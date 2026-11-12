# -*- coding: utf-8 -*-
"""
허브의 일반 페이지(홈·가이드·정책)를 한 번에 만드는 스크립트.

  python scripts/pages.py

머리말·꼬리말·광고 자리·SEO 태그를 모든 페이지에 똑같이 넣어 줍니다.
새 가이드를 쓰려면 아래 GUIDES 목록에 하나 추가하고 다시 실행하세요.
(템플릿 스튜디오 페이지 template-studio/index.html 은 이 스크립트가 건드리지 않습니다.)
"""
import io, os, sys, json, html

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = json.load(io.open(os.path.join(ROOT, 'site.json'), encoding='utf-8'))
BASE = SITE['base_url'].rstrip('/') + '/'
NAME = SITE['name']


def head(title, desc, path, depth):
    r = '../' * depth
    url = BASE + path
    return f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{html.escape(NAME)}">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{url}">
<meta name="theme-color" content="#15141b">
<link rel="icon" href="{r}assets/favicon.svg" type="image/svg+xml">
<!-- ADSENSE:START -->
<!-- ADSENSE:END -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=IBM+Plex+Sans+KR:wght@400;500;700&family=JetBrains+Mono:wght@400;600&display=swap">
<link rel="stylesheet" href="{r}assets/site.css">
</head>
<body>
<a class="skip" href="#main">본문으로 건너뛰기</a>
'''


def header(depth, cur):
    r = '../' * depth
    items = [('home', '홈', f'{r}index.html'), ('studio', '템플릿 스튜디오', f'{r}template-studio/'),
             ('guides', '가이드', f'{r}guides/'), ('about', '소개', f'{r}about.html')]
    nav = ''.join(f'<a href="{h}"' + (' aria-current="page"' if k == cur else '') + f'>{l}</a>' for k, l, h in items)
    return f'''<header class="site-head"><div class="wrap"><a class="logo" href="{r}index.html">CREATOR<i>HUB</i></a><nav class="nav" aria-label="주요 메뉴">{nav}</nav></div></header>
'''


def footer(depth):
    r = '../' * depth
    return f'''<footer class="site-foot"><div class="wrap">
<nav aria-label="사이트 정보"><a href="{r}about.html">소개</a><a href="{r}privacy.html">개인정보처리방침</a><a href="{r}terms.html">이용약관</a><a href="{r}contact.html">문의</a></nav>
<small>© <span data-year>2026</span> {html.escape(NAME)}. 이 사이트는 Google AdSense 광고를 게재할 수 있으며, 광고 수익은 무료 도구 운영에 쓰입니다.</small>
</div></footer>
<script src="{r}assets/ads-config.js"></script>
<script src="{r}assets/site.js"></script>
</body>
</html>
'''


def ad(slot):
    return f'<div class="ad-slot" data-slot="{slot}" hidden></div>\n'


def write(path, text):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with io.open(full, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)
    print('wrote', path)


# ------------------------------------------------------------------ guides
GUIDES = [
 dict(slug='transitions', title='화면 전환 17가지, 언제 무엇을 쓸까', summary='컷·디졸브·휩 팬·아이리스·글리치… 전환을 리듬·감정·방향·형태로 나눠 고르는 법과 길이·효과음 짝짓기.', date='2026-11-09', body='''
