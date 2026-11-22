/* Empório do Saber — interações do site (sem dependências) */
(function () {
  "use strict";
  document.documentElement.classList.remove("rd-no-js");

  var WA_NUMBER = "244942783050";

  /* Links de WhatsApp: <a data-wa="mensagem"> */
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(a.getAttribute("data-wa"));
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* Header: transparente sobre o hero, branco ao fazer scroll */
  var header = document.querySelector(".rd-header");
  if (header) {
    var alwaysSolid = header.hasAttribute("data-solid");
    var onScroll = function () {
      header.classList.toggle("is-solid", alwaysSolid || window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Menu mobile */
  var menu = document.getElementById("rd-mobile-menu");
  var openBtn = document.querySelector(".rd-burger");
  if (menu && openBtn) {
    var closeBtn = menu.querySelector(".rd-mobile-menu__close");
    var setMenu = function (open) {
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      openBtn.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("rd-no-scroll", open);
      if (open) closeBtn.focus(); else openBtn.focus();
    };
    openBtn.addEventListener("click", function () { setMenu(true); });
    closeBtn.addEventListener("click", function () { setMenu(false); });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false); });
  }

  /* Fade-in / slide-up ao entrar no ecrã */
  var reveals = document.querySelectorAll(".rd-reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* FAQ accordion */
  document.querySelectorAll(".rd-faq__q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".rd-faq__item");
      var open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* Galeria: filtros + lightbox */
  var gallery = document.querySelector(".rd-gallery");
  if (gallery) {
    var items = Array.prototype.slice.call(gallery.querySelectorAll(".rd-gallery__item"));
    document.querySelectorAll(".rd-gallery-filters button").forEach(function (b, _, all) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-filter");
        all.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        items.forEach(function (it) { it.hidden = f !== "todas" && it.getAttribute("data-cat") !== f; });
      });
    });

    var lb = document.querySelector(".rd-lightbox");
    var lbImg = lb.querySelector("img");
    var lbCap = lb.querySelector("figcaption");
    var current = 0;
    var visible = function () { return items.filter(function (i) { return !i.hidden; }); };
    var show = function (idx) {
      var list = visible();
      current = (idx + list.length) % list.length;
      var it = list[current];
      var img = it.querySelector("img");
      lbImg.src = img.getAttribute("data-full") || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = it.querySelector("figcaption") ? it.querySelector("figcaption").textContent : "";
    };
    var lastFocus = null;
    var open = function (it) {
      lastFocus = it;
      show(visible().indexOf(it));
      lb.classList.add("is-open");
      document.body.classList.add("rd-no-scroll");
      lb.querySelector(".rd-lightbox__close").focus();
    };
    var close = function () {
      lb.classList.remove("is-open");
      document.body.classList.remove("rd-no-scroll");
      if (lastFocus) lastFocus.focus();
    };
    items.forEach(function (it) { it.addEventListener("click", function () { open(it); }); });
    lb.querySelector(".rd-lightbox__close").addEventListener("click", close);
    lb.querySelector(".rd-lightbox__prev").addEventListener("click", function () { show(current - 1); });
    lb.querySelector(".rd-lightbox__next").addEventListener("click", function () { show(current + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  /* Formulário de pré-inscrição (apenas frontend nesta fase) */
  var form = document.getElementById("rd-pre-inscricao");
  if (form) {
    var promoWrap = form.querySelector(".rd-promo-field");
    var promoInput = form.querySelector("#codigo_promocional");

    /* ?nivel=pre-escolar pré-seleciona o nível vindo dos botões "Saber mais" */
    var params = new URLSearchParams(window.location.search);
    var nivel = params.get("nivel");
    if (nivel) {
      var opt = form.querySelector('input[name="nivel"][value="' + nivel + '"]');
      if (opt) opt.checked = true;
    }

    var syncPromo = function () {
      var sim = form.querySelector('input[name="tem_codigo"]:checked');
      var show = sim && sim.value === "sim";
      promoWrap.classList.toggle("is-visible", show);
      promoWrap.setAttribute("aria-hidden", show ? "false" : "true");
      promoInput.required = show;
      promoInput.tabIndex = show ? 0 : -1;
      if (!show) { promoInput.value = ""; promoInput.closest(".rd-field").classList.remove("has-error"); }
    };
    form.querySelectorAll('input[name="tem_codigo"]').forEach(function (r) { r.addEventListener("change", syncPromo); });
    syncPromo();

    var phoneOk = function (v) { return v.replace(/[^\d]/g, "").length >= 9; };

    var validateField = function (field) {
      var inputs = field.querySelectorAll("input, select, textarea");
      var ok = true;
      if (!inputs.length) return true;
      var first = inputs[0];
      if (first.type === "radio") {
        if (field.hasAttribute("data-required")) ok = !!field.querySelector("input:checked");
      } else if (first.required) {
        var v = first.value.trim();
        ok = v.length > 0;
        if (ok && first.type === "tel") ok = phoneOk(v);
        if (ok && first.type === "date") {
          var d = new Date(v);
          ok = !isNaN(d.getTime()) && d < new Date();
        }
      }
      field.classList.toggle("has-error", !ok);
      return ok;
    };

    form.querySelectorAll(".rd-field").forEach(function (field) {
      field.addEventListener("change", function () { if (field.classList.contains("has-error")) validateField(field); });
      field.addEventListener("input", function () { if (field.classList.contains("has-error")) validateField(field); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll(".rd-field").forEach(function (field) {
        if (field.closest(".rd-promo-field") && !promoInput.required) return;
        if (!validateField(field) && !firstBad) firstBad = field;
      });
      if (firstBad) {
        firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
        var f = firstBad.querySelector("input, select, textarea");
        if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 300);
        return;
      }

      /* Resumo para o WhatsApp: os dados só chegam à escola se o encarregado enviar a mensagem */
      var data = new FormData(form);
      var nivelLabel = form.querySelector('input[name="nivel"]:checked').getAttribute("data-label");
      var tipo = form.querySelector('input[name="tipo_aluno"]:checked').getAttribute("data-label");
      var linhas = [
        "Olá! Gostaria de dar seguimento a uma pré-inscrição no Empório do Saber.",
        "",
        "Aluno: " + data.get("nome_aluno"),
        "Data de nascimento: " + data.get("data_nascimento").split("-").reverse().join("/"),
        "Encarregado de educação: " + data.get("nome_encarregado"),
        "Telefone: " + data.get("telefone"),
        "WhatsApp: " + data.get("whatsapp"),
        "Nível pretendido: " + nivelLabel,
        "Situação: " + tipo
      ];
      if (data.get("tem_codigo") === "sim") linhas.push("Código promocional: " + data.get("codigo_promocional"));
      if ((data.get("mensagem") || "").trim()) linhas.push("Mensagem: " + data.get("mensagem").trim());

      var success = document.getElementById("rd-form-success");
      var waBtn = success.querySelector("[data-wa-summary]");
      waBtn.href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(linhas.join("\n"));
      form.hidden = true;
      success.hidden = false;
      success.setAttribute("tabindex", "-1");
      success.focus();
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    var resetBtn = document.querySelector("[data-form-reset]");
    if (resetBtn) resetBtn.addEventListener("click", function () {
      form.reset();
      syncPromo();
      document.getElementById("rd-form-success").hidden = true;
      form.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* Ano no rodapé */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = Math.max(2026, new Date().getFullYear()); });
})();
