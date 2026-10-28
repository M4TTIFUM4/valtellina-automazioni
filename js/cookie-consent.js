/* Banner cookie + Google Analytics 4 caricato solo dopo il consenso.
   Per attivare le statistiche basta inserire qui sotto l'ID di Google Analytics (G-...). */
(function () {
  var GA_ID = "G-048472GFGR";
  var KEY = "oq_cookie_consent"; // "granted" | "denied"

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadAnalytics() {
    if (!/^G-[A-Z0-9]{6,}$/.test(GA_ID) || GA_ID === "G-XXXXXXXXXX" || window.__oqGa) return;
    window.__oqGa = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  }

  function removeAnalyticsCookies() {
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (/^_ga/.test(name)) {
        var host = location.hostname.replace(/^www\./, "");
        ["", "; domain=." + host, "; domain=" + location.hostname].forEach(function (d) {
          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
        });
      }
    });
  }

  function close(banner) { if (banner && banner.parentNode) banner.parentNode.removeChild(banner); }

  function showBanner() {
    if (document.getElementById("cookie-banner")) return;
    var b = document.createElement("div");
    b.id = "cookie-banner";
    b.className = "cookie-banner";
    b.setAttribute("role", "dialog");
    b.setAttribute("aria-live", "polite");
    b.setAttribute("aria-label", "Preferenze cookie");
    b.innerHTML =
      '<button type="button" class="cookie-banner__x" data-c="denied" aria-label="Chiudi e rifiuta">×</button>' +
      '<p class="cookie-banner__title">Usiamo i cookie?</p>' +
      '<p class="cookie-banner__text">Solo quelli tecnici, necessari al sito, e, se ci date il consenso, cookie di statistica anonima (Google Analytics) per sapere quante persone visitano il sito. Niente pubblicità. <a href="/privacy.html#cookie">Cookie policy</a></p>' +
      '<div class="cookie-banner__actions">' +
      '<button type="button" class="btn btn--sm cookie-banner__no" data-c="denied">Rifiuta</button>' +
      '<button type="button" class="btn btn--primary btn--sm" data-c="granted">Accetta</button>' +
      "</div>";
    b.addEventListener("click", function (e) {
      var v = e.target.getAttribute && e.target.getAttribute("data-c");
      if (!v) return;
      save(v);
      if (v === "granted") loadAnalytics(); else removeAnalyticsCookies();
      close(b);
    });
    document.body.appendChild(b);
  }

  // Link "Preferenze cookie" nel footer (o ovunque con data-cookie-prefs)
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-cookie-prefs]");
    if (!t) return;
    e.preventDefault();
    showBanner();
  });

  function init() {
    var v = read();
    if (v === "granted") loadAnalytics();
    else if (v !== "denied") showBanner();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