<p>화면 전환은 두 장면을 잇는 접착제이면서, 동시에 “지금 분위기가 바뀐다”는 신호입니다. 좋은 전환은 눈에 띄지 않거나, 눈에 띈다면 이유가 분명합니다. 이 글은 템플릿 스튜디오에 들어 있는 17가지 전환을 <strong>무엇을 전달하느냐</strong>에 따라 다섯 묶음으로 나누고, 각각 언제 쓰면 좋은지 정리합니다.</p>
<h2>1. 리듬형 — 컷, 화이트 플래시, 글리치 컷</h2>
<p>음악의 비트에 맞춰 장면을 끊을 때 씁니다. <strong>하드 컷</strong>은 가장 기본이자 가장 강력한 전환입니다. 가사 영상이나 하이라이트처럼 템포가 빠른 영상은 컷만으로 리듬을 만들고, 강조하고 싶은 박자에만 다른 전환을 섞습니다.</p>
<ul><li><strong>화이트 플래시</strong>: 드롭·후렴 진입처럼 에너지가 한 번에 올라가는 지점. 0.2~0.4초.</li>
<li><strong>글리치 컷</strong>: 슬라이스가 어긋나고 색이 갈라지는 전환. 테크·사이버펑크·힙합에 어울리며, 남발하면 화면이 피곤해집니다. 한 영상에 2~3번이면 충분합니다.</li></ul>
<h2>2. 감정형 — 크로스 디졸브, 블랙 딥, 필름 번</h2>
<p>시간이 흐르거나 감정이 가라앉을 때 씁니다. <strong>디졸브</strong>는 두 장면이 겹치며 “이어진다”는 느낌을, <strong>블랙 딥</strong>은 “끊기고 다시 시작한다”는 느낌을 줍니다. 스릴러 타이틀은 배우 크레딧 사이를 블랙 딥으로 끊어 긴장감을 쌓고, 다큐멘터리는 디졸브로 부드럽게 잇는 경우가 많습니다. <strong>필름 번</strong>은 회상·레트로 무드에 씁니다.</p>
<h2>3. 방향형 — 푸시, 휩 팬, 컬러 와이프, 대각 스트라이프</h2>
<p>화면이 한 방향으로 밀려나며 “다음으로 넘어간다”를 명확하게 보여 줍니다. 정보형 영상, 예능, 브랜드 광고에서 가장 많이 쓰입니다.</p>
<ul><li><strong>푸시</strong>: 목록을 넘기듯 차분하게. 0.4~0.6초.</li>
<li><strong>휩 팬</strong>: 카메라를 휙 돌린 듯 모션블러가 생깁니다. 장소가 바뀔 때(도시 → 사막) 특히 자연스럽습니다.</li>
<li><strong>컬러 와이프·대각 스트라이프</strong>: 브랜드 컬러 띠가 화면을 쓸고 지나가 브랜드 인상을 남깁니다. 스포츠·이벤트 영상에 좋습니다.</li></ul>
<h2>4. 형태형 — 아이리스, 하트 버스트, 잉크 번짐, 타일, 분할 바</h2>
<p>특정 모양의 마스크로 다음 장면을 드러냅니다. 모양 자체가 메시지가 됩니다. 로맨스에는 하트, 동양풍에는 먹물이 번지는 잉크, 그리드·모던 디자인에는 타일이 어울립니다. <strong>아이리스</strong>(원형)는 캐릭터 애니메이션의 엔딩이나 장면 집중에 오래 쓰여 온 고전적인 전환입니다.</p>
<h2>5. 공간형 — 줌 스루, 스핀 줌</h2>
<p>화면 안으로 파고들거나 회전하며 넘어갑니다. 에너지가 크고 시선을 강하게 끌기 때문에 숏폼 도입부나 클라이맥스에 한두 번 쓰는 편이 좋습니다.</p>
<h2>전환 길이는 박자에서 고른다</h2>
<p>전환 길이를 감으로 정하면 영상이 미묘하게 어긋나 보입니다. 배경 음악의 BPM에서 계산하면 깔끔합니다.</p>
<div class="tbl"><table><thead><tr><th>BPM</th><th>1박 길이</th><th>추천 전환 길이</th></tr></thead><tbody>
<tr><td>72 (느린 피아노)</td><td>0.83초</td><td>0.8초 (1박) — 디졸브·블랙 딥</td></tr>
<tr><td>100</td><td>0.6초</td><td>0.3초(반 박) 또는 0.6초(1박)</td></tr>
<tr><td>120</td><td>0.5초</td><td>0.25초 또는 0.5초 — 푸시·와이프</td></tr>
<tr><td>140 (트랩)</td><td>0.43초</td><td>0.2초 이하 — 컷·플래시·글리치</td></tr></tbody></table></div>
<h2>효과음과 짝짓기</h2>
<p>전환에는 대부분 효과음이 붙습니다. 방향형에는 <strong>우쉬·스우시·휩</strong>, 리듬형에는 <strong>임팩트·글리치</strong>, 감정형에는 <strong>리버스 스웰·시네마 붐</strong>, 형태형에는 <strong>팝·차임</strong>이 잘 맞습니다. 템플릿 스튜디오에서는 타임라인의 ‘효과음’ 트랙에서 각 전환에 붙은 소리를 바로 바꿀 수 있습니다.</p>
<div class="note">자주 하는 실수: 모든 장면 사이에 서로 다른 전환을 넣는 것. 한 영상 안에서는 <strong>주력 전환 1~2개</strong>를 정하고, 정말 강조할 지점에만 특수 전환을 쓰세요.</div>
'''),
 dict(slug='text-animation', title='텍스트 등장 애니메이션 12가지와 가독성 규칙', summary='팝·슬램·자간 수렴·타자기·스크램블… 글자 등장 기법을 장르별로 고르고, 읽힐 만큼 오래 보여 주는 법.', date='2026-11-09', body='''
