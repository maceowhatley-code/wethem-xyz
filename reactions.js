(function () {
    'use strict';
    var player = document.querySelector('.wt-frame > lite-yt[videoid]');
    if (!player || !window.fetch || !window.JSON) { return; }
    var d = document, vid = player.getAttribute('videoid');
    var up = /\/watch\//.test(location.pathname) ? '../' : '';
    var STEP = 15, LEVELS = ['wt-heat-1', 'wt-heat-2', 'wt-heat-3', 'wt-heat-4'];
    var HEAT_AT = [2, 4, 8, 16], HEAT_MIN = 5;
    var THUMB = 'M2 21h4V9H2v12zm20-11a2 2 0 0 0-2-2h-6.31l.95-4.57.03-.32a1.5 1.5 0 0 0-.44-1.06L13.17 1 6.59 7.59A2 2 0 0 0 6 9v10a2 2 0 0 0 2 2h9a2 2 0 0 0 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z';

    function fmt(t) { var m = Math.floor(t / 60), s = t % 60; return m + ':' + (s < 10 ? '0' : '') + s; }
    function el(tag, cls, text) {
        var e = d.createElement(tag);
        if (cls) { e.className = cls; }
        if (text) { e.textContent = text; }
        return e;
    }

    var now = null, playing = false, total = 0, on = false, MIN_SHOWN = 5;
    var bar = el('div', 'wt-react');
    var btn = el('button', 'wt-like');
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-describedby', 'wt-like-n');
    btn.hidden = true;
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="' + THUMB + '"/></svg>';
    btn.appendChild(el('span', 'wt-like-label', 'Like'));
    var count = el('span', 'wt-like-count');
    count.id = 'wt-like-n';
    count.hidden = true;
    var talk = el('a', 'wt-talk-cta-link', 'Comment');
    talk.href = 'https://www.youtube.com/watch?v=' + vid;
    talk.target = '_blank';
    talk.rel = 'noopener';
    talk.title = 'Comment on YouTube';
    talk.setAttribute('aria-label', 'Comment on YouTube');
    talk.setAttribute('data-ev', 'comment');
    var yt = el('a', 'wt-like-yt', 'Give it a thumbs up on YouTube');
    yt.href = 'https://www.youtube.com/watch?v=' + vid;
    yt.target = '_blank';
    yt.rel = 'noopener';
    yt.hidden = true;
    var share = el('div', 'wtm-share');
    share.setAttribute('data-compact', '1');
    var note = el('p', 'wt-like-note');
    note.setAttribute('aria-live', 'polite');
    function say(t) {
        if (!note.parentNode) { bar.appendChild(note); }
        note.textContent = t;
    }
    bar.appendChild(btn);
    bar.appendChild(count);
    bar.appendChild(share);
    bar.appendChild(talk);
    bar.appendChild(yt);
    var frame = player.parentNode;
    frame.parentNode.insertBefore(bar, frame.nextSibling);
    if (window.wtmShare) { window.wtmShare(share); }

    function mine() {
        try { return JSON.parse(localStorage.getItem('wtm_like_' + vid) || 'null'); } catch (e) { return null; }
    }
    function keep(v) {
        try { if (v) { localStorage.setItem('wtm_like_' + vid, JSON.stringify(v)); } else { localStorage.removeItem('wtm_like_' + vid); } } catch (e) {}
    }
    function showCount() {
        var n = total + (mine() ? 1 : 0);
        count.textContent = n >= MIN_SHOWN ? n + (n === 1 ? ' like' : ' likes') : '';
        count.hidden = n < MIN_SHOWN;
    }
    function showLiked() {
        var m = mine();
        btn.classList.toggle('is-liked', !!m);
        btn.setAttribute('aria-pressed', m ? 'true' : 'false');
        yt.href = 'https://www.youtube.com/watch?v=' + vid + (m && m.t ? '&t=' + m.t + 's' : '');
        showCount();
    }

    fetch('/api/react', { credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
            on = !!(j && j.on);
            if (!on) { return; }
            btn.hidden = false; yt.hidden = false; showLiked();
            tint();
        }).catch(function () {});

    window.addEventListener('message', function (e) {
        if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(e.origin || '')) { return; }
        var m = e.data;
        if (typeof m === 'string') { try { m = JSON.parse(m); } catch (x) { return; } }
        if (!m || !m.info) { return; }
        if (typeof m.info.currentTime === 'number') { now = m.info.currentTime; }
        if (typeof m.info.playerState === 'number') { playing = m.info.playerState === 1; }
    });
    function listen(f) {
        var ask = function () {
            try { f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'); } catch (x) {}
        };
        f.addEventListener('load', ask);
        ask();
    }
    var f0 = player.querySelector('iframe');
    if (f0) {
        listen(f0);
    } else if (window.MutationObserver) {
        var mo = new MutationObserver(function () {
            var f = player.querySelector('iframe');
            if (f) { mo.disconnect(); listen(f); }
        });
        mo.observe(player, { childList: true });
    }

    function send(t, moment, off) {
        try {
            fetch('/api/react', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'omit',
                                  body: JSON.stringify({ v: vid, t: t, m: moment ? 1 : 0, off: off ? 1 : 0 }), keepalive: true }).catch(function () {});
        } catch (x) {}
        if (window.wtmTrack) { window.wtmTrack(off ? 'unlike' : 'like', vid, t); }
    }
    btn.addEventListener('click', function () {
        var had = mine();
        if (had) {
            keep(null);
            send(had.t || 0, had.m, true);
            showLiked();
            say('Like removed.');
            if (window.wtmTrack) { window.wtmTrack('click', 'like-removed'); }
            return;
        }
        var moment = playing && now !== null;
        var t = moment ? Math.floor(now) : 0;
        keep({ t: t, m: moment ? 1 : 0 });
        send(t, moment, false);
        showLiked();
        say((moment ? 'Liked, at ' + fmt(t) + '. Thank you. ' : 'Liked. Thank you. ')
            + 'One more tap where it counts for the channel: give it a thumbs up on YouTube.');
    });

    function tint() {
    fetch(up + 'reactions.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (all) {
        var rec = all && all[vid];
        if (!rec) { return; }
        var rows = Array.isArray(rec) ? rec : (rec.b || []);
        total += Array.isArray(rec) ? rows.reduce(function (s, x) { return s + (x[1] || 0); }, 0) : (rec.n || 0);
        showLiked();
        if (!rows.length) { return; }
        var ps = d.querySelectorAll('.wt-transcript p[id^="s"]'), list = [], i, j;
        for (i = 0; i < ps.length; i++) {
            var mm = /^s(\d+)(?:-\d+)?$/.exec(ps[i].id);
            if (mm) { list.push({ el: ps[i], t: +mm[1], n: 0 }); }
        }
        if (!list.length) { return; }
        list.sort(function (a, b) { return a.t - b.t; });
        for (j = 0; j < rows.length; j++) {
            var at = rows[j][0], n = rows[j][1], k = -1;
            for (i = 0; i < list.length && list[i].t <= at + STEP - 1; i++) { k = i; }
            if (k >= 0) { list[k].n += n; }
        }
        var sum = 0;
        list.forEach(function (x) { sum += x.n; });
        if (sum < HEAT_MIN) { return; }
        list.forEach(function (x) {
            var lv = -1;
            for (var z = 0; z < HEAT_AT.length; z++) { if (x.n >= HEAT_AT[z]) { lv = z; } }
            if (lv < 0) { return; }
            x.el.classList.add('wt-heat', LEVELS[lv]);
            var tag = el('span', 'visually-hidden', ' (' + x.n + (x.n === 1 ? ' like' : ' likes') + ' for this moment)');
            x.el.appendChild(tag);
            x.el.title = x.n + (x.n === 1 ? ' like' : ' likes') + ' for this moment';
        });
        var body = list[0].el.closest ? list[0].el.closest('.wt-body') : null;
        if (body) {
            body.parentNode.insertBefore(el('p', 'wt-note wt-heat-note', 'Tinted where viewers liked a moment: the darker, the more of them.'), body);
        }
    }).catch(function () {});
    }
}());
