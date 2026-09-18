/* ==========================================================================
   RoadTripRoutes — main.js
   Consent management (GDPR / CCPA-aware). Vanilla JS, no dependencies.
   The site sets no cookies today; this banner sets the ground rules for
   any future ads or analytics, and pre-wires the consent gate.
   ========================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "roadtriproutes_consent_v1";
  var CHOICES = { all: "all", necessary: "necessary" };

  /* How deep are we? The banner needs ../-aware asset paths from any folder. */
  function base() {
    var seg = (window.location.pathname || "").split("/").filter(Boolean);
    return seg.length ? "../" : "";
  }

  function readChoice() {
    try { return window.localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function writeChoice(choice) {
    try { window.localStorage.setItem(STORAGE_KEY, choice); } catch (e) { /* private mode */ }
    document.documentElement.setAttribute("data-consent", choice);
    document.dispatchEvent(new CustomEvent("rtr:consent", { detail: { consent: choice } }));
  }

  function applyExisting() {
    var c = readChoice();
    if (c === CHOICES.all || c === CHOICES.necessary) {
      document.documentElement.setAttribute("data-consent", c);
    }
  }

  function buildBanner() {
    var existing = document.getElementById("consent-banner");
    if (existing) { existing.parentNode.removeChild(existing); }

    var banner = document.createElement("div");
    banner.id = "consent-banner";
    banner.className = "consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Cookie and privacy choices");

    var inner = document.createElement("div");
    inner.className = "consent-banner__inner wrap";

    var title = document.createElement("p");
    title.className = "consent-banner__title";
    title.textContent = "Your privacy, plain and simple";

    var copy = document.createElement("p");
    copy.className = "consent-banner__copy";
    copy.innerHTML =
      "RoadTripRoutes is an informational travel site and sets no tracking cookies today. " +
      "If we later show ads (such as Google AdSense) or use analytics, your choice below governs them. " +
      "Read our <a href=\"" + base() + "privacidad/\">privacy policy</a> for the details.";

    var actions = document.createElement("p");
    actions.className = "consent-banner__actions";

    var btnAll = document.createElement("button");
    btnAll.type = "button";
    btnAll.className = "btn btn--amber";
    btnAll.setAttribute("data-choice", CHOICES.all);
    btnAll.textContent = "Accept all";

    var btnNecessary = document.createElement("button");
    btnNecessary.type = "button";
    btnNecessary.className = "btn btn--ghost";
    btnNecessary.setAttribute("data-choice", CHOICES.necessary);
    btnNecessary.textContent = "Necessary only";

    actions.appendChild(btnAll);
    actions.appendChild(btnNecessary);

    inner.appendChild(title);
    inner.appendChild(copy);
    inner.appendChild(actions);
    banner.appendChild(inner);
    document.body.appendChild(banner);

    actions.addEventListener("click", function (ev) {
      var btn = ev.target.closest ? ev.target.closest("[data-choice]") : null;
      if (!btn) { return; }
      writeChoice(btn.getAttribute("data-choice"));
      hideBanner(banner);
    });

    return banner;
  }

  function hideBanner(banner) {
    banner.classList.add("consent-banner--hide");
    window.setTimeout(function () {
      if (banner.parentNode) { banner.parentNode.removeChild(banner); }
    }, 320);
  }

  function showBanner() {
    var banner = buildBanner();
    window.setTimeout(function () { banner.classList.remove("consent-banner--hide"); }, 40);
  }

  function wireReopen() {
    var triggers = document.querySelectorAll("#consent-settings");
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener("click", function (ev) {
        ev.preventDefault();
        showBanner();
      });
    }
  }

  function init() {
    applyExisting();
    wireReopen();
    if (!readChoice() && !document.getElementById("consent-banner")) {
      showBanner();
    }
    /* future gate: analytics/ads scripts can listen for rtr:consent === "all" */
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();