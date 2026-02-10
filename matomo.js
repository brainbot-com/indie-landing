// ========================================
// Matomo (self-hosted) website analytics
// ========================================
//
// 1) Set `MATOMO_BASE_URL` and `MATOMO_SITE_ID` to enable tracking.
// 2) Optional: adjust cookie/consent settings below.
//
// Example:
// const MATOMO_BASE_URL = "https://analytics.example.com/";
// const MATOMO_SITE_ID = "1";
//
(function () {
  const MATOMO_BASE_URL = "https://indieboxai.matomo.cloud/";
  const MATOMO_SITE_ID = "1";
  // Matomo Cloud serves the JS from a CDN URL (not from `MATOMO_BASE_URL`).
  // Leave empty for self-hosted; set for Matomo Cloud.
  const MATOMO_JS_URL = "https://cdn.matomo.cloud/indieboxai.matomo.cloud/matomo.js";

  // Privacy-oriented defaults:
  // - disableCookies: cookie-less analytics (often avoids cookie banners, depending on jurisdiction/setup)
  // - respect Do Not Track (browser setting)
  const MATOMO_DISABLE_COOKIES = true;
  const MATOMO_REQUIRE_CONSENT = false;

  // Don't track local previews.
  const DISABLE_ON_LOCALHOST = true;

  if (!MATOMO_BASE_URL || !MATOMO_SITE_ID) return;

  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.location && window.location.protocol === "file:") return;
  if (
    DISABLE_ON_LOCALHOST &&
    window.location &&
    /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname)
  ) {
    return;
  }

  // Avoid tracking a transient page that will immediately redirect to /en/
  // (mirrors the redirect logic in `script.js`).
  const path = window.location.pathname || "";
  const isAlreadyEnglish = /\/en(\/|$)/.test(path);
  if (!isAlreadyEnglish) {
    const preferred =
      (navigator.languages && navigator.languages[0]) || navigator.language || "";
    const prefersEnglish = preferred.toLowerCase().startsWith("en");
    const isRoot =
      path === "" ||
      path === "/" ||
      path.endsWith("/index.html") ||
      path.endsWith("/");

    if (prefersEnglish && isRoot) return;
  }

  const baseUrl = MATOMO_BASE_URL.endsWith("/")
    ? MATOMO_BASE_URL
    : `${MATOMO_BASE_URL}/`;

  window._paq = window._paq || [];
  const _paq = window._paq;

  if (MATOMO_REQUIRE_CONSENT) _paq.push(["requireConsent"]);
  if (MATOMO_DISABLE_COOKIES) _paq.push(["disableCookies"]);
  _paq.push(["setDoNotTrack", true]);
  _paq.push(["setAnonymizeIp", true]);

  _paq.push(["setTrackerUrl", `${baseUrl}matomo.php`]);
  _paq.push(["setSiteId", String(MATOMO_SITE_ID)]);

  _paq.push(["trackPageView"]);
  _paq.push(["enableLinkTracking"]);

  const d = document;
  const g = d.createElement("script");
  const s = d.getElementsByTagName("script")[0];
  g.async = true;
  g.src = MATOMO_JS_URL ? MATOMO_JS_URL : `${baseUrl}matomo.js`;
  s.parentNode.insertBefore(g, s);
})();
