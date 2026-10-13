
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
    if (!t || !n || t.dataset.wired) { return; }
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