<p>모션그래픽에서 글자는 정보이자 그림입니다. 같은 문장도 어떻게 등장하느냐에 따라 귀엽게, 비장하게, 긴박하게 읽힙니다. 다만 아무리 멋진 등장도 <strong>읽을 시간이 없으면 실패</strong>입니다. 기법을 고르기 전에 가독성 규칙부터 짚고 가겠습니다.</p>
<h2>먼저, 몇 초나 보여 줘야 할까</h2>
<p>한국어 자막은 보통 1초에 4~6글자를 편하게 읽습니다. 여기에 등장 애니메이션 시간을 더하면 최소 노출 시간이 나옵니다.</p>
<ul><li>최소 노출 시간 ≈ <strong>등장 시간 + (글자 수 ÷ 5)초 + 0.5초</strong></li>
<li>예: “모쏠 탈출 대작전”(8자), 팝 등장 0.5초 → 0.5 + 1.6 + 0.5 ≈ <strong>2.6초 이상</strong></li>
<li>키네틱 타이포처럼 한 단어씩 보여 줄 때는 단어당 0.3~0.5초도 충분합니다. 단어가 짧고 크기 때문입니다.</li></ul>
<h2>기법별 쓰임새</h2>
<div class="tbl"><table><thead><tr><th>기법</th><th>느낌</th><th>잘 맞는 곳</th></tr></thead><tbody>
<tr><td>팝 바운스</td><td>경쾌, 귀여움</td><td>예능·연애 프로그램 타이틀, 키즈</td></tr>
<tr><td>마스크 슬라이드 업</td><td>깔끔, 정돈</td><td>정보형·기업 홍보·강의</td></tr>
<tr><td>타자기</td><td>대화, 기록</td><td>메신저 연출, 다큐 자막, 뉴스</td></tr>
<tr><td>슬램 (임팩트)</td><td>강렬, 박자</td><td>힙합·K-POP 가사, 스포츠, 숏폼 훅</td></tr>
<tr><td>블러 인</td><td>몽환, 시네마틱</td><td>판타지·로맨스 타이틀, 뷰티</td></tr>
<tr><td>글자 낙하</td><td>장난, 활기</td><td>캐릭터물, 웹툰 예고</td></tr>
<tr><td>깜빡임</td><td>불안, 공포</td><td>스릴러·호러, 네온사인</td></tr>
<tr><td>자간 수렴</td><td>무게, 품격</td><td>드라마 크레딧, 시상식, 웨딩</td></tr>
<tr><td>좌→우 마스크</td><td>모던, 구조적</td><td>그리드 디자인, 테크 런칭</td></tr>
<tr><td>글자 스크램블</td><td>디지털, 해킹</td><td>사이버펑크, 게임, 테크</td></tr></tbody></table></div>
<h2>조합하는 요령</h2>
<h3>메인과 보조를 다르게</h3>
<p>제목에는 개성 있는 등장(팝·슬램·블러)을, 부제에는 조용한 등장(페이드·자간 수렴)을 0.3~0.5초 늦게 붙이면 위계가 생깁니다. 둘 다 요란하면 서로 시선을 뺏습니다.</p>
<h3>서체와 등장을 맞추기</h3>
<p>두꺼운 고딕(블랙한산스, Anton)은 슬램·팝처럼 크기가 변하는 등장에서 힘이 납니다. 가는 세리프(나눔명조, 고운바탕)는 자간 수렴·블러처럼 천천히 드러나는 등장과 어울립니다. 붓글씨는 왼쪽에서 오른쪽으로 쓰이듯 드러나는 마스크가 가장 자연스럽습니다.</p>
<h3>등장에 효과음을 한 번만</h3>
<p>글자마다 소리를 붙이면 금방 시끄러워집니다. 슬램은 단어마다 임팩트를 넣어도 되지만, 팝 바운스는 문장 전체에 팝 한 번이면 충분합니다.</p>
<div class="note">스튜디오에서는 타임라인 ‘자막’ 트랙의 항목을 누르면 그 장면의 글자와 등장 기법만 따로 열립니다. 기법 카드에 마우스를 올리면 실제 움직임을 미리 볼 수 있어요.</div>
'''),
 dict(slug='title-sequence-styles', title='타이틀 시퀀스 7가지 스타일과 구성법', summary='플랫 일러스트 로맨스부터 누아르, 동양 판타지, 키네틱 타이포까지 — 장르별 색·서체·전환·음악 조합.', date='2026-11-09', body='''
<p>드라마와 예능의 오프닝 타이틀 시퀀스는 30~60초 안에 작품의 장르와 분위기를 약속합니다. 모션그래픽 수강생 포트폴리오에서도 가장 많이 만드는 형식이죠. 공개된 학생·실무 작품들을 살펴보면 대부분 아래 일곱 가지 스타일 중 하나에서 출발합니다.</p>
<h2>타이틀 시퀀스의 기본 구조</h2>
<ol><li><strong>훅 (0~5초)</strong>: 세계관을 한 컷으로 보여 주는 상징 오브제나 장면.</li>
<li><strong>전개 (5~25초)</strong>: 인물·장소·사건의 조각을 리듬에 맞춰 나열. 출연진 크레딧이 이 구간에 들어갑니다.</li>
<li><strong>타이틀 공개 (마지막 3~5초)</strong>: 제목 로고가 가장 크고 오래 머무는 순간. 음악도 여기서 정리됩니다.</li></ol>
<h2>1. 플랫 일러스트 로맨스</h2>
<p>파스텔 두 가지 색, 외곽선 없는 벡터 인물, 메신저 말풍선과 하트. 장면을 2~4분할 패널로 쪼개고, 하트 모양 마스크나 분할 바로 넘깁니다. 음악은 경쾌한 팝, 등장은 팝 바운스.</p>
<h2>2. K-POP·힙합 키네틱 타이포</h2>
<p>화면을 꽉 채우는 컨덴스드 대문자를 행마다 반복해 쌓고, 단어 단위로 비트에 맞춰 내리꽂습니다. 원색 블록, 하프톤 도트, 글리치 컷이 핵심. 20초 남짓한 짧은 길이에 컷 수가 가장 많은 스타일입니다.</p>
<h2>3. 캐릭터 여정</h2>
<p>한 캐릭터가 여러 배경을 통과하며 이야기를 끌고 갑니다. 레이어마다 속도가 다른 <strong>패럴랙스</strong>로 깊이를 만들고, 배경이 바뀔 때는 휩 팬이나 푸시, 마지막은 아이리스로 로고에 도착합니다. 브랜드 광고에서 자주 보이는 구성입니다.</p>
<h2>4. 다크 스릴러·누아르</h2>
<p>거의 검정에 가까운 화면에서 소품(무전기, 시계, 문틈)만 빛을 받습니다. 먼지 입자, 깜빡이는 조명, 붉은 포인트 한 가지. 배우 이름은 화면 한쪽에 세리프 서체로 넓은 자간을 두고 천천히 모입니다. 전환은 블랙 딥, 음악은 저음 드론.</p>
<h2>5. 동양 판타지·사극</h2>
<p>골든아워 역광, 들판과 고궁 실루엣, 장면을 관통하는 붉은 실이나 리본 같은 연결 모티프. 불씨 파티클과 레터박스로 영화적인 화면을 만들고, 마지막은 붓글씨 타이틀과 낙관으로 마무리합니다.</p>
<h2>6. 모듈러 그리드</h2>
<p>12컬럼 그리드가 그려지고 컬러 블록이 칸에 맞춰 채워집니다. 타이포그래피 수업의 실습 과제로 많이 쓰이며, 모노스페이스 라벨(프레임 수, 좌표)이 디테일을 더합니다.</p>
<h2>7. 정보형 프로모션</h2>
<p>밝은 브랜드 컬러, 해시태그 팝업, 분할 패널, 인물과 카피, 엔드카드. 공공기관·교육 홍보처럼 메시지를 정확히 전달해야 할 때 씁니다.</p>
<h2>스타일을 섞을 때</h2>
<p>두 스타일을 섞는다면 <strong>색과 서체는 하나로 통일</strong>하고 전환·구성만 빌려 오세요. 예를 들어 누아르의 색과 서체를 유지한 채 키네틱 타이포의 단어 슬램을 클라이맥스에만 넣으면, 긴장감을 해치지 않고 리듬만 더할 수 있습니다.</p>
<div class="note">템플릿 스튜디오의 67개 템플릿은 이 일곱 스타일과, 같은 기법을 뉴스·게임·요리·시즌 이벤트 등으로 넓힌 변형으로 이루어져 있습니다. 원본 영상의 그림·음악은 쓰지 않고 기법만 참고해 새로 그렸습니다.</div>
'''),
 dict(slug='sound-design', title='모션그래픽 효과음 배치 기초', summary='우쉬·임팩트·라이저·팝을 어디에 넣는지, 소리의 위계와 타이밍, 음악과 부딪히지 않게 섞는 법.', date='2026-11-09', body='''
