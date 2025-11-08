// ============================================
// ANDROID BETA BANNER
// ============================================
const androidBanner = document.getElementById('androidBanner');
if (androidBanner && localStorage.getItem('androidBannerDismissed')) {
    androidBanner.classList.add('hidden');
}

function dismissBanner() {
    const banner = document.getElementById('androidBanner');
    if (banner) {
        banner.classList.add('hidden');
        localStorage.setItem('androidBannerDismissed', '1');
    }
}

// ============================================
// HERO VIDEO DELAYED START
// ============================================
const heroVideo = document.getElementById('hero-video');
if (heroVideo) {
    setTimeout(() => {
        heroVideo.play();
    }, 3000);
}

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
window.addEventListener('scroll', () => {
    const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    const hueShift = scrollPercent * 60;
    document.body.style.background = `linear-gradient(180deg,
        hsl(${220 + hueShift}, 25%, 8%) 0%,
        hsl(${230 + hueShift}, 30%, 6%) 100%)`;
});

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
    const switcher = document.querySelector('.lang-switcher');
    if (!switcher) return;
    const btn = switcher.querySelector('.lang-switcher-btn');
    btn.addEventListener('click', () => switcher.classList.toggle('open'));
    document.addEventListener('click', (e) => {
        if (!switcher.contains(e.target)) switcher.classList.remove('open');
    });
});

// ============================================
// FAQ ACCORDION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item h3');

    faqItems.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            item.classList.toggle('open');
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

            float t = time * 0.06 + random(uv.x) * 0.4;
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

    let time = 1.0;

    function resize() {
        const hero = canvas.parentElement;
        const w = hero.offsetWidth;
        const h = hero.offsetHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(resLoc, canvas.width, canvas.height);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    function animate() {
        time += 0.05;
        gl.uniform1f(timeLoc, time);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(animate);
    }

    animate();
}());
