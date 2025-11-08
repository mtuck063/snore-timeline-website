// Shared client-side search for the support center.
// SnoreSearch.hub()  -> site-wide search box with a ranked, highlighted dropdown
// SnoreSearch.faq()  -> live filter for the FAQ accordion
// Both use the same synonym-aware token matcher. No dependencies, no backend.
//
// Language support: hub() and faq() accept an opts object so translated centers
// can pass their own index URL, synonym groups, and UI strings. With no opts the
// English defaults apply, so the /support pages stay unchanged.
window.SnoreSearch = (function () {
    'use strict';

    // English synonym groups: a query token matches any term in a group it belongs to.
    // Translated pages pass their own groups via opts.syn (or carry them in the index file).
    var EN_SYN = [
        ['apnea', 'breathing', 'disruption', 'pause', 'gasp'],
        ['spo2', 'oxygen', 'o2'],
        ['airpods', 'bluetooth', 'earbud', 'headphone'],
        ['heart rate', 'pulse', 'bpm', 'heartrate'],
        ['hrv', 'variability'],
        ['decibel', 'loudness', 'volume'],
        ['hypnogram', 'stage', 'rem', 'deep sleep', 'light sleep'],
        ['watch', 'wrist', 'complication'],
        ['health', 'healthkit'],
        ['export', 'share', 'sharing', 'csv', 'report', 'zip'],
        ['cost', 'subscription', 'free', 'price', 'paid', 'purchase'],
        ['privacy', 'private', 'cloud', 'account'],
        ['battery', 'charge', 'charging', 'power'],
        ['siri', 'shortcut', 'voice'],
        ['placement', 'position', 'nightstand', 'distance', 'place'],
        ['quality', 'fidelity', 'storage', 'space'],
        ['wearable', 'oura', 'whoop', 'garmin', 'ring']
    ];

    function expand(tok, syn) {
        syn = syn || EN_SYN;
        var set = {}; set[tok] = 1;
        syn.forEach(function (g) {
            if (g.some(function (term) { return term.indexOf(tok) !== -1 || tok.indexOf(term) !== -1; })) {
                g.forEach(function (term) { set[term] = 1; });
            }
        });
        return Object.keys(set);
    }
    // A token "matches" a haystack if the token or any synonym is a substring.
    function tokenMatch(tok, hay, syn) {
        return expand(tok, syn).some(function (m) { return hay.indexOf(m) !== -1; });
    }
    function esc(t) { return t.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function escRe(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

    function hub(inputSel, boxSel, opts) {
        opts = opts || {};
        var indexUrl = opts.index || '/support/search-index.json';
        var emptyText = opts.emptyText || 'No matches. Try fewer or different words.';
        var syn = opts.syn || EN_SYN;
        var input = document.querySelector(inputSel);
        var box = document.querySelector(boxSel);
        if (!input || !box) return;
        var records = [], current = [], active = -1;
        fetch(indexUrl).then(function (r) { return r.json(); }).then(function (d) {
            var recs = Array.isArray(d) ? d : (d.records || []);
            if (!opts.syn && !Array.isArray(d) && d.syn) syn = d.syn;
            records = recs.map(function (rec) { return { rec: rec, t: rec.t.toLowerCase(), b: (rec.b || '') }; });
        }).catch(function () {});

        function rank(q) {
            var toks = q.split(/\s+/).filter(Boolean), out = [];
            records.forEach(function (x) {
                var s = 0, ok = true;
                toks.forEach(function (tok) {
                    var inT = tokenMatch(tok, x.t, syn), inB = tokenMatch(tok, x.b, syn);
                    if (!inT && !inB) ok = false;
                    s += (inT ? 3 : 0) + (inB ? 1 : 0);
                });
                if (!ok) return;
                if (x.t.indexOf(q) !== -1) s += 5; else if (x.b.indexOf(q) !== -1) s += 2;
                out.push({ x: x, s: s });
            });
            out.sort(function (a, b) { return b.s - a.s; });
            return out.slice(0, 8).map(function (o) { return o.x; });
        }
        function hl(text, toks) {
            var o = esc(text);
            toks.forEach(function (tok) { if (tok) o = o.replace(new RegExp('(' + escRe(esc(tok)) + ')', 'ig'), '<mark>$1</mark>'); });
            return o;
        }
        function render() {
            var q = input.value.trim().toLowerCase();
            if (!q) { box.hidden = true; box.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); current = []; active = -1; return; }
            var toks = q.split(/\s+/).filter(Boolean);
            current = rank(q); active = -1;
            box.innerHTML = current.length
                ? current.map(function (x, i) {
                    return '<a class="hub-search-hit" href="' + x.rec.u + '" role="option" data-i="' + i + '">' +
                        '<span class="hub-search-hit-t">' + hl(x.rec.t, toks) + '</span>' +
                        '<span class="hub-search-hit-c">' + esc(x.rec.c) + '</span></a>';
                }).join('')
                : '<p class="hub-search-empty">' + esc(emptyText) + '</p>';
            box.hidden = false; input.setAttribute('aria-expanded', 'true');
        }
        function setActive(n) {
            var hits = box.querySelectorAll('.hub-search-hit');
            if (!hits.length) return;
            active = (n + hits.length) % hits.length;
            hits.forEach(function (h, i) { h.classList.toggle('is-active', i === active); });
            hits[active].scrollIntoView({ block: 'nearest' });
        }
        input.addEventListener('input', render);
        input.addEventListener('focus', render);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
            else if (e.key === 'Enter') { if (active >= 0 && current[active]) location.href = current[active].rec.u; }
            else if (e.key === 'Escape') { box.hidden = true; input.blur(); }
        });
        document.addEventListener('click', function (e) {
            if (!input.contains(e.target) && !box.contains(e.target)) { box.hidden = true; input.setAttribute('aria-expanded', 'false'); }
        });
    }

    function faq(inputSel, opts) {
        opts = opts || {};
        var syn = opts.syn || EN_SYN;
        // Default English count text; translated pages pass their own.
        var countText = opts.countText || function (shown, total) {
            return shown + (shown === 1 ? ' question' : ' questions') + ' of ' + total;
        };
        var input = document.querySelector(inputSel);
        if (!input) return;
        var entries = [].slice.call(document.querySelectorAll('.faq-entry'));
        var cats = [].slice.call(document.querySelectorAll('.faq-cat'));
        var count = document.querySelector('.faq-search-count');
        var nores = document.querySelector('.faq-noresults');
        var noresTerm = nores ? nores.querySelector('b') : null;
        var total = entries.length;
        entries.forEach(function (e) { e._txt = (e.textContent || '').toLowerCase(); });

        function apply() {
            var q = input.value.trim().toLowerCase();
            var toks = q.split(/\s+/).filter(Boolean);
            var shown = 0;
            entries.forEach(function (e) {
                var match = !q || toks.every(function (tok) { return tokenMatch(tok, e._txt, syn); });
                e.classList.toggle('is-hidden', !match);
                if (match) shown++;
                if (!q) e.open = false;
            });
            cats.forEach(function (c) { c.classList.toggle('is-hidden', !c.querySelector('.faq-entry:not(.is-hidden)')); });
            if (q) {
                if (count) count.textContent = countText(shown, total);
                if (nores) { nores.hidden = shown > 0; if (noresTerm) noresTerm.textContent = '“' + input.value.trim() + '”'; }
                var vis = entries.filter(function (e) { return !e.classList.contains('is-hidden'); });
                if (vis.length === 1) vis[0].open = true;
            } else {
                if (count) count.textContent = '';
                if (nores) nores.hidden = true;
            }
        }
        input.addEventListener('input', apply);
        // Translated pages can load synonyms from their index file; refresh once it arrives.
        if (opts.index) {
            fetch(opts.index).then(function (r) { return r.json(); }).then(function (d) {
                if (!opts.syn && !Array.isArray(d) && d.syn) { syn = d.syn; if (input.value.trim()) apply(); }
            }).catch(function () {});
        }
        if (location.hash) {
            var t = document.getElementById(location.hash.slice(1));
            if (t && t.classList.contains('faq-entry')) { t.open = true; t.scrollIntoView(); }
        }
    }

    // Dropdown search for the FAQ page: ranks the on-page questions and, on
    // selection, opens and scrolls to that entry (stays on the page). Same look
    // and keyboard behavior as hub().
    function faqSearch(inputSel, boxSel, opts) {
        opts = opts || {};
        var syn = opts.syn || EN_SYN;
        var emptyText = opts.emptyText || 'No questions match. Try fewer or different words.';
        var input = document.querySelector(inputSel);
        var box = document.querySelector(boxSel);
        if (!input || !box) return;
        var count = document.querySelector('.faq-search-count');
        var nores = document.querySelector('.faq-noresults');
        if (nores) nores.hidden = true;
        var entries = [].slice.call(document.querySelectorAll('.faq-entry')).map(function (el) {
            var sum = el.querySelector('summary');
            var cat = el.closest('.faq-cat');
            var h = cat ? cat.querySelector('h2') : null;
            return {
                el: el, id: el.id,
                t: (sum ? sum.textContent : '').trim(),
                tl: (sum ? sum.textContent : '').toLowerCase(),
                cat: h ? h.textContent.trim() : '',
                b: (el.textContent || '').toLowerCase()
            };
        });
        var current = [], active = -1;

        function rank(q) {
            var toks = q.split(/\s+/).filter(Boolean), out = [];
            entries.forEach(function (x) {
                var s = 0, ok = true;
                toks.forEach(function (tok) {
                    var inT = tokenMatch(tok, x.tl, syn), inB = tokenMatch(tok, x.b, syn);
                    if (!inT && !inB) ok = false;
                    s += (inT ? 3 : 0) + (inB ? 1 : 0);
                });
                if (!ok) return;
                if (x.tl.indexOf(q) !== -1) s += 5; else if (x.b.indexOf(q) !== -1) s += 2;
                out.push({ x: x, s: s });
            });
            out.sort(function (a, b) { return b.s - a.s; });
            return out.slice(0, 8).map(function (o) { return o.x; });
        }
        function hl(text, toks) {
            var o = esc(text);
            toks.forEach(function (tok) { if (tok) o = o.replace(new RegExp('(' + escRe(esc(tok)) + ')', 'ig'), '<mark>$1</mark>'); });
            return o;
        }
        function render() {
            var q = input.value.trim().toLowerCase();
            if (count) count.textContent = '';
            if (!q) { box.hidden = true; box.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); current = []; active = -1; return; }
            var toks = q.split(/\s+/).filter(Boolean);
            current = rank(q); active = -1;
            box.innerHTML = current.length
                ? current.map(function (x, i) {
                    return '<a class="hub-search-hit" href="#' + x.id + '" role="option" data-i="' + i + '">' +
                        '<span class="hub-search-hit-t">' + hl(x.t, toks) + '</span>' +
                        (x.cat ? '<span class="hub-search-hit-c">' + esc(x.cat) + '</span>' : '') + '</a>';
                }).join('')
                : '<p class="hub-search-empty">' + esc(emptyText) + '</p>';
            box.hidden = false; input.setAttribute('aria-expanded', 'true');
        }
        function openEntry(x) {
            box.hidden = true; input.setAttribute('aria-expanded', 'false');
            entries.forEach(function (e) { if (e.el !== x.el) e.el.open = false; });
            x.el.open = true;
            if (history.replaceState) history.replaceState(null, '', '#' + x.id);
            x.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        function setActive(n) {
            var hits = box.querySelectorAll('.hub-search-hit');
            if (!hits.length) return;
            active = (n + hits.length) % hits.length;
            hits.forEach(function (h, i) { h.classList.toggle('is-active', i === active); });
            hits[active].scrollIntoView({ block: 'nearest' });
        }
        box.addEventListener('click', function (e) {
            var a = e.target.closest ? e.target.closest('.hub-search-hit') : null;
            if (!a) return;
            e.preventDefault();
            var x = current[parseInt(a.getAttribute('data-i'), 10)];
            if (x) openEntry(x);
        });
        input.addEventListener('input', render);
        input.addEventListener('focus', render);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
            else if (e.key === 'Enter') { if (active >= 0 && current[active]) openEntry(current[active]); }
            else if (e.key === 'Escape') { box.hidden = true; input.blur(); }
        });
        document.addEventListener('click', function (e) {
            if (!input.contains(e.target) && !box.contains(e.target)) { box.hidden = true; input.setAttribute('aria-expanded', 'false'); }
        });
        if (opts.index) {
            fetch(opts.index).then(function (r) { return r.json(); }).then(function (d) {
                if (!opts.syn && !Array.isArray(d) && d.syn) { syn = d.syn; if (input.value.trim()) render(); }
            }).catch(function () {});
        }
        if (location.hash) {
            var t = document.getElementById(location.hash.slice(1));
            if (t && t.classList.contains('faq-entry')) { t.open = true; t.scrollIntoView(); }
        }
    }

    return { hub: hub, faq: faq, faqSearch: faqSearch, expand: expand };
})();
