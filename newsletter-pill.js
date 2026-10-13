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
