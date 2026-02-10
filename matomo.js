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
  // - require consent before loading Matomo
  // - respect Do Not Track (browser setting)
  // - enable cookies only after consent (needed for returning visitors)
  const MATOMO_DISABLE_COOKIES = false;
  const MATOMO_REQUIRE_CONSENT = true;

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

  const CONSENT_KEY = "indiebox_matomo_consent";
  const CONSENT_GRANTED = "granted";
  const CONSENT_DENIED = "denied";

  const getLang = () => {
    const raw = (document.documentElement && document.documentElement.lang) || "";
    const normalized = raw.trim().toLowerCase();
    return normalized.startsWith("de") ? "de" : "en";
  };

  const getPrivacyLink = (lang) => {
    return lang === "de" ? "datenschutz.html" : "privacy.html";
  };

  const getStoredConsent = () => {
    try {
      return String(window.localStorage.getItem(CONSENT_KEY) || "");
    } catch (err) {
      return "";
    }
  };

  const storeConsent = (value) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (err) {
      /* Ignore storage errors */
    }
  };

  const clearMatomoCookies = () => {
    // Matomo uses cookies like `_pk_id.*` and `_pk_ses.*` for visitor recognition.
    const cookies = String(document.cookie || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean);

    cookies.forEach((entry) => {
      const name = entry.split("=")[0];
      if (!name || !name.startsWith("_pk_")) return;
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    });
  };

  const ensureSettingsButton = (lang) => {
    if (document.getElementById("matomo-settings-button")) return;

    const button = document.createElement("button");
    button.type = "button";
    button.id = "matomo-settings-button";
    button.className = "matomo-settings button button--plain-light button--pill button--sm";
    button.textContent = lang === "de" ? "Tracking-Einstellungen" : "Tracking settings";
    button.addEventListener("click", () => {
      showConsentBanner({ force: true });
    });

    document.body.appendChild(button);
  };

  const showConsentBanner = ({ force } = {}) => {
    const existing = document.getElementById("matomo-consent-banner");
    if (existing && !force) return;
    if (existing) existing.remove();

    const lang = getLang();
    const privacyLink = getPrivacyLink(lang);

    const banner = document.createElement("div");
    banner.id = "matomo-consent-banner";
    banner.className = "matomo-consent";

    const title = document.createElement("div");
    title.className = "matomo-consent__title";
    title.textContent = lang === "de" ? "Website-Analyse (Matomo)" : "Website analytics (Matomo)";

    const body = document.createElement("div");
    body.className = "matomo-consent__body";
    body.innerHTML =
      lang === "de"
        ? `Wir nutzen Matomo, um die Website zu verbessern. Mit deiner Zustimmung setzen wir Cookies, um <strong>wiederkehrende Besucher</strong> zu erkennen. <a class="matomo-consent__link" href="${privacyLink}">Mehr Infos</a>.`
        : `We use Matomo to improve this website. With your consent, we set cookies to recognize <strong>returning visitors</strong>. <a class="matomo-consent__link" href="${privacyLink}">Learn more</a>.`;

    const actions = document.createElement("div");
    actions.className = "matomo-consent__actions";

    const accept = document.createElement("button");
    accept.type = "button";
    accept.className = "button button--solid button--pill button--sm";
    accept.textContent = lang === "de" ? "Akzeptieren" : "Accept";

    const decline = document.createElement("button");
    decline.type = "button";
    decline.className = "button button--plain-light button--pill button--sm";
    decline.textContent = lang === "de" ? "Ablehnen" : "Decline";

    accept.addEventListener("click", () => {
      storeConsent(CONSENT_GRANTED);
      banner.remove();
      ensureSettingsButton(lang);
      initTracking();
    });

    decline.addEventListener("click", () => {
      storeConsent(CONSENT_DENIED);
      clearMatomoCookies();
      banner.remove();
      ensureSettingsButton(lang);
    });

    actions.appendChild(accept);
    actions.appendChild(decline);
    banner.appendChild(title);
    banner.appendChild(body);
    banner.appendChild(actions);

    document.body.appendChild(banner);
  };

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

  const initTracking = () => {
    const baseUrl = MATOMO_BASE_URL.endsWith("/") ? MATOMO_BASE_URL : `${MATOMO_BASE_URL}/`;

    window._paq = window._paq || [];
    const _paq = window._paq;

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
  };

  const lang = getLang();
  const consent = getStoredConsent();

  if (!MATOMO_REQUIRE_CONSENT) {
    initTracking();
    return;
  }

  ensureSettingsButton(lang);

  if (consent === CONSENT_GRANTED) {
    initTracking();
    return;
  }

  if (consent === CONSENT_DENIED) {
    clearMatomoCookies();
    return;
  }

  showConsentBanner();
})();
