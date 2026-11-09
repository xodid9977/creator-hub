/*
  광고 설정 — 애드센스 승인 후 이 파일만 고치면 됩니다.

  client : 애드센스 게시자 ID (예: 'ca-pub-1234567890123456')
           → scripts/site_config.py adsense ca-pub-... 를 실행하면 이 값,
             모든 페이지 <head>의 애드센스 코드, ads.txt가 한 번에 채워집니다.
  slots  : 애드센스에서 만든 '디스플레이 광고 단위'의 data-ad-slot 숫자.
           비워 두면 그 자리는 화면에 나타나지 않습니다.
           (자동 광고만 쓸 거라면 전부 비워 둬도 됩니다.)
*/
window.SITE_ADS = {
  client: '',
  slots: {
    'hub-top': '',
    'hub-bottom': '',
    'guide-inline': '',
    'guide-bottom': '',
    'studio-about': ''
  }
};
