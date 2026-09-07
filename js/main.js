/* ============================================================
   birthdayConfig — single source of truth for dates & identity
   ============================================================ */
const birthdayConfig = {
  // Nida's birthday — September 15 at 12:00 PM (noon), local time
  // Change year here when reusing next year
  birthdayYear: 2026,
  birthdayMonth: 9, // September (1–12)
  birthdayDay: 15,
  birthdayHour: 12, // 12 = 12:00 PM noon
  birthdayMinute: 0,
  password: "01052025",
  name: "Nida",
  from: "Kabir",
  pages: {
    index: "index.html",
    day1: "day-1.html",
    day2: "day-2.html",
    day3: "day-3.html",
    day4: "day-4.html",
    day5: "day-5.html",
    day6: "day-6.html",
    birthday: "birthday.html",
  },
};

/** September 15 at 12:00 PM local — avoids ISO/UTC parse bugs */
function getBirthdayDate() {
  const y = birthdayConfig.birthdayYear;
  const m = birthdayConfig.birthdayMonth - 1; // JS months are 0-based
  const d = birthdayConfig.birthdayDay;
  const h = birthdayConfig.birthdayHour ?? 12;
  const min = birthdayConfig.birthdayMinute ?? 0;
  return new Date(y, m, d, h, min, 0, 0);
}

// Keep a string form for display / debugging
birthdayConfig.birthday = `${birthdayConfig.birthdayYear}-${String(birthdayConfig.birthdayMonth).padStart(2, "0")}-${String(birthdayConfig.birthdayDay).padStart(2, "0")}T${String(birthdayConfig.birthdayHour).padStart(2, "0")}:${String(birthdayConfig.birthdayMinute).padStart(2, "0")}:00`;

window.birthdayConfig = birthdayConfig;
window.getBirthdayDate = getBirthdayDate;

/* ============================================================
   Utilities
   ============================================================ */
const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isTouchDevice = () =>
  window.matchMedia("(hover: none), (pointer: coarse)").matches ||
  "ontouchstart" in window;

function $(sel, ctx = document) {
  return ctx.querySelector(sel);
}

function $$(sel, ctx = document) {
  return Array.from(ctx.querySelectorAll(sel));
}

function isBirthdayOrAfter() {
  return new Date() >= getBirthdayDate();
}

/* ============================================================
   initCursor — romantic custom cursor (desktop only)
   ============================================================ */
function initCursor() {
  if (isTouchDevice() || prefersReducedMotion()) {
    document.body.classList.add("no-custom-cursor", "is-touch");
    return;
  }

  const dot = document.createElement("div");
  dot.className = "custom-cursor";
  const ring = document.createElement("div");
  ring.className = "custom-cursor-ring";
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let raf = null;

  const render = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    raf = requestAnimationFrame(render);
  };
  raf = requestAnimationFrame(render);

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const expandSelectors =
    "a, button, .btn, .envelope, .compliment-card, .quiz-option, .tap-heart, input, .love-meter input";

  document.addEventListener("mouseover", (e) => {
    const t = e.target.closest(expandSelectors);
    const img = e.target.closest(".gallery-item, .memory-frame");

    if (img) {
      dot.classList.add("view-mode", "expanded");
      dot.setAttribute("data-label", "View ❤️");
      ring.style.opacity = "0";
    } else if (t) {
      dot.classList.add("expanded");
      dot.classList.remove("view-mode");
      dot.removeAttribute("data-label");
      ring.style.opacity = "0.5";
    } else {
      dot.classList.remove("expanded", "view-mode");
      dot.removeAttribute("data-label");
      ring.style.opacity = "1";
    }
  });

  window.addEventListener("beforeunload", () => {
    if (raf) cancelAnimationFrame(raf);
  });
}

/* ============================================================
   initMagneticButtons
   ============================================================ */
function initMagneticButtons() {
  if (isTouchDevice() || prefersReducedMotion()) return;

  $$(".magnetic, .btn-primary, .btn-ghost, .btn-gold").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      if (window.gsap) {
        gsap.to(btn, { x: x * 0.25, y: y * 0.25, duration: 0.35, ease: "power2.out" });
      }
    });
    btn.addEventListener("mouseleave", () => {
      if (window.gsap) {
        gsap.to(btn, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.4)" });
      }
    });
  });
}

