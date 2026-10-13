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
        var wrap = el('div', { class: 'fix-panel', role: 'dialog',
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
            placeholder: PLACEHOLDER });
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
        var nm = el('input', { name: 'name', type: 'text', placeholder: 'Your name (optional)' });
        var rp = el('input', { name: 'reply', type: 'text',
            placeholder: 'Email or handle, if you want an answer (optional)' });
        var hp = el('input', { name: 'website', type: 'text', tabindex: '-1',
            autocomplete: 'off', 'aria-hidden': 'true', class: 'fix-hp' });
        var send = el('button', { type: 'submit', class: 'fix-send' }, 'Send it');
        var note = el('p', { class: 'fix-note' });

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
        var open = el('button', { type: 'button', class: 'fix-open' }, 'Something wrong here?');
        open.style.minHeight = '44px';
        open.style.borderBottom = '0';
        open.style.textDecoration = 'underline';
        open.style.textUnderlineOffset = '3px';
        var box = null;
        function show(kind, after, at) {
            if (!box) { box = panel(); }
            var where = after || open;
            where.parentNode.insertBefore(box, where.nextSibling);
            box.hidden = false;
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
            if (box && !box.hidden && box.previousSibling === open) { box.hidden = true; return; }
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
