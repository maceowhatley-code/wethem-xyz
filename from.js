(function () {
    'use strict';
    var d = document;
    if (!d.querySelectorAll) { return; }
    var OK = /^[a-z0-9][a-z0-9-]{0,39}$/;
    var yes = /(?:^|; )wtm_consent=yes(?:;|$)/.test(d.cookie || '');
    var tag = '';
    var m = /[?&]from=([^&#]*)/.exec(location.search || '');
    if (m) {
        try { tag = decodeURIComponent(m[1]).toLowerCase(); } catch (e) { tag = ''; }
        if (!OK.test(tag)) { tag = ''; }
    }
    try {
        if (yes && tag) { sessionStorage.setItem('wtm_from', tag); }
        if (yes && !tag) { tag = sessionStorage.getItem('wtm_from') || ''; }
    } catch (e) {}
    if (!OK.test(tag)) { return; }
    var forms = d.querySelectorAll('form[action*="/api/inquiry"], form[action*="/api/intake/"]');
    for (var i = 0; i < forms.length; i++) {
        var f = forms[i].querySelector('input[name="from"]');
        if (!f) {
            f = d.createElement('input');
            f.type = 'hidden';
            f.name = 'from';
            forms[i].appendChild(f);
        }
        f.value = tag;
    }
}());
