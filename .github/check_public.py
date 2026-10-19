# The check for the public repo (13 Oct 2026). No secrets, no network, no build.
#
#   python3 .github/check_public.py          a pull request: the files it changes, against origin/main
#   python3 .github/check_public.py --all    every file (a push to main, and the exporter before it syncs)
#
# 19 Oct 2026: integrity as well as secrets. A transcript must belong to a page here, parse, and not be emptied;
# a pull request may not delete a transcript a page still uses, and may not add a link to a file that is not here.
# The video-id pattern is the one tools/public_export.py uses to pick the transcripts; keep the two the same.
import io
import json
import os
import re
import subprocess
import sys

ALL = '--all' in sys.argv[1:]
bad, warn = [], []


def git(*a):
    r = subprocess.run(['git'] + list(a), capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else None


def read(f):
    return io.open(f, encoding='utf-8', errors='replace').read()


def walk():
    out = []
    for dp, dn, fn in os.walk('.'):
        dn[:] = [d for d in dn if d != '.git']
        out += [os.path.relpath(os.path.join(dp, f), '.').replace('\\', '/') for f in fn]
    return out


diff = None if ALL else git('diff', '--name-status', 'origin/main...HEAD')
changed, deleted = [], []
for line in (diff or '').splitlines():
    p = line.split('\t')
    if p[0].startswith('D'):
        deleted.append(p[-1])
    else:
        changed.append(p[-1])
if ALL or diff is None or not (changed or deleted):
    ALL = True
    files = walk()
else:
    files = changed
every = walk()

# 1. secrets and forbidden files (13 Oct 2026)
SECRET = re.compile(r'AKIA[0-9A-Z]{16}|GOCSPX-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{35}|gh[pousr]_[A-Za-z0-9]{30,}'
                    r'|sk-[A-Za-z0-9]{32,}|-----BEGIN [A-Z ]*PRIVATE KEY-----')
for f in files:
    if not os.path.isfile(f):
        continue
    if os.path.getsize(f) > 90 * 1024 * 1024:
        bad.append((f, 'file over 90 MB'))
    if re.search(r'(^|/)(\.env|token\.json|client_secret[^/]*|[^/]*\.pem|[^/]*\.key)$', f):
        bad.append((f, 'forbidden file name'))
    if f.endswith(('.txt', '.vtt', '.json', '.html', '.md')) and SECRET.search(read(f)):
        bad.append((f, 'secret-shaped text'))

# 2. transcripts: each one belongs to a page here, and parses
VID = re.compile(r'(?:youtube(?:-nocookie)?\.com/(?:embed/|watch\?v=)|youtu\.be/|videoid=")([A-Za-z0-9_-]{11})')
on_pages, on_watch = {}, set()
for f in every:
    if f.endswith('.html'):
        for m in VID.finditer(read(f)):
            on_pages.setdefault(m.group(1), f)
            if f.startswith('watch/'):
                on_watch.add(m.group(1))


def tid(f):
    b = os.path.basename(f)
    for ext in ('.en.vtt', '.txt', '.json'):
        if b.endswith(ext):
            return b[:-len(ext)]
    return None


for f in files:
    if not f.startswith('transcripts/') or not os.path.isfile(f):
        continue
    i = tid(f)
    if i is None:
        bad.append((f, 'not a transcript file (.txt, .en.vtt or speakers/<id>.json)'))
        continue
    if i not in on_pages:
        bad.append((f, 'transcript for %s, which no page here shows' % i))
    s = read(f)
    if f.endswith('.txt') and len(s.strip()) < 20:
        bad.append((f, 'empty transcript'))
    if f.endswith('.vtt') and not s.startswith('WEBVTT'):
        bad.append((f, 'captions file does not start with WEBVTT'))
    if f.endswith('.json'):
        try:
            json.loads(s)
        except ValueError as e:
            bad.append((f, 'speaker file is not JSON: %s' % e))

# a pull request may not take away a transcript that a page still shows
for f in deleted:
    if f.startswith('transcripts/') and tid(f) in on_pages:
        bad.append((f, 'deleted, but %s still shows this video' % on_pages[tid(f)]))

if 'videos.json' in files:
    try:
        v = json.loads(read('videos.json'))
        ids = [x['id'] for x in v]
        if len(ids) != len(set(ids)):
            bad.append(('videos.json', 'an id is listed twice'))
    except (ValueError, KeyError, TypeError) as e:
        bad.append(('videos.json', 'does not parse as a list of videos: %s' % e))

if ALL:
    have = {tid(f) for f in every if f.startswith('transcripts/') and f.endswith('.txt')}
    gaps = sorted(on_watch - have)
    if gaps:
        warn.append(('watch/', '%d videos on watch pages have no transcript yet: %s' % (len(gaps), ' '.join(gaps[:12]))))

# 3. links: a pull request may not add a link or image to a file that is not here. The site has pages the repo
# leaves out (unlisted ones), so only links that the change itself adds are judged.
ATTR = re.compile(r'''<(?:a|img|link|script|source)\b[^>]*?\s(?:href|src)\s*=\s*["']([^"'#?]+)''', re.I)


def targets(path, s):
    s = re.sub(r'<!--.*?-->', '', s, flags=re.S)
    s = re.sub(r'(<script\b[^>]*>).*?</script>', r'\1</script>', s, flags=re.S | re.I)   # a URL built in script is not a link
    out = set()
    for m in ATTR.finditer(s):
        u = m.group(1).strip()
        if re.match(r'[a-z][a-z0-9+.-]*:|//|\{|\$', u, re.I):
            m2 = re.match(r'https?://(?:www\.)?wethem\.xyz(/[^"\'#?]*)?', u)
            if not m2:
                continue
            u = m2.group(1) or '/'
        p = u if u.startswith('/') else '/' + os.path.normpath(os.path.join(os.path.dirname(path), u)).replace('\\', '/')
        if not p.startswith(('/api/', '/cdn-cgi/')):
            out.add(p)
    return out


def here(p):
    p = p.lstrip('/')
    return p == '' or any(os.path.isfile(c) for c in (p, p + '.html', p.rstrip('/') + '/index.html'))


if not ALL:
    for f in files:
        if f.endswith('.html') and os.path.isfile(f):
            before = git('show', 'origin/main:' + f)
            was = targets(f, before) if before is not None else set()
            for t in sorted(targets(f, read(f)) - was):
                if not here(t):
                    bad.append((f, 'new link to %s, which is not in this repo' % t))

for f, why in bad:
    print('FAIL', f, why)
for f, why in warn:
    print('warn', f, why)
print('%d files checked, %d problems' % (len(files), len(bad)))
sys.exit(1 if bad else 0)
