/* ============================================================
   animations.js — reusable GSAP animation helpers
   ============================================================ */

function fadeIn(targets, vars = {}) {
  if (!window.gsap) return;
  return gsap.fromTo(
    targets,
    { opacity: 0, y: vars.y ?? 20, filter: vars.blur ? "blur(8px)" : "none" },
    {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: vars.duration ?? 1,
      ease: vars.ease ?? "power2.out",
      stagger: vars.stagger,
      delay: vars.delay ?? 0,
      ...vars,
    }
  );
}

function fadeOut(targets, vars = {}) {
  if (!window.gsap) return;
  return gsap.to(targets, {
    opacity: 0,
    y: vars.y ?? -12,
    duration: vars.duration ?? 0.6,
    ease: vars.ease ?? "power2.in",
    ...vars,
  });
}

function slideUp(targets, vars = {}) {
  if (!window.gsap) return;
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 60 },
    {
      opacity: 1,
      y: 0,
      duration: vars.duration ?? 1,
      ease: vars.ease ?? "power3.out",
      stagger: vars.stagger,
      delay: vars.delay ?? 0,
    }
  );
}

function slideDown(targets, vars = {}) {
  if (!window.gsap) return;
  return gsap.fromTo(
    targets,
    { opacity: 0, y: -40 },
    {
      opacity: 1,
      y: 0,
      duration: vars.duration ?? 1,
      ease: vars.ease ?? "power3.out",
      stagger: vars.stagger,
      delay: vars.delay ?? 0,
    }
  );
}

function scaleIn(targets, vars = {}) {
  if (!window.gsap) return;
  return gsap.fromTo(
    targets,
    { opacity: 0, scale: vars.from ?? 0.85 },
    {
      opacity: 1,
      scale: 1,
      duration: vars.duration ?? 0.9,
      ease: vars.ease ?? "back.out(1.4)",
      delay: vars.delay ?? 0,
      stagger: vars.stagger,
    }
  );
}

function revealChars(el, vars = {}) {
  if (!window.gsap || !el) return;
  const chars = window.birthdayUtils.splitText(el);
  gsap.set(el, { opacity: 1 });
  return gsap.fromTo(
    chars,
    { opacity: 0, y: 30, rotateX: -40 },
    {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: vars.duration ?? 0.7,
      ease: "power3.out",
      stagger: vars.stagger ?? 0.045,
      delay: vars.delay ?? 0,
    }
  );
}

function typewriter(el, text, vars = {}) {
  return new Promise((resolve) => {
    if (!el) return resolve();
    const reduced = window.birthdayUtils?.prefersReducedMotion?.();
    if (reduced || !window.gsap) {
      el.textContent = text;
      return resolve();
    }

    el.textContent = "";
    const cursor = document.createElement("span");
    cursor.className = "typed-cursor";
    cursor.setAttribute("aria-hidden", "true");
    el.appendChild(cursor);

    const speed = vars.speed ?? 28;
    let i = 0;

    const tick = () => {
      if (i < text.length) {
        el.insertBefore(document.createTextNode(text.charAt(i)), cursor);
        i += 1;
        setTimeout(tick, speed + Math.random() * 18);
      } else {
        if (vars.keepCursor === false) cursor.remove();
        resolve();
      }
    };
    setTimeout(tick, vars.delay ?? 0);
  });
}

function initScrollAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.birthdayUtils?.prefersReducedMotion?.()) {
    gsap.set("[data-scroll]", { opacity: 1, clearProps: "all" });
    return;
  }

  gsap.utils.toArray("[data-scroll]").forEach((el) => {
    const type = el.dataset.scroll || "fade";
    const from = {
      fade: { opacity: 0, y: 40 },
      up: { opacity: 0, y: 80 },
      scale: { opacity: 0, scale: 0.92 },
      blur: { opacity: 0, filter: "blur(12px)", y: 20 },
    }[type] || { opacity: 0, y: 40 };

    gsap.fromTo(el, from, {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      duration: 1.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });
}

function initParallax() {
  if (!window.gsap || window.birthdayUtils?.prefersReducedMotion?.()) return;
  if (window.birthdayUtils?.isTouchDevice?.()) return;

  gsap.utils.toArray("[data-parallax]").forEach((el) => {
    const speed = parseFloat(el.dataset.parallax) || 0.15;
    gsap.to(el, {
      yPercent: speed * 100,
      ease: "none",
      scrollTrigger: {
        trigger: el.parentElement || el,
        scrub: true,
        start: "top bottom",
        end: "bottom top",
      },
    });
  });
}

function mouseParallax(container, layers) {
  if (!container || window.birthdayUtils?.isTouchDevice?.()) return;
  if (window.birthdayUtils?.prefersReducedMotion?.()) return;

  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    layers.forEach(({ el, depth }) => {
      if (!el || !window.gsap) return;
      gsap.to(el, {
        x: x * depth * 40,
        y: y * depth * 30,
        duration: 0.8,
        ease: "power2.out",
      });
    });
  });
}

function confettiHearts(x, y, count = 16) {
  if (window.spawnHeartBurst) window.spawnHeartBurst(x, y, count);
}

window.anim = {
  fadeIn,
  fadeOut,
  slideUp,
  slideDown,
  scaleIn,
  revealChars,
  typewriter,
  initScrollAnimations,
  initParallax,
  mouseParallax,
  confettiHearts,
};
