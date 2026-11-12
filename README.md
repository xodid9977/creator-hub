# Creator Hub

영상 만드는 사람을 위한 무료 웹 도구 모음입니다. GitHub Pages로 배포되는 정적 사이트로, 빌드 과정 없이 HTML 파일 그대로 동작합니다.

- 사이트: https://xodid9977.github.io/creator-hub/ (도메인 연결 후에는 그 주소)
- 첫 도구: [모션 템플릿 스튜디오](template-studio/) — 67개 템플릿, 500여 개 에셋, 트랙별 편집, WebM 내보내기

## 폴더 구조

| 경로 | 내용 |
|---|---|
| `index.html` | 허브 홈 (도구 카드 · 가이드 목록) |
| `template-studio/index.html` | 모션 템플릿 스튜디오 (단일 파일 앱) |
| `guides/` | 모션그래픽 가이드 글 (애드센스 심사용 본문 콘텐츠) |
| `about.html` `privacy.html` `terms.html` `contact.html` | 소개 · 개인정보처리방침 · 이용약관 · 문의 |
| `assets/site.css` `assets/site.js` | 공통 디자인 · 광고 자리 처리 |
| `assets/ads-config.js` | **광고 설정 (게시자 ID, 광고 단위 번호)** |
| `_template/` | 새 도구 페이지를 만들 때 복사할 기본 틀 (검색 노출 안 됨) |
| `scripts/pages.py` | 홈·가이드·정책 페이지 생성기 |
| `scripts/site_config.py` | 애드센스 ID · 도메인을 한 번에 바꾸는 스크립트 |
| `site.json` | 사이트 이름 · 주소 · 문의 이메일 |

## 자주 하는 작업

### 템플릿 스튜디오 업데이트
`template-studio/index.html` 을 고친 뒤 커밋·푸시하면 1~2분 뒤 사이트에 반영됩니다.

### 새 도구 추가
1. `_template/` 폴더를 복사해 새 이름으로 바꿉니다 (예: `thumbnail-maker/`).
2. 그 안의 `index.html` 에 도구를 만들고, `<meta name="robots" content="noindex">` 줄을 지웁니다.
3. 홈 `index.html` 의 `<!-- TOOL CARDS -->` 안에 카드를 하나 더 복사해 넣습니다 (`scripts/pages.py` 의 홈 부분도 같이 고쳐야 다음 생성 때 유지됩니다).
4. `scripts/pages.py` 의 `urls` 목록(사이트맵)에 새 경로를 추가하고 `python scripts/pages.py` 실행.

### 가이드 글 추가
`scripts/pages.py` 의 `GUIDES` 목록에 항목을 추가하고 `python scripts/pages.py` 를 실행하면 글 페이지, 가이드 목록, 홈, 사이트맵이 함께 갱신됩니다.

## 구글 애드센스 설정 순서

1. **내 도메인 연결 (필수)** — 애드센스는 `github.io` 주소를 사이트로 등록할 수 없습니다.
   - 도메인을 산 뒤 `python scripts/site_config.py domain mysite.com` 실행 → 커밋·푸시
   - 도메인 업체 DNS에 아래 레코드 추가
     - `A` 레코드 4개: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
     - `www` → `CNAME` → `xodid9977.github.io`
   - GitHub 저장소 → Settings → Pages → Custom domain 확인, **Enforce HTTPS** 체크
2. **애드센스 가입** — https://adsense.google.com 에서 사이트(내 도메인) 추가 → 게시자 ID(`ca-pub-…`) 확인
3. **코드 넣기** — `python scripts/site_config.py adsense ca-pub-XXXXXXXXXXXXXXXX` 실행 → 커밋·푸시
   - 모든 페이지 `<head>` 에 애드센스 코드, `ads.txt`, `assets/ads-config.js` 가 한 번에 채워집니다.
4. **심사 신청** — 애드센스에서 ‘사이트 연결’ 확인 후 검토 요청. 보통 며칠~2주 걸립니다.
5. **동의 메시지(GDPR)** — 애드센스 → 개인 정보 보호 및 메시지 → 유럽 규정 메시지를 만들어 게시합니다 (코드 추가 없음).
6. **승인 후** — 자동 광고를 켜거나, 디스플레이 광고 단위를 만들어 그 번호를 `assets/ads-config.js` 의 `slots` 에 넣습니다. 비워 둔 자리는 화면에 나타나지 않습니다.

### 심사 통과를 위한 체크리스트
- [x] 개인정보처리방침(쿠키·Google 광고 고지 포함), 이용약관, 소개, 문의 페이지
- [x] 직접 쓴 가이드 글 5편 + 도구 페이지 사용법·FAQ
- [x] 사이트맵 · robots.txt · 페이지별 설명(meta description)
- [x] 광고는 도구 조작 버튼과 떨어진 위치에만
- [ ] 내 도메인 연결
- [ ] 문의 이메일 (`site.json` 의 `contact_email` 에 넣고 `python scripts/pages.py`)
- [ ] 가이드 글을 꾸준히 추가 (글이 많을수록 승인과 검색 유입에 유리)
- [ ] Google Search Console에 사이트맵 제출

## 로컬에서 미리 보기

```bash
python -m http.server 8000
```
브라우저에서 http://localhost:8000 을 엽니다.
