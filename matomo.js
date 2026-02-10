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

  const loadMatomoScriptOnce = (baseUrl) => {
    if (window.__matomoScriptLoaded) return;
    window.__matomoScriptLoaded = true;

    const d = document;
    const g = d.createElement("script");
    const s = d.getElementsByTagName("script")[0];
    g.async = true;
    g.src = MATOMO_JS_URL ? MATOMO_JS_URL : `${baseUrl}matomo.js`;
    s.parentNode.insertBefore(g, s);
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
    decline.className = "button button--plain-dark button--pill button--sm";
    decline.textContent = lang === "de" ? "Ablehnen" : "Decline";

    accept.addEventListener("click", () => {
      storeConsent(CONSENT_GRANTED);
      banner.remove();
      if (window._paq) {
        window._paq.push(["setConsentGiven"]);
        window._paq.push(["setCookieConsentGiven"]);
        window._paq.push(["trackPageView"]);
        window._paq.push(["enableLinkTracking"]);
      }
    });

    decline.addEventListener("click", () => {
      storeConsent(CONSENT_DENIED);
      clearMatomoCookies();
      banner.remove();
      if (window._paq) {
        window._paq.push(["forgetConsentGiven"]);
        window._paq.push(["forgetCookieConsentGiven"]);
      }
    });

    actions.appendChild(accept);
    actions.appendChild(decline);
    banner.appendChild(title);
    banner.appendChild(body);
    banner.appendChild(actions);

    document.body.appendChild(banner);
  };

  window.indieboxOpenTrackingSettings = () => {
    showConsentBanner({ force: true });
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

  const baseUrl = MATOMO_BASE_URL.endsWith("/") ? MATOMO_BASE_URL : `${MATOMO_BASE_URL}/`;

  window._paq = window._paq || [];
  const _paq = window._paq;

  if (MATOMO_DISABLE_COOKIES) _paq.push(["disableCookies"]);
  _paq.push(["setDoNotTrack", true]);
  _paq.push(["setAnonymizeIp", true]);

  _paq.push(["setTrackerUrl", `${baseUrl}matomo.php`]);
  _paq.push(["setSiteId", String(MATOMO_SITE_ID)]);

  const lang = getLang();
  const consent = getStoredConsent();
  const debugEnabled = (() => {
    try {
      const params = new URLSearchParams(window.location.search || "");
      if (params.get("matomo_debug") === "1") return true;
    } catch (err) {
      /* Ignore */
    }
    return false;
  })();

  if (debugEnabled) {
    // eslint-disable-next-line no-console
    console.log("[matomo] init", { consent, lang, baseUrl, siteId: MATOMO_SITE_ID });
  }

  const bindConsentLinks = () => {
    document.querySelectorAll("[data-matomo-consent-open]").forEach((el) => {
      if (el.__matomoBound) return;
      el.__matomoBound = true;
      el.addEventListener("click", (event) => {
        event.preventDefault();
        showConsentBanner({ force: true });
      });
    });
  };

  const isDoNotTrackEnabled = () => {
    const dnt =
      (navigator && (navigator.doNotTrack || navigator.msDoNotTrack)) ||
      (window && window.doNotTrack);
    return String(dnt) === "1" || String(dnt).toLowerCase() === "yes";
  };

  const buildClickLabel = (el) => {
    const explicit = el.getAttribute("data-matomo-label");
    if (explicit) return explicit.trim();

    const i18nKey = el.getAttribute("data-i18n");
    if (i18nKey) return `i18n:${i18nKey}`;

    const aria = el.getAttribute("aria-label");
    if (aria) return aria.trim();

    const id = el.id;
    if (id) return `#${id}`;

    const text = String(el.textContent || "").replace(/\s+/g, " ").trim();
    if (text) return text.slice(0, 80);

    return "unknown";
  };

  const buildClickAction = (el) => {
    if (el.hasAttribute("data-overlay-open")) return "overlay_open";
    if (el.hasAttribute("data-overlay-close")) return "overlay_close";
    return "click";
  };

  const setupButtonTracking = () => {
    if (window.__matomoButtonTrackingInstalled) return;
    window.__matomoButtonTrackingInstalled = true;

    document.addEventListener(
      "click",
      (event) => {
        const target = event.target;
        if (!target || typeof target.closest !== "function") return;

        const button = target.closest("button, a.button, a.combi-pill, [data-overlay-open]");
        if (!button) return;
        if (button.hasAttribute("data-matomo-ignore")) return;
        if (button.closest && button.closest("#matomo-consent-banner")) return;

        if (isDoNotTrackEnabled()) return;
        if (MATOMO_REQUIRE_CONSENT && getStoredConsent() !== CONSENT_GRANTED) return;

        window._paq = window._paq || [];

        const category = button.getAttribute("data-matomo-category") || "ui";
        const action = button.getAttribute("data-matomo-action") || buildClickAction(button);
        const label = button.getAttribute("data-matomo-event") || buildClickLabel(button);

        window._paq.push(["trackEvent", category, action, label]);
      },
      { capture: true, passive: true }
    );
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindConsentLinks, { once: true });
  } else {
    bindConsentLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupButtonTracking, { once: true });
  } else {
    setupButtonTracking();
  }

  if (!MATOMO_REQUIRE_CONSENT) {
    loadMatomoScriptOnce(baseUrl);
    _paq.push(["trackPageView"]);
    _paq.push(["enableLinkTracking"]);
    return;
  }

  if (consent === CONSENT_GRANTED) {
    loadMatomoScriptOnce(baseUrl);
    _paq.push(["setConsentGiven"]);
    _paq.push(["setCookieConsentGiven"]);
    _paq.push(["trackPageView"]);
    _paq.push(["enableLinkTracking"]);
    return;
  }

  if (consent === CONSENT_DENIED) {
    _paq.push(["requireConsent"]);
    _paq.push(["requireCookieConsent"]);
    loadMatomoScriptOnce(baseUrl);
    clearMatomoCookies();
    _paq.push(["forgetConsentGiven"]);
    _paq.push(["forgetCookieConsentGiven"]);
    return;
  }

  _paq.push(["requireConsent"]);
  _paq.push(["requireCookieConsent"]);
  loadMatomoScriptOnce(baseUrl);
  showConsentBanner();
})();
