// Interactive frequency explorer for the support center.
// Drag the slider (or tap a preset), play a sine tone, and watch which band
// it lands in. Teaches the LOW/MID/HIGH mapping without abstract numbers.
// Web Audio API, no dependencies. Labels come from the markup so it localizes.
window.SnoreFreq = (function () {
    'use strict';

    function init(sel) {
        var root = document.querySelector(sel);
        if (!root) return;
        var slider = root.querySelector('.freq-slider');
        var hzEl = root.querySelector('.freq-readout-hz');
        var bandEl = root.querySelector('.freq-readout-band');
        var descEl = root.querySelector('.freq-readout-desc');
        var bars = [].slice.call(root.querySelectorAll('.freq-bar'));
        var playBtn = root.querySelector('.freq-play');
        var playLabel = root.querySelector('.freq-play-label');
        var presets = [].slice.call(root.querySelectorAll('.freq-presets button'));
        if (!slider || !playBtn) return;
        var ex = {
            low: root.getAttribute('data-ex-low') || '',
            mid: root.getAttribute('data-ex-mid') || '',
            high: root.getAttribute('data-ex-high') || ''
        };
        var hzUnit = root.getAttribute('data-unit-hz') || 'Hz';
        var khzUnit = root.getAttribute('data-unit-khz') || 'kHz';
        var MIN = 50, MAX = 8000, ratio = MAX / MIN;
        var ctx = null, osc = null, gain = null, playing = false;

        function vToHz(v) { return MIN * Math.pow(ratio, v / 1000); }
        function hzToV(hz) { return 1000 * Math.log(hz / MIN) / Math.log(ratio); }
        function bandOf(hz) { return hz < 250 ? 'low' : (hz <= 1500 ? 'mid' : 'high'); }
        function fmt(hz) {
            return hz >= 1000 ? (Math.round(hz / 100) / 10) + ' ' + khzUnit : Math.round(hz) + ' ' + hzUnit;
        }
        function bandName(b) {
            var el = root.querySelector('.freq-bar[data-band="' + b + '"] .freq-bar-name');
            return el ? el.textContent : b;
        }
        function update() {
            var hz = vToHz(+slider.value), b = bandOf(hz);
            hzEl.textContent = fmt(hz);
            bandEl.textContent = bandName(b);
            bandEl.setAttribute('data-band', b);
            descEl.textContent = ex[b];
            bars.forEach(function (x) { x.classList.toggle('is-active', x.getAttribute('data-band') === b); });
            if (playing && osc) osc.frequency.setTargetAtTime(hz, ctx.currentTime, 0.01);
        }
        function setBtn() {
            playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
            playBtn.classList.toggle('is-playing', playing);
            if (playLabel) playLabel.textContent = playing
                ? (playBtn.getAttribute('data-label-stop') || 'Stop')
                : (playBtn.getAttribute('data-label-play') || 'Play tone');
        }
        function start() {
            if (!ctx) {
                var AC = window.AudioContext || window.webkitAudioContext;
                if (!AC) return;
                ctx = new AC();
                gain = ctx.createGain();
                gain.gain.value = 0;
                gain.connect(ctx.destination);
            }
            if (ctx.state === 'suspended') ctx.resume();
            osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = vToHz(+slider.value);
            osc.connect(gain);
            osc.start();
            gain.gain.cancelScheduledValues(ctx.currentTime);
            gain.gain.setTargetAtTime(0.06, ctx.currentTime, 0.02);
            playing = true; setBtn();
        }
        function stop() {
            if (gain && ctx) {
                gain.gain.cancelScheduledValues(ctx.currentTime);
                gain.gain.setTargetAtTime(0, ctx.currentTime, 0.02);
            }
            if (osc) {
                var o = osc;
                setTimeout(function () { try { o.stop(); o.disconnect(); } catch (e) {} }, 140);
                osc = null;
            }
            playing = false; setBtn();
        }
        slider.addEventListener('input', update);
        playBtn.addEventListener('click', function () { playing ? stop() : start(); });
        presets.forEach(function (p) {
            p.addEventListener('click', function () {
                slider.value = hzToV(+p.getAttribute('data-hz'));
                update();
                if (!playing) start();
            });
        });
        document.addEventListener('visibilitychange', function () { if (document.hidden && playing) stop(); });
        update();
    }

    return { init: init };
})();
