
try {

(function () {
    'use strict';
    var h = document.documentElement;
    if (h.dataset.brokenImg) { return; }
    h.dataset.brokenImg = '1';
    function isImg(el) { return !!el && el.tagName === 'IMG'; }
    function hide(img) { img.style.visibility = 'hidden'; img.setAttribute('data-broken', ''); }
    document.addEventListener('error', function (e) { if (isImg(e.target)) { hide(e.target); } }, true);
    document.addEventListener('load', function (e) {
        if (isImg(e.target) && e.target.hasAttribute('data-broken')) {
            e.target.removeAttribute('data-broken');
            e.target.style.visibility = '';
        }
    }, true);
    var imgs = document.images;
    for (var i = 0; i < imgs.length; i++) {
        if (imgs[i].complete && imgs[i].naturalWidth === 0 && (imgs[i].currentSrc || imgs[i].src)) { hide(imgs[i]); }
    }
}());

(function () {
    'use strict';
    var t = document.querySelector('.nav-toggle'),
        n = document.getElementById('primary-nav');
    if (!t || !n || t.dataset.wired || document.querySelector('script[data-nav-inline]')) { return; }
    t.dataset.wired = '1';

    function set(o) {
        t.setAttribute('aria-expanded', String(o));
        t.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
        n.classList.toggle('is-open', o);
    }

    var frame = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
    function focusFirst(tries) {
        var a = n.querySelector('a');
        if (!a || !n.classList.contains('is-open')) { return; }
        var at = document.activeElement;
        if (at !== t && at !== document.body && at !== null) { return; }
        a.focus();
        if (document.activeElement !== a && tries > 0) {
            frame(function () { focusFirst(tries - 1); });
        }
    }

    t.addEventListener('click', function () {
        var o = t.getAttribute('aria-expanded') !== 'true';
        set(o);
        if (o) { focusFirst(12); }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && n.classList.contains('is-open')) {
            set(false);
            t.focus();
        }
    });
}());
} catch (e) { if (window.console) { console.error("nav.js", e); } }

try {
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

    var queue = [];
    function flush() {
        if (!queue.length) { return; }
        var body = JSON.stringify({ p: location.pathname, r: ref, u: utm.join('&'), id: uid, s: sid, e: queue.splice(0, 50) });
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
    setTimeout(flush, 4000);

    var deepest = 0, active = 0, lastBeat = Date.now(), lastInput = Date.now();
    function depth() {
        var h = Math.max(d.documentElement.scrollHeight - w.innerHeight, 1);
        var q4 = Math.min(4, Math.floor(((w.scrollY || w.pageYOffset || 0) / h) * 4 + 0.0001));
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
        track('scroll', '', deepest * 25);
        track('time', '', Math.round(active));
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
                keepPlace(vidId, info.currentTime, info.duration);
            }
        });
    }
}());
} catch (e) { if (window.console) { console.error("track.js", e); } }

