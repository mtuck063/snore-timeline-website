// ============================================
// ANONYMOUS EVENT COUNTING (GoatCounter)
// ============================================
// Loaded by the GoatCounter loader in script.js and support/support-nav.js, so
// every page and locale gets it without touching the HTML. Counts taps and how
// far people scroll on the homepage. Like page counting, it sets no cookies and
// sends no personal data: just an event name and the page path.
//
// Event names (query them with .claude/gc_events.py):
//   appstore:<area>:<place>   tap on a Snore Timeline App Store link
//   play:<area>:<place>       tap on the Google Play link
//   review:<area>:<place>     tap on "write a review"
//   tip:<amount>:<area>       tap on a tip amount (Stripe link)
//   faq:<area>:<id>           a FAQ question opened
//   reached:<section>         homepage section scrolled into view (once per visit)
// <area> is home, blog, support, about or other; <place> is the section id,
// header, footer, or the guide's slug on blog pages.
(function initEventCounting() {
    if (window.__stEvents) return;
    window.__stEvents = true;

    const LANGS = /^\/(ar|da|de|es|fil|fr|hi|id|it|ja|ko|ms|nl|no|pl|pt|ru|sv|th|tr|zh|zh-Hant)(?=\/|$)/;
    const path = location.pathname.replace(LANGS, '').replace(/\.html$/, '').replace(/\/index$/, '/') || '/';
    const area = path === '/' ? 'home'
        : path.startsWith('/blog') ? 'blog'
        : path.startsWith('/support') ? 'support'
        : path.startsWith('/about') ? 'about' : 'other';
    const slug = path.split('/').filter(Boolean).pop() || 'index';

    // count.js loads async (and ad blockers stop it), so queue until it's ready
    // and give up quietly after a while.
    const queue = [];
    let tries = 0;
    function flush() {
        const gc = window.goatcounter;
        if (gc && typeof gc.count === 'function') {
            while (queue.length) {
                try { gc.count(queue.shift()); } catch (e) { /* never break the page */ }
            }
            return;
        }
        if (++tries < 40) setTimeout(flush, 250);
    }
    function send(name) {
        queue.push({ path: name, title: location.pathname, event: true });
        flush();
    }

    function place(el) {
        if (el.closest('header, .support-topbar, .header')) return 'header';
        if (el.closest('footer')) return 'footer';
        if (area === 'blog' || area === 'support') return slug;
        // Hero has no id, so fall back to the section's first class name.
        const sec = el.closest('section');
        return sec ? (sec.id || sec.classList[0] || 'page') : 'page';
    }

    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href]');
        if (a) {
            const href = a.href;
            if (/apps\.apple\.com\/.*id6751759381/.test(href)) {
                send((/action=write-review/.test(href) ? 'review:' : 'appstore:') + area + ':' + place(a));
            } else if (/play\.google\.com\/.*com\.meneliktucker\.snoretimeline/.test(href)) {
                send('play:' + area + ':' + place(a));
            } else if (/donate\.stripe\.com/.test(href)) {
                const amt = (a.textContent.match(/\d+/) || ['other'])[0];
                send('tip:' + amt + ':' + area);
            }
        }
    }, true);

    // Homepage FAQ items open on pointerup (see script.js), so watch the open
    // class instead of clicks.
    function watchFaq() {
        const mo = new MutationObserver((muts) => {
            muts.forEach((m) => {
                const el = m.target;
                const was = (m.oldValue || '').split(/\s+/).includes('open');
                if (!was && el.classList.contains('open') && el.id) send('faq:' + area + ':' + el.id);
            });
        });
        document.querySelectorAll('.faq-item[id]').forEach((el) => {
            mo.observe(el, { attributes: true, attributeFilter: ['class'], attributeOldValue: true });
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchFaq);
    else watchFaq();

    document.addEventListener('toggle', (e) => {
        const d = e.target;
        if (d.tagName === 'DETAILS' && d.open && d.classList.contains('faq-entry') && d.id) {
            send('faq:' + area + ':' + d.id);
        }
    }, true);

    // Scroll depth on the homepage: one event per section, the first time its
    // top reaches the upper 60% of the screen.
    if (area === 'home' && 'IntersectionObserver' in window) {
        const seen = new Set();
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => {
                const id = en.target.id;
                if (en.isIntersecting && !seen.has(id)) {
                    seen.add(id);
                    io.unobserve(en.target);
                    send('reached:' + id);
                }
            });
        }, { rootMargin: '0px 0px -40% 0px' });
        const start = () => document.querySelectorAll('body section[id]').forEach((s) => {
            // Only top-level page sections, not sub-blocks inside them.
            if (!s.parentElement.closest('section[id]')) io.observe(s);
        });
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
        else start();
    }
}());