/* ============================================================
   initPageTransition
   ============================================================ */
function initPageTransition() {
  let overlay = $(".page-transition");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "page-transition";
    overlay.innerHTML = '<p class="page-transition__text"></p>';
    document.body.appendChild(overlay);
  }

  const textEl = overlay.querySelector(".page-transition__text");

  $$("[data-navigate]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("href") || link.dataset.navigate;
      const chapter = link.dataset.chapter || "Loading...";
      navigateWithTransition(href, chapter);
    });
  });

  window.navigateWithTransition = navigateWithTransition;

  function navigateWithTransition(href, chapterText) {
    if (prefersReducedMotion() || !window.gsap) {
      window.location.href = href;
      return;
    }

    overlay.classList.add("active");
    textEl.textContent = chapterText;

    const tl = gsap.timeline({
      onComplete: () => {
        window.location.href = href;
      },
    });

    tl.set(overlay, { opacity: 0 })
      .to(overlay, { opacity: 1, duration: 0.45, ease: "power2.inOut" })
      .fromTo(
        textEl,
        { opacity: 0, y: 16, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "power2.out" }
      )
      .to(textEl, { opacity: 0, duration: 0.3, delay: 0.35 });
  }

  // Entrance reveal when arriving
  if (window.gsap && !prefersReducedMotion()) {
    overlay.classList.add("active");
    gsap.set(overlay, { opacity: 1 });
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.7,
      delay: 0.15,
      ease: "power2.inOut",
      onComplete: () => overlay.classList.remove("active"),
    });
  }
}

/* ============================================================
   initParticles — canvas stars / dust / soft hearts
   ============================================================ */
function initParticles(options = {}) {
  const touch = isTouchDevice();
  const {
    count = touch ? 28 : 55,
    hearts = true,
    color = "rgba(232, 160, 176, 0.55)",
    speed = 0.35,
  } = options;

  if (prefersReducedMotion()) return null;

  const canvas = document.createElement("canvas");
  canvas.className = "canvas-particles";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  let w, h, particles, rafId;
  const dpr = Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2);

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createParticles() {
    const density = touch ? 28000 : 18000;
    const n = Math.min(count, Math.floor((w * h) / density));
    particles = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      vy: -(Math.random() * speed + 0.05),
      vx: (Math.random() - 0.5) * 0.2,
      a: Math.random() * 0.6 + 0.15,
      type: hearts && Math.random() > (touch ? 0.93 : 0.88) ? "heart" : "star",
      tw: Math.random() * Math.PI * 2,
    }));
  }

  function drawHeart(x, y, size, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 12, size / 12);
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.bezierCurveTo(-5, -2, -12, 4, 0, 12);
    ctx.bezierCurveTo(12, 4, 5, -2, 0, 3);
    ctx.fillStyle = `rgba(196, 92, 122, ${alpha})`;
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.tw += 0.02;
      if (p.y < -10) {
        p.y = h + 10;
        p.x = Math.random() * w;
      }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;

      const alpha = p.a * (0.65 + Math.sin(p.tw) * 0.35);

      if (p.type === "heart") {
        drawHeart(p.x, p.y, p.r * 8, alpha * 0.7);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(/[\d.]+\)$/, `${alpha})`);
        ctx.fill();
      }
    });
    rafId = requestAnimationFrame(tick);
  }

  resize();
  createParticles();
  tick();

  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });

  return () => {
    cancelAnimationFrame(rafId);
    canvas.remove();
  };
}

/* ============================================================
   initHeartParticles — burst at x,y
   ============================================================ */
function initHeartParticles() {
  window.spawnHeartBurst = function spawnHeartBurst(x, y, amount = 10) {
    for (let i = 0; i < amount; i++) {
      const el = document.createElement("span");
      el.className = "floating-heart";
      el.textContent = Math.random() > 0.5 ? "♥" : "♡";
      el.style.left = x + (Math.random() - 0.5) * 40 + "px";
      el.style.top = y + (Math.random() - 0.5) * 20 + "px";
      el.style.fontSize = 0.7 + Math.random() * 0.8 + "rem";
      el.style.color = Math.random() > 0.5 ? "#e8a0b0" : "#c45c7a";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2600);
    }
  };
}

