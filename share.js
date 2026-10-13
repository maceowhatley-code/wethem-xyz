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
