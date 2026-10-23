(function () {
    'use strict';
    var d = document, w = window;
    if (!w.JSON || !d.querySelector) { return; }
    if (navigator.webdriver || /bot|crawl|spider|headless|lighthouse|wtm-shot/i.test(navigator.userAgent || '')) {
        w.wtmTrack = function () {};
        return;
    }
    function cookie(k) {
        var m = d.cookie.match(new RegExp('(?:^|; )' + k + '=([^;]*)'));
        return m ? decodeURIComponent(m[1]) : null;
    }
    function hex(n) {
        var a = new Uint8Array(n), s = '';
        (w.crypto || w.msCrypto).getRandomValues(a);
        for (var i = 0; i < n; i++) { s += ('0' + a[i].toString(16)).slice(-2); }
        return s;
    }
    var yes = cookie('wtm_consent') === 'yes';
    var uid = yes && /^[a-f0-9]{16}$/.test(cookie('wtm_uid') || '') ? cookie('wtm_uid') : '';
    var sid = '';
    if (yes) {
        try { sid = sessionStorage.getItem('wtm_sid') || ''; if (!sid) { sid = hex(6); sessionStorage.setItem('wtm_sid', sid); } } catch (e) { sid = ''; }
    }
    var ref = '';
    try { ref = d.referrer ? new URL(d.referrer).hostname.replace(/^www\./, '') : ''; } catch (e) { ref = ''; }
    if (ref === location.hostname.replace(/^www\./, '')) { ref = '(site)'; }
    var q = location.search, utm = [];
    ['utm_source', 'utm_medium', 'utm_campaign', 's', 'from'].forEach(function (k) {
        var m = new RegExp('[?&]' + k + '=([^&#]*)').exec(q);
        if (m) { utm.push(k.replace('utm_', '') + '=' + decodeURIComponent(m[1]).slice(0, 40)); }
    });
    if (/[?&]s=/.test(q) && w.history && history.replaceState) {
        try {
            var rest = q.replace(/^\?/, '').split('&').filter(function (p) { return p && p.split('=')[0] !== 's'; }).join('&');
            history.replaceState(history.state, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
        } catch (e) {}
    }

    var landing = ref !== '(site)';
    var fromTag = (/[?&]from=([A-Za-z0-9_-]{1,40})(?:&|#|$)/.exec(q) || [])[1] || '';
    function decorate(a) {
        if (!fromTag || !a || !a.getAttribute) { return; }
        var h = a.getAttribute('href') || '';
        if (!h || h.charAt(0) === '#' || /^(mailto|tel|javascript):/i.test(h) || /[?&]from=/.test(h)) { return; }
        try {
            var u = new URL(h, location.href);
            if (u.hostname.replace(/^www\./, '') !== location.hostname.replace(/^www\./, '')) { return; }
            u.searchParams.set('from', fromTag);
            a.setAttribute('href', u.pathname + u.search + u.hash);
        } catch (e) {}
    }
    if (fromTag) {
        ['pointerdown', 'touchstart', 'focusin', 'mouseover'].forEach(function (n) {
            d.addEventListener(n, function (e) { decorate(e.target && e.target.closest ? e.target.closest('a[href]') : null); }, true);
        });
    }

    var queue = [];
    function flush() {
        if (!queue.length) { return; }
        var body = JSON.stringify({ p: location.pathname, r: ref, u: utm.join('&'), l: landing ? 1 : 0, id: uid, s: sid, e: queue.splice(0, 50) });
        try {
            if (navigator.sendBeacon) { navigator.sendBeacon('/api/ev', new Blob([body], { type: 'application/json' })); }
            else { fetch('/api/ev', { method: 'POST', body: body, headers: { 'content-type': 'application/json' }, keepalive: true }); }
        } catch (e) {}
    }
    function track(t, k, v) {
        queue.push({ t: t, k: k ? String(k).slice(0, 200) : '', v: typeof v === 'number' ? v : 0 });
        if (queue.length >= 20) { flush(); }
    }
    w.wtmTrack = track;

    track('view', (d.title || '').slice(0, 120), w.innerWidth || 0);
    if (d.querySelector('meta[name="wtm-miss"]')) { track('miss', location.pathname.slice(0, 200), 0); }
    setTimeout(flush, 4000);

    var deepest = 0, active = 0, lastBeat = Date.now(), lastInput = Date.now();
    function depth() {
        var h = Math.max(d.documentElement.scrollHeight - w.innerHeight, 1);
        var q4 = Math.min(10, Math.floor(((w.scrollY || w.pageYOffset || 0) / h) * 10 + 0.0001));
        if (q4 > deepest) { deepest = q4; }
    }
    ['scroll', 'keydown', 'pointerdown', 'touchstart', 'mousemove'].forEach(function (n) {
        w.addEventListener(n, function () { lastInput = Date.now(); if (n === 'scroll') { depth(); } }, { passive: true });
    });
    var PLACE = 'wtm_at', PLACE_MIN = 30, PLACE_MAX = 24, PLACE_EVERY = 5000, placeAt = 0, placeDone = false;
    function keepPlace(vid, at, dur) {
        if (!vid || !(dur > 0) || placeDone) { return; }
        var done = at > dur * 0.95, tick = Date.now();
        if (!done && (!(at > PLACE_MIN) || tick - placeAt < PLACE_EVERY)) { return; }
        placeAt = tick;
        try {
            var m = JSON.parse(localStorage.getItem(PLACE) || '{}');
            if (Object.prototype.toString.call(m) !== '[object Object]') { m = {}; }
            if (done) {
                placeDone = true;
                if (!(vid in m)) { return; }
                delete m[vid];
            } else {
                m[vid] = Math.floor(at);
                var ks = Object.keys(m);
                while (ks.length > PLACE_MAX) { delete m[ks.shift()]; }
            }
            localStorage.setItem(PLACE, JSON.stringify(m));
        } catch (e) {  }
    }

    setInterval(function () {
        var now = Date.now();
        if (d.visibilityState === 'visible' && now - lastInput < 30000) { active += (now - lastBeat) / 1000; }
        lastBeat = now;
    }, 5000);
    var ended = false;
    function leave() {
        if (ended) { return; }
        ended = true;
        depth();
        track('scroll', '', deepest * 10);
        track('time', '', Math.round(active));
        if (w.wtmLastSecond) { w.wtmLastSecond(); }
        flush();
    }
    d.addEventListener('visibilitychange', function () {
        if (d.visibilityState === 'hidden') { leave(); } else { ended = false; lastBeat = Date.now(); }
    });
    w.addEventListener('pagehide', leave);

    d.addEventListener('click', function (e) {
        var a = e.target && e.target.closest ? e.target.closest('a[href], button[data-ev]') : null;
        if (!a) { return; }
        var href = a.getAttribute('href') || '', kind = '';
        var pl = d.querySelector('.wt-frame > lite-yt[videoid]');
        if (pl && typeof pl.seek === 'function' && a.matches && a.matches('a[data-seek], a.wt-at, a.wt-t')) { return; }
        if (a.hasAttribute('data-ev')) { kind = a.getAttribute('data-ev'); }
        else if (/youtube\.com|youtu\.be/.test(href)) { kind = 'youtube'; }
        else if (/beehiiv|newsletter/.test(href)) { kind = 'newsletter'; }
        else if (/supporter\.html/.test(href)) { kind = 'support'; }
        else if (a.closest('.fy-card')) { kind = 'foryou'; }
        else if (a.querySelector && a.querySelector('.hpj-near')) { kind = 'near'; }
        else if (a.closest('.wtm-share')) { kind = 'share-link'; }
        else if (/^https?:\/\//.test(href) && href.indexOf(location.hostname) < 0) {
            try { kind = 'out:' + new URL(href).hostname.replace(/^www\./, ''); } catch (x) { kind = 'out'; }
        }
        if (kind) { track('click', kind + '|' + (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60)); }
    }, true);

    var recent = [];
    function zone(el) {
        if (el.closest('header, nav, .nav, .site-nav')) { return 'header'; }
        if (el.closest('footer')) { return 'footer'; }
        return 'body';
    }
    function label(el) {
        return (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    }
    function target(el) {
        try { var u = new URL(el.getAttribute('href') || '', location.href); return (u.hostname === location.hostname ? '' : u.hostname.replace(/^www\./, '')) + u.pathname; } catch (e) { return ''; }
    }
    function kindOf(el) {
        var h = el.getAttribute('href') || '';
        if (/calendar\.app\.google/i.test(h)) { return 'book'; }
        if (/supporter|donate/i.test(h)) { return 'support'; }
        if (/work-with-us(\.html)?#start/i.test(h)) { return 'enquire'; }
        return 'ui';
    }
    d.addEventListener('click', function (e) {
        var t = e.target;
        if (!t || !t.closest) { return; }
        var el = t.closest('a[href], button, [role=button], summary, input[type=submit]');
        var now = Date.now(), x = Math.round(e.clientX / 40), y = Math.round(e.clientY / 40);
        recent = recent.filter(function (r) { return now - r.t < 1000; });
        recent.push({ t: now, x: x, y: y });
        var same = recent.filter(function (r) { return Math.abs(r.x - x) <= 1 && Math.abs(r.y - y) <= 1; });
        if (same.length === 3) { track('rage', zone(t) + '|' + (el ? label(el) : t.tagName.toLowerCase()), 3); }
        if (el) { track('click', kindOf(el) + '|' + zone(el) + '|' + label(el) + '|' + target(el).slice(0, 60)); }
        else if (w.getComputedStyle && w.getComputedStyle(t).cursor === 'pointer') {
            var before = d.body.innerHTML.length, here = location.href;
            setTimeout(function () {
                if (location.href === here && d.body.innerHTML.length === before) {
                    track('dead', zone(t) + '|' + t.tagName.toLowerCase() + '|' + label(t).slice(0, 60));
                }
            }, 400);
        }
    }, true);

    var formLast = {};
    function fid(f) { return (f.id || f.getAttribute('name') || f.getAttribute('action') || 'form').slice(0, 60); }
    d.addEventListener('focusin', function (e) {
        var f = e.target && e.target.form;
        if (!f) { return; }
        var id = fid(f);
        if (!formLast[id]) { track('form', 'started|' + id); }
        formLast[id] = (e.target.name || e.target.id || e.target.type || 'field').slice(0, 40);
    }, true);
    d.addEventListener('submit', function (e) { track('form', 'sent|' + fid(e.target)); delete formLast[fid(e.target)]; }, true);
    d.addEventListener('invalid', function (e) {
        var f = e.target && e.target.form;
        if (f) { track('form', 'refused|' + fid(f) + '|' + (e.target.name || '').slice(0, 40)); }
    }, true);
    w.addEventListener('pagehide', function () {
        Object.keys(formLast).forEach(function (id) { track('form', 'field|' + id + '|' + formLast[id]); });
        formLast = {};
    });

    var errs = 0;
    w.addEventListener('error', function (e) {
        if (errs++ > 5) { return; }
        var f = String(e.filename || '').split('?')[0].split('#')[0];
        track('error', String(e.message || '').slice(0, 120) + '|' + f.slice(-80) + ':' + (e.lineno || 0));
    });
    try {
        var cls = 0, lcp = 0, inp = 0, sentPerf = false;
        if (w.PerformanceObserver) {
            new PerformanceObserver(function (l) { l.getEntries().forEach(function (x) { lcp = x.startTime; }); }).observe({ type: 'largest-contentful-paint', buffered: true });
            new PerformanceObserver(function (l) { l.getEntries().forEach(function (x) { if (!x.hadRecentInput) { cls += x.value; } }); }).observe({ type: 'layout-shift', buffered: true });
            new PerformanceObserver(function (l) { l.getEntries().forEach(function (x) { if (x.duration > inp) { inp = x.duration; } }); }).observe({ type: 'event', durationThreshold: 40, buffered: true });
        }
        d.addEventListener('visibilitychange', function () {
            if (d.visibilityState !== 'hidden' || sentPerf) { return; }
            sentPerf = true;
            var nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
            track('perf', 'ttfb', Math.round(nav.responseStart || 0));
            track('perf', 'lcp', Math.round(lcp));
            track('perf', 'cls', Math.round(cls * 1000));
            track('perf', 'inp', Math.round(inp));
        });
    } catch (e) {}

    var player = d.querySelector('.wt-frame > lite-yt[videoid]');
    if (player) {
        var vidId = player.getAttribute('videoid'), started = false, marks = {};

        var at = /[#&]t=(\d+)/.exec(location.hash || ''), how = 'hash';
        if (!at) { at = /[?&]t=(\d+)/.exec(location.search || ''); how = 'query'; }
        track('arrive', vidId + '|' + (at ? how : 'top'), at ? parseInt(at[1], 10) : 0);
        var momented = false;
        function moment(via, t) {
            if (momented) { return; }
            momented = true;
            track('moment', vidId + '|' + via, t);
        }
        d.addEventListener('click', function (e) {
            var a = e.target && e.target.closest ? e.target.closest('a[data-seek], a.wt-at, a.wt-t') : null;
            if (!a || typeof player.seek !== 'function') { return; }
            var t = a.getAttribute('data-seek'), v = a.getAttribute('data-vid') || '', href = a.getAttribute('href') || '';
            if (t === null) {
                var m = /[?&]t=(\d+)/.exec(href);
                if (!m) { return; }
                t = m[1];
                v = (/[?&]v=([A-Za-z0-9_-]{11})/.exec(href) || [])[1] || '';
            }
            if (v && v !== vidId) { return; }
            moment('link', parseInt(t, 10) || 0);
        }, true);
        w.addEventListener('hashchange', function () {
            var m = /[#&]t=(\d+)/.exec(location.hash || '');
            if (m && typeof player.seek === 'function') { moment('hash', parseInt(m[1], 10)); }
        });

        var lastAt = 0;
        w.wtmLastSecond = function () { if (started && lastAt > 0) { track('watch', vidId + '|last', Math.round(lastAt)); lastAt = 0; } };
        w.addEventListener('message', function (e) {
            if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(e.origin || '')) { return; }
            var m = e.data;
            if (typeof m === 'string') { try { m = JSON.parse(m); } catch (x) { return; } }
            var info = m && m.info;
            if (!info) { return; }
            if (info.playerState === 1 && !started) { started = true; track('play', vidId, 0); }
            if (typeof info.currentTime === 'number' && info.duration > 0) {
                var pct = Math.floor((info.currentTime / info.duration) * 4) * 25;
                [25, 50, 75].forEach(function (p) { if (pct >= p && !marks[p]) { marks[p] = 1; track('watch', vidId, p); } });
                if (info.currentTime >= info.duration - 1 && !marks[100]) {
                    marks[100] = 1; track('watch', vidId, 100);
                    Array.prototype.forEach.call(d.querySelectorAll('.wt-support[hidden]'), function (el) { el.hidden = false; });
                }
                lastAt = info.currentTime;
                keepPlace(vidId, info.currentTime, info.duration);
            }
        });
    }
}());
