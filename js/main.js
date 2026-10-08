/* Valtellina Automazioni — interazioni */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header e menu mobile ---------- */
  var header = document.querySelector(".header");
  var nav = document.getElementById("nav");
  var toggle = document.querySelector(".nav-toggle");
  var mobileCta = document.querySelector(".mobile-cta");
  var contatti = document.getElementById("contatti");

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    if (mobileCta) {
      var ctaTop = contatti.getBoundingClientRect().top;
      mobileCta.classList.toggle("is-visible", y > 600 && ctaTop > window.innerHeight * 0.6);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    nav.classList.remove("is-open");
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Apri il menu");
  }
  toggle.addEventListener("click", function () {
    var open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
  });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  /* ---------- Reveal allo scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el, i) {
      // leggero sfalsamento tra elementi vicini
      var siblings = el.parentElement.querySelectorAll(":scope > .reveal");
      var idx = Array.prototype.indexOf.call(siblings, el);
      if (idx > 0) el.style.transitionDelay = Math.min(idx, 5) * 70 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Feed animato dell'agente ---------- */
  var tasks = [
    { icon: "i-file", title: "Fattura_Fornitore_0482.pdf", desc: "Dati letti e registrati nel gestionale", min: 6 },
    { icon: "i-mail", title: "Richiesta preventivo da cliente", desc: "Classificata e inoltrata all'ufficio commerciale", min: 4 },
    { icon: "i-cart", title: "Nuovo ordine via email", desc: "Articoli inseriti, conferma inviata al cliente", min: 9 },
    { icon: "i-sheet", title: "Registro presenze.xlsx", desc: "Foglio aggiornato con i dati della settimana", min: 12 },
    { icon: "i-chat", title: "Domanda su orari di apertura", desc: "Risposta inviata automaticamente", min: 3 },
    { icon: "i-chart", title: "Report vendite settimanale", desc: "Creato e inviato al titolare", min: 25 },
    { icon: "i-folder", title: "Documenti pratica Bianchi", desc: "Archiviati, richiesto il documento mancante", min: 8 },
    { icon: "i-calendar", title: "Prenotazione tavolo per 6", desc: "Registrata e confermata via email", min: 3 }
  ];
  var feed = document.getElementById("feed");
  var kpiTasks = document.getElementById("kpi-tasks");
  var kpiTime = document.getElementById("kpi-time");
  var doneCount = 37, savedMin = 214, t = 0, MAX = 4;

  function fmtTime(m) {
    var h = Math.floor(m / 60), r = m % 60;
    return h ? h + " h " + (r < 10 ? "0" : "") + r + " min" : r + " min";
  }
  function updateKpi() {
    kpiTasks.textContent = doneCount;
    kpiTime.textContent = fmtTime(savedMin);
  }
  function makeItem(task) {
    var li = document.createElement("li");
    li.className = "feed__item";
    li.innerHTML =
      '<span class="feed__icon"><svg class="ic"><use href="#' + task.icon + '"/></svg></span>' +
      '<span class="feed__text"><strong></strong><span></span></span>' +
      '<span class="feed__state feed__state--work">In corso</span>';
    li.querySelector("strong").textContent = task.title;
    li.querySelector(".feed__text span").textContent = task.desc;
    return li;
  }
  function tick() {
    var task = tasks[t % tasks.length]; t++;
    var li = makeItem(task);
    feed.insertBefore(li, feed.firstChild);
    while (feed.children.length > MAX) feed.removeChild(feed.lastChild);
    setTimeout(function () {
      var st = li.querySelector(".feed__state");
      st.className = "feed__state feed__state--done";
      st.textContent = "✓ Fatto";
      doneCount++; savedMin += task.min;
      updateKpi();
    }, reduceMotion ? 0 : 1300);
  }
  if (feed) {
    // stato iniziale
    for (var i = 0; i < 3; i++) {
      var li = makeItem(tasks[tasks.length - 1 - i]);
      li.style.animation = "none";
      var st = li.querySelector(".feed__state");
      st.className = "feed__state feed__state--done";
      st.textContent = "✓ Fatto";
      feed.appendChild(li);
    }
    updateKpi();
    if (!reduceMotion) {
      tick();
      setInterval(function () { if (!document.hidden) tick(); }, 2800);
    }
  }

  /* ---------- Calcolatore ---------- */
  var inPeople = document.getElementById("in-people");
  var inHours = document.getElementById("in-hours");
  var inCost = document.getElementById("in-cost");
  // formattazione con separatore delle migliaia anche per numeri a 4 cifre (1.320)
  var nf = { format: function (n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); } };
  var DAYS = 220;

  function paintRange(el) {
    var p = (el.value - el.min) / (el.max - el.min) * 100;
    el.style.setProperty("--p", p + "%");
  }
  function calc() {
    var people = +inPeople.value, hours = +inHours.value, cost = +inCost.value;
    document.getElementById("out-people").textContent = people;
    document.getElementById("out-hours").textContent = String(hours).replace(".", ",");
    document.getElementById("out-cost").textContent = cost + " €";
    var totH = people * hours * DAYS;
    document.getElementById("res-hours").textContent = nf.format(totH);
    document.getElementById("res-cost").textContent = nf.format(totH * cost) + " €";
    document.getElementById("res-save").textContent = nf.format(totH / 2) + " ore";
    [inPeople, inHours, inCost].forEach(paintRange);
  }
  if (inPeople) {
    [inPeople, inHours, inCost].forEach(function (el) { el.addEventListener("input", calc); });
    calc();
  }

  /* ---------- Filtri esempi ---------- */
  var filters = document.querySelectorAll(".filter");
  var cases = document.querySelectorAll(".case");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.dataset.filter;
      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", String(on));
      });
      cases.forEach(function (c) {
        var show = f === "all" || c.dataset.tags.split(" ").indexOf(f) !== -1;
        c.classList.toggle("is-hidden", !show);
        if (show) c.classList.add("is-visible");
      });
    });
  });

  /* ---------- Modulo contatti ----------
     Per ricevere le richieste senza backend, impostare nell'attributo
     action del form un endpoint (es. Formspree, Getform, Netlify Forms).
     Se action è vuoto, viene aperto il client email precompilato. */
  var form = document.getElementById("contact-form");
  var msg = document.getElementById("form-msg");
  var CONTACT_EMAIL = "info@valtellinaautomazioni.it";

  function setInvalid(el, bad) {
    var wrap = el.closest(".field") || el.closest(".check");
    if (wrap) wrap.classList.toggle("is-invalid", bad);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (el) {
        var bad = el.type === "checkbox" ? !el.checked : !el.value.trim() || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(el.value));
        setInvalid(el, bad);
        if (bad && ok) { el.focus(); ok = false; }
      });
      if (!ok) {
        msg.className = "form__msg is-err";
        msg.textContent = "Controlla i campi evidenziati, per favore.";
        return;
      }

      var data = new FormData(form);
      var endpoint = form.getAttribute("action");

      if (endpoint) {
        msg.className = "form__msg";
        msg.textContent = "Invio in corso…";
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) {
            if (!r.ok) throw new Error();
            form.reset();
            msg.className = "form__msg is-ok";
            msg.textContent = "Grazie! Abbiamo ricevuto la tua richiesta, ti ricontattiamo a breve.";
          })
          .catch(function () {
            msg.className = "form__msg is-err";
            msg.textContent = "Si è verificato un problema. Scrivici a " + CONTACT_EMAIL;
          });
      } else {
        var body =
          "Nome: " + data.get("nome") + "\n" +
          "Azienda: " + (data.get("azienda") || "-") + "\n" +
          "Email: " + data.get("email") + "\n" +
          "Telefono: " + (data.get("telefono") || "-") + "\n" +
          "Settore: " + (data.get("settore") || "-") + "\n\n" +
          "Attività da automatizzare:\n" + data.get("messaggio");
        window.location.href = "mailto:" + CONTACT_EMAIL +
          "?subject=" + encodeURIComponent("Richiesta consulenza gratuita") +
          "&body=" + encodeURIComponent(body);
        msg.className = "form__msg is-ok";
        msg.textContent = "Si sta aprendo il tuo programma di posta per inviare la richiesta.";
      }
    });
    form.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("input", function () { setInvalid(el, false); });
      el.addEventListener("change", function () { setInvalid(el, false); });
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