/* ============================================================
   initMusic
   ============================================================ */
function initMusic() {
  const btn = $(".music-btn");
  if (!btn) return;

  const audio = new Audio("assets/audio/romantic.mp3");
  audio.loop = true;
  audio.preload = "none";
  audio.volume = 0.45;

  let playing = false;
  let available = true;

  audio.addEventListener("error", () => {
    available = false;
    btn.title = "Add romantic.mp3 to assets/audio to enable music";
  });

  btn.addEventListener("click", async () => {
    if (!available) {
      btn.querySelector(".music-label").textContent = "Music coming soon";
      setTimeout(() => {
        btn.querySelector(".music-label").textContent = "♫ Play our song";
      }, 2000);
      return;
    }

    try {
      if (playing) {
        audio.pause();
        playing = false;
        btn.classList.remove("is-playing");
        btn.querySelector(".music-label").textContent = "♫ Play our song";
      } else {
        await audio.play();
        playing = true;
        btn.classList.add("is-playing");
        btn.querySelector(".music-label").textContent = "Pause";
      }
    } catch (err) {
      available = false;
      btn.querySelector(".music-label").textContent = "Music unavailable";
    }
  });

  window.birthdayAudio = audio;
}

/* ============================================================
   initImageFallbacks — elegant placeholders when photos missing
   ============================================================ */
function initImageFallbacks() {
  $$("img[data-fallback]").forEach((img) => {
    const applyFallback = () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = "1";
      const wrap = img.parentElement;
      const label = img.dataset.fallback || "A memory";
      const placeholder = document.createElement("div");
      placeholder.className = "memory-placeholder";
      placeholder.innerHTML = `<span class="heart-glow">♡</span><span>${label}</span><small style="opacity:0.5;font-size:0.7rem;letter-spacing:0.08em">Add ${img.getAttribute("src")?.split("/").pop() || "photo"}</small>`;
      img.style.display = "none";
      wrap.appendChild(placeholder);
    };

    img.addEventListener("error", applyFallback);
    if (img.complete && img.naturalWidth === 0) applyFallback();
  });
}

/* ============================================================
   splitText — wrap characters for GSAP
   ============================================================ */
function splitText(el) {
  if (!el) return [];
  const text = el.textContent;
  el.setAttribute("aria-label", text);
  el.innerHTML = "";
  const chars = [];
  [...text].forEach((ch) => {
    const span = document.createElement("span");
    span.className = "char";
    span.textContent = ch === " " ? "\u00A0" : ch;
    span.setAttribute("aria-hidden", "true");
    el.appendChild(span);
    chars.push(span);
  });
  return chars;
}

/* ============================================================
   Global boot
   ============================================================ */
function bootCommon(particleOpts) {
  if (isTouchDevice()) document.body.classList.add("is-touch");

  // Background blobs if container exists
  const bg = $(".bg-layer");
  if (bg && !bg.querySelector(".blob")) {
    ["blob-1", "blob-2", "blob-3"].forEach((c) => {
      const b = document.createElement("div");
      b.className = `blob ${c}`;
      b.setAttribute("aria-hidden", "true");
      bg.appendChild(b);
    });
  }

  if (!$(".film-grain")) {
    const grain = document.createElement("div");
    grain.className = "film-grain";
    grain.setAttribute("aria-hidden", "true");
    document.body.appendChild(grain);
  }

  initCursor();
  initHeartParticles();
  initParticles(particleOpts);
  initPageTransition();
  initMagneticButtons();
  initMusic();
  initImageFallbacks();

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.TextPlugin) gsap.registerPlugin(TextPlugin);
  }
}

window.birthdayUtils = {
  $,
  $$,
  prefersReducedMotion,
  isTouchDevice,
  getBirthdayDate,
  isBirthdayOrAfter,
  splitText,
  bootCommon,
  initParticles,
  initHeartParticles,
  initCursor,
  initMagneticButtons,
  initPageTransition,
  initMusic,
  initImageFallbacks,
};

document.addEventListener("DOMContentLoaded", () => {
  // Pages call bootCommon themselves with custom opts,
  // but ensure base setup if data-auto-boot is present
  if (document.body.dataset.autoBoot !== undefined) {
    bootCommon();
  }
});
