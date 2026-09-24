/* ============================================================
   Онлайн-школа «Чебурашка» — интерактив
   reveal-анимации, parallax-блобы, 3D-tilt, таймер, меню, шапка
   и форма записи через Яндекс.Формы (хранение в РФ, без Google Таблицы)
   ============================================================ */
(function () {
  "use strict";

  /* Страховка: скрипт загрузился — снимаем аварийный показ контента */
  if (window.__revealFallback) { clearTimeout(window.__revealFallback); }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Scroll-reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in-view");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- 2. Parallax-блобы на скролле ---------- */
  var blobs = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var scrollY = window.pageYOffset || 0;
  var maxTravel = 150;

  function moveBlobs() {
    if (reduceMotion) return;
    blobs.forEach(function (b) {
      var speed = parseFloat(b.getAttribute("data-parallax")) || 0.1;
      var y = Math.max(-maxTravel, Math.min(maxTravel, scrollY * speed * 0.55));
      var x = -y * 0.45;
      b.style.transform = "translate3d(" + x.toFixed(1) + "px, " + y.toFixed(1) + "px, 0)";
    });
  }

  var rafId = null;
  window.addEventListener(
    "scroll",
    function () {
      scrollY = window.pageYOffset || 0;
      if (rafId) return;
      rafId = requestAnimationFrame(function () {
        rafId = null;
        moveBlobs();
      });
    },
    { passive: true }
  );
  moveBlobs();

  /* ---------- 3. Шапка: фон при скролле ---------- */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    header.classList.toggle("scrolled", (window.pageYOffset || 0) > 24);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- 4. Мобильное меню ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("siteNav");
  if (burger && nav) {
    burger.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = nav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !e.target.closest(".header-inner")) {
        nav.classList.remove("open");
        burger.classList.remove("open");
      }
    });
  }

  /* ---------- 5. Таймер до 23:59 сегодня ---------- */
  var cells = {
    h: document.querySelector('[data-cd="h"]'),
    m: document.querySelector('[data-cd="m"]'),
    s: document.querySelector('[data-cd="s"]')
  };
  if (cells.h && cells.m && cells.s) {
    function pad(n) { return n < 10 ? "0" + n : String(n); }
    function tick() {
      var now = new Date();
      var target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      var diff = Math.max(0, target - now);
      var h = Math.floor(diff / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      cells.h.textContent = pad(h);
      cells.m.textContent = pad(m);
      cells.s.textContent = pad(s);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 6. 3D-tilt для дашборда ---------- */
  var tiltWrap = document.querySelector("[data-tilt]");
  var dash = tiltWrap ? tiltWrap.querySelector(".dash") : null;
  if (tiltWrap && dash && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var mx = 0, my = 0, tx = 0, ty = 0, ticking = false;

    tiltWrap.addEventListener("pointermove", function (e) {
      var r = tiltWrap.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(function () {
          tx += (mx - tx) * 0.08;
          ty += (my - ty) * 0.08;
          dash.style.transform =
            "rotateX(" + (-ty * 5).toFixed(2) + "deg) rotateY(" + (tx * 6).toFixed(2) + "deg)";
          ticking = false;
        });
      }
    });

    tiltWrap.addEventListener("pointerleave", function () {
      mx = 0; my = 0;
      dash.style.transition = "transform .6s cubic-bezier(.22,.8,.36,1)";
      dash.style.transform = "rotateX(0deg) rotateY(0deg)";
      setTimeout(function () { dash.style.transition = ""; }, 650);
    });
  }

/* ---------- 7. Форма записи → Яндекс.Формы ---------- */
  /* Данные формы попадают в ваш аккаунт Яндекса (РФ) — без иностранных
     сервисов и без Google Таблицы. Яндекс.Форма подключена как iframe.
     Чтобы подключить свою форму:
       1. Создайте форму на forms.yandex.ru (поля: Имя, Фамилия, Email,
          согласие на обработку персональных данных).
       2. Нажмите «Поделиться» → «Встроить» и скопируйте адрес iframe.
       3. Вставьте этот адрес в атрибут data-src у iframe #yandexFormFrame
          в index.html — больше ничего менять не нужно. */
  var modal = document.getElementById("leadModal");
  if (modal) {
    var frame = document.getElementById("yandexFormFrame");
    var frameInited = false;
    var lastOpener = null;

    function openLeadModal(opener) {
      lastOpener = opener || null;
      /* Ленивая загрузка: src подставляется только при первом открытии окна */
      if (frame && !frameInited) {
        frameInited = true;
        var src = frame.getAttribute("data-src");
        if (src) frame.src = src;
      }
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    }

    function closeLeadModal() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
      if (lastOpener && lastOpener.focus) lastOpener.focus();
    }

    document.querySelectorAll("[data-open-modal]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        openLeadModal(el);
      });
    });

    modal.querySelectorAll("[data-modal-close]").forEach(function (el) {
      el.addEventListener("click", closeLeadModal);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) closeLeadModal();
    });
  }
})();