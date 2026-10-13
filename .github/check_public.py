# The pull request check for the public repo (13 Oct 2026). No secrets, no network, no build.
import os
import re
import subprocess
import sys

bad = []
files = subprocess.run(['git', 'diff', '--name-only', 'origin/main...HEAD'], capture_output=True, text=True).stdout.split()
if not files:
    files = subprocess.run(['git', 'ls-files'], capture_output=True, text=True).stdout.split()
SECRET = re.compile(r'AKIA[0-9A-Z]{16}|GOCSPX-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY-----')
for f in files:
    if not os.path.isfile(f):
        continue
    if os.path.getsize(f) > 90 * 1024 * 1024:
        bad.append((f, 'file over 90 MB'))
    if re.search(r'(^|/)(\.env|token\.json|client_secret[^/]*)$', f):
        bad.append((f, 'forbidden file name'))
    if f.endswith(('.txt', '.vtt', '.json', '.html', '.md')):
        s = open(f, encoding='utf-8', errors='replace').read()
        if SECRET.search(s):
            bad.append((f, 'secret-shaped text'))
for f, why in bad:
    print('FAIL', f, why)
print('%d files checked, %d problems' % (len(files), len(bad)))
sys.exit(1 if bad else 0)