<p>소리를 끄고 모션그래픽을 보면 절반은 힘이 빠집니다. 효과음은 움직임에 무게와 속도를 더하고, 시청자가 어디를 봐야 하는지 알려 줍니다. 그렇다고 많이 넣을수록 좋은 건 아닙니다. 기본 원칙 다섯 가지를 정리했습니다.</p>
<h2>1. 효과음을 역할로 나누기</h2>
<div class="tbl"><table><thead><tr><th>분류</th><th>대표 소리</th><th>역할</th></tr></thead><tbody>
<tr><td>이동</td><td>우쉬, 스우시, 휩</td><td>무언가 지나가거나 화면이 넘어감</td></tr>
<tr><td>강조</td><td>임팩트, 시네마 붐, 낙관 도장</td><td>중요한 순간에 무게를 실음</td></tr>
<tr><td>기대</td><td>라이저, 리버스 스웰</td><td>다음 순간을 향해 긴장을 쌓음</td></tr>
<tr><td>UI·귀여움</td><td>팝, 말풍선, 클릭, 코인</td><td>작은 요소의 등장, 버튼·알림</td></tr>
<tr><td>질감</td><td>글리치, 라디오 잡음, 네온 지직</td><td>세계관의 재질을 들려 줌</td></tr></tbody></table></div>
<h2>2. 타이밍: 소리는 살짝 먼저</h2>
<p>사람은 소리를 화면보다 조금 늦게 인식하는 경향이 있습니다. 그래서 <strong>우쉬는 전환이 시작되기 0.1~0.2초 전</strong>에 시작해 전환의 한가운데서 가장 크게 들리도록 두면 자연스럽습니다. 반대로 <strong>임팩트는 화면이 멈추는 정확한 프레임</strong>에 맞춰야 합니다. 라이저는 끝나는 지점이 다음 장면의 시작과 딱 맞아야 효과가 있습니다.</p>
<h2>3. 소리의 위계</h2>
<p>한 순간에 주인공 소리는 하나입니다. 일반적인 크기 순서는 <strong>내레이션·대사 &gt; 효과음 &gt; 배경 음악</strong>입니다. 대사가 없는 모션그래픽이라면 효과음이 음악보다 약간 크게 들리되, 음악의 박자와 겹치게 두면 하나의 리듬처럼 들립니다.</p>
<h2>4. 쌓지 말고 고르기</h2>
<p>같은 순간에 우쉬와 팝과 임팩트를 모두 넣으면 소리가 뭉개집니다. 장면이 바뀌는 순간엔 전환 효과음 하나, 그 다음 0.3초 뒤에 글자 등장음 하나처럼 <strong>시간을 나눠</strong> 배치하세요. 템플릿 스튜디오의 ‘효과음’ 트랙은 소리들이 시간축 위 어디에 놓였는지 보여 주므로, 겹치는 구간을 눈으로 확인할 수 있습니다.</p>
<h2>5. 음악과 장르 맞추기</h2>
<ul><li>트랩·힙합 비트 → 임팩트, 글리치, 휩</li>
<li>큐트 팝·뮤직박스 → 팝, 말풍선, 반짝, 차임</li>
<li>다크 드론 → 라디오 잡음, 심장 박동, 시네마 붐</li>
<li>동양풍 에픽 → 붓 스트로크, 낙관 도장, 벨</li>
<li>칩튠 → 코인, 레벨 업, 비프</li></ul>
<div class="note">점검법: 효과음만 켜고 음악을 끈 채로 한 번, 반대로 한 번 들어 보세요. 효과음만 들어도 화면이 상상되고, 음악과 합쳤을 때 귀가 피곤하지 않다면 잘 배치된 것입니다.</div>
'''),
 dict(slug='studio-tutorial', title='템플릿 스튜디오 사용법: 5분 만에 첫 영상 만들기', summary='템플릿 고르기 → 트랙별 편집 → 에셋 끌어다 놓기 → 소리 고르기 → WebM 내보내기까지 단계별 안내.', date='2026-11-09', body='''
