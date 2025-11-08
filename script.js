// ============================================
// ANONYMOUS PAGE COUNTING (GoatCounter)
// ============================================
// Cookieless and stores no personal data, so no consent banner is required.
// Injected from this shared file so every locale page is counted without
// touching 23 HTML files. Local/dev hosts are skipped to keep numbers clean
// (count.js also ignores localhost itself; this just avoids the request).
(function initPageCount() {
    if (/^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname)) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://gc.zgo.at/count.js';
    s.dataset.goatcounter = 'https://snoretimeline.goatcounter.com/count';
    document.head.appendChild(s);
}());

// ============================================
// HERO VIDEO DELAYED START
// ============================================
(function initVideoResume() {
    const hero = document.getElementById('hero-video');

    const attempt = (v) => {
        const p = v.play();
        if (p && p.catch) p.catch(() => { try { v.currentTime = 0; } catch (e) {} });
    };

    // Poster holds for a beat before the hero loop starts.
    if (hero) setTimeout(() => { const p = hero.play(); if (p && p.catch) p.catch(() => {}); }, 3000);

    // Reopening a backgrounded tab without refreshing (iOS Chrome/Safari) suspends
    // every autoplaying video and never resumes it, so each one sits frozen on
    // whatever frame it reached, often a half-rendered loading state mid-clip.
    // Resume them; if playback can't restart at all (Low Power Mode), rewind so the
    // clip rests on its clean opening frame instead.
    //
    // Deliberately play() and not load(): load() resets the element and leaves it
    // painting nothing but its background, which is how the tour clip went black.
    function reviveAll() {
        document.querySelectorAll('video').forEach((v) => {
            if (v.paused && !v.hasAttribute('controls')) attempt(v);
        });
    }
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reviveAll();
    });
    window.addEventListener('pageshow', (e) => { if (e.persisted) reviveAll(); });
}());

// ============================================
// PARALLAX EFFECTS FOR IMAGES
// ============================================
const parallaxImages = document.querySelectorAll('.phone-mockup, .breathing-mockup');
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            parallaxImages.forEach(img => {
                const rect = img.getBoundingClientRect();
                const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);

                if (scrollPercent > 0 && scrollPercent < 1) {
                    const moveAmount = (scrollPercent - 0.5) * 30;
                    img.style.transform = `translateY(${moveAmount}px)`;
                }
            });

            ticking = false;
        });
        ticking = true;
    }
});

// ============================================
// INTERSECTION OBSERVER WITH STAGGER EFFECTS
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const createStaggerObserver = () => {
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
                staggerObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Feature cards with stagger animation
    document.querySelectorAll('.feature-card').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `all 0.5s ease ${index * 0.1}s`;
        staggerObserver.observe(el);
    });

    // Detection steps with stagger
    document.querySelectorAll('.detection-step').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.12}s`;
        staggerObserver.observe(el);
    });

    // Breathing screenshot
    const breathingScreenshot = document.querySelector('.breathing-screenshot-wrapper');
    if (breathingScreenshot) {
        breathingScreenshot.style.opacity = '0';
        breathingScreenshot.style.transform = 'scale(0.9) translateY(20px)';
        breathingScreenshot.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s';
        staggerObserver.observe(breathingScreenshot);
    }

    // Sleep stages steps with stagger
    document.querySelectorAll('.sleep-stages-step').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.12}s`;
        staggerObserver.observe(el);
    });

    // Hypnogram wrapper
    const hypnogramWrapper = document.querySelector('.hypnogram-wrapper');
    if (hypnogramWrapper) {
        hypnogramWrapper.style.opacity = '0';
        hypnogramWrapper.style.transform = 'scale(0.95)';
        hypnogramWrapper.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s';
        staggerObserver.observe(hypnogramWrapper);
    }

    // Stage distribution bar
    const stageDistribution = document.querySelector('.stage-distribution');
    if (stageDistribution) {
        stageDistribution.style.opacity = '0';
        stageDistribution.style.transform = 'translateY(10px)';
        stageDistribution.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.5s';
        staggerObserver.observe(stageDistribution);
    }

    // FAQ items with subtle animation
    document.querySelectorAll('.faq-item').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s`;
        staggerObserver.observe(el);
    });
};

createStaggerObserver();

// ============================================
// BACKGROUND GRADIENT SHIFT ON SCROLL
// ============================================
// Painted on <html>, not <body>. body is deliberately transparent so the fixed
// #hero-shader (z-index:-1) shows through, but a negative-z-index element paints
// below the backgrounds of in-flow block descendants — so an opaque background on
// body covered the shader completely, permanently, from the first scroll event.
// html's background sits below the canvas instead.
//
// Also throttled: this used to run on every scroll event, forcing a full-page
// style recalc and repaint each time. Now one write per frame, and only when the
// rounded hue actually changes.
let bgTicking = false;
let lastHue = -1;
window.addEventListener('scroll', () => {
    if (bgTicking) return;
    bgTicking = true;
    window.requestAnimationFrame(() => {
        bgTicking = false;
        const range = document.documentElement.scrollHeight - window.innerHeight;
        const hueShift = Math.round((range > 0 ? window.scrollY / range : 0) * 60);
        if (hueShift === lastHue) return;
        lastHue = hueShift;
        document.documentElement.style.background = `linear-gradient(180deg,
            hsl(${220 + hueShift}, 25%, 8%) 0%,
            hsl(${230 + hueShift}, 30%, 6%) 100%)`;
    });
}, { passive: true });

// ============================================
// CONTACT EMAIL OBFUSCATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const contactBtn = document.getElementById('contactBtn');
    if (contactBtn) {
        contactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const user = 'meneliktucker';
            const domain = 'gmail';
            const tld = 'com';
            const subject = 'Snore Timeline Inquiry';
            window.location.href = `mailto:${user}@${domain}.${tld}?subject=${encodeURIComponent(subject)}`;
        });
    }
});

// ============================================
// DOWNLOAD BUTTON LOADING ANIMATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const downloadButtons = document.querySelectorAll('.btn-primary');

    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.add('loading');
            setTimeout(() => {
                this.classList.remove('loading');
            }, 3000);
        });
    });
});

// ============================================
// LANGUAGE SWITCHER TOGGLE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const footerSwitcher = document.querySelector('.lang-switcher');
    if (!footerSwitcher) return;

    // Mirror the footer switcher into the header so desktop readers don't have to
    // scroll the whole page to change language. Cloned rather than duplicated in
    // markup so every locale's links stay correct without touching 23 files. CSS
    // hides it on phones, where the bar is already full.
    const bar = document.querySelector('.support-topbar-inner');
    const supportLink = bar && bar.querySelector('.home-topbar-link');
    if (bar) {
        const top = footerSwitcher.cloneNode(true);
        top.classList.add('lang-switcher-top');
        bar.insertBefore(top, supportLink || bar.lastElementChild);
    }

    const switchers = Array.prototype.slice.call(document.querySelectorAll('.lang-switcher'));
    const isMobile = () => window.matchMedia('(max-width: 600px)').matches;
    let backdrop = null;

    const close = () => {
        switchers.forEach((sw) => sw.classList.remove('open'));
        document.body.classList.remove('lang-sheet-open');
        if (backdrop) { backdrop.remove(); backdrop = null; }
    };
    const open = (sw) => {
        close();
        sw.classList.add('open');
        // The header copy is desktop-only, so it never uses the mobile sheet.
        if (isMobile() && !sw.classList.contains('lang-switcher-top')) {
            document.body.classList.add('lang-sheet-open');
            backdrop = document.createElement('div');
            backdrop.className = 'lang-backdrop';
            backdrop.addEventListener('click', close);
            document.body.appendChild(backdrop);
        }
    };
    switchers.forEach((sw) => {
        const b = sw.querySelector('.lang-switcher-btn');
        if (!b) return;
        b.addEventListener('click', (e) => {
            e.stopPropagation();
            sw.classList.contains('open') ? close() : open(sw);
        });
    });
    document.addEventListener('click', (e) => {
        if (!switchers.some((sw) => sw.contains(e.target))) close();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    // The rest of this block drives the mobile sheet, which only the footer copy uses.
    const switcher = footerSwitcher;

    // Swipe-down to dismiss the mobile language sheet. Only engages when the list
    // is scrolled to the top, so an upward/normal scroll of the languages is untouched.
    const sheet = switcher.querySelector('.lang-dropdown');
    if (sheet) {
        let dragging = false, startY = 0, dy = 0;
        sheet.addEventListener('touchstart', (e) => {
            if (!isMobile() || !switcher.classList.contains('open') || sheet.scrollTop > 0) return;
            dragging = true;
            startY = e.touches[0].clientY;
            dy = 0;
            sheet.style.transition = 'none';
        }, { passive: true });
        sheet.addEventListener('touchmove', (e) => {
            if (!dragging) return;
            dy = e.touches[0].clientY - startY;
            if (dy <= 0) { sheet.style.transform = ''; return; }  // dragging up → let it scroll
            e.preventDefault();                                   // claim the gesture; stop rubber-band
            sheet.style.transform = `translateY(${dy}px)`;
        }, { passive: false });
        const endDrag = () => {
            if (!dragging) return;
            dragging = false;
            sheet.style.transition = '';
            sheet.style.transform = '';   // back to CSS state: closes (if past threshold) or snaps back
            if (dy > 90) close();
        };
        sheet.addEventListener('touchend', endDrag);
        sheet.addEventListener('touchcancel', endDrag);
    }
});

// ============================================
// FAQ ACCORDION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item h3');

    // Drive the toggle from pointer events, not click: iOS Safari suppresses the
    // very first click after a page load (it arms click delivery on first touch),
    // which made the first FAQ tap of the session do nothing. pointerup fires on
    // that first tap. The move guard keeps scrolls/drags from toggling.
    faqItems.forEach(question => {
        let sx = 0, sy = 0, moved = false;
        question.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; moved = false; });
        question.addEventListener('pointermove', (e) => {
            if (Math.abs(e.clientX - sx) > 10 || Math.abs(e.clientY - sy) > 10) moved = true;
        });
        question.addEventListener('pointerup', (e) => {
            if (moved || (e.button && e.button !== 0)) return;
            if (e.target.closest('.faq-link-btn')) return; // let the copy button handle its own tap
            question.parentElement.classList.toggle('open');
        });
    });

    // Open & scroll to a specific FAQ from URL hash
    const hash = window.location.hash;
    if (hash) {
        const target = document.getElementById(hash.slice(1));
        if (target && target.classList.contains('faq-item')) {
            target.style.opacity = '1';
            target.style.transform = 'none';
            target.classList.add('open');
            setTimeout(() => {
                const top = target.getBoundingClientRect().top + window.scrollY - 90;
                window.scrollTo({ top, behavior: 'smooth' });
            }, 300);
        }
    }

    // Copy link buttons
    document.querySelectorAll('.faq-link-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const item = btn.closest('.faq-item');
            const url = `${location.origin}${location.pathname}#${item.id}`;
            navigator.clipboard.writeText(url);
            btn.classList.add('copied');
            setTimeout(() => btn.classList.remove('copied'), 2000);
        });
    });
});

