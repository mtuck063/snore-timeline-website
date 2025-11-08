// Support Center navigation: single source of truth for page order and grouping.
// Renders the grouped, collapsible, color-coded sidebar and the prev/next pager.
(function () {
    'use strict';

    var m = window.location.pathname.match(/^\/([a-z]{2})\//);
    var langPrefix = m ? '/' + m[1] : '';

    // Visual sidebar groups, in order. `key` maps to the wayfinding color.
    var GROUPS = [
        { label: 'Recording', key: 'recording', pages: [
            { slug: 'getting-started', title: 'Getting Started' },
            { slug: 'how-detection-works', title: 'How Detection Works' },
            { slug: 'storage-and-quality', title: 'Storage & Quality' },
            { slug: 'siri-and-shortcuts', title: 'Siri, Shortcuts & Widgets' }
        ]},
        { label: 'Your results', key: 'results', pages: [
            { slug: 'timeline-and-playback', title: 'Timeline & Playback' },
            { slug: 'episodes-and-events', title: 'Episodes & Events' },
            { slug: 'breathing-disruptions', title: 'Breathing Disruptions' },
            { slug: 'sleep-stages', title: 'Sleep Stages' },
            { slug: 'sleep-score', title: 'Sleep Score & Insights' }
        ]},
        { label: 'Devices & health', key: 'devices', pages: [
            { slug: 'apple-watch', title: 'Apple Watch & Biometrics' },
            { slug: 'export-and-sharing', title: 'Export & Sharing' },
            { slug: 'android', title: 'Android' }
        ]},
        { label: 'Help', key: 'help', pages: [
            { slug: 'faq', title: 'FAQ' },
            { slug: 'troubleshooting', title: 'Troubleshooting' }
        ]},
        { label: 'Guides', key: 'help', pages: [
            { slug: 'first-week', title: 'Your First Week', guide: true },
            { slug: 'doctor-ready-data', title: 'Doctor-Ready Data', guide: true },
            { slug: 'test-a-remedy', title: 'Testing a Snoring Fix', guide: true },
            { slug: 'deeper-sleep-data', title: 'Deeper Sleep Data', guide: true },
            { slug: 'record-a-partner', title: 'Tracking a Partner', guide: true }
        ]}
    ];

    // Flat order for the prev/next pager.
    var ORDER = [];
    GROUPS.forEach(function (g) { g.pages.forEach(function (p) { ORDER.push(p); }); });

    var current = document.body.getAttribute('data-support-page');

    function el(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text) n.textContent = text;
        return n;
    }

    function renderCurrentSubLinks() {
        var sections = document.querySelectorAll('.privacy-section[id]');
        if (!sections.length) return null;
        var sub = el('div', 'support-nav-sub');
        sections.forEach(function (section) {
            var h = section.querySelector('h2');
            if (!h) return;
            var a = el('a', null, h.textContent);
            a.href = '#' + section.id;
            sub.appendChild(a);
        });
        return sub.children.length ? sub : null;
    }

    function renderSidebar() {
        var nav = document.querySelector('.support-sidebar .support-nav');
        if (!nav) return;

        var home = el('a', 'support-nav-home', 'All support');
        home.href = langPrefix + '/support/';
        nav.appendChild(home);

        GROUPS.forEach(function (group) {
            var hasCurrent = group.pages.some(function (p) { return p.slug === current; });

            var wrap = el('div', 'support-nav-group');
            wrap.setAttribute('data-group', group.key);
            if (!hasCurrent) wrap.classList.add('is-collapsed');

            var btn = el('button', 'support-nav-group-label');
            btn.type = 'button';
            btn.setAttribute('aria-expanded', hasCurrent ? 'true' : 'false');
            btn.appendChild(el('span', 'support-nav-group-dot'));
            btn.appendChild(document.createTextNode(group.label));
            btn.addEventListener('click', function () {
                var collapsed = wrap.classList.toggle('is-collapsed');
                btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            });
            wrap.appendChild(btn);

            var items = el('div', 'support-nav-group-items');
            group.pages.forEach(function (p) {
                var a = el('a', 'support-nav-item', p.title);
                a.href = langPrefix + '/support/' + p.slug;
                if (p.slug === current) a.classList.add('is-current');
                items.appendChild(a);
            });
            wrap.appendChild(items);
            nav.appendChild(wrap);
        });
    }

    function pagerCell(page, label, cls) {
        var a = el('a', cls);
        a.href = langPrefix + '/support/' + page.slug;
        a.appendChild(el('span', 'pager-label', label));
        a.appendChild(el('span', 'pager-title', page.title));
        return a;
    }

    function renderPager() {
        var pager = document.getElementById('support-pager');
        if (!pager || !current) return;
        var i = ORDER.findIndex(function (p) { return p.slug === current; });
        if (i === -1) return;

        if (i > 0) {
            pager.appendChild(pagerCell(ORDER[i - 1], 'Previous', 'pager-prev'));
        } else {
            var hub = el('a', 'pager-prev');
            hub.href = langPrefix + '/support/';
            hub.appendChild(el('span', 'pager-label', 'Previous'));
            hub.appendChild(el('span', 'pager-title', 'All support'));
            pager.appendChild(hub);
        }
        if (i < ORDER.length - 1) {
            pager.appendChild(pagerCell(ORDER[i + 1], 'Next', 'pager-next'));
        } else {
            pager.appendChild(el('span', 'pager-spacer'));
        }
    }

    renderSidebar();
    renderPager();
})();

/* Magnify pop-out connectors: draw a "zoom cone" from the highlighted
   region on the phone to the zoomed-in detail card. */
