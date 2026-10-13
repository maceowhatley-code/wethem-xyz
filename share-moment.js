(function () {
    'use strict';
    if (!navigator.clipboard) { return; }
    var ps = document.querySelectorAll('.wt-transcript p[id^="s"]');
    if (!ps.length) { return; }
    var base = location.origin + location.pathname;
    var live = document.getElementById('wt-live');
    ps.forEach(function (p) {
        if (!/^s\d+(-\d+)?$/.test(p.id)) { return; }
        var b = document.createElement('button');
        b.className = 'wt-share';
        b.type = 'button';
        b.title = 'Copy a link to this moment';
        b.setAttribute('aria-label', 'Copy a link to this moment');
        b.textContent = '\u29c9';
        b.addEventListener('click', function () {
            navigator.clipboard.writeText(base + '#' + p.id).then(function () {
                b.textContent = 'copied';
                b.classList.add('is-copied');
                if (live) { live.textContent = 'Link copied'; }
                setTimeout(function () {
                    b.textContent = '\u29c9';
                    b.classList.remove('is-copied');
                    if (live) { live.textContent = ''; }
                }, 1600);
            });
        });
        p.appendChild(b);
    });
}());