// ============================================
// TIP JAR SUCCESS MESSAGE
// ============================================

// Check if user just completed a tip (coming back from Stripe)
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('tip') === 'success') {
        // Create and show thank-you toast notification
        const toast = document.createElement('div');
        toast.className = 'tip-success-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-emoji">🙏</span>
                <div>
                    <strong>Thank you for your support!</strong>
                    <p>Your contribution helps keep Snore Timeline free and improving.</p>
                </div>
            </div>
        `;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);

        // Clean URL (remove ?tip=success parameter)
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
});

// Shader background
(function initShaderBackground() {
    const canvas = document.getElementById('hero-shader');
    if (!canvas) return;

    // Phones get no shader at all. Not a cheaper one: the element is removed
    // before a GL context exists, so there's no context, no compiled program, no
    // animation frame, and no full-screen blurred layer for the compositor to
    // recomposite. The wash isn't legible at this size, so none of that work buys
    // anything. Checked before getContext on purpose.
    const small = window.matchMedia && window.matchMedia('(max-width: 900px)');
    if (small && small.matches) {
        canvas.remove();
        return;
    }

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vertSrc = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fragSrc = `
        precision highp float;
        uniform vec2 resolution;
        uniform float time;
        uniform vec4 ripples[12];   // xy: center in uv space, z: spawn time, w: strength
        uniform vec2 rippleVel[12]; // momentum carry vector per ripple, uv units

        float random(in float x) {
            return fract(sin(x) * 1e4);
        }
        float random2(in vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        void main(void) {
            vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

            vec2 fMosaicScal = vec2(4.0, 2.0);
            vec2 vScreenSize = vec2(256.0, 256.0);
            uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
            uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);

            // Cursor cut: no waves, no rings. Each trail point is a smooth bulge
            // that shoves the field outward — dragging the cursor parts the
            // pattern like a stick through water, and the groove relaxes shut as
            // the points age. Momentum lets the groove glide on after a flick.
            vec2 duv = vec2(0.0);
            for (int k = 0; k < 12; k++) {
                float age = time - ripples[k].z;
                if (age < 0.0 || age > 6.0) continue;
                vec2 center = ripples[k].xy + rippleVel[k] * (1.0 - exp(-age * 0.8));
                vec2 diff = uv - center;
                float d = length(diff);
                float push = exp(-d * d * 40.0) * exp(-age * 0.9) * ripples[k].w;
                duv += (diff / max(d, 0.001)) * push * 0.12;
                // A little of the field gets dragged along with the motion too.
                duv += rippleVel[k] * push * 0.5;
            }

            // Phase offset comes from the UNdisplaced column: feeding the warped
            // uv into random() rescrambled every column's ring phase per frame,
            // which read as the whole animation lurching faster. The wake may only
            // bend geometry (the length() below), never reseed the phase field.
            float t = time * 0.06 + random(uv.x) * 0.4;
            uv += duv;
            float lineWidth = 0.0008;

            vec3 color = vec3(0.0);
            for (int j = 0; j < 3; j++) {
                for (int i = 0; i < 5; i++) {
                    color[j] += lineWidth * float(i * i) / abs(fract(t - 0.01 * float(j) + float(i) * 0.01) * 1.0 - length(uv));
                }
            }

            gl_FragColor = vec4(color[2], color[1], color[0], 1.0);
        }
    `;

    function createShader(type, src) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl.VERTEX_SHADER, vertSrc));
    gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, fragSrc));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'time');
    const resLoc = gl.getUniformLocation(program, 'resolution');
    const rippleLoc = gl.getUniformLocation(program, 'ripples');
    const rippleVelLoc = gl.getUniformLocation(program, 'rippleVel');

    let time = 1.0;

    // Cursor wake: a ring buffer of ripple origins the shader turns into
    // expanding, decaying waves. Each entry is xy center / z spawn time /
    // w strength, plus a matching momentum carry vector in rippleVelData.
    // z = -1e3 marks a dead slot (its age is always past the 8-unit cutoff).
    const MAX_RIPPLES = 12;
    const RIPPLE_LIFE = 6.0; // shader-time units; 3 units ≈ 1 second
    const rippleData = new Float32Array(MAX_RIPPLES * 4);
    const rippleVelData = new Float32Array(MAX_RIPPLES * 2);
    for (let i = 0; i < MAX_RIPPLES; i++) rippleData[i * 4 + 2] = -1e3;
    let rippleIdx = 0;
    let ripplesActiveUntil = -1;

    // This canvas is fixed, full-screen and sits under everything, so it never
    // stops being drawn. At devicePixelRatio on a phone that was ~4.4 megapixels a
    // frame at 60fps, blurred 22px on top, which is what cooked the device.
    //
    // Render at CSS pixels rather than device pixels: the layer is blurred anyway,
    // so the extra 3x detail was never visible, and this is still ~27x cheaper than
    // before once combined with the framerate cap. Don't drop this much lower — the
    // shader draws sub-pixel-thin rings (lineWidth 0.0008), and undersampling them
    // averages the pattern away to almost nothing.
    const RES_SCALE = 1.0;
    let stopped = false;

    function resize() {
        if (stopped) return;
        // Drive both the CSS box and the backing store from the viewport.
        //
        // <canvas> is a replaced element, so inset:-60px does NOT stretch it the
        // way it would a div: with width:auto it takes its intrinsic (backing
        // store) size and anchors top-left. Measuring canvas.clientWidth therefore
        // just read back its own 300x150 default and pinned it in the corner.
        // Measuring the parent is no good either — that's <body>, which reports the
        // whole document height. Hence the explicit style width/height: the element
        // covers the viewport plus bleed, while the buffer underneath can stay at
        // RES_SCALE and be upscaled.
        const w = window.innerWidth + 120;
        const h = window.innerHeight + 120;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        canvas.width = Math.max(1, Math.round(w * RES_SCALE));
        canvas.height = Math.max(1, Math.round(h * RES_SCALE));
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(resLoc, canvas.width, canvas.height);
    }

    resize();
    let resizeT = 0;
    window.addEventListener('resize', () => {
        clearTimeout(resizeT);
        resizeT = setTimeout(resize, 200);
    }, { passive: true });

    function draw() {
        gl.uniform1f(timeLoc, time);
        gl.uniform4fv(rippleLoc, rippleData);
        gl.uniform2fv(rippleVelLoc, rippleVelData);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        draw();               // one static frame, no loop, no cursor ripples
        return;
    }

    // Registered after the reduced-motion bail-out so those users get no wake.
    // Spawns are distance-gated: one ripple per ~30px of travel, giving a trail
    // when dragging and a single ring when nudging. Cursor velocity (EMA-smoothed
    // px/ms) sets each ripple's strength and its momentum carry, so a lazy drift
    // barely dents the water while a flick shoves a swell along its path.
    let lastSpawnX = null;
    let lastSpawnY = null;
    let lastMoveX = 0;
    let lastMoveY = 0;
    let lastMoveT = 0;
    let velX = 0;
    let velY = 0;
    window.addEventListener('mousemove', function (e) {
        if (stopped) return;
        const dt = e.timeStamp - lastMoveT;
        if (lastMoveT !== 0 && dt > 0 && dt < 100) {
            // EMA weighted by the event gap, so one jittery event can't spike it.
            const a = Math.min(1, dt / 50);
            velX += ((e.clientX - lastMoveX) / dt - velX) * a;
            velY += ((e.clientY - lastMoveY) / dt - velY) * a;
        } else {
            velX = 0; // a pause over 100ms starts a new gesture from rest
            velY = 0;
        }
        lastMoveX = e.clientX;
        lastMoveY = e.clientY;
        lastMoveT = e.timeStamp;

        if (lastSpawnX !== null) {
            const dx = e.clientX - lastSpawnX;
            const dy = e.clientY - lastSpawnY;
            if (dx * dx + dy * dy < 625) return;
        }
        lastSpawnX = e.clientX;
        lastSpawnY = e.clientY;
        // Same mapping the shader applies to gl_FragCoord, done in page space:
        // the canvas sits at (-60,-60) and GL's y axis points up.
        const px = (e.clientX + 60) * RES_SCALE;
        const py = canvas.height - (e.clientY + 60) * RES_SCALE;
        const m = Math.min(canvas.width, canvas.height);
        const speed = Math.hypot(velX, velY);
        const o = rippleIdx * 4;
        rippleData[o] = (px * 2 - canvas.width) / m;
        rippleData[o + 1] = (py * 2 - canvas.height) / m;
        rippleData[o + 2] = time;
        rippleData[o + 3] = Math.min(0.35 + speed * 0.55, 1.5);
        // Momentum carry: how far the swell keeps sliding, in uv units. Scales
        // with speed, capped so a hard flick can't shove it across the viewport.
        const pxToUv = 2 * RES_SCALE / m;
        const carryMag = Math.min(speed * 90 * pxToUv, 0.15);
        const inv = speed > 1e-4 ? carryMag / speed : 0;
        rippleVelData[rippleIdx * 2] = velX * inv;
        rippleVelData[rippleIdx * 2 + 1] = -velY * inv;
        rippleIdx = (rippleIdx + 1) % MAX_RIPPLES;
        ripplesActiveUntil = time + RIPPLE_LIFE;
    }, { passive: true });

    // A drifting background doesn't need 60fps — except while cursor ripples
    // are live, when 20fps reads as chop. The clock advances by wall time, so
    // the drift speed is identical at either cadence (3 units/sec matches the
    // original 0.05-per-frame-at-60fps rate).
    const IDLE_STEP = 1000 / 20;
    const ACTIVE_STEP = 1000 / 60;
    const TIME_SCALE = 0.003;

    let last = 0;
    let rafId = 0;
    function animate(now) {
        if (stopped) return;
        rafId = requestAnimationFrame(animate);
        const step = time < ripplesActiveUntil ? ACTIVE_STEP : IDLE_STEP;
        // The -4 tolerance absorbs rAF jitter; without it a 16.6ms frame missing
        // a 16.67ms threshold would halve the active framerate.
        if (now - last < step - 4) return;
        time += Math.min(now - last, 100) * TIME_SCALE;
        last = now;
        draw();
    }

    rafId = requestAnimationFrame(animate);

    // Narrowing a desktop window past the breakpoint should stop the work too,
    // not just hide it.
    if (small && small.addEventListener) {
        small.addEventListener('change', function (e) {
            if (!e.matches || stopped) return;
            stopped = true;
            cancelAnimationFrame(rafId);
            canvas.remove();
        });
    }
}());

// Mobile sticky CTA bar: starts hidden, reveals on scroll-up, hides on scroll-down.
(function initMobileCtaAutoHide() {
    const bar = document.querySelector('.mobile-cta-bar');
    if (!bar) return;
    // The bar is currently disabled in CSS. Bail out so its scroll listener isn't
    // running for nothing; removing that CSS rule revives this automatically.
    if (getComputedStyle(bar).display === 'none') return;

    // overflow-x:hidden on <html>/<body> can make <body> the scroller, so read
    // from whichever element actually carries the scroll offset.
    function scrollTop() {
        return window.pageYOffset
            || document.documentElement.scrollTop
            || document.body.scrollTop
            || 0;
    }

    let lastY = scrollTop();
    let ticking = false;

    function update() {
        const y = scrollTop();
        const delta = y - lastY;
        // Ignore tiny jitters; only react past a small threshold.
        if (Math.abs(delta) > 6) {
            if (delta < 0) {
                bar.classList.remove('is-tucked'); // scrolling up → reveal
            } else {
                bar.classList.add('is-tucked');    // scrolling down → hide
            }
            lastY = y;
        }
        ticking = false;
    }

    // capture:true catches scroll events even when a non-root element scrolls.
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }, { capture: true, passive: true });
}());

// Platform-aware stores.
//  - Compact "Download" CTAs (header + mobile bar): Apple logo + App Store by
//    default, swapped to the Android robot + Google Play on Android.
//  - Store badge pairs (hero + closing CTA): on a known phone show only that
//    platform's badge; on desktop / unknown show both.
(function initPlatformStores() {
    const ua = navigator.userAgent || '';
    const isAndroid = /android/i.test(ua);
    // Only an actual handheld phone collapses the badge pair to a single store.
    // Every desktop (incl. Mac) and tablet/iPad keeps both badges.
    const isPhone = /iphone|ipod/i.test(ua) || (isAndroid && /mobile/i.test(ua));

    if (isAndroid) {
        const playUrl = 'https://play.google.com/store/apps/details?id=com.meneliktucker.snoretimeline';
        const androidRobot = '<path d="M17.6 9.48l1.84-3.18a.4.4 0 0 0-.15-.55.4.4 0 0 0-.54.16l-1.86 3.23a11.4 11.4 0 0 0-9.78 0L5.25 5.91a.4.4 0 0 0-.54-.16.4.4 0 0 0-.15.55L6.4 9.48A10.8 10.8 0 0 0 1 17.5h22a10.8 10.8 0 0 0-5.4-8.02zM7 14.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/>';
        document.querySelectorAll('[data-store-cta]').forEach((a) => {
            a.setAttribute('href', playUrl);
            const icon = a.querySelector('.store-cta-icon');
            if (icon) icon.innerHTML = androidRobot;
        });
    }

    // On a phone, hide the other platform's store badge (desktop/tablet keep both).
    if (isPhone) {
        const drop = isAndroid ? 'ios' : 'android';
        document.querySelectorAll('[data-store-badge="' + drop + '"]').forEach((el) => {
            el.style.display = 'none';
        });
    }
}());

// Hero 3D phone: subtle parallax tilt toward the cursor (desktop, motion-OK only).
(function initPhoneTilt() {
    var scene = document.getElementById('phone-scene');
    if (!scene) return;
    var el = scene.querySelector('.phone-3d');
    if (!el) return;
    if (window.matchMedia) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (window.matchMedia('(hover: none)').matches) return;
    }
    var hero = scene.closest('.hero') || document.body;
    var raf = 0;
    hero.addEventListener('mousemove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
            raf = 0;
            var r = hero.getBoundingClientRect();
            var px = (e.clientX - r.left) / r.width - 0.5;
            var py = (e.clientY - r.top) / r.height - 0.5;
            // small offset layered on top of the auto-swing
            el.style.setProperty('--phone-ry', (px * 12).toFixed(2) + 'deg');
            el.style.setProperty('--phone-rx', (-py * 9).toFixed(2) + 'deg');
        });
    }, { passive: true });
    hero.addEventListener('mouseleave', function () {
        el.style.removeProperty('--phone-ry');
        el.style.removeProperty('--phone-rx');
    });
}());

// ============================================
// LIVE APP STORE REVIEWS
// Data comes from the ratings tracker's GitHub Pages deploy, which recollects
// from Apple every hour. Served with `access-control-allow-origin: *`, so the
// browser can read it cross-origin with no proxy.
// Strings live on the panel's data-rv-* attributes so each translated page can
// supply its own copy without forking this file.
// ============================================
(function initLiveReviews() {
    var panel = document.getElementById('reviewsPanel');
    if (!panel || !window.fetch) return;

    var BASE = 'https://mtuck063.github.io/snore-ratings-tracker/data/';
    var WEEK = 7 * 864e5;
    // A phone shows one card per row, so twelve is a long scroll before the reader
    // reaches the "show all" button. Matches the single-column CSS breakpoint.
    var PAGE_WIDE = 12;
    var PAGE_NARROW = 3;
    function pageSize() {
        return window.matchMedia && window.matchMedia('(max-width: 560px)').matches
            ? PAGE_NARROW : PAGE_WIDE;
    }
    var lang = document.documentElement.lang || 'en';

    var q = function (sel) { return panel.querySelector('[data-rv="' + sel + '"]'); };
    var el = {
        avg: q('avg'), avgStars: q('avgstars'), count: q('count'),
        histogram: q('histogram'), note: q('note'),
        week: q('week'), weekNum: q('weeknum'), weekCountries: q('weekcountries'),
        weekReviews: q('weekreviews'), weekSubhead: q('weeksubhead'), weekList: q('weeklist'),
        weekEmpty: q('weekempty'),
        updatedText: q('updatedtext'), controls: q('controls'), country: q('country'),
        sort: q('sort'), countLine: q('countline'), list: q('list'), more: q('more')
    };

    // Copy templates, overridable per locale via data attributes on the panel.
    function t(key, fallback) {
        return panel.getAttribute('data-rv-' + key) || fallback;
    }
    function fill(str, vars) {
        return str.replace(/\{(\w+)\}/g, function (m, k) {
            return vars[k] === undefined ? m : vars[k];
        });
    }

    var regionNames = null;
    try { regionNames = new Intl.DisplayNames([lang], { type: 'region' }); } catch (e) { /* older browser */ }

    // Apple ships a modified region database: Intl.DisplayNames('CN') returns
    // "China mainland" on Safari and iOS, while standard CLDR (and therefore
    // Chrome) returns "China". Same page, different label depending on browser, so
    // pin the ones that disagree.
    var REGION_OVERRIDES = {
        cn: {
            en: 'China', ar: 'الصين', da: 'Kina', de: 'China', es: 'China',
            fil: 'China', fr: 'Chine', hi: 'चीन', id: 'Tiongkok', it: 'Cina',
            ja: '中国', ko: '중국', ms: 'China', nl: 'China', no: 'Kina',
            pl: 'Chiny', pt: 'China', ru: 'Китай', sv: 'Kina', th: 'จีน',
            tr: 'Çin', zh: '中国', 'zh-hant': '中國'
        }
    };

    function countryName(cc) {
        var over = REGION_OVERRIDES[cc];
        if (over) {
            var l = lang.toLowerCase();
            var hit = over[l] || over[l.split('-')[0]] || over.en;
            if (hit) return hit;
        }
        var up = cc.toUpperCase();
        if (regionNames) {
            try { return regionNames.of(up) || up; } catch (e) { /* invalid code */ }
        }
        return up;
    }
    function flag(cc) {
        return cc.toUpperCase().replace(/[A-Z]/g, function (c) {
            return String.fromCodePoint(127397 + c.charCodeAt(0));
        });
    }

    var dateFmt;
    try { dateFmt = new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { dateFmt = null; }
    var relFmt;
    try { relFmt = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }); } catch (e) { relFmt = null; }

    function absoluteDate(ms) {
        var d = new Date(ms);
        return dateFmt ? dateFmt.format(d) : d.toISOString().slice(0, 10);
    }
    // "3 hours ago" while it's fresh, a plain date once it isn't.
    function relativeTime(ms) {
        if (!relFmt) return absoluteDate(ms);
        var diff = Date.now() - ms;
        if (diff < 6e4) return t('justnow', 'just now');
        var mins = Math.round(diff / 6e4);
        if (mins < 60) return relFmt.format(-mins, 'minute');
        var hours = Math.round(diff / 36e5);
        if (hours < 24) return relFmt.format(-hours, 'hour');
        var days = Math.round(diff / 864e5);
        if (days < 7) return relFmt.format(-days, 'day');
        return absoluteDate(ms);
    }

    function reviewTime(r) {
        return new Date(r.date || r.firstSeen).getTime() || 0;
    }

    // The gold gradient is background-clipped to text, so it has to live on a span
    // holding ONLY the earned stars — a dimmed child would still composite over it.
    function starString(n) {
        var full = Math.max(0, Math.min(5, Math.round(n)));
        var wrap = document.createElement('span');
        wrap.className = 'rv-card-stars';
        if (full > 0) {
            var on = document.createElement('span');
            on.className = 'rv-star-on';
            on.textContent = '★★★★★'.slice(0, full);
            wrap.appendChild(on);
        }
        if (full < 5) {
            var off = document.createElement('span');
            off.className = 'rv-star-off';
            off.textContent = '★★★★★'.slice(full);
            wrap.appendChild(off);
        }
        wrap.setAttribute('aria-label', fill(t('starslabel', '{n} out of 5 stars'), { n: full }));
        return wrap;
    }

    // Developer replies, keyed by App Store review id. Apple's public review feed
    // doesn't carry them, so they're transcribed from App Store Connect by hand —
    // add an entry here whenever you reply to a review you want shown.
    var RESPONSES = {
        // iPoseidon111 · IN · 5★ · "Amazing app"
        '14130483705': {
            date: '2026-06-03',
            fixedIn: '4.4',
            text: 'Reviews like yours are the reason both of these changes exist, so genuinely, thank you for taking the time to spell them out. The Snore Detection Sensitivity slider you suggested is now in 4.4 exactly as you described: it lives in Settings under the Snoring toggle, and you can turn it up to catch the milder snores that fan noise was causing the app to miss. The Apple Watch mismatch you flagged is the other big fix. When a fan or AC covers your breathing, or you\'re just a very quiet breather, the app couldn\'t hear enough to score those hours and they dropped off the total, which is how 6.5 hours became 2. The 4.4 update adds a Silence stage for exactly those stretches: when your breathing can\'t be heard but there\'s no sign you were awake, that time now counts as restful sleep instead of vanishing, so your nightly total should line up much more closely with your Watch. Update to 4.4 and let me know if the numbers look right, your feedback genuinely shaped this release.'
        },
        // Bad app hunterr · VN · 5★ · "Great dev response"
        '14113799066': {
            date: '2026-05-26',
            fixedIn: '4.2',
            text: 'v4.2 fixes this. Older recordings were failing to compress into the daily cache, so raw amplitude data kept piling up and dragging the timeline down. The new version cleans up the backlog on launch and keeps it trimmed going forward. Please update to v4.2, open the app, and give it a minute on the timeline screen so the cleanup can finish. After that scrolling and day-swiping should be smooth again. Try it and let me know how it goes.'
        },
        // Nicki (≖_≖) · CN · 5★ · "Excellent sleep monitoring software, I hope that Chinese and American language support can be added"
        '13914066033': {
            date: '2026-04-03',
            text: 'Chinese localization is coming in v3.18. On auto- start: Apple requires the app to be open to begin recording, so it can\'t start silently in the background. The bedtime reminder gets you close — it sends a notification at your set time and one tap starts the session. You can also set up a Shortcuts automation triggered by Sleep Focus, which launches the app and starts recording when you activate it before bed.'
        },
        // Amos Kk · US · 5★ · "Simple and Efficient"
        '13911360639': {
            date: '2026-04-03',
            text: 'Appreciate you taking the time to write this up. Shortcuts automation improvements are coming in v3.18. If the quirks persist after updating, reach out and I\'ll look into your specific setup.'
        },
        // Zxycas · US · 5★ · "Fantastic!"
        '13851832069': {
            date: '2026-03-18',
            text: 'Thank you so much, I\'m really glad the sleep talking detection is working well for you! An Android version is on the way, I\'m targeting early April.'
        },
        // BrianNate · US · 5★ · "Good just needs to add a share button"
        '13822888962': {
            date: '2026-03-09',
            text: 'Really appreciate the review and the suggestion! Sharing recordings is actually already possible. Tap the download icon at the top of the Snoring Episodes list, select "Export Full Night Audio," and once it finishes processing a share sheet will appear where you can AirDrop it, send it via Messages, email it, or upload it to ChatGPT. For individual episodes, tap the download icon on any episode card to start processing, then tap it again once it\'s ready to open the share sheet.'
        },
        // Social Snorer · AU · 5★ · "Simple, Free and Private"
        '13709492058': {
            date: '2026-02-20',
            fixedIn: '3.4',
            text: 'Thank you so much for the kind review! I\'m glad the app is working well for you. I added the ability for it to turn on and off with Sleep Focus in version 3.4! You can now create a shortcut in the Shortcuts app to start recording when you turn Sleep Focus on and also stop recording with turning Sleep Focus off. I did not think this was possible, I really appreciate you bringing this to my attention. Thanks for taking the time to give a thoughtful review.'
        },
        // Geek_Poilu · FR · 4★ · "Near perfect but ..."
        '13714949490': {
            date: '2026-02-08',
            fixedIn: '3.3',
            text: 'Thank you for bringing this to my attention! I\'ve significantly boosted the playback volume in the latest update (Version 3.3), it should be much easier to hear your recordings now.'
        },
        // Luckygirlmo · US · 3★ · "Great if you live alone- Can’t clean up signals"
        '13701461553': {
            date: '2026-02-07',
            fixedIn: '3.0',
            text: 'Thank you for the thoughtful feedback! You\'re absolutely right, the inability to remove false positives from environmental noise like CPAP equipment was a real limitation. Great news - you can now delete individual snoring episodes! Just tap on any episode to open its details, and you\'ll find a remove button at the bottom to dismiss detections that aren\'t actually snoring. I appreciate you taking the time to share this. It\'s exactly the kind of feedback that helps improve the app. Hope you\'ll give Snore Timeline another try!'
        },
        // Kicki_68 · SE · 3★ · "Ta bort ljudfiler utan att radera appen"
        '13673288060': {
            date: '2026-02-07',
            text: 'Tack för recensionen och feedbacken! Du kan faktiskt radera inspelningar direkt i appen - tryck på inställningsikonen (kugghjulet) uppe till höger för att öppna inställningar, där du hittar ett alternativ för att radera alla inspelningar och data för den aktuella dagen. Det finns också en inställning för "Lagringsgräns för inspelningar" som automatiskt raderar äldre inspelningar när du överskrider en viss gräns, så du behöver inte hantera lagringen manuellt. Jag hoppas att den nya inställningssidan gör dessa alternativ lättare att hitta!'
        },
        // lenicat8 · US · 5★ · "Recommend"
        '13618884602': {
            date: '2026-01-12',
            text: 'I\'m glad the app has been helpful for tracking your sleep talking. I\'ve been getting a few requests for Sleep Insights, so I\'ll prioritize it for a February release. It will include a Sleep Score, Time to Fall Asleep detection, and estimated Sleep Stages based on audio patterns. If you or anyone else have any other feature ideas, I\'m always welcome to hear them.'
        }
    };

    var state = { reviews: [], latest: null, histograms: null, events: [],
        stars: 'all', cc: 'all', sort: 'newest', shown: PAGE_WIDE };

    function visible() {
        var out = state.reviews.filter(function (r) {
            if (state.stars !== 'all' && r.rating !== Number(state.stars)) return false;
            if (state.cc !== 'all' && r.cc !== state.cc) return false;
            return true;
        });
        out.sort(function (a, b) {
            switch (state.sort) {
                case 'oldest': return reviewTime(a) - reviewTime(b);
                case 'lowest': return a.rating - b.rating || reviewTime(b) - reviewTime(a);
                case 'highest': return b.rating - a.rating || reviewTime(b) - reviewTime(a);
                default: return reviewTime(b) - reviewTime(a);
            }
        });
        return out;
    }

    // Keyless Google endpoint, same one the ratings tracker uses. Fires only when
    // the reader asks, and sends nothing but the public review text.
    function translateToEnglish(text) {
        var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' +
            encodeURIComponent(lang.split('-')[0]) + '&dt=t&q=' + encodeURIComponent(text);
        return fetch(url).then(function (r) { return r.json(); }).then(function (d) {
            return {
                text: (d[0] || []).map(function (seg) { return seg[0]; }).join(''),
                src: d[2] || ''
            };
        });
    }

    // Which storefronts this page's language is already native to. A review from
    // anywhere else gets a Translate button; no text sniffing involved.
    var LOCALE_HOME = {
        en: ['us', 'gb', 'au', 'ca', 'nz', 'ie', 'za', 'in', 'sg', 'ph'],
        ar: ['sa', 'ae', 'eg', 'qa', 'kw', 'bh', 'om', 'jo', 'lb', 'ma', 'dz', 'tn', 'iq', 'ly', 'ye'],
        da: ['dk'], de: ['de', 'at', 'ch', 'li'], es: ['es', 'mx', 'ar', 'cl', 'co', 'pe', 've', 'ec', 'uy', 'py', 'bo', 'cr', 'pa', 'gt', 'hn', 'ni', 'sv', 'do'],
        fil: ['ph'], fr: ['fr', 'be', 'ch', 'ca', 'lu', 'mc'], hi: ['in'], id: ['id'],
        it: ['it', 'ch', 'sm'], ja: ['jp'], ko: ['kr'], ms: ['my', 'bn', 'sg'],
        nl: ['nl', 'be'], no: ['no'], pl: ['pl'], pt: ['pt', 'br'], ru: ['ru', 'by', 'kz', 'kg'],
        sv: ['se', 'fi'], th: ['th'], tr: ['tr', 'cy'], zh: ['cn'], 'zh-hant': ['tw', 'hk', 'mo']
    };
    var homeCountries = LOCALE_HOME[lang.toLowerCase()] ||
        LOCALE_HOME[lang.toLowerCase().split('-')[0]] || [];

    // Word list from the tracker, accurate because it reads the text directly: a
    // non-English review either uses letters outside a-z, or is pure ASCII holding
    // 2+ of these foreign function words (one hit isn't enough, a reviewer named
    // "Dan" matches the Indonesian word).
    var FOREIGN_WORDS = ('und nicht kein keine nur auch sehr ist das der wirklich jetzt oder ' +
        'le les une des est pour avec tres cette ' +
        'muy que para esta una los las con este pero ' +
        'che il per molto questa ' +
        'uma muito com por isso ' +
        'het een niet erg deze ' +
        'och att det inte den ikke og ett ' +
        'yang dan untuk tidak ini ang mga').split(' ');
    function likelyEnglish(text) {
        if (!/\p{L}/u.test(text)) return true;           // emoji only, nothing to do
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            if (/\p{L}/u.test(ch) && !/[a-zA-Z]/.test(ch)) return false;
        }
        var words = text.toLowerCase().match(/[a-z']+/g) || [];
        var hits = 0;
        words.forEach(function (w) { if (FOREIGN_WORDS.indexOf(w) !== -1) hits++; });
        return hits < 2;
    }

    var isEnglishPage = lang.toLowerCase().split('-')[0] === 'en';

    function needsTranslation(r) {
        // On the English page the word list can inspect the text itself, which is
        // more accurate than guessing from the storefront. Elsewhere there's no
        // equivalent test for "is this German?", so fall back to the storefront.
        if (isEnglishPage) return !likelyEnglish((r.title || '') + ' ' + (r.body || ''));
        return homeCountries.indexOf(r.cc) === -1;
    }

    // Whether a review's text overflows depends only on its text and the column
    // width, so it's measured once per review and cached. Re-measuring on every
    // filter change meant ~80 forced synchronous layouts per render, which is what
    // made the cards appear before their contents settled.
    //
    // -webkit-line-clamp makes scrollHeight match clientHeight, so "does it
    // overflow" has to be answered with the clamp lifted. Doing that per card
    // interleaves write/read/write and thrashes layout, so the batch is measured
    // in phases instead: unclamp all, read all, re-clamp all, read all.
    var clipCache = {};
    var pendingMeasure = [];

    function flushMeasure() {
        if (!pendingMeasure.length) return;
        var items = pendingMeasure;
        pendingMeasure = [];
        items.forEach(function (it) { it.body.classList.remove('is-clamped'); });
        items.forEach(function (it) { it.full = it.body.scrollHeight; });
        items.forEach(function (it) { it.body.classList.add('is-clamped'); });
        items.forEach(function (it) { it.clamped = it.body.clientHeight; });
        items.forEach(function (it) {
            var clipped = it.full - it.clamped > 2;
            clipCache[it.id] = clipped;
            it.apply(clipped);
        });
    }

    function applyClip(body, expand, clipped) {
        if (clipped) expand.hidden = false;
        else body.classList.remove('is-clamped');
    }

    // The developer's own reply, shown under the review it answers.
    function responseBlock(reply) {
        var box = document.createElement('div');
        box.className = 'rv-response';

        var head = document.createElement('div');
        head.className = 'rv-response-head';
        var label = document.createElement('span');
        label.className = 'rv-response-label';
        label.textContent = t('devresponse', 'Response from the developer');
        head.appendChild(label);

        // Parse YYYY-MM-DD as a local date. `new Date('2026-02-07')` is UTC
        // midnight, which renders as the 6th anywhere west of Greenwich.
        var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(reply.date || '');
        var when = parts
            ? new Date(+parts[1], +parts[2] - 1, +parts[3]).getTime()
            : new Date(reply.date).getTime();
        if (when) {
            var d = document.createElement('span');
            d.className = 'rv-response-date';
            d.textContent = absoluteDate(when);
            head.appendChild(d);
        }
        if (reply.fixedIn) {
            var fixed = document.createElement('span');
            fixed.className = 'rv-fixed-tag';
            fixed.textContent = fill(t('fixedin', 'Fixed in v{v}'), { v: reply.fixedIn });
            head.appendChild(fixed);
        }
        box.appendChild(head);

        var p = document.createElement('p');
        p.className = 'rv-response-body is-clamped';
        p.textContent = reply.text;
        box.appendChild(p);
        return box;
    }

    // Renders the translation under the original so both stay readable.
    function translateButton(r, art, body) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rv-card-expand rv-translate';
        btn.textContent = t('translate', 'Translate');
        btn.addEventListener('click', function () {
            btn.disabled = true;
            btn.textContent = t('translating', 'Translating\u2026');
            Promise.all([
                r.title ? translateToEnglish(r.title) : { text: '', src: '' },
                r.body ? translateToEnglish(r.body) : { text: '', src: '' }
            ]).then(function (res) {
                var ti = res[0], bo = res[1];
                if ((bo.src || ti.src) === lang.split('-')[0]) {
                    btn.textContent = t('alreadylang', 'Already in your language');
                    return;
                }
                var box = document.createElement('div');
                box.className = 'rv-translation';
                var tag = document.createElement('span');
                tag.className = 'rv-translation-tag';
                tag.textContent = t('translated', 'Translated');
                box.appendChild(tag);
                if (ti.text) {
                    var h = document.createElement('p');
                    h.className = 'rv-translation-title';
                    h.textContent = ti.text;
                    box.appendChild(h);
                }
                if (bo.text) {
                    var b = document.createElement('p');
                    b.className = 'rv-translation-body';
                    b.textContent = bo.text;
                    box.appendChild(b);
                }
                body.classList.remove('is-clamped');
                body.parentNode.insertBefore(box, body.nextSibling);
                art.dataset.rvOpen = '1';
                art.style.height = 'auto';
                btn.remove();
                // Translating already shows the review in full, so its "Read full
                // review" toggle would now do nothing. A reply link stays: the
                // reply is still collapsed.
                if (!art.classList.contains('has-reply')) {
                    var stale = art.querySelector('.rv-card-actions .rv-card-expand');
                    if (stale) stale.remove();
                }
                equalise();
            }).catch(function () {
                btn.disabled = false;
                btn.textContent = t('translatefailed', 'Translation failed, tap to retry');
            });
        });
        return btn;
    }

    function card(r) {
        var art = document.createElement('article');
        art.className = 'rv-card';
        if (RESPONSES[r.id]) art.classList.add('has-reply');
        var ts = reviewTime(r);
        var isNew = Date.now() - ts <= WEEK;
        if (isNew) art.classList.add('is-new');

        var top = document.createElement('div');
        top.className = 'rv-card-top';
        top.appendChild(starString(r.rating));
        var date = document.createElement('span');
        date.className = 'rv-card-date';
        if (isNew) {
            var tag = document.createElement('span');
            tag.className = 'rv-new-tag';
            tag.textContent = t('newtag', 'New');
            date.appendChild(tag);
        }
        date.appendChild(document.createTextNode(ts ? absoluteDate(ts) : ''));
        top.appendChild(date);
        art.appendChild(top);

        if (r.title) {
            var h = document.createElement('h3');
            h.className = 'rv-card-title';
            h.textContent = r.title;
            art.appendChild(h);
        }

        var body = document.createElement('p');
        body.className = 'rv-card-body is-clamped';
        body.textContent = r.body || '';
        art.appendChild(body);

        var reply = RESPONSES[r.id];

        var expand = document.createElement('button');
        expand.type = 'button';
        expand.className = 'rv-card-expand';
        expand.textContent = t('readmore', 'Read full review');
        expand.hidden = true;
        expand.addEventListener('click', function () {
            body.classList.remove('is-clamped');
            var rb = art.querySelector('.rv-response-body');
            if (rb) rb.classList.remove('is-clamped');
            art.dataset.rvOpen = '1';    // opt out of height equalisation
            art.style.height = 'auto';
            equalise();
        });
        var actions = document.createElement('div');
        actions.className = 'rv-card-actions';
        art.appendChild(actions);

        actions.appendChild(expand);
        if (reply) {
            expand.textContent = t('readreply', 'Read the developer\'s reply');
            expand.hidden = false;
        } else {
            expand.addEventListener('click', function () { expand.remove(); });
            var known = clipCache[r.id];
            if (known === undefined) {
                pendingMeasure.push({
                    id: r.id,
                    body: body,
                    apply: function (clipped) { applyClip(body, expand, clipped); }
                });
            } else {
                applyClip(body, expand, known);
            }
        }

        if (needsTranslation(r)) {
            actions.appendChild(translateButton(r, art, body));
        }

        var foot = document.createElement('div');
        foot.className = 'rv-card-foot';
        var author = document.createElement('span');
        author.className = 'rv-card-author';
        author.textContent = r.author || '';
        var meta = document.createElement('span');
        meta.className = 'rv-card-meta';
        meta.textContent = flag(r.cc) + ' ' + countryName(r.cc) + (r.version ? ' · v' + r.version : '');
        foot.appendChild(author);
        foot.appendChild(meta);
        art.appendChild(foot);

        // After the reviewer's attribution, so the byline clearly closes their
        // review rather than looking like it signs the reply.
        if (reply) {
            var block = responseBlock(reply);
            block.hidden = true;
            art.appendChild(block);
            expand.addEventListener('click', function () {
                block.hidden = false;
                expand.remove();
            });
        }
        return art;
    }

    // Every card gets the same height: measure the natural tallest, then pin all
    // of them to it. Grid stretching can't do this across rows, and clamping alone
    // still leaves rows of differing heights.
    var equaliseTimer = 0;
    var lastTallest = 0;

    // Phased so the whole grid costs one layout flush, not one per card: release
    // every height, then read every height, then pin every height.
    function measureAndPin() {
        var cards = el.list.querySelectorAll('.rv-card');
        if (!cards.length) return;
        var live = [];
        cards.forEach(function (c) {
            if (c.dataset.rvOpen) return;
            c.style.height = 'auto';
            live.push(c);
        });
        var tallest = 0;
        live.forEach(function (c) { tallest = Math.max(tallest, c.offsetHeight); });
        lastTallest = tallest;
        live.forEach(function (c) { c.style.height = tallest + 'px'; });
    }

    // Debounced form, for resize and for cards the reader expands. The first
    // render calls measureAndPin() directly instead: clamps are already resolved
    // synchronously by then, so waiting would just show one frame of unsized cards.
    function equalise() {
        clearTimeout(equaliseTimer);
        equaliseTimer = setTimeout(measureAndPin, 60);
    }

    // Emoji and fallback fonts can land after first layout and change card heights.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(equalise);

    var resizeTimer = 0;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            // Column width changed, so cached overflow and row height are stale.
            clipCache = {};
            lastTallest = 0;
            // Rotating a phone changes how many fit before "show all". Leave the
            // list alone once the reader has asked for everything.
            var want = pageSize();
            if (state.shown !== Infinity && state.shown !== want) {
                state.shown = want;
                render();
            } else {
                equalise();
            }
        }, 150);
    }, { passive: true });

    function render() {
        var rows = visible();
        var slice = rows.slice(0, state.shown);
        // Filtering used to hard-swap the grid: cards appeared at their natural
        // height, then snapped when equalise() ran 60ms later. Pre-apply the known
        // height below so nothing jumps. The cards fade themselves in via CSS —
        // fading the whole container instead just blanks it for a frame.
        el.list.textContent = '';

        if (!rows.length) {
            var empty = document.createElement('p');
            empty.className = 'rv-empty';
            // A storefront can carry plenty of ratings and no written reviews at
            // all — say so rather than implying there's nothing there.
            var ratings = state.cc === 'all' ? 0 : totalsFor(state.cc).total;
            empty.textContent = (state.cc !== 'all' && state.stars === 'all' && ratings)
                ? fill(t('emptycountry', '{country} has {n} ratings but no written reviews yet.'),
                    { country: countryName(state.cc), n: ratings.toLocaleString(lang) })
                : t('empty', 'No reviews match that filter yet.');
            el.list.appendChild(empty);
        } else {
            var frag = document.createDocumentFragment();
            slice.forEach(function (r) { frag.appendChild(card(r)); });
            el.list.appendChild(frag);
        }

        // The empty-state card already says it; don't also print "0 of 0".
        el.countLine.hidden = !rows.length;
        el.countLine.textContent = fill(rows.length === 1
            ? t('showingone', 'Showing the only written review')
            : t('showing', 'Showing {shown} of {total} written reviews'),
            { shown: slice.length, total: rows.length });

        // Resolve every clamp, then size the cards, all before this task yields, so
        // nothing renders half-settled. The height is always re-measured rather
        // than reused: a filtered set can contain a card taller than the last one,
        // and pinning it shorter compresses the flex children, which clipped the
        // title mid-line.
        flushMeasure();
        measureAndPin();

        var left = rows.length - slice.length;
        el.more.hidden = left <= 0;
        if (left > 0) {
            // Reveals everything left, not another page. Someone who clicks this
            // wants the rest of the reviews, not a second helping of twelve.
            el.more.textContent = fill(t('showall', 'Show all {n} reviews'), { n: rows.length });
        }
    }

    // Totals for one storefront, or every storefront when cc is 'all'.
    function totalsFor(cc) {
        var countries = (state.latest && state.latest.countries) || {};
        var hist = (state.histograms && state.histograms.countries) || {};
        var total = 0, weighted = 0, buckets = [0, 0, 0, 0, 0];
        Object.keys(countries).forEach(function (code) {
            if (cc !== 'all' && code !== cc) return;
            total += countries[code].count;
            weighted += countries[code].count * countries[code].avg;
        });
        Object.keys(hist).forEach(function (code) {
            if (cc !== 'all' && code !== cc) return;
            (hist[code].counts || []).forEach(function (v, i) { buckets[i] += v; });
        });
        return { total: total, avg: total ? weighted / total : 0, buckets: buckets };
    }

    function buildSummary() {
        var d = totalsFor(state.cc);

        el.avg.textContent = d.total ? d.avg.toFixed(1) : '—';
        el.count.textContent = d.total.toLocaleString(lang);
        el.avgStars.textContent = d.total ? ('★★★★★'.slice(0, Math.round(d.avg)) || '★') : '';

        // No scope heading: the storefront picker already names what's on screen,
        // and repeating it above the control read as duplicated state.
        // Apple only publishes a star breakdown per storefront, so say when it's missing.
        var histTotal = d.buckets.reduce(function (a, b) { return a + b; }, 0);
        var missing = state.cc !== 'all' && !histTotal && d.total;
        el.note.hidden = !missing;
        if (missing) el.note.textContent = t('nobreakdown', '(no star breakdown published)');

        var rows = el.histogram.querySelectorAll('.rv-bar-row');
        var maxBucket = Math.max.apply(null, d.buckets);
        var label = [];
        d.buckets.forEach(function (count, i) {
            var row = rows[i];
            if (!row) return;
            row.querySelector('.rv-bar-fill').style.width =
                (maxBucket ? (count / maxBucket) * 100 : 0).toFixed(1) + '%';
            row.querySelector('.rv-bar-num').textContent = count.toLocaleString(lang);
            label.push(count + ' ' + (5 - i) + '\u2605');
        });
        el.histogram.setAttribute('aria-label',
            fill(t('histlabel', 'Rating breakdown: {rows}'), { rows: label.join(', ') }));
    }

    function buildWeek() {
        var since = Date.now() - WEEK;
        var reviews = state.reviews.filter(function (r) {
            return state.cc === 'all' || r.cc === state.cc;
        });

        // Roll the hourly delta events up per storefront so visitors can see
        // where the week's ratings actually came from.
        var newRatings = 0;
        var byCountry = {};
        (state.events || []).forEach(function (ev) {
            var at = new Date(ev.at).getTime();
            if (at < since || typeof ev.to !== 'number' || typeof ev.from !== 'number') return;
            if (state.cc !== 'all' && ev.cc !== state.cc) return;
            var delta = Math.max(0, ev.to - ev.from);
            if (!delta) return;
            newRatings += delta;
            byCountry[ev.cc] = (byCountry[ev.cc] || 0) + delta;
        });

        el.weekNum.textContent = newRatings.toLocaleString(lang);
        if (newRatings > 0) el.weekNum.classList.add('is-up');

        el.weekCountries.textContent = '';
        if (state.cc !== 'all') byCountry = {};
        Object.keys(byCountry).sort(function (a, b) {
            return byCountry[b] - byCountry[a] || countryName(a).localeCompare(countryName(b), lang);
        }).forEach(function (cc) {
            var li = document.createElement('li');
            li.appendChild(document.createTextNode(flag(cc) + ' ' + countryName(cc) + ' '));
            var n = document.createElement('span');
            n.className = 'rv-week-cc-num';
            n.textContent = '+' + byCountry[cc];
            li.appendChild(n);
            el.weekCountries.appendChild(li);
        });

        var fresh = reviews.filter(function (r) { return reviewTime(r) >= since; })
            .sort(function (a, b) { return reviewTime(b) - reviewTime(a); });

        el.week.hidden = false;

        if (!fresh.length) {
            el.weekReviews.hidden = true;
            el.weekEmpty.hidden = false;
            el.weekEmpty.textContent = t('weeknone', 'No new written reviews this week. Ratings without a written review are counted above.');
            return;
        }

        el.weekEmpty.hidden = true;
        el.weekReviews.hidden = false;
        el.week.hidden = false;
        el.weekSubhead.textContent = fill(fresh.length === 1
            ? t('weekone', '{n} new written review')
            : t('weekmany', '{n} new written reviews'), { n: fresh.length });
        el.weekList.textContent = '';
        var frag = document.createDocumentFragment();
        fresh.forEach(function (r) { frag.appendChild(card(r)); });
        el.weekList.appendChild(frag);
    }

    // Every storefront that has ratings, not just the ones with written reviews —
    // a country can have plenty of ratings and nothing written.
    function buildCountries() {
        var countries = (state.latest && state.latest.countries) || {};
        var ccs = Object.keys(countries).filter(function (cc) { return countries[cc].count > 0; });
        ccs.sort(function (a, b) {
            return countries[b].count - countries[a].count ||
                countryName(a).localeCompare(countryName(b), lang);
        });
        var frag = document.createDocumentFragment();
        ccs.forEach(function (cc) {
            var opt = document.createElement('option');
            opt.value = cc;
            // Count always shown, on every screen size. Long entries wrap to two
            // lines in the native picker on a phone, which is the accepted trade.
            opt.textContent = flag(cc) + ' ' + countryName(cc) + ' · ' +
                fill(countries[cc].count === 1
                    ? t('nrating', '{n} rating')
                    : t('nratings', '{n} ratings'), { n: countries[cc].count });
            frag.appendChild(opt);
        });
        el.country.appendChild(frag);
        el.country.disabled = false;
    }

    function applyCountry() {
        buildSummary();
        buildWeek();
        state.shown = pageSize();
        render();
    }

    function disableEmptyChips() {
        var byStar = {};
        state.reviews.forEach(function (r) { byStar[r.rating] = (byStar[r.rating] || 0) + 1; });
        panel.querySelectorAll('.rv-chip').forEach(function (chip) {
            var v = chip.getAttribute('data-rv-stars');
            if (v !== 'all' && !byStar[v]) chip.disabled = true;
        });
    }

    function wire() {
        panel.querySelectorAll('.rv-chip').forEach(function (chip) {
            chip.addEventListener('click', function () {
                if (chip.disabled) return;
                panel.querySelectorAll('.rv-chip').forEach(function (c) { c.classList.remove('is-active'); });
                chip.classList.add('is-active');
                state.stars = chip.getAttribute('data-rv-stars');
                state.shown = pageSize();
                render();
            });
        });
        el.country.addEventListener('change', function () {
            state.cc = el.country.value;
            applyCountry();
        });
        el.sort.addEventListener('change', function () {
            state.sort = el.sort.value;
            state.shown = pageSize();
            render();
        });
        el.more.addEventListener('click', function () {
            state.shown = Infinity;
            render();
        });
    }

    function getJSON(name) {
        // GitHub Pages serves these with cache-control: max-age=600, so without
        // this the browser reuses its copy for ten minutes and the page can sit on
        // stale counts after an hourly collect lands. 'no-cache' revalidates with
        // the ETag every load: a 304 when nothing changed, fresh data when it did.
        return fetch(BASE + name, {
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-cache'
        }).then(function (res) {
            if (!res.ok) throw new Error(name + ' ' + res.status);
            return res.json();
        });
    }

    var started = false;
    function load() {
        if (started) return;
        started = true;
        panel.setAttribute('data-rv-state', 'loading');

        Promise.all([
            getJSON('latest.json'),
            getJSON('histograms.json'),
            getJSON('reviews.json'),
            getJSON('events.json').catch(function () { return []; })
        ]).then(function (data) {
            var latest = data[0], histograms = data[1], reviews = data[2], events = data[3];
            state.reviews = (reviews || []).filter(function (r) { return r && r.cc && r.rating; });
            state.latest = latest;
            state.histograms = histograms;
            state.events = events || [];

            buildSummary();
            buildWeek();
            buildCountries();
            disableEmptyChips();

            var fetchedAt = new Date(latest.fetchedAt).getTime();
            if (fetchedAt) {
                el.updatedText.textContent = '';
                var strong = document.createElement('strong');
                strong.textContent = relativeTime(fetchedAt);
                // fetchedAt only advances when a run actually finds something new,
                // so it's the last *change*, not the last check. The check is hourly.
                el.updatedText.appendChild(document.createTextNode(t('updatedpre', 'Checked hourly · last new rating ')));
                el.updatedText.appendChild(strong);
                el.updatedText.appendChild(document.createTextNode(t('updatedpost', '')));
                el.updatedText.parentNode.setAttribute('title', new Date(fetchedAt).toLocaleString(lang));
            }

            el.controls.hidden = false;
            state.shown = pageSize();
            wire();
            render();
            panel.setAttribute('data-rv-state', 'live');
        }).catch(function (err) {
            // Leave the statically rendered reviews in place; they're real too.
            panel.setAttribute('data-rv-state', 'static');
            if (window.console && console.warn) console.warn('[reviews] live data unavailable:', err);
        });
    }

    // The section sits just under the hero, so it's in view on load. Hold the
    // fetch until the page has settled rather than racing the hero video.
    // Loaded unconditionally rather than on scroll: this section sits directly
    // under the hero, so an IntersectionObserver gate raced the fold (the panel
    // landed within a pixel of the trigger threshold and loading became a coin
    // flip). Idle scheduling still keeps it off the hero's critical path.
    var go = function () {
        if (window.requestIdleCallback) requestIdleCallback(load, { timeout: 1500 });
        else setTimeout(load, 200);
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
}());
