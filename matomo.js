(function () {
  if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname)) return;

  var _paq = window._paq = window._paq || [];
  _paq.push(['requireCookieConsent']);
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

  var CONSENT_KEY = 'ib_analytics_consent';
  var consent = localStorage.getItem(CONSENT_KEY);

  if (consent === 'accepted') {
    _paq.push(['rememberCookieConsentGiven']);
  } else if (consent === null) {
    var banner = document.createElement('div');
    banner.id = 'ib-consent-banner';
    banner.style.cssText = [
      'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
      'z-index:9999', 'width:calc(100% - 48px)', 'max-width:640px',
      'background:#0f2128', 'color:#e0e8ed', 'border-radius:12px',
      'box-shadow:0 8px 32px rgba(0,0,0,0.32)', 'padding:20px 24px',
      'font-family:Inter,system-ui,sans-serif', 'font-size:14px', 'line-height:1.6'
    ].join(';');
    banner.innerHTML = [
      '<div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">',
        '<p style="flex:1;margin:0;color:rgba(224,232,237,0.85)">',
          'Möchten Sie bei Ihrem nächsten Besuch wiedererkannt werden? ',
          'Wir verwenden Matomo Analytics mit anonymisierten IP-Adressen. ',
          'Ohne Zustimmung erfolgt das Tracking cookielos. ',
          '<a href="datenschutz.html" style="color:#ff9142">Datenschutz</a>',
        '</p>',
        '<div style="display:flex;gap:10px;flex-shrink:0">',
          '<button id="ib-consent-accept" style="padding:9px 18px;border-radius:6px;background:#ff6314;color:#fff;border:none;font-weight:600;cursor:pointer;white-space:nowrap">Ja, gerne</button>',
          '<button id="ib-consent-decline" style="padding:9px 18px;border-radius:6px;background:transparent;color:rgba(224,232,237,0.7);border:1px solid rgba(224,232,237,0.25);font-weight:600;cursor:pointer;white-space:nowrap">Nein danke</button>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(banner);

    document.getElementById('ib-consent-accept').addEventListener('click', function () {
      localStorage.setItem(CONSENT_KEY, 'accepted');
      banner.remove();
      _paq.push(['rememberCookieConsentGiven']);
    });

    document.getElementById('ib-consent-decline').addEventListener('click', function () {
      localStorage.setItem(CONSENT_KEY, 'declined');
      banner.remove();
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest('[data-matomo-category]');
    if (!btn || !window._paq) return;
    var category = btn.getAttribute('data-matomo-category');
    var action = btn.getAttribute('data-matomo-action') || 'click';
    var label = btn.getAttribute('data-matomo-label') || '';
    window._paq.push(['trackEvent', category, action, label]);
  });
})();
