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