<p>템플릿 스튜디오는 설치 없이 브라우저에서 바로 쓰는 모션그래픽 편집기입니다. 모든 그림·애니메이션·소리를 브라우저가 직접 만들어 내기 때문에 파일을 올릴 필요도 없습니다. 처음 쓰는 분을 위해 순서대로 안내합니다.</p>
<h2>1단계. 템플릿 고르기</h2>
<p>오른쪽 패널의 <strong>템플릿</strong> 탭에서 카테고리(드라마 타이틀, 뮤직·가사, 브랜드·광고, 정보·홍보, 유튜브·숏폼, 이벤트·시즌 등)를 누르거나 검색창에 “네온”, “세로”, “피아노”처럼 입력해 찾습니다. 카드를 누르면 장면 구성, 기법, 전환, 효과음, 음악이 한 번에 세팅됩니다. 마음에 안 들면 알림창의 ‘되돌리기’를 누르세요.</p>
<h2>2단계. 타임라인 트랙 이해하기</h2>
<p>미리보기 아래 타임라인은 다섯 줄로 나뉘어 있습니다.</p>
<ul><li><strong>화면</strong>: 장면 썸네일. 누르면 일러스트·길이·순서 편집.</li>
<li><strong>자막</strong>: 장면별 글자와 등장 기법. 누르면 텍스트 입력칸으로 바로 이동.</li>
<li><strong>전환</strong>: 장면 사이의 화면 전환. 누르면 전환 고르기 화면이 열림.</li>
<li><strong>효과음</strong>: 시간 위치에 놓인 소리들. 누르면 그 소리가 들리고 바꿀 수 있음.</li>
<li><strong>음악</strong>: 배경 음악. 누르면 사운드 탭으로 이동.</li></ul>
<p>트랙의 빈 곳을 드래그하면 영상을 앞뒤로 훑어볼 수 있고, 스페이스바로 재생·정지합니다.</p>
<h2>3단계. 글자 바꾸기</h2>
<p>‘자막’ 트랙에서 장면을 누르고 메인 텍스트와 보조 텍스트를 고칩니다. 장면 종류에 따라 입력 규칙이 조금 다릅니다. 메신저 장면은 줄마다 말풍선 하나, 키네틱 슬램은 띄어쓰기마다 한 단어, 그래프 장면은 보조 텍스트에 숫자를 띄어 쓰면 값이 됩니다.</p>
<h2>4단계. 에셋에서 가져오기</h2>
<p><strong>에셋</strong> 탭에는 장면 프리셋 200여 개, 일러스트 90종, 전환 24종, 텍스트 등장 22종, 효과 프리셋, 팔레트, 서체, 효과음, 음악이 모여 있습니다. 카드에 마우스를 올리면 움직임을 미리 볼 수 있고, 버튼을 누르거나 <strong>카드를 타임라인으로 끌어다 놓으면</strong> 바로 들어갑니다. 장면은 놓은 자리에 끼워지고, 전환·등장·효과음은 놓은 장면에 적용됩니다.</p>
<h2>5단계. 색과 효과</h2>
<p><strong>효과·색</strong> 탭에서 다섯 가지 팔레트 색, 제목·본문 서체, 출력 비율(16:9 / 9:16 / 1:1), 필름 그레인·레터박스·글리치 같은 전역 효과를 조절합니다.</p>
<h2>6단계. 소리</h2>
<p><strong>사운드</strong> 탭에서 배경 음악 16종 중 하나를 고르고 템포와 볼륨을 맞춥니다. 내 음악 파일이나 효과음 파일을 올릴 수도 있습니다(올린 파일은 이 브라우저 탭에서만 쓰입니다).</p>
<h2>7단계. 내보내기와 저장</h2>
<ul><li><strong>영상 내보내기(.webm)</strong>: 실시간으로 녹화하므로 영상 길이만큼 기다리면 됩니다. 녹화 중엔 탭을 바꾸지 마세요.</li>
<li>MP4가 필요하면 HandBrake, 캡컷, 프리미어 등에서 WebM을 변환하세요.</li>
<li><strong>프로젝트 저장(.json)</strong>: 편집 상태를 파일로 저장해 두었다가 ‘프로젝트 불러오기’로 이어서 작업할 수 있습니다. 편집 중인 내용은 브라우저에도 자동 저장됩니다.</li></ul>
<div class="note">개인정보: 스튜디오에서 만든 내용은 서버로 보내지지 않고 사용자의 브라우저 안에서만 처리·저장됩니다.</div>
'''),
]

# ------------------------------------------------------------------ pages
def page(path, depth, cur, title, desc, main):
    write(path, head(title, desc, path.replace('index.html', ''), depth) + header(depth, cur) + main + footer(depth))


def build():
    # guides
    for i, g in enumerate(GUIDES):
        others = [x for x in GUIDES if x is not g][:2]
        main = f'''<main id="main" class="wrap">
