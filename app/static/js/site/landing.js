(function () {
  "use strict";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  var activeSub = "todos";

  /* ================= 1. Filtro de subcategorías (ropa) ================= */
  function applyRopaFilter() {
    var feed = $('[data-feed="ropa"]');
    if (!feed) return;
    $all(".look-card", feed).forEach(function (card) {
      var match = activeSub === "todos" || card.getAttribute("data-category") === activeSub;
      card.style.display = match ? "" : "none";
    });
  }

  function bindSubmenu() {
    var menu = $("[data-submenu]");
    if (!menu) return;
    $all("[data-sub]", menu).forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeSub = btn.getAttribute("data-sub");
        $all("[data-sub]", menu).forEach(function (b) { b.classList.toggle("active", b === btn); });
        applyRopaFilter();
      });
    });
  }

  /* ================= 2. Animación de aparición ================= */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  function observeReveals() {
    $all(".reveal:not(.visible)").forEach(function (el, i) {
      if (!el.style.getPropertyValue("--d")) el.style.setProperty("--d", (i % 4) * 0.09 + "s");
      revealObserver.observe(el);
    });
  }

  /* ================= 3. Visor de prenda (lightbox) ================= */
  var pmodal = $("[data-pmodal]");
  var viewersTimer = null;

  function paintViewers(n) {
    var el = $("[data-pmodal-viewers]");
    if (el) el.textContent = n + " personas la están viendo ahora";
  }

  function openProduct(card) {
    if (!card || !pmodal) return;
    var media = $("[data-pmodal-media]");
    media.className = $(".look-media", card).className.replace("look-media", "pmodal-media look-media");
    media.innerHTML = $(".look-media", card).innerHTML;

    $("[data-pmodal-cat]").textContent = $(".look-cat", card).textContent;
    $("[data-pmodal-name]").textContent = $(".look-name", card).textContent;
    var tagSource = $(".look-tag", card);
    var tag = $("[data-pmodal-tag]");
    tag.hidden = !tagSource;
    if (tagSource) tag.textContent = tagSource.textContent;
    $("[data-pmodal-desc]").textContent =
      card.getAttribute("data-desc") || "Pieza seleccionada de nuestra colección. Escríbenos para más detalles 💕";
    $("[data-pmodal-cta]").href = $(".look-cta", card).href;

    var viewers = randInt(5, 22);
    paintViewers(viewers);
    clearInterval(viewersTimer);
    viewersTimer = setInterval(function () {
      viewers = Math.min(22, Math.max(4, viewers + randInt(-2, 2)));
      paintViewers(viewers);
    }, 5000);

    pmodal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeProduct() {
    if (!pmodal || pmodal.hidden) return;
    pmodal.hidden = true;
    document.body.style.overflow = "";
    clearInterval(viewersTimer);
  }

  document.addEventListener("click", function (ev) {
    var media = ev.target.closest(".look-card .look-media");
    if (media) {
      openProduct(media.closest(".look-card"));
      return;
    }
    if (ev.target.closest("[data-pmodal-close]")) closeProduct();
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") closeProduct();
  });

  /* ================= 4. Prueba social: aviso de compra periódico ================= */
  var NAMES = ["Camila", "Valentina", "Mariana", "Daniela", "Sofía", "Isabella", "Gabriela",
    "Natalia", "Alejandra", "Paula", "Andrea", "Carolina", "Laura", "Fernanda", "Juliana",
    "Manuela", "Sara", "Salomé", "Antonia", "Luciana", "Martina", "Renata", "Catalina",
    "Jimena", "Dayana", "Lorena", "Ángela", "Julieth", "Tatiana", "Yesica"];
  var PLACES = ["Vélez", "Barbosa", "San Gil", "Bucaramanga", "Tunja", "Moniquirá",
    "Medellín", "Bogotá", "Cúcuta", "Socorro"];

  var proofEl = $("[data-proof]");
  var proofTimer = null;
  var lastIdx = -1;

  function showPurchaseProof() {
    var cards = $all(".look-card");
    if (!proofEl || !cards.length) return;
    if (document.hidden) return;
    if (proofEl.classList.contains("show")) return;

    var idx = randInt(0, cards.length - 1);
    if (idx === lastIdx) idx = (idx + 1) % cards.length;
    lastIdx = idx;

    var name = $(".look-name", cards[idx]).textContent;
    var buyer = pick(NAMES);
    proofEl.innerHTML =
      '<span class="proof-avatar">' + buyer.charAt(0) + "</span>" +
      '<div class="proof-body">' +
        '<p class="proof-title"><strong>' + buyer + "</strong> de " + pick(PLACES) + " la compró 🛍️</p>" +
        '<p class="proof-product">' + name + "</p>" +
      "</div>";
    proofEl.classList.add("show");

    clearTimeout(proofTimer);
    proofTimer = setTimeout(function () { proofEl.classList.remove("show"); }, 5000);
  }

  setTimeout(showPurchaseProof, 8000);
  setInterval(showPurchaseProof, 30000);

  /* ================= 5. Scrollspy del menú superior ================= */
  var spyLinks = {};
  $all("[data-spy]").forEach(function (a) { spyLinks[a.getAttribute("data-spy")] = a; });
  function setActiveSection(id) {
    Object.keys(spyLinks).forEach(function (key) {
      spyLinks[key].classList.toggle("active", key === id);
    });
  }
  var spyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActiveSection(entry.target.id);
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["inicio", "ropa", "accesorios", "contacto"].forEach(function (id) {
    var section = document.getElementById(id);
    if (section) spyObserver.observe(section);
  });

  var blobs = $all(".hero-blob");
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.scrollY;
      blobs.forEach(function (blob, i) {
        blob.style.translate = "0 " + y * (0.06 + i * 0.04) + "px";
      });
      if (window.innerHeight + y >= document.body.scrollHeight - 90) {
        setActiveSection("contacto");
      }
      ticking = false;
    });
  }, { passive: true });

  /* ================= 6. Feedback visual al abrir redes sociales ================= */
  var toast = $("[data-toast]");
  var toastTimer = null;
  var NETWORK_LABELS = { whatsapp: "WhatsApp", instagram: "Instagram", facebook: "Facebook" };

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  $all("[data-social]").forEach(function (el) {
    el.addEventListener("click", function () {
      var network = el.getAttribute("data-social");
      showToast("Abriendo " + (NETWORK_LABELS[network] || network) + "…");
    });
  });

  bindSubmenu();
  observeReveals();
})();