try {
(function () {
    'use strict';
    var d = document;
    if (!d.querySelectorAll) { return; }
    var OK = /^[a-z0-9][a-z0-9-]{0,39}$/;
    var yes = /(?:^|; )wtm_consent=yes(?:;|$)/.test(d.cookie || '');
    var tag = '';
    var m = /[?&]from=([^&#]*)/.exec(location.search || '');
    if (m) {
        try { tag = decodeURIComponent(m[1]).toLowerCase(); } catch (e) { tag = ''; }
        if (!OK.test(tag)) { tag = ''; }
    }
    try {
        if (yes && tag) { sessionStorage.setItem('wtm_from', tag); }
        if (yes && !tag) { tag = sessionStorage.getItem('wtm_from') || ''; }
    } catch (e) {}
    if (!OK.test(tag)) { return; }
    var forms = d.querySelectorAll('form[action*="/api/inquiry"], form[action*="/api/intake/"]');
    for (var i = 0; i < forms.length; i++) {
        var f = forms[i].querySelector('input[name="from"]');
        if (!f) {
            f = d.createElement('input');
            f.type = 'hidden';
            f.name = 'from';
            forms[i].appendChild(f);
        }
        f.value = tag;
    }
}());
} catch (e) { if (window.console) { console.error("from.js", e); } }

try {
(function () {
    'use strict';
    var d = document;
    if (!d.querySelector) { return; }

    var oq = d.querySelector('[data-oq]');
    var form = d.querySelector('form[data-ask]');
    if (oq) {
        var slides = oq.querySelectorAll('.hm-slide');
        var turn = form && form.querySelector('[data-turn]');
        var shown = form && form.querySelector('input[name="shown_q"]');
        var show = function (i) {
            for (var k = 0; k < slides.length; k++) {
                slides[k].hidden = (k !== i);
                var h = slides[k].querySelector('.hm-q');
                if (h) { if (k === i) { h.id = 'hm-q'; } else { h.removeAttribute('id'); } }
                var bs = slides[k].querySelectorAll('.hm-dots button');
                for (var b = 0; b < bs.length; b++) { bs[b].setAttribute('aria-pressed', String(+bs[b].getAttribute('data-go') === i)); }
            }
            var q = slides[i] ? slides[i].getAttribute('data-q') || '' : '';
            if (turn && q) { turn.firstChild.nodeValue = 'Your turn: ' + q.charAt(0).toLowerCase() + q.slice(1); }
            if (shown) { shown.value = q; }
        };
        Array.prototype.forEach.call(oq.querySelectorAll('.hm-dots button'), function (b) {
            b.addEventListener('click', function () { show(+b.getAttribute('data-go') || 0); });
        });
        if (slides.length) {
            var n = 0;
            try { n = parseInt(localStorage.getItem('wtm_oqv') || '0', 10) || 0; localStorage.setItem('wtm_oqv', String(n + 1)); } catch (e) { n = 0; }
            show(n % slides.length);
        }
    }

    if (form) {
        var steps = form.querySelectorAll('[data-step]');
        var err = form.querySelector('.hm-err');
        var thanks = form.parentNode.querySelector('.hm-thanks');
        var iv = form.querySelector('#ask-iv'), ivw = d.getElementById('ask-fwrap');
        if (iv && ivw) {
            ivw.hidden = !iv.checked;
            iv.addEventListener('change', function () { ivw.hidden = !iv.checked; if (iv.checked) { var f = ivw.querySelector('input'); if (f) { f.focus(); } } });
        }
        var at = 0;
        var go = function (i, focus) {
            at = i;
            for (var k = 0; k < steps.length; k++) { steps[k].hidden = (k !== i); }
            var first = steps[i].querySelector('input:not([type="hidden"]):not([type="checkbox"]), textarea');
            if (first && focus) { first.focus(); }
        };
        if (steps.length > 1) { go(0, false); }
        var say = function (m) { if (err) { err.textContent = m; } };
        form.addEventListener('submit', function (e) {
            if (!window.fetch || !window.JSON || steps.length < 2) { return; }
            e.preventDefault();
            say('');
            var q = form.querySelector('[name="q"]');
            if (at < steps.length - 1) {
                if (steps[at].contains(q) && !q.value.trim()) { say('Write your question first.'); q.focus(); return; }
                go(at + 1, true);
                return;
            }
            var need = form.querySelectorAll('input[type="checkbox"][required]');
            for (var j = 0; j < need.length; j++) {
                if (!need[j].checked) { say('Tick both boxes to send it.'); need[j].focus(); return; }
            }
            var fields = {};
            Array.prototype.forEach.call(form.elements, function (el) {
                if (!el.name || el.disabled) { return; }
                if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) { return; }
                if (el.type === 'submit' || el.type === 'button') { return; }
                fields[el.name] = el.value;
            });
            var send = form.querySelector('[data-step="' + steps.length + '"] button[type="submit"]') || null;
            if (send) { send.disabled = true; }
            say('Sending…');
            fetch(form.getAttribute('action'), { method: 'POST', headers: { 'content-type': 'application/json' },
                                                 credentials: 'same-origin', body: JSON.stringify({ fields: fields, submit: true }) })
                .then(function (r) { return r.json().catch(function () { return {}; }); })
                .then(function (j) {
                    if (j && j.ok) {
                        form.hidden = true;
                        if (thanks) { thanks.hidden = false; thanks.focus(); }
                        if (window.wtmTrack) { window.wtmTrack('click', 'oq-sent'); }
                        return;
                    }
                    say((j && j.error === 'spam check') ? 'Wait for the check above the button, then send it again.'
                        : 'That did not send. Try again in a moment.');
                    if (send) { send.disabled = false; }
                    if (window.turnstile && window.turnstile.reset) { try { window.turnstile.reset(); } catch (x) {} }
                })
                .catch(function () { say('That did not send. Try again in a moment.'); if (send) { send.disabled = false; } });
        });
    }

    var v = d.querySelector('.hm-involved video[data-src], .oqp-loop video[data-src]');
    if (v && window.matchMedia && matchMedia('(min-width: 641px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        v.src = v.getAttribute('data-src');
        v.autoplay = true;
        try { var p = v.play(); if (p && p.catch) { p.catch(function () {}); } } catch (e) {}
    }
}());
} catch (e) { if (window.console) { console.error("ask.js", e); } }

try {
(function () {
    'use strict';
    var d = document;
    if (!d.querySelector || !d.body || !window.JSON) { return; }
    var CONSENT = 'wtm_consent', SEEN = 'wtm_seen', UID = 'wtm_uid', SEEN_MAX = 24;
    var ASK_AGAIN = 15552000;
    var me = d.querySelector('script[src$="wtm-core.js"], script[src$="memory.js"]');
    var up = me ? (me.getAttribute('src') || '').replace(/(?:wtm-core|memory)\.js.*$/, '') : '';

    function cookie(k) {
        var m = d.cookie.match(new RegExp('(?:^|; )' + k + '=([^;]*)'));
        return m ? decodeURIComponent(m[1]) : null;
    }
    function setCookie(k, v, age) {
        d.cookie = k + '=' + encodeURIComponent(v) + '; Max-Age=' + age + '; Path=/; SameSite=Lax' +
                   (location.protocol === 'https:' ? '; Secure' : '');
    }
    function newId() {
        var a = new Uint8Array(8), s = '';
        (window.crypto || window.msCrypto).getRandomValues(a);
        for (var i = 0; i < 8; i++) { s += ('0' + a[i].toString(16)).slice(-2); }
        return s;
    }
    function seen() {
        return (cookie(SEEN) || '').split('.').filter(function (x) { return /^[A-Za-z0-9_-]{11}$/.test(x); });
    }
    function forget() {
        setCookie(SEEN, '', 0);
        setCookie(UID, '', 0);
        setCookie(CONSENT, 'no', ASK_AGAIN);
        try { localStorage.removeItem('wtm_at'); } catch (e) {}
        try { sessionStorage.removeItem('wtm_sid'); } catch (e) {}
        var fy = d.getElementById('for-you');
        if (fy) { fy.hidden = true; fy.innerHTML = ''; }
    }
    function remember() {
        var p = d.querySelector('.wt-frame > lite-yt[videoid]');
        if (!p || cookie(CONSENT) !== 'yes') { return; }
        var v = p.getAttribute('videoid');
        var list = [v].concat(seen().filter(function (x) { return x !== v; })).slice(0, SEEN_MAX);
        setCookie(SEEN, list.join('.'), ASK_AGAIN);
    }

    function el(tag, cls, text) {
        var e = d.createElement(tag);
        if (cls) { e.className = cls; }
        if (text) { e.textContent = text; }
        return e;
    }

    var PEEK = 96;
    function ask(from, by) {
        var frame = d.querySelector('.wt-frame');
        var player = from || (frame ? frame.querySelector('lite-yt') : null);
        var opener = by || ((d.activeElement && d.activeElement !== d.body) ? d.activeElement : null);
        var b = el('div', 'wtm-consent');
        b.setAttribute('role', 'dialog');
        b.setAttribute('aria-labelledby', 'wtm-consent-h');
        b.setAttribute('aria-describedby', 'wtm-consent-t');
        b.setAttribute('tabindex', '-1');
        var h = el('p', 'wtm-consent-h', 'We Them Media');
        h.id = 'wtm-consent-h';
        b.appendChild(h);
        var t = el('p', 'wtm-consent-t', 'Can we remember you on this device? Cookies and a random visitor '
                   + 'number let us see what you watch and like, and suggest what to watch next. '
                   + 'Either way we count page views and plays, with no number connecting them to you. '
                   + 'You can change your answer at any time on the privacy page. ');
        t.id = 'wtm-consent-t';
        var more = el('a', '', 'What we collect');
        more.href = up + 'privacy.html#collect';
        t.appendChild(more);
        var row = el('p', 'wtm-consent-b');
        var yes = el('button', 'btn btn-primary', 'Yes, remember'), no = el('button', 'btn btn-line', 'No thanks');
        yes.type = no.type = 'button';
        row.appendChild(yes);
        row.appendChild(no);
        b.appendChild(t);
        b.appendChild(row);
        if (frame && frame.parentNode) {
            b.classList.add('wtm-consent-inflow');
            frame.parentNode.insertBefore(b, frame.nextSibling);
        } else {
            var skip = d.querySelector('.skip-link');
            if (skip && skip.parentNode === d.body) { d.body.insertBefore(b, skip.nextSibling); } else { d.body.insertBefore(b, d.body.firstChild); }
        }
        d.body.classList.add('wtm-consent-open');
        if (from || opener) {
            yes.focus({ preventScroll: true });
            if (from) {
                var over = b.getBoundingClientRect().top - (window.innerHeight - PEEK);
                if (over > 0) { window.scrollBy(0, over); }
            }
        }
        function onKey(e) {
            if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); close(); }
        }
        d.addEventListener('keydown', onKey);
        function close() {
            d.removeEventListener('keydown', onKey);
            d.body.classList.remove('wtm-consent-open');
            var back = from || ((opener && d.body.contains(opener)) ? opener : player);
            if (back && back.focus) {
                back.focus({ preventScroll: true });
                if (d.activeElement !== back && back.querySelector) {
                    var f = back.querySelector('iframe');
                    if (f) { f.focus({ preventScroll: true }); }
                }
            }
            if (b.parentNode) { b.parentNode.removeChild(b); }
        }
        yes.addEventListener('click', function () {
            setCookie(CONSENT, 'yes', ASK_AGAIN);
            setCookie(UID, newId(), ASK_AGAIN);
            if (window.wtmTrack) { window.wtmTrack('consent', 'yes'); }
            close();
            remember();
            forYou();
        });
        no.addEventListener('click', function () {
            setCookie(CONSENT, 'no', ASK_AGAIN);
            setCookie(SEEN, '', 0);
            setCookie(UID, '', 0);
            if (window.wtmTrack) { window.wtmTrack('consent', 'no'); }
            close();
        });
    }

    function places() {
        try {
            var m = JSON.parse(localStorage.getItem('wtm_at') || '{}');
            return (m && Object.prototype.toString.call(m) === '[object Object]') ? m : {};
        } catch (e) { return {}; }
    }
    function placeAt(vid) {
        var n = places()[vid];
        return (typeof n === 'number' && n > 30) ? Math.floor(n) : 0;
    }
    function lastPlace() {
        var ks = Object.keys(places()).filter(function (k) { return /^[A-Za-z0-9_-]{11}$/.test(k); });
        return ks.length ? ks[ks.length - 1] : null;
    }
    function mmss(n) {
        var m = Math.floor(n / 60), s = n % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function card(p, vid) {
        var li = el('li'), a = el('a', 'fy-card'), pic = el('span', 'fy-pic wt-thumb'), img = el('img');
        var at = vid ? placeAt(vid) : 0;
        a.href = up + p[0] + (at ? '#t=' + at : '');
        img.src = /^https?:/.test(p[3]) ? p[3] : up + p[3];
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.width = 480;
        img.height = 270;
        pic.appendChild(img);
        a.appendChild(pic);
        a.appendChild(el('span', 'fy-name', p[1]));
        var meta = at ? ((p[2] ? p[2] + ' · ' : '') + 'from ' + mmss(at)) : p[2];
        if (meta) { a.appendChild(el('span', 'fy-meta', meta)); }
        li.appendChild(a);
        return li;
    }
    function grid(cls, ids, j) {
        var ul = el('ul', cls);
        ids.forEach(function (x) { ul.appendChild(card(j.p[x], x)); });
        return ul;
    }
    function forYou() {
        var fy = d.getElementById('for-you'), yes = cookie(CONSENT) === 'yes', s = yes ? seen() : [];
        if (!fy || !window.fetch || !(s.length || lastPlace())) { return; }
        fetch(up + 'foryou.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
            if (!j || !j.p) { return; }
            var last = null, i;
            for (i = 0; i < s.length && !last; i++) { if (j.p[s[i]]) { last = s[i]; } }
            if (!last && lastPlace() && j.p[lastPlace()]) { last = lastPlace(); }
            if (!last) { return; }
            var had = {}, more = [];
            s.forEach(function (x) { had[x] = 1; });
            for (var rank = 0; rank < 8 && more.length < 4; rank++) {
                for (i = 0; i < Math.min(s.length, 6) && more.length < 4; i++) {
                    var r = ((j.r || {})[s[i]] || [])[rank];
                    if (r && !had[r] && j.p[r]) { had[r] = 1; more.push(r); }
                }
            }
            var head = el('div', 'sechead'), span = el('span', 'mono'), btn = el('button', 'fy-forget', 'Forget what I have watched');
            btn.type = 'button';
            btn.addEventListener('click', forget);
            head.appendChild(el('h2', 't', 'For you.'));
            span.appendChild(btn);
            head.appendChild(span);
            fy.innerHTML = '';
            fy.appendChild(head);
            fy.appendChild(el('p', 'fy-k', placeAt(last) ? 'Pick up where you left off'
                                                         : 'The last one you opened'));
            fy.appendChild(grid('fy-grid fy-one', [last], j));
            if (more.length) {
                fy.appendChild(el('p', 'fy-k', 'More like what you have watched'));
                fy.appendChild(grid('fy-grid', more, j));
            }
            fy.hidden = false;
        }).catch(function () {});
    }

    var NEAR_KEY = 'wtm_near';
    function nearYouPrompt(onYes) {
        var stored;
        try { stored = localStorage.getItem(NEAR_KEY); } catch (e) {}
        if (stored === 'no') return;
        if (stored === 'yes') { onYes(); return; }
        var bar = el('div', 'wtm-near-ask');
        bar.setAttribute('role', 'group');
        bar.setAttribute('aria-labelledby', 'wtm-near-q');
        var txt = el('span', '', 'Show videos filmed near you?');
        txt.id = 'wtm-near-q';
        var yes = el('button', 'btn btn-primary btn-sm', 'Yes');
        var no = el('button', 'btn btn-line btn-sm', 'No thanks');
        yes.type = no.type = 'button';
        bar.appendChild(txt);
        bar.appendChild(yes);
        bar.appendChild(no);
        var hero = d.querySelector('.hh-rows') || d.querySelector('.hpj-grid');
        if (hero && hero.parentNode) { hero.parentNode.insertBefore(bar, hero); } else { return; }
        yes.addEventListener('click', function () {
            try { localStorage.setItem(NEAR_KEY, 'yes'); } catch (x) {}
            if (bar.parentNode) bar.parentNode.removeChild(bar);
            onYes();
        });
        no.addEventListener('click', function () {
            try { localStorage.setItem(NEAR_KEY, 'no'); } catch (x) {}
            if (bar.parentNode) bar.parentNode.removeChild(bar);
        });
    }
    function nearYou() {
        var node = d.getElementById('hh-local');
        if (!node || !window.fetch) { return; }
        var map;
        try { map = JSON.parse(node.textContent); } catch (e) { return; }
        nearYouPrompt(function () {
        fetch('/api/here', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (h) {
            if (!h) { return; }
            var want = [], add = function (list) { (list || []).forEach(function (x) { if (want.indexOf(x) < 0) { want.push(x); } }); };
            add((map.city || {})[String(h.city || '').toLowerCase()]);
            add((map.region || {})[String(h.r || '').toLowerCase()]);
            if (h.c && h.c !== 'US') { add((map.c || {})[h.c]); }
            if (!want.length) { return; }
            var rows = d.querySelector('.hh-rows'), grid = d.querySelector('.hpj-grid');
            function item(ul, href) {
                var a = ul ? ul.querySelector('a[href="' + href + '"]') : null;
                return a && a.closest ? a.closest('li') : null;
            }
            function mark(li) {
                var a = li.querySelector('a');
                if (a && !a.querySelector('.hpj-near')) { a.appendChild(el('span', 'hpj-near', 'Near you')); }
            }
            want.slice().reverse().forEach(function (h) {
                var li = item(rows, h);
                if (li) { rows.insertBefore(li, rows.firstChild); mark(li); }
            });
            if (!grid) { return; }
            var armB = !!(rows && window.getComputedStyle && window.getComputedStyle(rows).display !== 'none');
            var head = [];
            if (armB && rows) {
                Array.prototype.forEach.call(rows.querySelectorAll('a[href]'), function (a) { head.push(a.getAttribute('href')); });
            }
            var front = armB ? want.filter(function (h) { return head.indexOf(h) < 0; }) : want;
            head.slice().reverse().forEach(function (h) {
                var li = item(grid, h);
                if (li) { grid.insertBefore(li, grid.firstChild); }
            });
            var moving = front.map(function (h) { return item(grid, h); }).filter(Boolean);
            moving.forEach(function (li) { grid.removeChild(li); });
            var at = grid.children[armB ? head.length : 0] || null;
            moving.forEach(function (li) { grid.insertBefore(li, at); mark(li); });
        }).catch(function () {});
        });
    }

    var answer = cookie(CONSENT), asked = answer === 'yes' || answer === 'no';
    function askOnce(from) {
        if (asked) { return; }
        asked = true;
        ask(from);
    }
    function onPlayer(e) {
        var t = (e.target && e.target.closest) ? e.target.closest('lite-yt, .wt-frame') : null;
        if (!t) { return null; }
        return t.tagName === 'LITE-YT' ? t : t.querySelector('lite-yt');
    }
    if (!asked) {
        d.addEventListener('click', function (e) { var p = onPlayer(e); if (p) { askOnce(p); } }, true);
        d.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { var p = onPlayer(e); if (p) { askOnce(p); } }
        }, true);
        window.addEventListener('message', function (e) {
            if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(e.origin || '')) { return; }
            var m = e.data;
            if (typeof m === 'string') { try { m = JSON.parse(m); } catch (x) { return; } }
            var st = !m ? null : (m.event === 'onStateChange' ? m.info : (m.info && m.info.playerState));
            if (st === 1) { askOnce(null); }
        });
        if (d.getElementById('for-you') && seen().length && window.fetch) { askOnce(null); }
    }
    remember();
    forYou();
    nearYou();
    var f = d.getElementById('wtm-forget'), fLabel = f ? f.textContent : '';
    if (f) {
        f.addEventListener('click', function () { forget(); f.textContent = 'Forgotten. Nothing is remembered now.'; f.disabled = true; });
    }
    var g = d.getElementById('wtm-again');
    if (g) {
        g.addEventListener('click', function () {
            if (d.querySelector('.wtm-consent')) { return; }
            setCookie(CONSENT, '', 0);
            if (f) { f.disabled = false; f.textContent = fLabel; }
            asked = true;
            ask(null, g);
        });
    }
}());
} catch (e) { if (window.console) { console.error("memory.js", e); } }

