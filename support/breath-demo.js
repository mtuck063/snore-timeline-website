// App-style colored-waveform player for the support center.
// Plays a real recording and draws the same low/mid/high frequency bands the
// app paints on its waveform (computed with the app's 2048-pt FFT, energy
// normalized per band). A playhead sweeps across in time with the audio.
// Data is precomputed in clips.json; playback is a plain <audio> element.
window.SnoreWave = (function () {
    'use strict';

    var COL = { low: '#C8641E', mid: '#EA8B38', high: '#FFBE82' };

    function rr(g, x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        g.beginPath();
        g.moveTo(x + r, y);
        g.arcTo(x + w, y, x + w, y + h, r);
        g.arcTo(x + w, y + h, x, y + h, r);
        g.arcTo(x, y + h, x, y, r);
        g.arcTo(x, y, x + w, y, r);
        g.closePath();
    }

    function fmt(s) {
        s = Math.max(0, s | 0);
        return (s / 60 | 0) + ':' + ('0' + (s % 60)).slice(-2);
    }

    function init(sel, dataUrl) {
        var root = document.querySelector(sel);
        if (!root) return;
        var canvas = root.querySelector('.wave-canvas');
        var playBtn = root.querySelector('.wave-play');
        var playLabel = root.querySelector('.wave-play-label');
        var timeEl = root.querySelector('.wave-time');
        var tabs = [].slice.call(root.querySelectorAll('.wave-tab'));
        var statusEl = root.querySelector('.wave-status');
        if (!canvas || !playBtn) return;
        var g = canvas.getContext('2d');
        var base = root.getAttribute('data-audio-base') || '/support/audio/';

        var DATA = null, cur = 'breathing', raf = null, ready = false;
        var audio = new Audio();
        audio.preload = 'auto';
        audio.loop = true;

        fetch(dataUrl).then(function (r) { return r.json(); }).then(function (d) {
            DATA = d; ready = true;
            audio.src = base + cur + '.mp3';
            drawWave(); idleStatus();
        }).catch(function () {});

        function drawWave(playheadT) {
            if (!DATA || !DATA[cur]) return;
            var clip = DATA[cur], bars = clip.bars;
            var W = canvas.width, H = canvas.height, mid = H / 2, maxH = H * 0.46;
            // one bar per second, with a gap so each second reads as its own bar (matches the app)
            var slot = W / bars.length;
            var gap = Math.min(14, slot * 0.18);
            var barW = slot - gap;
            g.clearRect(0, 0, W, H);
            // mirrored stacked bars with rounded outer corners: low (inner) -> mid -> high (bright tips)
            for (var i = 0; i < bars.length; i++) {
                var b = bars[i], hh = Math.max(4, b[0] * maxH);
                var x = i * slot + gap / 2;
                g.save();
                rr(g, x, mid - hh, barW, hh * 2, Math.min(barW / 2, hh, 12));
                g.clip();
                var segs = [[b[1], COL.low], [b[2], COL.mid], [b[3], COL.high]];
                var yU = mid, yD = mid;
                for (var k = 0; k < 3; k++) {
                    var sh = hh * segs[k][0];
                    g.fillStyle = segs[k][1];
                    g.fillRect(x, yU - sh, barW, sh + 0.6); yU -= sh;
                    g.fillRect(x, yD, barW, sh + 0.6); yD += sh;
                }
                g.restore();
            }
            // playhead
            if (playheadT != null) {
                var px = (playheadT / clip.duration) * W;
                g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 2;
                g.beginPath(); g.moveTo(px, 0); g.lineTo(px, H); g.stroke();
                g.fillStyle = '#fff';
                g.beginPath(); g.arc(px, 6, 3.5, 0, 7); g.fill();
            }
        }

        function updateStatus(t) {
            if (!statusEl) return;
            var clip = DATA[cur];
            if (cur !== 'breathing') { statusEl.textContent = ''; statusEl.removeAttribute('data-phase'); return; }
            var bars = clip.bars;
            // Threshold per clip: a second is an "exhale" when its high-band energy is
            // above average. Driven by the same data the bars show, so the label always
            // matches the bar under the playhead and never flickers mid-second.
            if (clip._exThr == null) {
                var sum = 0; for (var j = 0; j < bars.length; j++) sum += bars[j][3];
                clip._exThr = (sum / bars.length) * 1.2;
            }
            var idx = Math.min(bars.length - 1, Math.max(0, Math.floor(t * bars.length / clip.duration)));
            var isEx = bars[idx][3] >= clip._exThr;
            statusEl.textContent = isEx
                ? (statusEl.getAttribute('data-exhale') || 'Exhale — more energy in the high band')
                : (statusEl.getAttribute('data-inhale') || 'Inhale');
            statusEl.setAttribute('data-phase', isEx ? 'exhale' : 'inhale');
        }
        function idleStatus() {
            if (!statusEl) return;
            statusEl.removeAttribute('data-phase');
            statusEl.textContent = (cur === 'breathing') ? (statusEl.getAttribute('data-idle') || '') : '';
        }
        function loop() {
            drawWave(audio.currentTime);
            updateStatus(audio.currentTime);
            if (timeEl) timeEl.textContent = fmt(audio.currentTime) + ' / ' + fmt(DATA[cur].duration);
            if (!audio.paused) raf = requestAnimationFrame(loop);
        }
        function setBtn() {
            var playing = !audio.paused;
            playBtn.classList.toggle('is-playing', playing);
            playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
            if (playLabel) playLabel.textContent = playing
                ? (playBtn.getAttribute('data-label-stop') || 'Pause')
                : (playBtn.getAttribute('data-label-play') || 'Play');
        }
        function play() { var p = audio.play(); if (p && p.catch) p.catch(function () {}); setBtn(); loop(); }
        function pause() { audio.pause(); setBtn(); if (raf) cancelAnimationFrame(raf); drawWave(audio.currentTime); idleStatus(); }

        playBtn.addEventListener('click', function () { if (!ready) return; audio.paused ? play() : pause(); });
        tabs.forEach(function (t) {
            t.addEventListener('click', function () {
                var name = t.getAttribute('data-clip'); if (name === cur && audio.src) return;
                var wasPlaying = !audio.paused;
                cur = name;
                tabs.forEach(function (x) { x.classList.toggle('is-active', x === t); });
                audio.src = base + cur + '.mp3'; audio.currentTime = 0;
                drawWave(0); idleStatus();
                if (timeEl) timeEl.textContent = fmt(0) + ' / ' + fmt(DATA[cur].duration);
                if (wasPlaying) play();
            });
        });
        audio.addEventListener('ended', function () { setBtn(); });
        document.addEventListener('visibilitychange', function () { if (document.hidden && !audio.paused) pause(); });
    }

    return { init: init };
})();
