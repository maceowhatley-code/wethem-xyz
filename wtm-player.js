
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

    if (window.customElements && window.customElements.get('lite-yt')) return;

    var STYLES = '' +
        'lite-yt {' +
        '  display: block; position: relative; width: 100%;' +
        '  background: #000; cursor: pointer;' +
        '  contain: content; overflow: hidden;' +
        '  padding-bottom: 56.25%; height: 0;' +
        '}' +
        '[style*="padding-bottom: 56.25%"] > lite-yt,' +
        '[style*="padding-bottom:56.25%"] > lite-yt {' +
        '  position: absolute; top: 0; left: 0; right: 0; bottom: 0;' +
        '  width: 100%; height: 100%;' +
        '  padding-bottom: 0;' +
        '}' +
        '.featured-video-frame > lite-yt,' +
        '.live-video-frame > lite-yt,' +
        '.elsewhere-frame > lite-yt,' +
        '.review-frame > lite-yt,' +
        '.guest-episodes-frame > lite-yt,' +
        '.podcast-playlist-frame > lite-yt {' +
        '  position: absolute; top: 0; left: 0; right: 0; bottom: 0;' +
        '  width: 100%; height: 100%;' +
        '  padding-bottom: 0;' +
        '}' +
        'lite-yt > .lite-yt-poster {' +
        '  position: absolute; inset: 0;' +
        '  background-size: cover; background-position: center;' +
        '  background-color: #1a1a1a;' +
        '  transition: filter 0.2s;' +
        '}' +
        'lite-yt:hover > .lite-yt-poster { filter: brightness(0.85); }' +
        'lite-yt > .lite-yt-poster > img {' +
        '  width: 100%; height: 100%; object-fit: cover; display: block;' +
        '}' +
        'lite-yt > .lite-yt-dur {' +
        '  position: absolute; right: 6px; bottom: 6px; z-index: 1;' +
        '  padding: 2px 5px 1px; background: rgba(0, 0, 0, 0.78); color: #EFEAE0;' +
        '  font: 10.5px/1.3 "IBM Plex Mono", ui-monospace, monospace; letter-spacing: 0.02em;' +
        '  border-radius: 2px; pointer-events: none;' +
        '}' +
        'lite-yt > .lite-yt-dur > span {' +
        '  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;' +
        '  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;' +
        '}' +
        'lite-yt[loaded] > .lite-yt-dur { display: none; }' +
        'lite-yt > .lite-yt-play {' +
        '  position: absolute; top: 50%; left: 50%;' +
        '  transform: translate(-50%, -50%);' +
        '  width: 68px; height: 48px;' +
        '  background: rgba(33, 33, 33, 0.9);' +
        '  border-radius: 14%;' +
        '  display: flex; align-items: center; justify-content: center;' +
        '  transition: background 0.2s, transform 0.18s;' +
        '  pointer-events: none;' +
        '}' +
        'lite-yt:hover > .lite-yt-play {' +
        '  background: #E47452;' +
        '  transform: translate(-50%, -50%) scale(1.05);' +
        '}' +
        'lite-yt > .lite-yt-play::after {' +
        '  content: "";' +
        '  display: block;' +
        '  border-style: solid; border-width: 11px 0 11px 19px;' +
        '  border-color: transparent transparent transparent #fff;' +
        '  margin-left: 4px;' +
        '}' +
        'lite-yt:focus { outline: 2px solid #E47452; outline-offset: 2px; }' +
        'lite-yt > iframe {' +
        '  position: absolute; inset: 0;' +
        '  width: 100%; height: 100%; border: 0;' +
        '}' +
        'lite-yt[loaded] { cursor: default; }' +
        'lite-yt[pending] { cursor: progress; }' +
        'lite-yt[loaded] > .lite-yt-poster,' +
        'lite-yt[loaded] > .lite-yt-play { display: none; }' +
        'lite-yt > .lite-yt-status {' +
        '  position: absolute; left: 0; right: 0; bottom: 0; z-index: 2;' +
        '  padding: 9px 12px; background: rgba(0, 0, 0, 0.78); color: #EFEAE0;' +
        '  font: 13px/1.4 ui-sans-serif, system-ui, -apple-system, sans-serif;' +
        '  pointer-events: none;' +
        '}' +
        'lite-yt > .lite-yt-status > a {' +
        '  color: #fff; text-decoration: underline; margin-left: 0.6em; pointer-events: auto;' +
        '}' +
        'lite-yt > .lite-yt-status > a:focus-visible { outline: 2px solid #E47452; outline-offset: 2px; }' +
        'lite-yt[pending] > .lite-yt-dur,' +
        'lite-yt[loaded] > .lite-yt-status { display: none; }' +
        'lite-yt > .lite-yt-title {' +
        '  position: absolute; top: 0; left: 0; right: 0;' +
        '  padding: 14px 18px;' +
        '  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;' +
        '  font-size: 14px; font-weight: 500; line-height: 1.3;' +
        '  color: #fff;' +
        '  background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0));' +
        '  pointer-events: none;' +
        '  text-shadow: 0 1px 2px rgba(0,0,0,0.5);' +
        '}' +
        'lite-yt[loaded] > .lite-yt-title { display: none; }';

    var styleEl = document.createElement('style');
    styleEl.id = 'lite-yt-styles';
    styleEl.appendChild(document.createTextNode(STYLES));
    document.head.appendChild(styleEl);

    function buildPoster(videoId, posterQuality) {
        var quality = posterQuality || 'hq720';
        return 'https://i.ytimg.com/vi/' + videoId + '/' + quality + '.jpg';
    }

    function watchUrl(videoId, playlistId, start) {
        var u = videoId
            ? 'https://www.youtube.com/watch?v=' + videoId + (playlistId ? '&list=' + playlistId : '')
            : 'https://www.youtube.com/playlist?list=' + playlistId;
        if (videoId && start > 0) u += '&t=' + start + 's';
        return u;
    }

    function LiteYT() {
        return Reflect.construct(HTMLElement, [], LiteYT);
    }
    LiteYT.prototype = Object.create(HTMLElement.prototype);
    LiteYT.prototype.constructor = LiteYT;
    Object.setPrototypeOf(LiteYT, HTMLElement);

    LiteYT.prototype.connectedCallback = function () {
        if (this.hasAttribute('init')) return;
        this.setAttribute('init', '');

        var served = this.hasAttribute('live') ? this.querySelector('iframe') : null;
        if (served) { this.goLive(); return; }

        var videoId = this.getAttribute('videoid');
        var playlistId = this.getAttribute('playlistid');
        var title = this.getAttribute('title') || '';
        var poster = this.getAttribute('poster') || 'hq720';
        var extraParams = this.getAttribute('params') || '';

        if (!videoId && !playlistId) return;

        var posterId = videoId;
        if (!posterId && playlistId) {
            posterId = null;
        }

        var drawn = null;
        for (var c = this.firstElementChild; c; c = c.nextElementSibling) {
            if (c.tagName === 'A' && /(^|\s)lite-yt-poster(\s|$)/.test(c.className)) { drawn = c; break; }
            if (c.tagName === 'IMG' && /(^|\s)lite-yt-fallback(\s|$)/.test(c.className)) { drawn = c; break; }
        }
        if (drawn) {
            var pic = drawn.tagName === 'A' ? drawn.querySelector('img') : drawn;
            var box = document.createElement('div');
            if (pic) box.appendChild(pic);
            box.setAttribute('aria-hidden', 'true');
            if (drawn.parentNode === this) this.replaceChild(box, drawn); else this.appendChild(box);
            drawn = box;
        }

        var posterEl = drawn || document.createElement('div');
        posterEl.className = 'lite-yt-poster';
        if (drawn) {
        } else if (posterId) {
            var posterUrl = this.getAttribute('posterurl') || buildPoster(posterId, poster);
            var posterSet = this.getAttribute('postersrcset') || '',
                dur = this.getAttribute('duration') || '',
                host = this;
            var loadPoster = function () {
                var w = Math.round(host.getBoundingClientRect().width);
                if (posterSet) {
                    var img = document.createElement('img');
                    img.alt = '';
                    img.decoding = 'async';
                    img.sizes = w > 0 ? w + 'px' : '100vw';
                    img.srcset = posterSet;
                    img.src = posterUrl;
                    posterEl.appendChild(img);
                } else {
                    posterEl.style.backgroundImage = 'url("' + posterUrl + '")';
                }
                if (/^\d{1,2}(:\d\d){1,2}$/.test(dur) && w >= 140) {
                    var durEl = document.createElement('span');
                    durEl.className = 'wt-dur lite-yt-dur';
                    durEl.innerHTML = '<span class="visually-hidden">Length </span>' + dur;
                    host.appendChild(durEl);
                }
            };
            if (window.IntersectionObserver) {
                var posterObserver = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            loadPoster();
                            posterObserver.unobserve(entry.target);
                        }
                    });
                }, { rootMargin: '800px 0px' });
                posterObserver.observe(this);
            } else {
                loadPoster();
            }
        } else {
            posterEl.style.background = '#141311';
            posterEl.style.display = 'flex';
            posterEl.style.alignItems = 'center';
            posterEl.style.justifyContent = 'center';
            posterEl.style.color = 'rgba(242, 237, 228, 0.55)';
            posterEl.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, sans-serif';
            posterEl.style.fontSize = '0.78rem';
            posterEl.style.fontWeight = '700';
            posterEl.style.letterSpacing = '0.18em';
            posterEl.style.textTransform = 'uppercase';
            posterEl.innerHTML = '<span style="margin-bottom: 70px;">Play the playlist</span>';
        }
        if (!drawn) this.appendChild(posterEl);

        if (title) {
            var titleEl = document.createElement('div');
            titleEl.className = 'lite-yt-title';
            titleEl.textContent = title;
            this.appendChild(titleEl);
        }

        var playEl = document.createElement('div');
        playEl.className = 'lite-yt-play';
        playEl.setAttribute('aria-hidden', 'true');
        this.appendChild(playEl);

        this.setAttribute('role', 'button');
        this.setAttribute('tabindex', '0');
        this.setAttribute('aria-label', 'Play: ' + (title || 'video'));

        var self = this;
        function activate(byKey) { self.upgradePosterToIframe(videoId, playlistId, extraParams, byKey === true); }
        this.addEventListener('click', function () { activate(false); });
        this.addEventListener('keydown', function (e) {
            if (e.target !== self) return;
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                activate(true);
            }
        });
    };

    LiteYT.prototype.upgradePosterToIframe = function (videoId, playlistId, extraParams, byKey) {
        if (this.hasAttribute('loaded') || this.hasAttribute('pending')) return;
        var srcBase;
        if (videoId) {
            srcBase = 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&rel=0';
            if (playlistId) srcBase += '&list=' + playlistId;
        } else if (playlistId) {
            srcBase = 'https://www.youtube-nocookie.com/embed/videoseries?list=' + playlistId + '&autoplay=1';
        }
        if (extraParams) srcBase += '&' + extraParams;
        srcBase += '&enablejsapi=1&origin=' + encodeURIComponent(location.origin);

        var iframe = document.createElement('iframe');
        iframe.setAttribute('src', srcBase);
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('title', this.getAttribute('title') || 'YouTube video');
        iframe.setAttribute('tabindex', '-1');
        iframe.setAttribute('aria-hidden', 'true');

        var host = this,
            atSecond = /(?:^|&)start=(\d+)/.exec(extraParams || ''),
            status = document.createElement('div'),
            timer = null,
            done = false;
        status.className = 'lite-yt-status';
        status.setAttribute('role', 'status');
        function unbutton() {
            host.removeAttribute('role');
            host.removeAttribute('tabindex');
            host.removeAttribute('aria-label');
        }
        function wayOut(why) {
            if (done || status.querySelector('a')) return;
            var a = document.createElement('a');
            var ch = videoId === 'live_stream' ? /(?:^|&)channel=([A-Za-z0-9_-]+)/.exec(extraParams || '') : null;
            a.href = ch ? 'https://www.youtube.com/channel/' + ch[1] + '/live'
                        : watchUrl(videoId, playlistId, atSecond ? parseInt(atSecond[1], 10) : 0);
            a.textContent = 'Open on YouTube';
            status.textContent = why + ' ';
            status.appendChild(a);
            var wasOn = document.activeElement === host;
            unbutton();
            if (wasOn) a.focus({ preventScroll: true });
        }
        function onLoad() {
            if (done) return;
            done = true;
            clearTimeout(timer);
            var at = document.activeElement,
                wasIn = at === host || (!!at && host.contains(at));
            host.removeAttribute('pending');
            host.setAttribute('loaded', '');
            iframe.removeAttribute('tabindex');
            iframe.removeAttribute('aria-hidden');
            if (wasIn || (byKey && (!at || at === document.body))) iframe.focus({ preventScroll: true });
            unbutton();
            if (status.parentNode) status.parentNode.removeChild(status);
            var later = host.getAttribute('seek-when-loaded');
            if (later !== null) {
                host.removeAttribute('seek-when-loaded');
                host.seek(later);
            }
        }
        iframe.addEventListener('load', onLoad);
        iframe.addEventListener('error', function () { wayOut('The player did not load.'); });
        timer = setTimeout(function () { wayOut('Still loading the player from YouTube.'); }, 8000);
        this.setAttribute('pending', '');
        this.insertBefore(iframe, this.firstChild);
        this.appendChild(status);
        setTimeout(function () {
            if (!done && !status.querySelector('a')) status.textContent = 'Loading the player from YouTube...';
        }, 0);
    };

    LiteYT.prototype.goLive = function () {
        this.setAttribute('loaded', '');
        this.removeAttribute('role');
        this.removeAttribute('tabindex');
        this.removeAttribute('aria-label');
        this._ready = false;
        if (!LiteYT.heard) {
            LiteYT.heard = true;
            window.addEventListener('message', function (e) {
                if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(e.origin || '')) return;
                var els = document.querySelectorAll('lite-yt[live]');
                for (var i = 0; i < els.length; i++) {
                    var fr = els[i].querySelector('iframe');
                    if (fr && fr.contentWindow === e.source) els[i]._ready = true;
                }
            });
        }
        var t = arrivalSecond(null);
        if (t !== null) {
            this.cue(t);
        } else {
            this.listen();
        }
    };

    Object.defineProperty(LiteYT.prototype, 'cue', {
        writable: true, configurable: true,
        value: function (t) {
            var old = this.querySelector('iframe');
            if (!old) return;
            var src = (old.getAttribute('src') || '').replace(/&(?:start|autoplay)=\d+/g, '');
            var f = old.cloneNode(false);
            f.setAttribute('src', src + '&start=' + Math.max(0, parseInt(t, 10) || 0) + '&autoplay=1');
            this._ready = false;
            old.parentNode.replaceChild(f, old);
            this.listen();
        }
    });

    LiteYT.prototype.listen = function () {
        var host = this, f = this.querySelector('iframe'), n = 0;
        if (!f) return;
        function ask() {
            if (host._ready || n++ > 40 || !f.parentNode) { clearInterval(host._asking); return; }
            try { f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*'); } catch (x) {}
        }
        clearInterval(host._asking);
        host._asking = setInterval(ask, 250);
        f.addEventListener('load', function () {
            n = 0;
            clearInterval(host._asking);
            host._asking = setInterval(ask, 250);
            ask();
        });
    };

    LiteYT.prototype.focusPlayer = function () {
        var f = this.hasAttribute('loaded') ? this.querySelector('iframe') : null;
        (f || this).focus({ preventScroll: true });
    };

    LiteYT.prototype.seek = function (t) {
        t = Math.max(0, parseInt(t, 10) || 0);
        var vid = this.getAttribute('videoid');
        if (this.hasAttribute('live') && !this._ready) {
            this.cue(t);
            return;
        }
        if (!this.hasAttribute('loaded')) {
            if (this.hasAttribute('pending')) {
                this.setAttribute('seek-when-loaded', String(t));
                return;
            }
            var extra = this.getAttribute('params') || '';
            this.upgradePosterToIframe(vid, this.getAttribute('playlistid'),
                (extra ? extra + '&' : '') + 'start=' + t);
            return;
        }
        var f = this.querySelector('iframe');
        if (f && f.contentWindow) {
            f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [t, true] }), '*');
            f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
        }
    };

    function playerFor(vid) {
        var els = document.querySelectorAll('lite-yt[videoid]');
        for (var i = 0; i < els.length; i++) {
            if (!vid || els[i].getAttribute('videoid') === vid) return els[i];
        }
        return null;
    }

    function scrollBehavior() {
        return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    }

    function scrollToParagraph(t) {
        var best = null, bestT = -1;
        var ps = document.querySelectorAll('[id^="s"]');
        for (var i = 0; i < ps.length; i++) {
            var m = /^s(\d+)$/.exec(ps[i].id);
            if (!m) continue;
            var pt = parseInt(m[1], 10);
            if (pt <= t && pt > bestT) { bestT = pt; best = ps[i]; }
        }
        if (best) best.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
    }

    document.addEventListener('click', function (e) {
        var a = e.target && e.target.closest ? e.target.closest('a[data-seek], a.wt-at, a.wt-t') : null;
        if (!a) return;
        if (e.button || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
        var t = a.getAttribute('data-seek');
        var vid = a.getAttribute('data-vid') || null;
        var href = a.getAttribute('href') || '';
        if (t === null) {
            var m = /[?&]t=(\d+)/.exec(href);
            if (!m) return;
            t = m[1];
            var v = /[?&]v=([A-Za-z0-9_-]{11})/.exec(href);
            vid = v ? v[1] : null;
        }
        var el = playerFor(vid);
        if (!el || typeof el.seek !== 'function') return;
        e.preventDefault();
        el.seek(t);
        el.focusPlayer();
        el.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
    }, true);

    function arrivalSecond(e) {
        var m = /[#&]t=(\d+)/.exec(location.hash || '');
        if (!m && !(e && e.type === 'hashchange')) m = /[?&]t=(\d+)/.exec(location.search || '');
        return m ? parseInt(m[1], 10) : null;
    }

    function onArrival(e) {
        var t = arrivalSecond(e);
        if (t === null) return;
        var el = playerFor(null);
        if (!el || typeof el.seek !== 'function') return;
        if (!(el.hasAttribute('live') && !(e && e.type === 'hashchange'))) el.seek(t);
        var isWatch = !!document.querySelector('.wt-frame');
        if (isWatch && window.innerWidth <= 820 && window.innerHeight > window.innerWidth) {
            scrollToParagraph(t);
        } else {
            el.scrollIntoView({ block: 'center' });
        }
        if (typeof el.focusPlayer === 'function') el.focusPlayer();
    }

    if (window.customElements) {
        window.customElements.define('lite-yt', LiteYT);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onArrival);
    } else {
        onArrival();
    }
    window.addEventListener('hashchange', onArrival);

    function initStickyFrame() {
        var frame = document.querySelector('.wt-frame');
        if (!frame || !window.IntersectionObserver) return;
        if (frame.classList.contains('hh-trailer')) return;
        var phone = window.matchMedia ? window.matchMedia('(max-width: 820px) and (orientation: portrait)') : { matches: true };
        var placeholder = document.createElement('div');
        placeholder.className = 'wt-frame-placeholder';
        placeholder.hidden = true;
        frame.parentNode.insertBefore(placeholder, frame.nextSibling);
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var above = phone.matches && !entry.isIntersecting && entry.boundingClientRect.top < 0;
                frame.classList.toggle('wt-frame-stuck', above);
                placeholder.hidden = !above;
            });
        }, { threshold: 0 });
        observer.observe(placeholder.hidden ? frame : placeholder);
        function watch() {
            observer.disconnect();
            observer.observe(frame.classList.contains('wt-frame-stuck') ? placeholder : frame);
        }
        new MutationObserver(watch).observe(frame, { attributes: true, attributeFilter: ['class'] });
        if (phone.addEventListener) phone.addEventListener('change', watch);
        else if (phone.addListener) phone.addListener(watch);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStickyFrame);
    } else {
        initStickyFrame();
    }
})();
} catch (e) { if (window.console) { console.error("lite-yt.js", e); } }

try {
(function () {
    'use strict';
    if (!document.querySelector('script[data-like]') && !document.querySelector('script[src$="reactions.js"]')) { return; }
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
} catch (e) { if (window.console) { console.error("reactions.js", e); } }

try {
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
} catch (e) { if (window.console) { console.error("share-moment.js", e); } }