<p class="crumbs"><a href="../index.html">홈</a> › <a href="./">가이드</a></p>
<article class="prose">
<h1>{html.escape(g["title"])}</h1>
<p class="meta">{g["date"]} · {html.escape(NAME)} 가이드</p>
{g["body"].strip()}
{ad("guide-bottom")}<p><a class="cta" href="../template-studio/">템플릿 스튜디오에서 직접 해 보기 →</a></p>
<div class="next">{''.join(f'<a href="{o["slug"]}.html">{html.escape(o["title"])} →</a>' for o in others)}</div>
</article>
</main>
'''
        page(f'guides/{g["slug"]}.html', 1, 'guides', f'{g["title"]} | {NAME}', g['summary'], main)

    items = ''.join(f'<li><a href="{g["slug"]}.html"><span class="no">{i+1:02d}</span><span><b>{html.escape(g["title"])}</b><span>{html.escape(g["summary"])}</span></span></a></li>' for i, g in enumerate(GUIDES))
    page('guides/index.html', 1, 'guides', f'모션그래픽 가이드 | {NAME}', '화면 전환, 텍스트 애니메이션, 타이틀 시퀀스, 효과음 배치까지 — 영상 만드는 사람을 위한 모션그래픽 실전 가이드.',
         f'''<main id="main" class="wrap">
<section class="hero" style="padding-bottom:20px"><p class="eyebrow">Guides</p><h1>모션그래픽 가이드</h1><p>도구를 잘 쓰려면 원리를 알아야 합니다. 전환, 글자, 구성, 소리 — 영상의 완성도를 바꾸는 기초를 짧고 실용적으로 정리했습니다.</p></section>
<ul class="guide-list">{items}</ul>
{ad("guide-inline")}</main>
''')

    # home
    gl = ''.join(f'<li><a href="guides/{g["slug"]}.html"><span class="no">{i+1:02d}</span><span><b>{html.escape(g["title"])}</b><span>{html.escape(g["summary"])}</span></span></a></li>' for i, g in enumerate(GUIDES))
    page('index.html', 0, 'home', f'{NAME} — 영상 만드는 사람을 위한 무료 도구', '설치 없이 브라우저에서 바로 쓰는 무료 크리에이터 도구 모음. 67가지 모션그래픽 템플릿 스튜디오와 실전 가이드.',
         f'''<main id="main">
<div class="wrap">
<section class="hero"><p class="eyebrow">Free tools for creators</p>
<h1>영상 만드는 사람을 위한<br><em>무료 도구</em> 모음</h1>
<p>설치도 회원가입도 없이 브라우저에서 바로 씁니다. 만든 내용은 서버로 보내지 않고 내 브라우저 안에서만 처리돼요.</p>
<a class="cta" href="template-studio/">템플릿 스튜디오 열기 →</a><a class="cta ghost" href="guides/">가이드 읽기</a></section>
{ad("hub-top")}
<section class="section" id="tools"><h2>도구</h2><p class="lead">필요한 도구를 골라 바로 시작하세요. 새 도구는 계속 추가됩니다.</p>
<div class="tool-grid">
<!-- TOOL CARDS: 새 도구를 만들면 아래 카드를 복사해 하나 더 추가하세요 -->
<a class="tool-card" href="template-studio/">
 <div class="art"><canvas id="studio-art" width="640" height="360" aria-hidden="true" style="width:100%;height:100%;display:block"></canvas></div>
 <div class="body"><h3>모션 템플릿 스튜디오</h3><p>67개 템플릿에서 시작해 장면·전환·자막·효과음·음악을 트랙별로 고르고, WebM 영상으로 바로 내보내는 모션그래픽 편집기.</p>
 <div class="tags"><span class="tag live">사용 가능</span><span class="tag">45 템플릿</span><span class="tag">에셋 500+</span><span class="tag">16:9 · 9:16</span></div></div>
</a>
<!-- /TOOL CARDS -->
</div></section>
<section class="section"><h2>가이드</h2><p class="lead">도구와 함께 읽으면 좋은 모션그래픽 기초.</p><ul class="guide-list">{gl}</ul></section>
<section class="section"><h2>이 사이트는</h2><p class="lead" style="max-width:720px">{html.escape(NAME)}는 영상 크리에이터·디자인 학생이 반복 작업을 줄이고 아이디어를 빠르게 시험해 볼 수 있도록 만든 무료 웹 도구 모음입니다. 광고 수익은 도구를 계속 무료로 운영하고 새 도구를 만드는 데 쓰입니다. <a href="about.html">더 알아보기</a></p></section>
{ad("hub-bottom")}</div>
</main>
<script>
/* small animated preview on the studio card (decorative) */
(function(){{var c=document.getElementById('studio-art');if(!c)return;var x=c.getContext('2d'),W=c.width,H=c.height,t0=performance.now(),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function f(now){{var t=(now-t0)/1000;x.fillStyle='#ff77ad';x.fillRect(0,0,W,H);x.fillStyle='#4f6bff';var d=Math.min(1,t/0.8);x.beginPath();x.moveTo(W*(1-d*.5),0);x.lineTo(W,0);x.lineTo(W,H);x.lineTo(W*(1-d*.8),H);x.fill();
x.fillStyle='#2b2141';for(var i=0;i<5;i++){{var r=W*(.08+i*.19),h=60+40*Math.sin(t*3+i);x.fillRect(r,H*.78-h,W*.12,h)}}
x.fillStyle='#fff';x.font='700 54px "Black Han Sans",sans-serif';x.textAlign='center';x.textBaseline='middle';var s=1+.04*Math.sin(t*2);x.save();x.translate(W/2,H*.38);x.scale(s,s);x.fillText('MOTION TEMPLATE',0,0);x.restore();
if(!reduce)requestAnimationFrame(f)}}requestAnimationFrame(f)}})();
</script>
''')

    # about / privacy / terms / contact
    simple = [
     ('about.html', 'about', '소개', '크리에이터 허브가 무엇이고 누가, 왜 만들었는지 소개합니다.', f'''
