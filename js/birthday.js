/* ============================================================
   birthday.js — lock screen, unlock cinema, final experience
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const { bootCommon, $, $$, prefersReducedMotion, isBirthdayOrAfter, splitText } =
    window.birthdayUtils;

  bootCommon({ count: 70, hearts: true });

  const lockScreen = $("#lock-screen");
  const birthdayContent = $("#birthday-content");
  const form = $("#lock-form");
  const input = $("#password-input");
  const errorEl = $("#lock-error");
  const earlyNotice = $("#early-notice");
  const unlockOverlay = $("#unlock-overlay");

  // Early date notice (still allow password unlock)
  if (earlyNotice) {
    if (!isBirthdayOrAfter()) {
      earlyNotice.hidden = false;
      if (window.initCountdown) {
        initCountdown("#early-countdown", { showDays: true });
      }
    } else {
      earlyNotice.hidden = true;
    }
  }

  // Password form
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = (input?.value || "").trim();
      const correct = window.birthdayConfig.password;

      if (value === correct) {
        runUnlockSequence();
      } else {
        showWrongPassword();
      }
    });
  }

  function showWrongPassword() {
    if (!errorEl) return;
    errorEl.textContent = "Almost... but that's not the secret ❤️";
    if (window.gsap) {
      gsap.fromTo(
        errorEl,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4 }
      );
      gsap.fromTo(
        form,
        { x: 0 },
        { x: 8, duration: 0.08, yoyo: true, repeat: 5, ease: "power1.inOut" }
      );
    } else {
      errorEl.style.opacity = "1";
    }
    if (input) {
      input.value = "";
      input.focus();
    }
  }

  function runUnlockSequence() {
    const reduced = prefersReducedMotion();

    if (reduced || !window.gsap) {
      finishUnlock();
      return;
    }

    const lockIcon = $(".lock-icon");
    const burst = unlockOverlay?.querySelector(".unlock-burst");

    const tl = gsap.timeline({
      onComplete: finishUnlock,
    });

    tl.to(lockScreen, { filter: "brightness(0.35)", duration: 0.5 })
      .to([form, errorEl, earlyNotice].filter(Boolean), {
        opacity: 0,
        y: -20,
        duration: 0.45,
        stagger: 0.05,
      }, "-=0.2");

    if (lockIcon) {
      tl.to(lockIcon, {
        scale: 1.2,
        filter: "drop-shadow(0 0 30px rgba(232,160,176,0.9))",
        duration: 0.6,
        ease: "power2.out",
      })
        .to(lockIcon, {
          rotationY: 90,
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
        });
    }

    if (burst) {
      tl.to(burst, { opacity: 1, duration: 0.3 }, "-=0.2")
        .to(burst, { opacity: 0, scale: 2.5, duration: 1.2, ease: "power2.out" }, "-=0.05");
    }

    // Particle / heart explosion
    tl.add(() => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      for (let i = 0; i < 5; i++) {
        setTimeout(() => window.spawnHeartBurst?.(cx, cy, 14), i * 120);
      }
    });

    // Reveal text letter by letter
    const revealHost = $("#unlock-reveal");
    if (revealHost) {
      revealHost.hidden = false;
      revealHost.style.display = "flex";
      gsap.set(revealHost, { opacity: 1 });
      const lines = $$(".unlock-line", revealHost);
      lines.forEach((line) => {
        const chars = splitText(line);
        gsap.set(line, { opacity: 1 });
        tl.fromTo(
          chars,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.035,
            ease: "power2.out",
          },
          "+=0.15"
        );
      });
      tl.to(revealHost, { opacity: 0, duration: 0.6, delay: 0.8 });
    }

    tl.to(lockScreen, { opacity: 0, duration: 0.7 });
  }

  function finishUnlock() {
    if (lockScreen) {
      lockScreen.style.display = "none";
      lockScreen.setAttribute("aria-hidden", "true");
    }
    const revealHost = $("#unlock-reveal");
    if (revealHost) {
      revealHost.hidden = true;
      revealHost.style.display = "none";
    }
    if (birthdayContent) {
      birthdayContent.classList.add("is-unlocked");
      birthdayContent.removeAttribute("hidden");
    }
    document.body.classList.add("is-unlocked");
    initBirthdayExperience();
  }

  /* ---------- Post-unlock experience ---------- */
  function initBirthdayExperience() {
    const reduced = prefersReducedMotion();

    // Hero entrance
    const heroDate = $(".birthday-hero__date");
    const heroLabel = $(".birthday-hero__label");
    const heroName = $(".birthday-hero__name");
    const heroFrom = $(".birthday-hero__from");
    const glow = $(".glow-heart-bg");
    const ornaments = $$(".birthday-hero .ornament");
    const scrollHint = $(".scroll-hint");

    if (window.gsap && !reduced) {
      const tl = gsap.timeline({ delay: 0.2 });
      if (glow) tl.fromTo(glow, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.4 }, 0);
      if (ornaments.length) {
        tl.fromTo(ornaments, { opacity: 0 }, { opacity: 1, duration: 1, stagger: 0.2 }, 0.15);
      }
      if (heroDate) tl.fromTo(heroDate, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, 0.25);
      if (heroLabel) tl.fromTo(heroLabel, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, 0.4);
      if (heroName) {
        const chars = splitText(heroName);
        gsap.set(heroName, { opacity: 1 });
        tl.fromTo(
          chars,
          { opacity: 0, y: 50, rotateX: -50 },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.05, ease: "power3.out" },
          0.65
        );
      }
      if (heroFrom) tl.fromTo(heroFrom, { opacity: 0 }, { opacity: 1, duration: 1 }, 1.45);
      if (scrollHint) tl.fromTo(scrollHint, { opacity: 0 }, { opacity: 0.7, duration: 1 }, 1.8);

      window.anim?.mouseParallax?.($(".birthday-hero"), [
        { el: glow, depth: 0.4 },
        { el: heroName, depth: 0.15 },
        { el: heroLabel, depth: 0.1 },
      ]);
    } else {
      [heroDate, heroLabel, heroName, heroFrom, glow, scrollHint, ...ornaments].forEach((el) => {
        if (el) el.style.opacity = "1";
      });
    }

    // Romantic messages on scroll
    window.anim?.initScrollAnimations?.();
    window.anim?.initParallax?.();

    $$(".message-stack p").forEach((p, i) => {
      if (!window.gsap || reduced) {
        p.style.opacity = "1";
        return;
      }
      gsap.fromTo(
        p,
        { opacity: 0, y: 40, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: p,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          delay: i * 0.05,
        }
      );
    });

    // Stagger wish / reason / promise items if reduced motion skipped data-scroll
    if (window.gsap && !reduced && window.ScrollTrigger) {
      gsap.utils.toArray(".wish-item, .reason-card, .promise-list li").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
            delay: (i % 3) * 0.05,
          }
        );
      });
    }

    initFinalGallery();
    initTapHeart();
    initLoveMeter();
    initCandle();
    initFinalSurprise();
  }

  function initCandle() {
    const btn = $("#candle-btn");
    const wish = $("#candle-wish");
    if (!btn) return;

    let blown = false;
    btn.addEventListener("click", () => {
      if (blown) return;
      blown = true;
      btn.classList.add("is-out");
      btn.setAttribute("aria-pressed", "true");

      if (wish) {
        wish.textContent = "Wish received. May it find its way to you, Nida ❤️";
        if (window.gsap) {
          gsap.fromTo(wish, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7 });
        }
      }

      const rect = btn.getBoundingClientRect();
      window.spawnHeartBurst?.(rect.left + rect.width / 2, rect.top + 20, 12);

      if (window.gsap) {
        gsap.to(".candle__flame", { opacity: 0, scale: 0.2, y: 12, duration: 0.45, ease: "power2.in" });
      }
    });
  }

  function initFinalGallery() {
    const lightbox = $("#lightbox");
    const lightboxImg = $("#lightbox-img");
    const closeBtn = $("#lightbox-close");

    $$(".gallery-item").forEach((item) => {
      item.addEventListener("click", () => {
        const img = item.querySelector("img");
        const placeholder = item.querySelector(".memory-placeholder");
        if (!lightbox) return;

        if (img && img.style.display !== "none" && img.naturalWidth) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt || "";
          lightboxImg.hidden = false;
        } else if (placeholder) {
          lightboxImg.hidden = true;
        }
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
      });

      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          item.click();
        }
      });
    });

    const close = () => {
      lightbox?.classList.remove("is-open");
      lightbox?.setAttribute("aria-hidden", "true");
    };

    closeBtn?.addEventListener("click", close);
    lightbox?.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  function initTapHeart() {
    const btn = $("#tap-heart");
    const msg = $("#heart-messages");
    const after = $("#heart-after");
    if (!btn) return;

    const messages = [
      "A little more love...",
      "Still going?",
      "You're adorable.",
      "Keep tapping ❤️",
      "My heart just skipped.",
      "Okay that's sweet.",
      "Nida energy detected.",
      "Love received.",
    ];

    let clicks = 0;

    btn.addEventListener("click", (e) => {
      clicks += 1;
      const rect = btn.getBoundingClientRect();
      window.spawnHeartBurst?.(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        8
      );

      if (window.gsap) {
        gsap.fromTo(btn, { scale: 1 }, { scale: 1.18, duration: 0.12, yoyo: true, repeat: 1 });
      }

      if (msg && clicks <= 8) {
        msg.textContent = messages[(clicks - 1) % messages.length];
        if (window.gsap) {
          gsap.fromTo(msg, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35 });
        }
      }

      if (clicks >= 8 && after) {
        after.hidden = false;
        if (window.gsap) {
          gsap.fromTo(after, { opacity: 0 }, { opacity: 1, duration: 0.8 });
        }
      }
    });
  }

  function initLoveMeter() {
    const slider = $("#love-slider");
    const valueEl = $("#love-value");
    const labelEl = $("#love-label");
    if (!slider) return;

    const labels = [
      { max: 25, text: "That's not even close." },
      { max: 50, text: "Still warming up..." },
      { max: 75, text: "Getting there..." },
      { max: 99, text: "Almost..." },
      { max: 100, text: "ERROR: Love exceeds maximum capacity ❤️" },
    ];

    function update() {
      const v = Number(slider.value);
      if (valueEl) valueEl.textContent = `${v}%`;

      const found = labels.find((l) => v <= l.max) || labels[labels.length - 1];
      if (labelEl) labelEl.textContent = found.text;

      if (v >= 100) {
        exceedLove();
      }
    }

    let exceeded = false;
    function exceedLove() {
      if (exceeded) return;
      exceeded = true;
      if (valueEl) {
        if (window.gsap) {
          gsap.to(valueEl, {
            scale: 1.3,
            duration: 0.5,
            onComplete: () => {
              valueEl.textContent = "∞";
              gsap.fromTo(valueEl, { scale: 1.6, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.6 });
            },
          });
        } else {
          valueEl.textContent = "∞";
        }
      }
      if (labelEl) {
        labelEl.textContent = "ERROR: Love exceeds maximum capacity ❤️";
      }
      window.spawnHeartBurst?.(window.innerWidth / 2, window.innerHeight / 2, 20);
    }

    slider.addEventListener("input", update);
    update();
  }

  function initFinalSurprise() {
    const trigger = $("#final-surprise-btn");
    const sequence = $("#final-sequence");
    const textEl = $("#final-sequence-text");
    if (!trigger || !sequence || !textEl) return;

    const lines = [
      "Nida...",
      "Thank you for being you.",
      "Happy Birthday ❤️",
      "May this year be as beautiful as your smile.",
      "Kabir × Nida",
      "End of the surprise...\nbut definitely not the end of our story.",
    ];

    trigger.addEventListener("click", async () => {
      sequence.classList.add("is-active");
      if (window.gsap) {
        gsap.to(sequence, { opacity: 1, duration: 0.8 });
      } else {
        sequence.style.opacity = "1";
      }

      for (const line of lines) {
        textEl.textContent = "";
        textEl.style.whiteSpace = "pre-line";
        if (window.gsap && !prefersReducedMotion()) {
          await new Promise((resolve) => {
            gsap.fromTo(
              textEl,
              { opacity: 0, y: 20, filter: "blur(8px)" },
              {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.9,
                onStart: () => {
                  textEl.textContent = line;
                },
                onComplete: () => setTimeout(resolve, line.length > 40 ? 2200 : 1600),
              }
            );
          });
          await new Promise((resolve) => {
            gsap.to(textEl, {
              opacity: 0,
              duration: 0.45,
              onComplete: resolve,
            });
          });
        } else {
          textEl.textContent = line;
          textEl.style.opacity = "1";
          await new Promise((r) => setTimeout(r, 1800));
        }
      }

      // Stay on last line
      textEl.textContent = lines[lines.length - 1];
      if (window.gsap) gsap.to(textEl, { opacity: 1, duration: 0.6 });
      else textEl.style.opacity = "1";
    });
  }
});