try {
(function () {
    'use strict';
    var d = document, w = window;
    if (!d.querySelector) { return; }

    function build(host) {
    var compact = host.hasAttribute('data-compact');
    var url = (d.querySelector('link[rel="canonical"]') || {}).href || location.href.split('#')[0];
    var title = ((d.querySelector('meta[property="og:title"]') || {}).content || d.title || '').replace(/ · We Them Media$/, '');
    var pic = (d.querySelector('meta[property="og:image"]') || {}).content || '';
    var text = title;

    function el(tag, cls, txt) {
        var e = d.createElement(tag);
        if (cls) { e.className = cls; }
        if (txt) { e.textContent = txt; }
        return e;
    }
    function link(name, href) {
        var a = el('a', 'wtm-share-link', name);
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener';
        a.addEventListener('click', function () { if (w.wtmTrack) { w.wtmTrack('share', name); } });
        return a;
    }
    function copyBtn() {
        var c = el('button', 'wtm-share-btn wtm-share-copy', 'Copy link');
        c.type = 'button';
        c.addEventListener('click', function () {
            navigator.clipboard.writeText(url).then(function () {
                c.textContent = 'Link copied';
                if (w.wtmTrack) { w.wtmTrack('share', 'copy'); }
                setTimeout(function () { c.textContent = 'Copy link'; }, 1800);
            }).catch(function () {});
        });
        return c;
    }
    var U = encodeURIComponent(url), T = encodeURIComponent(text), TU = encodeURIComponent(text + ' ' + url);

    var row = el('div', 'wtm-share-row');
    if (!compact) { row.appendChild(el('span', 'wtm-share-head', 'Share')); }

    if (navigator.share) {
        var b = el('button', 'wtm-share-btn', 'Share');
        b.type = 'button';
        b.addEventListener('click', function () {
            if (w.wtmTrack) { w.wtmTrack('share', 'sheet'); }
            navigator.share({ title: title, text: text, url: url }).catch(function () {});
        });
        row.appendChild(b);
    } else if (compact && navigator.clipboard) {
        row.appendChild(copyBtn());
    }
    if (compact) {
        if (row.children.length) { host.appendChild(row); }
        return;
    }
    if (navigator.canShare && pic) {
        var ready = null;
        var p = el('button', 'wtm-share-btn wtm-share-pic', 'Share the picture');
        p.type = 'button';
        p.title = 'For Instagram and TikTok, which cannot take a link';
        function preload() {
            if (ready) { return ready; }
            ready = fetch(pic).then(function (r) { return r.blob(); }).then(function (blob) {
                return new File([blob], 'wethem.jpg', { type: blob.type || 'image/jpeg' });
            }).catch(function () { return null; });
            return ready;
        }
        p.addEventListener('pointerenter', preload);
        p.addEventListener('touchstart', preload, { passive: true });
        p.addEventListener('click', function () {
            preload().then(function (file) {
                if (!file || !navigator.canShare({ files: [file] })) { p.hidden = true; return; }
                if (w.wtmTrack) { w.wtmTrack('share', 'picture'); }
                try { navigator.clipboard.writeText(url); } catch (e) {}
                navigator.share({ files: [file] }).catch(function () {});
            });
        });
        row.appendChild(p);
    }

    row.appendChild(link('WhatsApp', 'https://wa.me/?text=' + TU));
    var more = el('span', 'wtm-share-more');
    more.hidden = true;
    [['X', 'https://x.com/intent/tweet?text=' + T + '&url=' + U],
     ['Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + U],
     ['LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url=' + U],
     ['Telegram', 'https://t.me/share/url?url=' + U + '&text=' + T],
     ['Farcaster', 'https://farcaster.xyz/~/compose?text=' + T + '&embeds[]=' + U],
     ['Bluesky', 'https://bsky.app/intent/compose?text=' + TU],
     ['Threads', 'https://www.threads.com/intent/post?text=' + T + '&url=' + U],
     ['Reddit', 'https://www.reddit.com/submit?url=' + U + '&title=' + T],
     ['Email', 'mailto:?subject=' + T + '&body=' + TU]].forEach(function (x) { more.appendChild(link(x[0], x[1])); });

    if (navigator.clipboard) { row.appendChild(copyBtn()); }
    var open = el('button', 'wtm-share-btn wtm-share-open', 'More ways to share');
    open.type = 'button';
    open.setAttribute('aria-expanded', 'false');
    open.addEventListener('click', function () {
        more.hidden = !more.hidden;
        open.setAttribute('aria-expanded', more.hidden ? 'false' : 'true');
        open.textContent = more.hidden ? 'More ways to share' : 'Fewer ways';
    });
    row.appendChild(open);
    row.appendChild(more);
    host.appendChild(row);
    }

    w.wtmShare = function (host) {
        if (host && !host.getAttribute('data-share-done')) {
            host.setAttribute('data-share-done', '1');
            build(host);
        }
    };
    Array.prototype.forEach.call(d.querySelectorAll('.wtm-share'), function (h) { w.wtmShare(h); });
}());
} catch (e) { if (window.console) { console.error("share.js", e); } }

try {
(function () {
    'use strict';
    var ENDPOINT = '/api/correction';
    var stamp = '';

    function el(tag, attrs, text) {
        var n = document.createElement(tag);
        for (var k in attrs) { n.setAttribute(k, attrs[k]); }
        if (text) { n.textContent = text; }
        return n;
    }

    function watchStamps(onParagraph) {
        document.addEventListener('click', function (e) {
            var t = e.target;
            if (!t || !t.textContent) { return; }
            var m = /^\s*\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*$/.exec(t.textContent);
            if (m && t.closest('p, li, span')) {
                stamp = m[1];
                var a = t.closest('a.wt-at');
                var p = a ? a.closest('.wt-transcript p[id^="s"]') : null;
                if (p && onParagraph) { onParagraph(p, m[1]); }
            }
        }, true);
    }

    function panel() {
        var wrap = el('div', { class: 'fix-panel', id: 'fix-panel', role: 'dialog',
                               'aria-label': 'Send a correction' });
        var h = el('h2', { class: 'fix-h' }, 'Something wrong here?');
        var p = el('p', { class: 'fix-p' },
            'These transcripts are made by a machine and it gets things wrong. '
            + 'If you were there, or you know who was, tell us and we will fix it.');
        var at = el('p', { class: 'fix-at' });
        at.hidden = true;
        var f = el('form', { class: 'fix-form' });

        var sel = el('select', { name: 'kind', 'aria-label': 'What kind of correction' });
        [['transcript', 'A word in the transcript is wrong'],
         ['name', 'Someone’s name is wrong or missing'],
         ['place', 'The place or date is wrong'],
         ['credit', 'The wrong person is credited'],
         ['takedown', 'I am in this and I want it changed or taken down'],
         ['other', 'Something else']].forEach(function (o) {
            var op = el('option', { value: o[0] }, o[1]);
            sel.appendChild(op);
        });

        var PLACEHOLDER = 'What is wrong, and what it should say.';
        var ta = el('textarea', { name: 'text', rows: '4', required: 'required',
            placeholder: PLACEHOLDER, 'aria-label': 'What is wrong, and what it should say' });
        function syncKind() {
            if (sel.value === 'takedown') {
                ta.removeAttribute('required');
                ta.placeholder = 'Optional: which moment, or what you want changed.';
            } else {
                ta.setAttribute('required', 'required');
                ta.placeholder = PLACEHOLDER;
            }
        }
        sel.addEventListener('change', syncKind);
        var nm = el('input', { name: 'name', type: 'text', placeholder: 'Your name (optional)',
            'aria-label': 'Your name (optional)', autocomplete: 'name' });
        var rp = el('input', { name: 'reply', type: 'text',
            placeholder: 'Email or handle, if you want an answer (optional)',
            'aria-label': 'Email or handle, if you want an answer (optional)' });
        var hp = el('input', { name: 'website', type: 'text', tabindex: '-1',
            autocomplete: 'off', 'aria-hidden': 'true', class: 'fix-hp' });
        var send = el('button', { type: 'submit', class: 'fix-send' }, 'Send it');
        var note = el('p', { class: 'fix-note', role: 'status', 'aria-live': 'polite', tabindex: '-1' });

        [sel, ta, nm, rp, hp, send, note].forEach(function (n) { f.appendChild(n); });
        wrap.appendChild(h); wrap.appendChild(p); wrap.appendChild(at); wrap.appendChild(f);

        f.addEventListener('submit', function (e) {
            e.preventDefault();
            var text = ta.value.trim();
            if (!text) {
                if (sel.value !== 'takedown') { return; }
                text = sel.options[sel.selectedIndex].text;
            }
            send.disabled = true;
            note.textContent = 'Sending…';
            var body = {
                page: location.pathname, title: document.title,
                kind: sel.value, stamp: wrap.getAttribute('data-stamp') || stamp, text: text,
                name: nm.value, reply: rp.value, website: hp.value
            };
            fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' },
                              body: JSON.stringify(body) })
                .then(function (r) { return r.json().catch(function () { return {}; }); })
                .then(function (j) {
                    if (j && j.ok) {
                        f.innerHTML = '';
                        note.textContent = (body.kind === 'takedown')
                            ? 'Got it. Thank you. Your request is stored and a person reads it. '
                              + 'Message us on Instagram (@we_them_media) or X (@WeThemMediaHQ) '
                              + 'and we will get back to you within two weeks.'
                            : 'Got it. Thank you. A person reads these.';
                        f.appendChild(note);
                        note.focus();
                    } else {
                        note.textContent = (j && j.error) ? j.error : 'That did not send. Try again in a moment.';
                        send.disabled = false;
                    }
                })
                .catch(function () {
                    note.textContent = 'That did not send. Try again in a moment.';
                    send.disabled = false;
                });
        });
        return wrap;
    }

    function init() {
        var host = document.querySelector('footer .wrap') || document.querySelector('footer') || document.body;
        var open = el('button', { type: 'button', class: 'fix-open', 'aria-expanded': 'false',
                                  'aria-controls': 'fix-panel' }, 'Something wrong here?');
        open.style.minHeight = '44px';
        open.style.borderBottom = '0';
        open.style.textDecoration = 'underline';
        open.style.textUnderlineOffset = '3px';
        var box = null, opener = null;
        function hide() {
            if (!box || box.hidden) { return; }
            box.hidden = true;
            open.setAttribute('aria-expanded', 'false');
            if (opener && opener.focus) { opener.focus(); }
        }
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && box && !box.hidden && box.contains(document.activeElement)) { hide(); }
        });
        function show(kind, after, at) {
            if (!box) { box = panel(); }
            var where = after || open;
            opener = (document.activeElement && document.activeElement !== document.body) ? document.activeElement : where;
            where.parentNode.insertBefore(box, where.nextSibling);
            box.hidden = false;
            open.setAttribute('aria-expanded', where === open ? 'true' : 'false');
            if (at) { box.setAttribute('data-stamp', at); } else { box.removeAttribute('data-stamp'); }
            var line = box.querySelector('.fix-at');
            var moment = at || stamp;
            if (line) {
                line.textContent = moment ? 'About the moment at ' + moment + ' in the video.' : '';
                line.hidden = !moment;
            }
            var s = box.querySelector('select[name="kind"]');
            if (kind && s) {
                s.value = kind;
                s.dispatchEvent(new Event('change'));
            }
            var t = box.querySelector(kind ? 'select' : 'textarea');
            if (t) { t.focus(); }
        }
        open.addEventListener('click', function () {
            if (box && !box.hidden && box.previousSibling === open) { box.hidden = true; open.setAttribute('aria-expanded', 'false'); return; }
            show('', open);
        });
        document.addEventListener('click', function (e) {
            var a = (e.target && e.target.closest) ? e.target.closest('[data-fix-open]') : null;
            if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
            e.preventDefault();
            show(a.getAttribute('data-fix-open') || '', a.closest('p') || a);
        });
        var slot = el('div', { class: 'fix-slot' });
        slot.appendChild(open);
        host.appendChild(slot);

        var row = null, btn = null, when = null, told = false;
        function offer(p, at) {
            if (!row) {
                row = el('div', { class: 'fix-here-row' });
                btn = el('button', { type: 'button', class: 'fix-here', 'aria-expanded': 'false' },
                         'Wrong word here? Tell us');
                when = el('span', { class: 'visually-hidden' });
                btn.appendChild(when);
                btn.addEventListener('click', function () {
                    var at2 = btn.getAttribute('data-stamp');
                    if (box && !box.hidden && box.previousSibling === row) {
                        box.hidden = true;
                        btn.setAttribute('aria-expanded', 'false');
                        return;
                    }
                    show('transcript', row, at2);
                    btn.setAttribute('aria-expanded', 'true');
                });
                row.appendChild(btn);
            }
            if (box && !box.hidden && box.previousSibling === row) { btn.setAttribute('aria-expanded', 'false'); }
            btn.setAttribute('data-stamp', at);
            when.textContent = ' about the moment at ' + at;
            p.parentNode.insertBefore(row, p.nextSibling);
            if (!told) {
                told = true;
                var live = document.getElementById('wt-live');
                if (!live) {
                    var sec = p.closest('.wt-transcript') || document.body;
                    live = el('div', { class: 'visually-hidden', role: 'status', 'aria-live': 'polite' });
                    sec.appendChild(live);
                }
                setTimeout(function () {
                    live.textContent = 'A button to report a wrong word now follows the paragraph at ' + at + '.';
                    setTimeout(function () { live.textContent = ''; }, 4000);
                }, 600);
            }
        }
        watchStamps(offer);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else { init(); }
}());
} catch (e) { if (window.console) { console.error("correct.js", e); } }