(function () {
    var SVGNS = 'http://www.w3.org/2000/svg';
    function draw() {
        var wide = window.matchMedia('(min-width: 681px)').matches;
        document.querySelectorAll('.feature-magnify').forEach(function (fm) {
            var region = fm.querySelector('.magnify-region');
            var img = fm.querySelector('.magnify-detail img');
            var svg = fm.querySelector('.magnify-connector');
            if (!region || !img) return;
            if (!wide) { if (svg) svg.innerHTML = ''; return; }
            if (!svg) {
                svg = document.createElementNS(SVGNS, 'svg');
                svg.setAttribute('class', 'magnify-connector');
                svg.setAttribute('aria-hidden', 'true');
                fm.insertBefore(svg, fm.firstChild);
            }
            var f = fm.getBoundingClientRect();
            var r = region.getBoundingClientRect();
            var d = img.getBoundingClientRect();
            svg.setAttribute('width', f.width);
            svg.setAttribute('height', f.height);
            svg.setAttribute('viewBox', '0 0 ' + f.width + ' ' + f.height);
            var rx = r.right - f.left, rt = r.top - f.top, rb = r.bottom - f.top;
            var dx = d.left - f.left, dt = d.top - f.top, db = d.bottom - f.top;
            svg.innerHTML =
                '<polygon class="mc-fill" points="' + rx + ',' + rt + ' ' + dx + ',' + dt + ' ' + dx + ',' + db + ' ' + rx + ',' + rb + '"/>' +
                '<line class="mc-line" x1="' + rx + '" y1="' + rt + '" x2="' + dx + '" y2="' + dt + '"/>' +
                '<line class="mc-line" x1="' + rx + '" y1="' + rb + '" x2="' + dx + '" y2="' + db + '"/>' +
                '<circle class="mc-dot" cx="' + rx + '" cy="' + ((rt + rb) / 2) + '" r="3"/>';
        });
    }
    if (document.querySelector('.feature-magnify')) {
        window.addEventListener('load', draw);
        window.addEventListener('resize', draw);
        document.querySelectorAll('.feature-magnify img').forEach(function (im) {
            if (!im.complete) im.addEventListener('load', draw);
        });
        if (window.ResizeObserver) {
            var ro = new ResizeObserver(function () { draw(); });
            document.querySelectorAll('.feature-magnify').forEach(function (fm) { ro.observe(fm); });
        }
        draw();
    }
})();

/* Route the "Open app" button to the visitor's store: Android -> Google Play,
   iOS and desktop keep the App Store link already in the markup. */
(function () {
    var cta = document.querySelector('.support-topbar-cta');
    if (cta && /Android/i.test(navigator.userAgent || '')) {
        cta.setAttribute('href', 'https://play.google.com/store/apps/details?id=com.meneliktucker.snoretimeline');
    }
})();

/* Footer language switcher: each language links to the current page, so readers
   stay where they are when switching. Reuses the homepage .lang-switcher styles. */
(function () {
    var col = document.querySelector('.support-footer .support-footer-col');
    if (!col) return;
    var LANGS = [
        ['en', 'ca', 'English'], ['fr', 'fr', 'Français'], ['es', 'es', 'Español'],
        ['zh', 'cn', '中文'], ['de', 'de', 'Deutsch'], ['tr', 'tr', 'Türkçe'],
        ['nl', 'nl', 'Nederlands'], ['ja', 'jp', '日本語'], ['ru', 'ru', 'Русский'],
        ['pl', 'pl', 'Polski'], ['sv', 'se', 'Svenska'], ['da', 'dk', 'Dansk'],
        ['no', 'no', 'Norsk'], ['ko', 'kr', '한국어'], ['th', 'th', 'ไทย']
    ];
    var m = window.location.pathname.match(/^\/([a-z]{2})\/support\//);
    var cur = m ? m[1] : 'en';
    var rest = 'support/' + (document.body.getAttribute('data-support-page') || '');
    function href(code) { return (code === 'en' ? '' : '/' + code) + '/' + rest; }
    var c = LANGS.filter(function (l) { return l[0] === cur; })[0] || LANGS[0];
    var opts = LANGS.map(function (l) {
        return '<a href="' + href(l[0]) + '"' + (l[0] === cur ? ' class="active"' : '') +
            '><img class="lang-flag" src="/flags/' + l[1] + '.svg" alt=""><span class="lang-name">' + l[2] + '</span></a>';
    }).join('');
    col.insertAdjacentHTML('beforeend',
        '<div class="lang-switcher"><button class="lang-switcher-btn" aria-label="Change language">' +
        '<img class="lang-flag" src="/flags/' + c[1] + '.svg" alt=""><span>' + c[2] + '</span>' +
        '<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
        '</button><div class="lang-dropdown">' + opts + '</div></div>');

    var sw = col.querySelector('.lang-switcher'), btn = sw.querySelector('.lang-switcher-btn'), backdrop = null;
    var isMobile = function () { return window.matchMedia('(max-width: 600px)').matches; };
    function close() { sw.classList.remove('open'); document.body.classList.remove('lang-sheet-open'); if (backdrop) { backdrop.remove(); backdrop = null; } }
    function open() {
        sw.classList.add('open');
        if (isMobile()) { document.body.classList.add('lang-sheet-open'); backdrop = document.createElement('div'); backdrop.className = 'lang-backdrop'; backdrop.addEventListener('click', close); document.body.appendChild(backdrop); }
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); sw.classList.contains('open') ? close() : open(); });
    document.addEventListener('click', function (e) { if (!sw.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();