<p>{html.escape(NAME)}는 영상을 만드는 사람들을 위한 <strong>무료 웹 도구 모음</strong>입니다. 첫 번째 도구인 <a href="template-studio/">모션 템플릿 스튜디오</a>는 타이틀 시퀀스, 가사 영상, 브랜드 광고, 숏폼 등에서 자주 쓰이는 모션그래픽 기법을 템플릿으로 정리해, 누구나 몇 분 만에 영상을 만들어 볼 수 있도록 했습니다.</p>
<h2>원칙</h2>
<ul><li><strong>설치·가입 없음</strong>: 모든 도구는 브라우저에서 바로 실행됩니다.</li>
<li><strong>내 데이터는 내 브라우저에</strong>: 도구에서 만든 내용은 서버로 전송하지 않습니다.</li>
<li><strong>직접 만든 리소스</strong>: 일러스트·애니메이션·음악·효과음은 코드로 새로 그리고 합성했습니다. 공개된 모션그래픽 작품들의 <em>기법</em>을 연구해 참고했지만, 원본 영상의 그림·음악·로고는 사용하지 않습니다.</li>
<li><strong>꾸준한 업데이트</strong>: 템플릿과 도구를 계속 추가합니다.</li></ul>
<h2>광고에 대해</h2>
<p>이 사이트는 Google AdSense 광고를 게재할 수 있습니다. 광고 수익은 도구를 계속 무료로 운영하는 데 쓰입니다. 광고는 도구의 조작 버튼과 떨어진 위치에만 배치합니다.</p>
<h2>문의</h2><p>오류 제보나 제안은 <a href="contact.html">문의 페이지</a>를 이용해 주세요.</p>'''),
     ('privacy.html', 'about', '개인정보처리방침', '크리에이터 허브의 개인정보 처리, 쿠키, 광고(Google AdSense)에 관한 안내.', f'''
<p class="meta">시행일: 2026년 11월 9일</p>
<p>{html.escape(NAME)}(이하 “사이트”)는 이용자의 개인정보를 소중히 다루며, 관련 법령을 준수합니다. 이 방침은 사이트가 어떤 정보를 어떻게 처리하는지 설명합니다.</p>
<h2>1. 사이트가 직접 수집하는 정보</h2>
<p>사이트는 회원가입 기능이 없으며, 이름·이메일·전화번호 같은 개인정보를 직접 수집하지 않습니다. 도구에서 만든 프로젝트, 업로드한 오디오 파일, 설정 값은 <strong>이용자의 브라우저(localStorage 등) 안에만 저장</strong>되며 사이트 서버로 전송되지 않습니다. 브라우저의 사이트 데이터를 삭제하면 함께 지워집니다.</p>
<h2>2. 호스팅과 접속 기록</h2>
<p>사이트는 GitHub Pages로 호스팅됩니다. GitHub는 보안과 서비스 운영을 위해 접속 IP 주소 등 기술적 기록을 처리할 수 있으며, 이는 <a href="https://docs.github.com/ko/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener" target="_blank">GitHub 개인정보처리방침</a>을 따릅니다.</p>
<h2>3. 쿠키와 광고 (Google AdSense)</h2>
<ul><li>사이트는 Google AdSense를 통해 광고를 게재할 수 있습니다. Google을 포함한 제3자 공급업체는 <strong>쿠키를 사용</strong>하여 이용자가 이 사이트나 다른 웹사이트를 이전에 방문한 기록을 바탕으로 광고를 게재합니다.</li>
<li>Google은 광고 쿠키를 사용하여 이용자의 이 사이트 및 다른 사이트 방문 기록을 바탕으로 이용자와 이용자의 파트너에게 광고를 게재할 수 있습니다.</li>
<li>이용자는 <a href="https://adssettings.google.com" rel="noopener" target="_blank">Google 광고 설정</a>에서 맞춤 광고를 해제할 수 있으며, <a href="https://www.aboutads.info" rel="noopener" target="_blank">www.aboutads.info</a>에서 제3자 공급업체의 맞춤 광고용 쿠키 사용을 해제할 수 있습니다.</li>
<li>Google의 데이터 사용 방식은 <a href="https://policies.google.com/technologies/partner-sites" rel="noopener" target="_blank">Google 파트너 사이트 데이터 사용 정책</a>에서 확인할 수 있습니다.</li>
<li>유럽경제지역(EEA)·영국·스위스 이용자에게는 Google 인증 동의 관리 도구를 통해 쿠키 사용 동의를 받습니다.</li></ul>
<h2>4. 외부 리소스</h2>
<p>사이트는 글꼴 표시를 위해 Google Fonts를 불러옵니다. 이 과정에서 이용자의 브라우저가 Google 서버에 접속합니다.</p>
<h2>5. 아동의 개인정보</h2>
<p>사이트는 만 14세 미만 아동의 개인정보를 의도적으로 수집하지 않습니다.</p>
<h2>6. 방침의 변경</h2>
<p>이 방침이 바뀌면 이 페이지에 시행일과 함께 공지합니다.</p>
<h2>7. 문의</h2>
<p>개인정보 관련 문의는 <a href="contact.html">문의 페이지</a>로 연락해 주세요.</p>'''),
     ('terms.html', 'about', '이용약관', '크리에이터 허브 이용약관.', f'''
