# -*- coding: utf-8 -*-
"""
사이트 설정을 한 번에 바꾸는 스크립트.

  애드센스 게시자 ID 넣기 (승인 신청 전에 실행):
    python scripts/site_config.py adsense ca-pub-1234567890123456

  내 도메인 연결 (도메인 구입 후):
    python scripts/site_config.py domain mysite.com

실행 후 git commit / push 하면 GitHub Pages에 반영됩니다.
"""
import io, os, re, sys, json, glob, subprocess

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG_PATH = os.path.join(ROOT, 'site.json')
START, END = '<!-- ADSENSE:START -->', '<!-- ADSENSE:END -->'


def load():
    return json.load(io.open(CFG_PATH, encoding='utf-8'))


def save(cfg):
    with io.open(CFG_PATH, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)
        f.write('\n')


def html_files():
    return [p for p in glob.glob(os.path.join(ROOT, '**', '*.html'), recursive=True) if '.git' not in p]


def rw(path, fn):
    s = io.open(path, encoding='utf-8').read()
    t = fn(s)
    if t != s:
        io.open(path, 'w', encoding='utf-8', newline='\n').write(t)
        return True
    return False


def apply_adsense(cfg):
    client = cfg.get('adsense_client', '')
    tag = (f'\n<meta name="google-adsense-account" content="{client}">\n'
           f'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={client}" crossorigin="anonymous"></script>\n') if client else '\n'
    n = 0
    for p in html_files():
        if rw(p, lambda s: re.sub(re.escape(START) + r'.*?' + re.escape(END), START + tag + END, s, flags=re.S)):
            n += 1
    rw(os.path.join(ROOT, 'assets', 'ads-config.js'), lambda s: re.sub(r"client:\s*'[^']*'", f"client: '{client}'", s))
    if client:
        pub = client.replace('ca-', '')
        io.open(os.path.join(ROOT, 'ads.txt'), 'w', encoding='utf-8', newline='\n').write(f'google.com, {pub}, DIRECT, f08c47fec0942fa0\n')
    print(f'애드센스 코드 반영: HTML {n}개, ads-config.js, ads.txt')


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return
    cmd, val = sys.argv[1], sys.argv[2].strip()
    cfg = load()
    if cmd == 'adsense':
        if not re.fullmatch(r'ca-pub-\d{10,20}', val):
            sys.exit('형식이 맞지 않아요. 예: ca-pub-1234567890123456')
        cfg['adsense_client'] = val
        save(cfg)
        apply_adsense(cfg)
    elif cmd == 'domain':
        dom = re.sub(r'^https?://', '', val).strip('/').lower()
        if not re.fullmatch(r'[a-z0-9.-]+\.[a-z]{2,}', dom):
            sys.exit('도메인 형식이 맞지 않아요. 예: mysite.com')
        old = cfg['base_url']
        new = f'https://{dom}/'
        cfg['base_url'], cfg['path_prefix'] = new, ''
        save(cfg)
        io.open(os.path.join(ROOT, 'CNAME'), 'w', encoding='utf-8', newline='\n').write(dom + '\n')
        for p in html_files() + [os.path.join(ROOT, 'sitemap.xml'), os.path.join(ROOT, 'robots.txt')]:
            if os.path.exists(p):
                rw(p, lambda s: s.replace(old, new))
        subprocess.run([sys.executable, os.path.join(ROOT, 'scripts', 'pages.py')], check=True)
        apply_adsense(cfg)
        print(f'도메인 설정 완료: {new}\n도메인 업체 DNS에 GitHub Pages 레코드를 추가하세요 (README 참고).')
    else:
        print(__doc__)


if __name__ == '__main__':
    main()
