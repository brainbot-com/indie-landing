(function () {
  if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname)) return;

  var _paq = window._paq = window._paq || [];
  _paq.push(['disableCookies']);
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function () {
    var u = 'https://shutter.matomo.cloud/';
    _paq.push(['setTrackerUrl', u + 'matomo.php']);
    _paq.push(['setSiteId', '8']);
    var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
    g.async = true;
    g.src = 'https://cdn.matomo.cloud/shutter.matomo.cloud/matomo.js';
    s.parentNode.insertBefore(g, s);
  })();

  document.addEventListener('click', function(e) {
    var btn = e.target && e.target.closest('[data-matomo-category]');
    if (!btn || !window._paq) return;
    var category = btn.getAttribute('data-matomo-category');
    var action = btn.getAttribute('data-matomo-action') || 'click';
    var label = btn.getAttribute('data-matomo-label') || '';
    window._paq.push(['trackEvent', category, action, label]);
  });
})();
