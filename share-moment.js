(function () {
    'use strict';
    if (!document.querySelector('script[data-moments]') && !document.querySelector('script[src$="share-moment.js"]')) { return; }
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
        var sec = parseInt(p.id.slice(1), 10);
        var when = Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);
        b.title = 'Copy a link to this moment';
        b.setAttribute('aria-label', 'Copy a link to the moment at ' + when);
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