<p class="meta">시행일: 2026년 11월 9일</p>
<h2>1. 서비스</h2><p>{html.escape(NAME)}는 웹 브라우저에서 동작하는 무료 도구와 가이드 글을 제공합니다. 서비스는 사전 통지 없이 변경되거나 중단될 수 있습니다.</p>
<h2>2. 만든 결과물의 권리</h2><p>이용자가 도구로 만든 영상과 프로젝트 파일의 권리는 이용자에게 있습니다. 개인·상업적 용도로 자유롭게 사용할 수 있습니다. 단, 이용자가 직접 올린 음악·이미지 등 제3자 저작물의 권리는 이용자가 책임집니다.</p>
<h2>3. 사이트 콘텐츠</h2><p>가이드 글과 사이트 디자인, 도구 코드의 저작권은 운영자에게 있습니다. 출처를 밝힌 짧은 인용은 허용되지만, 전문을 무단 복제·재배포할 수 없습니다.</p>
<h2>4. 금지 행위</h2><ul><li>사이트의 정상적인 운영을 방해하는 행위</li><li>광고를 부정하게 클릭하거나 클릭을 유도하는 행위</li><li>도구를 이용해 타인의 권리를 침해하는 결과물을 만드는 행위</li></ul>
<h2>5. 면책</h2><p>도구는 “있는 그대로” 제공되며, 결과물의 품질이나 특정 목적 적합성을 보증하지 않습니다. 브라우저 데이터 삭제 등으로 인한 작업물 손실에 대해 책임지지 않으니, 중요한 작업은 ‘프로젝트 저장’으로 파일을 보관해 주세요.</p>
<h2>6. 광고</h2><p>사이트에는 Google AdSense 등 제3자 광고가 표시될 수 있으며, 광고 내용에 대한 책임은 광고주에게 있습니다.</p>'''),
     ('contact.html', 'about', '문의', '크리에이터 허브에 오류 제보, 기능 제안, 제휴 문의를 보내는 방법.', f'''
<p>오류 제보, 새 템플릿·도구 제안, 기타 문의는 아래 방법으로 보내 주세요. 보통 며칠 안에 답변드립니다.</p>
<h2>GitHub 이슈 (권장)</h2>
<p><a href="{html.escape(SITE["repo_url"])}/issues" rel="noopener" target="_blank">{html.escape(SITE["repo_url"])}/issues</a> 에서 새 이슈를 열어 주세요. 오류라면 사용한 브라우저, 어떤 템플릿에서 무엇을 눌렀는지 적어 주시면 빨리 고칠 수 있습니다.</p>
<h2>이메일</h2>
<p>{html.escape(SITE.get("contact_email") or "준비 중입니다. 그동안은 GitHub 이슈를 이용해 주세요.")}</p>'''),
    ]
    for path, cur, title, desc, body in simple:
        page(path, 0, cur, f'{title} | {NAME}', desc, f'<main id="main" class="wrap"><article class="prose" style="padding-top:36px"><h1>{title}</h1>{body}</article></main>\n')

    # 404
    write('404.html', head(f'페이지를 찾을 수 없어요 | {NAME}', '요청한 페이지가 없습니다.', '404.html', 0).replace('<link rel="canonical"', '<meta name="robots" content="noindex"><link rel="canonical"')
          .replace('href="assets/', 'href="/' + SITE['path_prefix'] + 'assets/') + header(0, '').replace('href="', 'href="/' + SITE['path_prefix']).replace('href="/' + SITE['path_prefix'] + 'index.html"', 'href="/' + SITE['path_prefix'] + '"')
          + f'<main id="main" class="wrap"><section class="hero"><p class="eyebrow">404</p><h1>페이지를 찾을 수 없어요</h1><p>주소가 바뀌었거나 삭제된 페이지입니다.</p><a class="cta" href="/{SITE["path_prefix"]}">홈으로</a></section></main>\n'
          + footer(0).replace('src="assets/', 'src="/' + SITE['path_prefix'] + 'assets/').replace('href="', 'href="/' + SITE['path_prefix']))

    # sitemap + robots
    urls = ['', 'template-studio/', 'guides/'] + [f'guides/{g["slug"]}.html' for g in GUIDES] + ['about.html', 'privacy.html', 'terms.html', 'contact.html']
    write('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{BASE}{u}</loc></url>\n' for u in urls) + '</urlset>\n')
    write('robots.txt', f'User-agent: *\nAllow: /\nDisallow: /_template/\n\nSitemap: {BASE}sitemap.xml\n')


if __name__ == '__main__':
    build()
