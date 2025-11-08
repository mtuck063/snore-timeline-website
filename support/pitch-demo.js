// "What is a frequency" playground: a live tone you drag up and down, with a
// wave that visibly tightens and oscillates faster as the pitch rises. Shows
// frequency = how fast the air vibrates, on the same low/mid/high scale the
// band waveform uses. Web Audio oscillator, no dependencies.
window.SnorePitch = (function () {
    'use strict';

    function init(sel) {
        var root = document.querySelector(sel);
        if (!root) return;
        var canvas = root.querySelector('.pitch-canvas');
        var slider = root.querySelector('.pitch-slider');
        var hzEl = root.querySelector('.pitch-hz');
        var bandEl = root.querySelector('.pitch-band');
        var playBtn = root.querySelector('.pitch-play');
        var playLabel = root.querySelector('.pitch-play-label');
        if (!canvas || !slider || !playBtn) return;
        var g = canvas.getContext('2d');
        var names = {
            low: root.getAttribute('data-band-low') || 'Low',
            mid: root.getAttribute('data-band-mid') || 'Mid',
            high: root.getAttribute('data-band-high') || 'High'
        };
        var MIN = 55, MAX = 2000, ratio = MAX / MIN;
        var ctx = null, osc = null, gain = null, playing = false, raf = null, phase = 0;

        function vToHz(v) { return MIN * Math.pow(ratio, v / 1000); }
        function bandOf(hz) { return hz < 250 ? 'low' : (hz <= 1500 ? 'mid' : 'high'); }
        function bandColor(b) { return b === 'low' ? '#D2772E' : (b === 'mid' ? '#EA8B38' : '#FFBE82'); }
        function fmt(hz) { return hz >= 1000 ? (Math.round(hz / 10) / 100) + ' kHz' : Math.round(hz) + ' Hz'; }

        function draw() {
            var hz = vToHz(+slider.value), b = bandOf(hz);
            var W = canvas.width, H = canvas.height, mid = H / 2;
            g.clearRect(0, 0, W, H);
            // faint center line
            g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 1;
            g.beginPath(); g.moveTo(0, mid); g.lineTo(W, mid); g.stroke();
            // the vibrating wave: more cycles + tighter as pitch rises
            var cycles = Math.max(1.2, Math.min(72, hz / 30));
            var amp = H * 0.36;
            g.strokeStyle = bandColor(b); g.lineWidth = 3; g.lineJoin = 'round';
            g.beginPath();
            for (var x = 0; x <= W; x += 2) {
                var y = mid - Math.sin((x / W) * cycles * 6.2832 + phase) * amp;
                if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
            }
            g.stroke();
        }
        function update() {
            var hz = vToHz(+slider.value), b = bandOf(hz);
            hzEl.textContent = fmt(hz);
            bandEl.textContent = names[b]; bandEl.setAttribute('data-band', b);
            if (playing && osc) osc.frequency.setTargetAtTime(hz, ctx.currentTime, 0.02);
            if (!playing) draw();
        }
        function setBtn() {
            playBtn.classList.toggle('is-playing', playing);
            playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
            if (playLabel) playLabel.textContent = playing
                ? (playBtn.getAttribute('data-label-stop') || 'Stop')
                : (playBtn.getAttribute('data-label-play') || 'Play');
        }
        function loop() {
            var hz = vToHz(+slider.value);
            phase += 0.06 + (hz / MAX) * 0.5;          // higher pitch -> faster motion
            draw();
            if (playing) raf = requestAnimationFrame(loop);
        }
        function start() {
            if (!ctx) {
                var AC = window.AudioContext || window.webkitAudioContext;
                if (!AC) return;
                ctx = new AC(); gain = ctx.createGain(); gain.gain.value = 0; gain.connect(ctx.destination);
            }
            if (ctx.state === 'suspended') ctx.resume();
            osc = ctx.createOscillator(); osc.type = 'sine';
            osc.frequency.value = vToHz(+slider.value); osc.connect(gain); osc.start();
            gain.gain.cancelScheduledValues(ctx.currentTime);
            gain.gain.setTargetAtTime(0.05, ctx.currentTime, 0.02);
            playing = true; setBtn(); loop();
        }
        function stop() {
            if (gain && ctx) { gain.gain.cancelScheduledValues(ctx.currentTime); gain.gain.setTargetAtTime(0, ctx.currentTime, 0.02); }
            if (osc) { var o = osc; setTimeout(function () { try { o.stop(); o.disconnect(); } catch (e) {} }, 140); osc = null; }
            playing = false; setBtn(); if (raf) cancelAnimationFrame(raf); draw();
        }
        slider.addEventListener('input', update);
        playBtn.addEventListener('click', function () { playing ? stop() : start(); });
        document.addEventListener('visibilitychange', function () { if (document.hidden && playing) stop(); });
        update();
    }

    return { init: init };
})();
