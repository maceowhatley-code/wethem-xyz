(function () {
    'use strict';
    var d = document;
    if (!d.querySelector || !d.body || !window.JSON) { return; }
    var CONSENT = 'wtm_consent', SEEN = 'wtm_seen', UID = 'wtm_uid', SEEN_MAX = 24;
    var ASK_AGAIN = 15552000;
    var me = d.querySelector('script[src$="memory.js"]');
    var up = me ? (me.getAttribute('src') || '').replace(/memory\.js.*$/, '') : '';

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
        bar.setAttribute('role', 'dialog');
        bar.setAttribute('aria-label', 'Location');
        var txt = el('span', '', 'Show videos filmed near you?');
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