try {
(function () {
    'use strict';

    function init() {
        var cta = document.querySelector('.wtm-newsletter-pill');
        if (!cta) return;

        try { if (localStorage.getItem('wtm_pill_dismissed')) return; } catch (e) {}

        var close = document.createElement('button');
        close.type = 'button';
        close.className = 'wtm-newsletter-pill-close';
        close.setAttribute('aria-label', 'Dismiss');
        close.textContent = '×';
        cta.appendChild(close);
        close.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            cta.classList.remove('is-visible');
            cta.classList.add('is-hidden-near-cta');
            try { localStorage.setItem('wtm_pill_dismissed', '1'); } catch (x) {}
        });

        var footerHidden = false;
        var footerEl = document.querySelector('footer');
        if (footerEl && window.IntersectionObserver) {
            var footerObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    footerHidden = entry.isIntersecting;
                    updateVisibility();
                });
            });
            footerObserver.observe(footerEl);
        }

        var scrolledPast = false;
        var ticking = false;
        var typing = false;

        function updateVisibility() {
            cta.classList.toggle('is-visible', scrolledPast && !footerHidden && !typing);
            cta.classList.toggle('is-hidden-near-cta', footerHidden || typing);
        }

        function isField(el) {
            if (!el || !el.tagName) return false;
            var tag = el.tagName.toLowerCase();
            if (tag === 'textarea' || tag === 'select' || el.isContentEditable) return true;
            return tag === 'input' && !/^(checkbox|radio|button|submit|reset|image|file|range|color|hidden)$/i.test(el.type || '');
        }
        document.addEventListener('focusin', function (e) {
            if (isField(e.target)) { typing = true; updateVisibility(); }
        });
        document.addEventListener('focusout', function (e) {
            if (isField(e.target)) { typing = false; updateVisibility(); }
        });
        typing = isField(document.activeElement);

        function onScroll() {
            scrolledPast = window.scrollY > window.innerHeight * 0.6;
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    updateVisibility();
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
} catch (e) { if (window.console) { console.error("newsletter-pill.js", e); } }
