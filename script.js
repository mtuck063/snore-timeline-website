// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// ENHANCED HEADER WITH SCROLL EFFECTS
// ============================================
const header = document.querySelector('.header');
const hero = document.querySelector('.hero');
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrollY = window.scrollY;

            // Glassmorphic header effect with blur increase
            if (scrollY > 50) {
                header.style.background = 'rgba(26, 31, 46, 0.85)';
                header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.2)';
                header.style.backdropFilter = 'blur(20px)';
            } else {
                header.style.background = 'rgba(26, 31, 46, 0.7)';
                header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
                header.style.backdropFilter = 'blur(10px)';
            }

            ticking = false;
        });
        ticking = true;
    }
});

// ============================================
// PARALLAX EFFECTS FOR IMAGES
// ============================================
const parallaxImages = document.querySelectorAll('.phone-mockup, .breathing-mockup');

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
// INTERSECTION OBSERVER WITH STAGGER & 3D EFFECTS
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
                // Reset to default transform (works for all element types)
                if (entry.target.classList.contains('breathing-feature-item')) {
                    entry.target.style.transform = 'translateX(0)';
                } else {
                    entry.target.style.transform = 'translateY(0) scale(1) rotateX(0deg)';
                }
                staggerObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Feature cards - static (no animation)
    // Animation removed per user request to keep cards always visible

    // Detection steps with stagger
    document.querySelectorAll('.detection-step').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-20px)';
        el.style.transition = `all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.15}s`;
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

    // Testimonial cards with stagger
    document.querySelectorAll('.testimonial-card').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px) scale(0.95)';
        el.style.transition = `all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.15}s`;
        staggerObserver.observe(el);
    });

    // Testimonial illustration
    const illustration = document.querySelector('.testimonial-illustration');
    if (illustration) {
        illustration.style.opacity = '0';
        illustration.style.transform = 'translateY(40px) scale(0.95)';
        illustration.style.transition = 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s';
        staggerObserver.observe(illustration);
    }

    // FAQ items - static (no animation)
    // Animation removed per user request to keep FAQ cards always visible
};

createStaggerObserver();

// 3D tilt effect removed - was visually distracting on feature cards

// ============================================
// TEXT REVEAL ANIMATIONS FOR SECTION TITLES
// ============================================
const createTextRevealEffect = () => {
    const sectionTitles = document.querySelectorAll('.section-title, .breathing-title');

    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const title = entry.target;
                // Apply word reveal animation
                const text = title.textContent;
                const words = text.split(' ');

                title.innerHTML = words.map((word, index) => {
                    return `<span class="word-reveal" style="animation-delay: ${index * 0.08}s">${word}</span>`;
                }).join(' ');

                title.dataset.animated = 'true';
                titleObserver.unobserve(title);
            }
        });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

    sectionTitles.forEach(title => {
        // Check if element is already in viewport on page load
        const rect = title.getBoundingClientRect();
        const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;

        if (isInViewport) {
            // Show immediately without animation for elements already visible
            title.style.opacity = '1';
            title.dataset.animated = 'true';
        } else {
            // Observe elements that need scroll animation
            titleObserver.observe(title);
        }
    });
};

createTextRevealEffect();

// ============================================
// BACKGROUND GRADIENT SHIFT ON SCROLL
// ============================================
const createGradientShift = () => {
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);

        // Shift gradient hue based on scroll
        const hueShift = scrollPercent * 60; // 0 to 60 degree shift
        document.body.style.background = `linear-gradient(180deg,
            hsl(${220 + hueShift}, 25%, 8%) 0%,
            hsl(${230 + hueShift}, 30%, 6%) 100%)`;
    });
};

createGradientShift();

// Mobile menu toggle (if needed in future)
const createMobileMenu = () => {
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelector('.nav-links');

    // Only on mobile
    if (window.innerWidth <= 768) {
        // Implementation for mobile menu can be added here if needed
    }
};

window.addEventListener('resize', createMobileMenu);
createMobileMenu();

// Preload important resources
window.addEventListener('load', () => {
    // Add any preload logic here
});

// Contact email obfuscation
document.addEventListener('DOMContentLoaded', () => {
    const contactBtn = document.getElementById('contactBtn');
    if (contactBtn) {
        contactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Obfuscated email construction
            const user = 'meneliktucker';
            const domain = 'gmail';
            const tld = 'com';
            const subject = 'Snore Timeline Inquiry';
            window.location.href = `mailto:${user}@${domain}.${tld}?subject=${encodeURIComponent(subject)}`;
        });
    }
});

// Download button loading animation
document.addEventListener('DOMContentLoaded', () => {
    const downloadButtons = document.querySelectorAll('.btn-primary, .nav-download-btn');

    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add loading class for visual feedback
            this.classList.add('loading');

            // Remove loading class after a delay (in case user comes back to page)
            setTimeout(() => {
                this.classList.remove('loading');
            }, 3000);
        });
    });
});
