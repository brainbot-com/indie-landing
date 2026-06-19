(function () {
  if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname)) return;

  var CONSENT_KEY = 'indiebox_analytics_consent';
  var lang = (document.documentElement.lang || '').toLowerCase().startsWith('de') ? 'de' : 'en';

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function setConsent(val) {
    try { localStorage.setItem(CONSENT_KEY, val); } catch (e) {}
  }

  function initMatomo() {
    var _paq = window._paq = window._paq || [];
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
  }

  function showBanner() {
    var style = document.createElement('style');
    style.textContent = [
      '.ib-consent{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#0f1923;border-top:1px solid rgba(255,255,255,0.1);padding:20px 24px}',
      '.ib-consent__inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:24px;flex-wrap:wrap}',
      '.ib-consent__text{font-size:14px;line-height:1.5;color:rgba(255,255,255,0.75);margin:0;flex:1;min-width:260px}',
      '.ib-consent__text a{color:#f97316;text-decoration:underline;text-underline-offset:3px}',
      '.ib-consent__btns{display:flex;gap:10px;flex-shrink:0}',
      '.ib-consent__btn{font-size:14px;font-weight:500;padding:9px 20px;border-radius:999px;cursor:pointer;border:1.5px solid #f97316;white-space:nowrap}',
      '.ib-consent__btn--accept{background:#f97316;color:#0f1923}',
      '.ib-consent__btn--decline{background:transparent;color:#fff}',
      '@media(max-width:480px){.ib-consent__inner{flex-direction:column;align-items:flex-start}.ib-consent__btns{width:100%}.ib-consent__btn{flex:1;text-align:center}}'
    ].join('');
    document.head.appendChild(style);

    var privacyHref = lang === 'de' ? '/datenschutz.html' : '/privacy.html';
    var text = lang === 'de'
      ? 'Diese Website verwendet Matomo Analytics zur Analyse des Websiteverkehrs. Mit Ihrer Zustimmung wird ein Cookie gesetzt, um wiederkehrende Besuche zu erkennen. IP-Adressen werden anonymisiert. <a href="' + privacyHref + '">Datenschutzerklärung</a>'
      : 'This website uses Matomo Analytics to analyze website traffic. With your consent, a cookie is set to recognize returning visits. IP addresses are anonymized. <a href="' + privacyHref + '">Privacy policy</a>';

    var banner = document.createElement('div');
    banner.className = 'ib-consent';
    banner.innerHTML = '<div class="ib-consent__inner"><p class="ib-consent__text">' + text + '</p>'
      + '<div class="ib-consent__btns">'
      + '<button class="ib-consent__btn ib-consent__btn--accept">' + (lang === 'de' ? 'Akzeptieren' : 'Accept') + '</button>'
      + '<button class="ib-consent__btn ib-consent__btn--decline">' + (lang === 'de' ? 'Ablehnen' : 'Decline') + '</button>'
      + '</div></div>';
    document.body.appendChild(banner);

    banner.querySelector('.ib-consent__btn--accept').addEventListener('click', function () {
      setConsent('accepted');
      banner.remove();
      initMatomo();
    });

    banner.querySelector('.ib-consent__btn--decline').addEventListener('click', function () {
      setConsent('declined');
      banner.remove();
    });
  }

  document.addEventListener('click', function(e) {
    var btn = e.target && e.target.closest('[data-matomo-category]');
    if (!btn || !window._paq) return;
    var category = btn.getAttribute('data-matomo-category');
    var action = btn.getAttribute('data-matomo-action') || 'click';
    var label = btn.getAttribute('data-matomo-label') || '';
    window._paq.push(['trackEvent', category, action, label]);
  });

  window.ibOpenConsentBanner = function() {
    localStorage.removeItem(CONSENT_KEY);
    showBanner();
  };

  document.querySelectorAll('[data-matomo-consent-open]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();
      window.ibOpenConsentBanner();
    });
  });

  var consent = getConsent();
  if (consent === 'accepted') {
    initMatomo();
  } else if (!consent) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }
})();
