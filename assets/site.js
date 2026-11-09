/* Creator Hub — shared behaviour: ad slots + footer year. Safe to load on every page. */
(function () {
  var cfg = window.SITE_ADS || {};
  var client = String(cfg.client || '').trim();
  var valid = /^ca-pub-\d{10,20}$/.test(client);

  if (valid) {
    // The verification snippet normally sits in <head> already (see scripts/site_config.py).
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      var s = document.createElement('script');
      s.async = true;
      s.crossOrigin = 'anonymous';
      s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + client;
      document.head.appendChild(s);
    }
    var slots = cfg.slots || {};
    document.querySelectorAll('.ad-slot[data-slot]').forEach(function (el) {
      var id = String(slots[el.getAttribute('data-slot')] || '').trim();
      if (!/^\d+$/.test(id)) return;
      el.hidden = false;
      el.innerHTML = '<span class="ad-label">광고</span>' +
        '<ins class="adsbygoogle" style="display:block" data-ad-client="' + client +
        '" data-ad-slot="' + id + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
