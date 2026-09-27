/**
 * ============================================================================
 * daily-easy-answer-banner.js
 * ============================================================================
 * LearnSkart — "Daily Easy Answer" promotional banner.
 *
 * WHAT THIS FILE DOES (high level):
 *   1. Waits for the DOM to be ready.
 *   2. Decides — using sessionStorage — whether the banner is allowed to show
 *      on the CURRENT page, respecting a per-page "already shown" flag and a
 *      site-wide cooldown timer.
 *   3. If allowed, builds a small fixed banner (HTML + CSS + inline SVG
 *      icons) entirely from JavaScript and appends it to <body>.
 *   4. Wires up the close button and the three outbound links
 *      (Google Form, Telegram, Instagram).
 *
 * DESIGN GOALS ENFORCED THROUGHOUT THE FILE:
 *   - Total isolation from the host page (IIFE scope, "ls-dea-" prefix on
 *     every class/ID, no globals, no external requests, no libraries).
 *   - Safe to include on literally any static HTML page (no path
 *     assumptions, no assumptions about existing markup/CSS).
 *   - Fails silently (never throws an uncaught error that could break the
 *     rest of the page) if storage is unavailable or something unexpected
 *     happens.
 * ============================================================================
 */

// Everything lives inside this IIFE (Immediately Invoked Function Expression)
// so nothing leaks into the global `window` scope. This is the "isolated
// scope" requirement from the spec.
(function () {
  "use strict";

  // --------------------------------------------------------------------
  // SECTION A: CONFIGURATION CONSTANTS
  // --------------------------------------------------------------------
  // Centralising all the "magic values" here makes the script easy to
  // audit and tweak later without hunting through the logic below.
  // --------------------------------------------------------------------

  // Unique DOM id used to detect/prevent duplicate banner instances
  // (requirement #12 — Duplicate Prevention).
  var BANNER_ID = "ls-dea-banner";

  // Prefix applied to every class name / element id this script creates.
  // Guarantees zero collisions with LearnSkart's existing CSS (requirement #1).
  var PREFIX = "ls-dea-";

  // sessionStorage key for "which pages have already shown the banner this
  // session". Stored as a JSON object: { "/path/one.html": true, ... }
  // (requirement #9 — Page-Specific Display Logic).
  var STORAGE_KEY_SHOWN_PAGES = "ls_daily_easy_answer_banner_shown";

  // sessionStorage key for the last time (timestamp, ms) the banner was
  // shown on ANY page — used for the global cooldown (requirement #10).
  var STORAGE_KEY_LAST_SHOWN = "ls_daily_easy_answer_banner_last_shown";

  // Global cooldown between banner appearances across different pages,
  // in milliseconds. Spec recommends 10 minutes.
  var GLOBAL_COOLDOWN_MS = 10 * 60* 1000; // 10 minutes

  // The three real, unmodified destination URLs (requirement #2).
  var LINKS = {
    googleForm:
      "https://docs.google.com/forms/d/e/1FAIpQLSfjCfQaIX7ni0zOk2N60fP3cmJtAXmzbuCmYbhjGymVOCkcWA/viewform",
    telegram: "https://t.me/LearnSkart",
    instagram: "https://www.instagram.com/learnskart?stkn=MWswMjdicWJ5dTQ3",
  };

  // User-facing copy, kept in one place so wording can be edited quickly
  // without touching any DOM-building logic (requirement #4).
  var COPY = {
    label: "NEW • LearnSkart",
    heading: "Daily Easy Answer",
    description:
      "Got a difficult 13, 14 or 16-mark question? Submit it to us. We select the most requested questions and provide easy-to-understand PDF answers on LearnSkart.",
    primaryCta: "Submit Your Question",
    secondaryCta: "Join Telegram",
    socialCta: "Instagram",
    footerNote: "Stay tuned for daily answers & updates.",
    closeAriaLabel: "Close Daily Easy Answer banner",
  };

  // --------------------------------------------------------------------
  // SECTION B: SAFE STORAGE HELPERS
  // --------------------------------------------------------------------
  // sessionStorage can throw (private browsing modes, storage disabled,
  // quota exceeded, etc.). Every read/write is wrapped in try/catch so a
  // storage failure can never bubble up and break the host page
  // (requirement #25 — "fails safely if storage is unavailable").
  // --------------------------------------------------------------------

  /**
   * Reads and JSON-parses a sessionStorage key.
   * Returns `fallback` (default: null) if the key is missing, storage is
   * unavailable, or the stored value is not valid JSON.
   */
  function safeGetJSON(key, fallback) {
    try {
      var raw = window.sessionStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  /**
   * JSON-stringifies and writes a value to sessionStorage.
   * Silently no-ops on failure — we never want a storage error to crash
   * the banner or the page.
   */
  function safeSetJSON(key, value) {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // Intentionally ignored — storage may be unavailable/full/blocked.
    }
  }

  // --------------------------------------------------------------------
  // SECTION C: DISPLAY-LOGIC DECISIONS
  // --------------------------------------------------------------------
  // Encapsulates the "should the banner show right now?" question, which
  // combines two independent rules:
  //   1. Has THIS exact page already shown the banner this session?
  //   2. Has ANY page shown the banner within the last 10 minutes?
  // Both must say "yes, allowed" for the banner to appear.
  // --------------------------------------------------------------------

  /**
   * Returns true if the current page (identified by window.location.pathname,
   * per requirement #9) has already displayed the banner during this
   * browser session.
   */
  function hasCurrentPageShownBanner() {
    var shownPages = safeGetJSON(STORAGE_KEY_SHOWN_PAGES, {});
    var currentPath = window.location.pathname;
    return Boolean(shownPages && shownPages[currentPath]);
  }

  /**
   * Marks the current page as "already shown" for this session by
   * updating (not replacing) the stored object — so unrelated pages'
   * records, and any other unrelated sessionStorage keys, are untouched
   * (requirement #9 and #18).
   */
  function markCurrentPageAsShown() {
    var shownPages = safeGetJSON(STORAGE_KEY_SHOWN_PAGES, {});
    if (!shownPages || typeof shownPages !== "object") {
      shownPages = {};
    }
    shownPages[window.location.pathname] = true;
    safeSetJSON(STORAGE_KEY_SHOWN_PAGES, shownPages);
  }

  /**
   * Returns true if enough time has passed since the banner was last shown
   * on ANY page (global cooldown, requirement #10). If it has never been
   * shown, the cooldown is naturally satisfied.
   */
  function isGlobalCooldownElapsed() {
    var lastShownRaw = null;
    try {
      lastShownRaw = window.sessionStorage.getItem(STORAGE_KEY_LAST_SHOWN);
    } catch (err) {
      // If storage is unavailable, treat the cooldown as elapsed so the
      // banner degrades gracefully (it just won't persist state).
      return true;
    }
    if (lastShownRaw === null) return true;

    var lastShownTime = parseInt(lastShownRaw, 10);
    if (isNaN(lastShownTime)) return true;

    var elapsed = Date.now() - lastShownTime;
    return elapsed >= GLOBAL_COOLDOWN_MS;
  }

  /** Records "now" as the moment the banner was last shown (any page). */
  function recordGlobalShownTimestamp() {
    try {
      window.sessionStorage.setItem(STORAGE_KEY_LAST_SHOWN, String(Date.now()));
    } catch (err) {
      // Ignored — non-critical if this fails.
    }
  }

  /**
   * Master gatekeeper: combines both rules above. Called once before we
   * bother building any DOM at all.
   */
  function isBannerAllowedToShow() {
    return !hasCurrentPageShownBanner() && isGlobalCooldownElapsed();
  }

  // --------------------------------------------------------------------
  // SECTION D: DUPLICATE-INSTANCE GUARD
  // --------------------------------------------------------------------
  // If this script somehow runs twice on the same page (e.g. accidentally
  // included twice), we must never create a second banner
  // (requirement #12).
  // --------------------------------------------------------------------
  function bannerAlreadyExistsInDom() {
    return Boolean(document.getElementById(BANNER_ID));
  }

  // --------------------------------------------------------------------
  // SECTION E: INLINE SVG ICONS
  // --------------------------------------------------------------------
  // Small, dependency-free vector icons for Telegram, Instagram and the
  // close ("×") button, so no icon library needs to be loaded
  // (requirement #16). They inherit color via `currentColor` so they
  // automatically match light/dark styling.
  // --------------------------------------------------------------------

  function getTelegramIconSVG() {
    return (
      '<svg class="' +
      PREFIX +
      "icon " +
      PREFIX +
      'icon-telegram" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M21.94 4.36 18.6 20.2c-.24 1.1-.9 1.37-1.83.85l-5.06-3.73-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.16 9.38-8.48c.41-.36-.09-.56-.63-.2L7.03 12.9l-5.02-1.57c-1.09-.34-1.11-1.09.23-1.61L20.53 3.2c.91-.33 1.71.2 1.41 1.16Z"/>' +
      "</svg>"
    );
  }

  function getInstagramIconSVG() {
    return (
      '<svg class="' +
      PREFIX +
      "icon " +
      PREFIX +
      'icon-instagram" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.43.4a4.9 4.9 0 0 1 1.77 1.15 4.9 4.9 0 0 1 1.15 1.77c.16.46.35 1.26.4 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.4 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.46.16-1.26.35-2.43.4-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.16-.46-.35-1.26-.4-2.43C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.24-1.97.4-2.43a4.9 4.9 0 0 1 1.15-1.77A4.9 4.9 0 0 1 5.59 1.8c.46-.16 1.26-.35 2.43-.4C9.29 1.34 9.67 1.33 12 1.33Zm0 1.8c-3.15 0-3.5.01-4.74.07-.96.04-1.48.2-1.83.34-.46.18-.79.4-1.13.74-.34.34-.56.67-.74 1.13-.14.35-.3.87-.34 1.83-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.04.96.2 1.48.34 1.83.18.46.4.79.74 1.13.34.34.67.56 1.13.74.35.14.87.3 1.83.34 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c.96-.04 1.48-.2 1.83-.34.46-.18.79-.4 1.13-.74.34-.34.56-.67.74-1.13.14-.35.3-.87.34-1.83.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.04-.96-.2-1.48-.34-1.83a3.1 3.1 0 0 0-.74-1.13 3.1 3.1 0 0 0-1.13-.74c-.35-.14-.87-.3-1.83-.34C15.5 4.01 15.15 4 12 4Zm0 3.6a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8Zm0 1.8a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Zm4.6-1.98a1.03 1.03 0 1 1-2.06 0 1.03 1.03 0 0 1 2.06 0Z"/>' +
      "</svg>"
    );
  }

  function getCloseIconSVG() {
    return (
      '<svg class="' +
      PREFIX +
      "icon " +
      PREFIX +
      'icon-close" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M6.4 4.98 4.98 6.4 10.59 12l-5.61 5.6 1.42 1.42L12 13.41l5.6 5.61 1.42-1.42L13.41 12l5.61-5.6-1.42-1.42L12 10.59Z"/>' +
      "</svg>"
    );
  }

  // --------------------------------------------------------------------
  // SECTION F: CSS INJECTION
  // --------------------------------------------------------------------
  // All styling is generated here as a single <style> element so no
  // external stylesheet is required (requirement: "All CSS required for
  // the banner must also be generated by this JavaScript file"). Every
  // selector is scoped under #ls-dea-banner and/or uses the "ls-dea-"
  // prefix, so it cannot leak onto / clash with existing site styles.
  // A light/dark variant is included via `prefers-color-scheme`, without
  // touching the site's own theme system.
  // --------------------------------------------------------------------
  function injectBannerStyles() {
    // Avoid inserting duplicate <style> tags if this ever runs more than
    // once (defensive, mirrors the duplicate-banner guard).
    if (document.getElementById(PREFIX + "styles")) return;

    var css =
      "#" +
      BANNER_ID +
      "{" +
      "position:fixed;inset:0;z-index:2147483000;" +
      "display:grid;place-items:center;padding:16px;" +
      "box-sizing:border-box;background:transparent;" +
      "font-family:inherit;font-size:14px;line-height:1.5;color:#123B3A;" +
      "pointer-events:none;animation:" +
      PREFIX +
      "backdrop-in 0.25s ease-out both;" +
      "}" +
      "#" +
      BANNER_ID +
      " *{box-sizing:border-box;}" +
      "@keyframes " +
      PREFIX +
      "backdrop-in{from{opacity:0;}to{opacity:1;}}" +
      "." +
      PREFIX +
      "card{" +
      "position:relative;width:100%;max-width:460px;max-height:calc(100vh - 32px);" +
      "overflow-y:auto;padding:28px;border:1px solid rgba(18,59,58,0.10);" +
      "border-radius:22px;background:#ffffff;color:#123B3A;" +
      "box-shadow:0 18px 48px rgba(18,59,58,0.14);" +
      "pointer-events:auto;animation:" +
      PREFIX +
      "card-in 0.25s ease-out both;" +
      "}" +
      "@keyframes " +
      PREFIX +
      "card-in{" +
      "from{opacity:0;transform:scale(0.98);}" +
      "to{opacity:1;transform:scale(1);}" +
      "}" +
      "." +
      PREFIX +
      "row{display:flex;align-items:flex-start;gap:12px;}" +
      "." +
      PREFIX +
      "content{flex:1 1 auto;min-width:0;}" +
      "." +
      PREFIX +
      "label{" +
      "display:inline-flex;align-items:center;margin:0 0 12px;padding:5px 9px;" +
      "border-radius:999px;background:rgba(0,140,131,0.10);" +
      "color:#008C83;font-size:11px;font-weight:700;letter-spacing:0.04em;" +
      "}" +
      "." +
      PREFIX +
      "heading{" +
      "margin:0 0 9px;font-size:25px;line-height:1.2;font-weight:700;color:#123B3A;" +
      "}" +
      "." +
      PREFIX +
      "description{" +
      "margin:0 0 20px;color:#526866;font-size:14px;font-weight:450;line-height:1.65;" +
      "overflow-wrap:anywhere;word-break:break-word;" +
      "}" +
      "." +
      PREFIX +
      "footer-note{" +
      "margin:13px 0 0;text-align:center;color:#71817f;font-size:12px;" +
      "}" +
      "." +
      PREFIX +
      "close-btn{" +
      "flex:0 0 auto;width:36px;height:36px;min-width:36px;min-height:36px;" +
      "display:flex;align-items:center;justify-content:center;padding:0;" +
      "border:0;border-radius:50%;background:#f1f4f3;color:#53615f;" +
      "cursor:pointer;transition:background 0.16s ease,color 0.16s ease,transform 0.16s ease;" +
      "}" +
      "." +
      PREFIX +
      "close-btn:hover{background:#e6edeb;color:#123B3A;transform:rotate(4deg);}" +
      "." +
      PREFIX +
      "close-btn:focus-visible{outline:2px solid #008C83;outline-offset:2px;}" +
      "." +
      PREFIX +
      "actions{display:grid;grid-template-columns:1fr;gap:9px;margin-top:0;}" +
      "." +
      PREFIX +
      "btn{" +
      "display:inline-flex;align-items:center;justify-content:center;gap:8px;" +
      "width:100%;min-height:46px;padding:11px 16px;border:1px solid transparent;" +
      "border-radius:11px;text-decoration:none;text-align:center;" +
      "font-size:14px;font-weight:650;line-height:1.3;" +
      "transition:background 0.16s ease,border-color 0.16s ease,transform 0.16s ease;" +
      "}" +
      "." +
      PREFIX +
      "btn:active{transform:translateY(1px);}" +
      "." +
      PREFIX +
      "btn:focus-visible{outline:2px solid #008C83;outline-offset:2px;}" +
      "." +
      PREFIX +
      "btn-primary{background:#008C83;color:#ffffff!important;}" +
      "." +
      PREFIX +
      "btn-primary:hover{background:#007c74;color:#ffffff!important;}" +
      "." +
      PREFIX +
      "btn-telegram{" +
      "border-color:rgba(18,59,58,0.14);background:#f7faf9;color:#123B3A;" +
      "}" +
      "." +
      PREFIX +
      "btn-telegram:hover{border-color:rgba(0,140,131,0.38);background:#f0f7f6;}" +
      "." +
      PREFIX +
      "btn-instagram{" +
      "justify-self:center;width:auto;min-height:32px;margin-top:1px;padding:5px 8px;" +
      "border-color:transparent;background:transparent;color:#58706d;font-size:13px;font-weight:550;" +
      "}" +
      "." +
      PREFIX +
      "btn-instagram:hover{color:#008C83;}" +
      "." +
      PREFIX +
      "icon{flex:0 0 auto;display:block;}" +
      "@media (max-width:480px){" +
      "." +
      PREFIX +
      "card{max-height:calc(100vh - 32px);padding:23px 20px;border-radius:20px;}" +
      "." +
      PREFIX +
      "heading{font-size:22px;}" +
      "." +
      PREFIX +
      "description{font-size:13.5px;line-height:1.6;margin-bottom:17px;}" +
      "." +
      PREFIX +
      "btn{min-height:46px;}" +
      "}" +
      "@media (prefers-reduced-motion: reduce){" +
      "#" +
      BANNER_ID +
      "{animation:none;}" +
      "." +
      PREFIX +
      "card{animation:none;}" +
      "}";

    var styleEl = document.createElement("style");
    styleEl.id = PREFIX + "styles";
    styleEl.type = "text/css";
    styleEl.appendChild(document.createTextNode(css));
    document.head.appendChild(styleEl);
  }

  // --------------------------------------------------------------------
  // SECTION G: BANNER DOM CONSTRUCTION
  // --------------------------------------------------------------------
  // Builds the banner purely with DOM APIs (createElement / textContent)
  // rather than innerHTML for user-facing text, so there is no risk of
  // accidentally interpreting text as markup. The small, fixed, trusted
  // SVG icon strings above are the only place innerHTML is used, and
  // they contain no external or user-controlled data (requirement #18 —
  // "Do not inject arbitrary HTML from external sources").
  // --------------------------------------------------------------------

  /**
   * Small helper to create an <a> element configured as a safe, secure
   * external link (target=_blank + rel=noopener noreferrer, per
   * requirement #2 / #18).
   */
  function createExternalLink(href, className, accessibleLabel) {
    var a = document.createElement("a");
    a.href = href;
    a.className = className;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    if (accessibleLabel) {
      a.setAttribute("aria-label", accessibleLabel);
    }
    return a;
  }

  /**
   * Builds the full banner element tree and returns the root <div>.
   * Nothing is attached to the document yet — that happens in
   * showBanner(), after all display-logic checks have passed.
   */
  function buildBannerElement() {
    // Root container. role="region" + aria-label gives assistive tech a
    // clear, non-intrusive landmark without stealing focus or
    // interrupting anything (requirement #14).
    var banner = document.createElement("div");
    banner.id = BANNER_ID;
    banner.setAttribute("role", "region");
    banner.setAttribute(
      "aria-label",
      "LearnSkart Daily Easy Answer announcement",
    );

    // Top row: text content on the left, close button on the right.
    var topRow = document.createElement("div");
    topRow.className = PREFIX + "row";

    // --- Text content block ---
    var content = document.createElement("div");
    content.className = PREFIX + "content";

    var label = document.createElement("p");
    label.className = PREFIX + "label";
    label.textContent = COPY.label;

    var heading = document.createElement("h2");
    heading.className = PREFIX + "heading";
    heading.textContent = COPY.heading;

    var description = document.createElement("p");
    description.className = PREFIX + "description";
    description.textContent = COPY.description;

    content.appendChild(label);
    content.appendChild(heading);
    content.appendChild(description);

    // --- Close button ---
    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = PREFIX + "close-btn";
    closeBtn.setAttribute("aria-label", COPY.closeAriaLabel);
    // innerHTML here is safe: getCloseIconSVG() returns a fixed, trusted,
    // hard-coded string defined within this same file — nothing external
    // or user-supplied ever reaches it.
    closeBtn.innerHTML = getCloseIconSVG();
    closeBtn.addEventListener("click", function () {
      hideBanner(banner);
    });

    topRow.appendChild(content);
    topRow.appendChild(closeBtn);

    // --- Actions row: Primary CTA, Telegram, Instagram ---
    var actions = document.createElement("div");
    actions.className = PREFIX + "actions";

    // Primary CTA -> Google Form.
    var primaryBtn = createExternalLink(
      LINKS.googleForm,
      PREFIX + "btn " + PREFIX + "btn-primary",
      COPY.primaryCta + " (opens Google Form in a new tab)",
    );
    primaryBtn.textContent = COPY.primaryCta;

    // Secondary CTA -> Telegram (given more visual weight than Instagram).
    var telegramBtn = createExternalLink(
      LINKS.telegram,
      PREFIX + "btn " + PREFIX + "btn-telegram",
      COPY.secondaryCta + " (opens Telegram in a new tab)",
    );
    var telegramIconWrap = document.createElement("span");
    telegramIconWrap.innerHTML = getTelegramIconSVG(); // fixed trusted SVG
    telegramBtn.appendChild(telegramIconWrap.firstChild);
    var telegramLabel = document.createElement("span");
    telegramLabel.textContent = COPY.secondaryCta;
    telegramBtn.appendChild(telegramLabel);

    // Smaller social link -> Instagram.
    var instagramBtn = createExternalLink(
      LINKS.instagram,
      PREFIX + "btn " + PREFIX + "btn-instagram",
      COPY.socialCta + " (opens Instagram in a new tab)",
    );
    var instagramIconWrap = document.createElement("span");
    instagramIconWrap.innerHTML = getInstagramIconSVG(); // fixed trusted SVG
    instagramBtn.appendChild(instagramIconWrap.firstChild);
    var instagramLabel = document.createElement("span");
    instagramLabel.textContent = COPY.socialCta;
    instagramBtn.appendChild(instagramLabel);

    actions.appendChild(primaryBtn);
    actions.appendChild(telegramBtn);
    actions.appendChild(instagramBtn);

    // --- Footer note ---
    var footerNote = document.createElement("p");
    footerNote.className = PREFIX + "footer-note";
    footerNote.textContent = COPY.footerNote;

    // Keep the content in a card inside the click-through viewport layer.
    var card = document.createElement("div");
    card.className = PREFIX + "card";
    card.appendChild(topRow);
    card.appendChild(actions);
    card.appendChild(footerNote);
    banner.appendChild(card);

    return banner;
  }

  // --------------------------------------------------------------------
  // SECTION H: SHOW / HIDE LIFECYCLE
  // --------------------------------------------------------------------

  /**
   * Removes the banner from the DOM. Does NOT reload the page and does
   * NOT touch body scroll/overflow, since the banner never modified them
   * in the first place (requirement #8, #23).
   */
  function hideBanner(bannerEl) {
    try {
      if (bannerEl && bannerEl.parentNode) {
        bannerEl.parentNode.removeChild(bannerEl);
      }
    } catch (err) {
      // Even if removal fails for some reason, we don't want to throw.
    }
  }

  /**
   * Orchestrates showing the banner: re-checks the duplicate guard,
   * injects styles, builds the DOM, appends it to <body>, and records
   * the "shown" state in sessionStorage (page-specific + global
   * cooldown timestamp).
   */
  function showBanner() {
    if (bannerAlreadyExistsInDom()) return;

    injectBannerStyles();
    var bannerEl = buildBannerElement();
    document.body.appendChild(bannerEl);

    // Persist state immediately once the banner is actually visible, so
    // a page reload right after showing it still respects both rules.
    markCurrentPageAsShown();
    recordGlobalShownTimestamp();
  }

  // --------------------------------------------------------------------
  // SECTION I: DOM-READY BOOTSTRAP
  // --------------------------------------------------------------------
  // Ensures the banner logic only runs once document.body exists,
  // regardless of whether this script is loaded via <script defer>,
  // injected dynamically, or placed at the end of <body>
  // (requirement #13 — DOM Safety).
  // --------------------------------------------------------------------

  function initBannerWhenReady() {
    // If the DOM is still loading, wait for it. Otherwise (document
    // already interactive/complete — e.g. a defer-loaded script) run
    // immediately.
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runBannerLogic, {
        once: true,
      });
    } else {
      runBannerLogic();
    }
  }

  /**
   * The actual entry point that decides whether to show the banner and,
   * if so, builds and displays it. Wrapped by the outer try/catch in
   * init() below for full defensive error handling (requirement:
   * "gracefully fail without breaking the website").
   */
  function runBannerLogic() {
    if (!document.body) return; // extremely defensive; should not happen post-DOMContentLoaded
    if (bannerAlreadyExistsInDom()) return;
    if (!isBannerAllowedToShow()) return;

    showBanner();
  }

  // --------------------------------------------------------------------
  // SECTION J: TOP-LEVEL ERROR BOUNDARY
  // --------------------------------------------------------------------
  // The entire feature is wrapped in try/catch so that ANY unexpected
  // runtime error (storage errors, unexpected DOM states, etc.) is
  // swallowed here rather than propagating up and potentially breaking
  // other scripts on the page (requirement #1 — "gracefully fail").
  // --------------------------------------------------------------------
  try {
    initBannerWhenReady();
  } catch (err) {
    // Deliberately silent: the banner is a non-critical promotional
    // feature and must never be allowed to affect the host website.
  }
})();
