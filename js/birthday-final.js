/**
 * NIDA ❤️ — THE FINAL BIRTHDAY SURPRISE (SEPTEMBER 15)
 * Master Interactive Controller for birthday-final.html
 * 
 * Clean, modular, robust vanilla JavaScript powered by GSAP & Canvas.
 * Engineered with zero console errors and defensive guards.
 */

(function () {
  "use strict";

  // Configuration & Constants
  const CONFIG = {
    password: "01052025",
    recipient: "Nida",
    sender: "Kabir",
    birthdayDate: "September 15, 2026",
    audioSrc: "assets/audio/romantic.mp3",
    tapMessages: [
      "You're special.",
      "You're beautiful.",
      "You're loved.",
      "You're my favorite.",
      "Always smile.",
      "Love you ❤️"
    ],
    galleryData: [
      {
        src: "assets/images/nida-1.jpg",
        caption: "That smile ❤️",
        tag: "Memory 01 • Nida"
      },
      {
        src: "assets/images/nida-2.jpg",
        caption: "Beautiful, as always.",
        tag: "Memory 02 • Nida"
      },
      {
        src: "assets/images/couple-1.jpg",
        caption: "Us.",
        tag: "Memory 03 • Together"
      },
      {
        src: "assets/images/couple-2.jpg",
        caption: "My favorite kind of memory.",
        tag: "Memory 04 • Together"
      }
    ]
  };

  // State Management
  const state = {
    isUnlocked: false,
    tapCount: 0,
    hasMilestoneShown: false,
    isMeterOverloaded: false,
    isWishMade: false,
    isPlayingMusic: false,
    lightboxIndex: 0,
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    targetMouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    isReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    isTouch: window.matchMedia("(hover: none), (pointer: coarse)").matches || "ontouchstart" in window
  };

  // Safe DOM query helper
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  // Global Audio instance
  let audioPlayer = null;

  // Global Canvas and particle systems
  let canvas, ctx;
  let particles = [];
  let burstParticles = [];
  let animFrameId = null;

  /* ==========================================================================
     1. PARTICLE SYSTEM (Canvas 2D)
     ========================================================================== */
  function initParticles() {
    canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Initial background ambient particles & stars
    const particleCount = window.innerWidth < 768 ? 45 : 90;
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(createAmbientParticle());
    }

    function createAmbientParticle() {
      const types = ["star", "bokeh", "petal"];
      const type = types[Math.floor(Math.random() * types.length)];
      return {
        type: type,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: type === "bokeh" ? Math.random() * 4 + 2 : Math.random() * 2 + 1,
        speedY: -(Math.random() * 0.4 + 0.15),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleVal: Math.random() * Math.PI * 2,
        color: type === "petal" ? "#ff708f" : (Math.random() > 0.4 ? "#f4e0c4" : "#ffffff")
      };
    }

    // Animation Loop
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render Ambient Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.y += p.speedY;
        p.x += p.speedX;
        p.twinkleVal += p.twinkleSpeed;

        // Wrap around boundaries
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;

        // Twinkle factor
        const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.twinkleVal));

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        if (p.type === "bokeh") {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "petal") {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size * 2, p.size, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Render Explosive Burst Particles
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const bp = burstParticles[i];
        bp.x += bp.vx;
        bp.y += bp.vy;
        bp.vy += bp.gravity;
        bp.rotation += bp.rotSpeed;
        bp.life -= bp.decay;

        if (bp.life <= 0) {
          burstParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, bp.life);
        ctx.translate(bp.x, bp.y);
        ctx.rotate(bp.rotation);

        if (bp.isHeart) {
          ctx.fillStyle = bp.color;
          ctx.beginPath();
          const s = bp.size;
          ctx.moveTo(0, -s / 2);
          ctx.bezierCurveTo(-s, -s, -s * 1.3, s / 3, 0, s);
          ctx.bezierCurveTo(s * 1.3, s / 3, s, -s, 0, -s / 2);
          ctx.fill();
        } else {
          ctx.fillStyle = bp.color;
          ctx.beginPath();
          ctx.arc(0, 0, bp.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animFrameId = requestAnimationFrame(render);
    }
    render();
  }

  // Particle explosion trigger function
  function explodeParticles(x, y, count = 60, options = {}) {
    const colors = options.colors || ["#ff4d6d", "#ff708f", "#ffb3c1", "#f4e0c4", "#ffffff", "#ffd166"];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 7 + 2) * (options.power || 1);
      burstParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (options.lift || 1.5),
        size: Math.random() * 4 + 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: Math.random() * 0.02 + 0.012,
        gravity: 0.12,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        isHeart: options.hearts ? Math.random() > 0.4 : false
      });
    }
  }

  /* ==========================================================================
     2. CUSTOM CURSOR
     ========================================================================== */
  function initCursor() {
    if (state.isTouch || state.isReducedMotion) {
      document.body.classList.add("no-custom-cursor");
      return;
    }

    const dot = document.createElement("div");
    dot.className = "custom-cursor-dot";

    const ring = document.createElement("div");
    ring.className = "custom-cursor-ring";
    ring.innerHTML = '<span class="cursor-text">VIEW ❤️</span>';

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let ringX = window.innerWidth / 2;
    let ringY = window.innerHeight / 2;

    let cursorVisible = false;

    window.addEventListener("mousemove", (e) => {
      if (!cursorVisible) {
        cursorVisible = true;
        dot.classList.add("visible");
        ring.classList.add("visible");
      }
      state.targetMouse.x = e.clientX;
      state.targetMouse.y = e.clientY;
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });

    function updateRing() {
      ringX += (state.targetMouse.x - ringX) * 0.18;
      ringY += (state.targetMouse.y - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(updateRing);
    }
    requestAnimationFrame(updateRing);

    // Hover interactions
    const hoverTargets = $$("a, button, input, .interactive-tap-heart, .memory-card");
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        if (el.classList.contains("memory-card")) {
          document.body.classList.add("cursor-view");
        } else {
          document.body.classList.add("cursor-hover");
        }
      });
      el.addEventListener("mouseleave", () => {
        document.body.classList.remove("cursor-hover", "cursor-view");
      });
    });
  }

  /* ==========================================================================
     3. MOUSE PARALLAX
     ========================================================================== */
  function initParallax() {
    if (state.isTouch || state.isReducedMotion || !window.gsap) return;

    const heroBg = $(".hero-giant-heart-bg");
    const lightRay = $(".hero-light-ray");

    const moveHeroBgX = gsap.quickTo(heroBg, "x", { duration: 0.8, ease: "power2.out" });
    const moveHeroBgY = gsap.quickTo(heroBg, "y", { duration: 0.8, ease: "power2.out" });

    window.addEventListener("mousemove", (e) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;

      if (heroBg) {
        moveHeroBgX(normX * 24);
        moveHeroBgY(normY * 18);
      }
      if (lightRay) {
        gsap.to(lightRay, {
          x: normX * 35,
          y: normY * 20,
          duration: 1.2,
          ease: "power1.out"
        });
      }
    });

    // 3D Card tilt on hover
    const cards = $$(".cinematic-card");
    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -9;
        const rotateY = ((x - centerX) / centerX) * 9;

        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          scale: 1.03,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.6,
          ease: "power3.out"
        });
      });
    });
  }

  /* ==========================================================================
     4. SPLITTEXT HELPER (No Paid Plugins Required)
     ========================================================================== */
  function splitTextToSpans(element) {
    if (!element) return [];
    const text = element.textContent.trim();
    element.innerHTML = "";
    element.setAttribute("aria-label", text);

    const chars = [];
    const words = text.split(" ");

    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement("span");
      wordSpan.style.display = "inline-block";
      wordSpan.style.whiteSpace = "nowrap";

      for (let char of word) {
        const charSpan = document.createElement("span");
        charSpan.style.display = "inline-block";
        charSpan.style.opacity = "0";
        charSpan.textContent = char;
        wordSpan.appendChild(charSpan);
        chars.push(charSpan);
      }

      element.appendChild(wordSpan);

      if (wordIndex < words.length - 1) {
        const space = document.createTextNode(" ");
        element.appendChild(space);
      }
    });

    return chars;
  }

  /* ==========================================================================
     5. SECTION 1 & 2: PASSWORD LOCK & CINEMATIC UNLOCK
     ========================================================================== */
  function initPassword() {
    const form = $("#lock-form");
    const input = $("#lock-password-input");
    const submitBtn = $("#btn-lock-submit");
    const errorMsg = $("#lock-error-msg");
    const lockScreen = $("#lock-screen");

    if (!form || !input || !submitBtn) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const entered = input.value.trim();

      if (entered === CONFIG.password) {
        if (errorMsg) errorMsg.classList.remove("visible");
        unlockExperience();
      } else {
        // Wrong password
        if (errorMsg) {
          errorMsg.textContent = "Not quite... try again, birthday girl ❤️";
          errorMsg.classList.add("visible");
        }
        form.classList.remove("shake");
        void form.offsetWidth; // trigger reflow
        form.classList.add("shake");
        input.value = "";
        input.focus();
      }
    });
  }

  function unlockExperience() {
    if (state.isUnlocked) return;
    state.isUnlocked = true;

    const lockScreen = $("#lock-screen");
    const lockCard = $(".lock-card");
    const stage = $("#unlock-stage");
    const heartWrap = $("#unlock-heart");
    const heartLeft = $(".heart-half-left");
    const heartRight = $(".heart-half-right");
    const crackLine = $("#heart-crack-line");
    const burst = $("#unlock-burst");
    const line1 = $("#unlock-line-1");
    const line2 = $("#unlock-line-2");
    const line3 = $("#unlock-line-3");
    const line4 = $("#unlock-line-4");

    if (!window.gsap || state.isReducedMotion) {
      if (lockScreen) lockScreen.classList.add("unlocked");
      window.scrollTo({ top: 0, behavior: "smooth" });
      initScrollAnimations();
      return;
    }

    const tl = gsap.timeline();

    // 1. Button glows intensely
    tl.to("#btn-lock-submit", {
      scale: 1.05,
      boxShadow: "0 0 50px #ff4d6d, 0 0 90px #ff708f",
      duration: 0.5,
      ease: "power2.out"
    })
    // 2. Screen darkens, password box dissolves
    .to(lockCard, {
      opacity: 0,
      y: -30,
      filter: "blur(12px)",
      duration: 0.8,
      ease: "power3.in"
    })
    .to([".lock-eyebrow", ".lock-title"], {
      opacity: 0,
      y: -20,
      duration: 0.5
    }, "-=0.4")
    // 3. Activate cinematic stage & glowing heart appears
    .add(() => {
      stage.classList.add("active");
    })
    .fromTo(heartWrap, 
      { scale: 0, opacity: 0, rotate: -20 },
      { scale: 1, opacity: 1, rotate: 0, duration: 1, ease: "back.out(1.8)" }
    )
    // 4. Heart beats slowly (lub-dub)
    .to(heartWrap, { scale: 1.25, duration: 0.16, ease: "power1.out" })
    .to(heartWrap, { scale: 1, duration: 0.22, ease: "power1.in" })
    .to(heartWrap, { scale: 1.35, duration: 0.18, ease: "power1.out", delay: 0.1 })
    .to(heartWrap, { scale: 1, duration: 0.28, ease: "power1.in" })
    // 5. Heart cracks / open animation
    .to(crackLine, {
      strokeDashoffset: 0,
      opacity: 1,
      duration: 0.45,
      ease: "power2.inOut"
    }, "+=0.2")
    .to(heartLeft, {
      x: -35,
      rotate: -14,
      duration: 0.65,
      ease: "power3.out"
    })
    .to(heartRight, {
      x: 35,
      rotate: 14,
      duration: 0.65,
      ease: "power3.out"
    }, "<")
    // 6. Hundreds of tiny particles explode outward
    .add(() => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      explodeParticles(centerX, centerY, 140, { power: 1.8, hearts: true });
    }, "-=0.2")
    // 7. Warm radiant light expands from center
    .to(burst, {
      opacity: 1,
      scale: 45,
      duration: 1.2,
      ease: "power2.inOut"
    }, "-=0.4")
    // Hide cracked heart and dissolve burst gently
    .to(heartWrap, {
      opacity: 0,
      scale: 1.3,
      duration: 0.5,
      ease: "power2.in"
    }, "-=0.6")
    .to(burst, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.2")
    // 8. Fade lock screen out completely
    .to(lockScreen, {
      opacity: 0,
      duration: 0.6,
      onComplete: () => {
        lockScreen.classList.add("unlocked");
      }
    })
    // 9. SplitText reveal: "Happy Birthday", "Nida ❤️", "September 15, 2026", "From Kabir"
    .add(() => {
      const chars1 = splitTextToSpans(line1);
      splitTextToSpans(line2);
      line1.style.opacity = "1";
      line2.style.opacity = "1";

      gsap.fromTo(chars1,
        { opacity: 0, y: 30, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, stagger: 0.04, ease: "power3.out" }
      );
    })
    // Pause, then reveal "Nida ❤️"
    .add(() => {
      const chars2 = line2.querySelectorAll("span span");
      gsap.fromTo(chars2,
        { opacity: 0, scale: 0.7, filter: "blur(6px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.7, stagger: 0.06, ease: "back.out(1.6)" }
      );
    }, "+=0.9")
    // Pause, reveal "September 15, 2026"
    .to(line3, { opacity: 1, duration: 0.8, ease: "power2.out" }, "+=0.9")
    // Pause, reveal "From Kabir"
    .to(line4, { opacity: 1, duration: 0.8, ease: "power2.out" }, "+=0.5")
    // Pause, then smoothly dissolve stage into Hero scene
    .to(stage, {
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: () => {
        stage.classList.remove("active");
        stage.style.display = "none";
        initScrollAnimations();
        attemptAudioPlay();
      }
    }, "+=1.6");
  }

  /* ==========================================================================
     6. SCROLLTRIGGER CINEMATIC ANIMATIONS
     ========================================================================== */
  function initScrollAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    if (state.isReducedMotion) {
      $$(".cinematic-card, .letter-paragraph, .memory-card, .climax-line").forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    // Hero content entrance
    gsap.from(".hero-date-badge", { opacity: 0, y: -20, duration: 1, ease: "power2.out", delay: 0.2 });
    gsap.from(".hero-title", { opacity: 0, y: 40, duration: 1.2, ease: "power3.out", delay: 0.4 });
    gsap.from(".hero-subtitle", { opacity: 0, y: 30, duration: 1, ease: "power2.out", delay: 0.7 });
    gsap.from(".hero-reveal-quote", { opacity: 0, y: 25, duration: 1, ease: "power2.out", delay: 0.9 });
    gsap.from(".hero-scroll-indicator", { opacity: 0, duration: 1, delay: 1.3 });

    // "This Day Is Yours" Cards Stagger
    gsap.from(".cinematic-card", {
      scrollTrigger: {
        trigger: "#section-cards",
        start: "top 78%",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 60,
      rotateX: 15,
      filter: "blur(10px)",
      duration: 1,
      stagger: 0.2,
      ease: "power3.out"
    });

    // Letter From Kabir Line-By-Line / Paragraph Stagger
    const letterLines = $$(".letter-paragraph");
    gsap.from(letterLines, {
      scrollTrigger: {
        trigger: "#section-letter",
        start: "top 72%",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 30,
      duration: 0.9,
      stagger: 0.28,
      ease: "power2.out"
    });

    // Handwritten Signature Stroke Animation
    const sigPath = $(".signature-path");
    if (sigPath) {
      const pathLength = sigPath.getTotalLength() || 300;
      sigPath.style.strokeDasharray = pathLength;
      sigPath.style.strokeDashoffset = pathLength;

      gsap.to(sigPath, {
        scrollTrigger: {
          trigger: ".letter-signoff",
          start: "top 85%",
          toggleActions: "play none none none"
        },
        strokeDashoffset: 0,
        duration: 2.2,
        ease: "power2.inOut"
      });
    }

    // Gallery Cards Parallax & Entrance
    const galleryCards = $$(".memory-card");
    galleryCards.forEach((card, idx) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none none"
        },
        opacity: 0,
        y: 50,
        scale: 0.94,
        filter: "blur(8px)",
        duration: 1,
        delay: (idx % 2) * 0.15,
        ease: "power3.out"
      });
    });

    // Final Surprise Climax Lines Sequence (exact timeline as requested)
    const climaxSection = $("#section-climax");
    const climaxLines = $$(".climax-line");
    if (climaxSection && climaxLines.length >= 10) {
      const climaxTl = gsap.timeline({
        scrollTrigger: {
          trigger: climaxSection,
          start: "top 68%",
          toggleActions: "play none none none"
        }
      });

      // Initially show: "Wait..."
      climaxTl.to(climaxLines[0], { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" })
      // Then after 2 seconds: "There's one more thing."
      .to(climaxLines[1], { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "+=2.0")
      // Then: "Nida..."
      .to(climaxLines[2], { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "+=1.3")
      // Then: "Thank you for being you."
      .to(climaxLines[3], { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "+=1.1")
      // Then: "Thank you for every smile."
      .to(climaxLines[4], { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "+=1.1")
      // Then: "Every memory."
      .to(climaxLines[5], { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "+=1.1")
      // Then: "Every little moment."
      .to(climaxLines[6], { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "+=1.1")
      // Then: "Happy Birthday to the person who means so much to me."
      .to(climaxLines[7], { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }, "+=1.3")
      // Then huge: "NIDA ❤️"
      .to(climaxLines[8], {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.5,
        ease: "back.out(1.8)",
        onStart: () => {
          const rect = climaxLines[8].getBoundingClientRect();
          explodeParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 90, { power: 1.8, hearts: true });
        }
      }, "+=1.5")
      // Then: "Kabir × Nida"
      .to(climaxLines[9], { opacity: 1, y: 0, duration: 1.1, ease: "power2.out" }, "+=1.2");
    }

    // Section 11: Final Photo Overlay Reveal
    const photoSection = $("#section-final-photo");
    if (photoSection) {
      const photoTl = gsap.timeline({
        scrollTrigger: {
          trigger: photoSection,
          start: "top 62%",
          toggleActions: "play none none none"
        }
      });

      photoTl
        .from(".photo-overlay-line", { opacity: 0, y: 30, duration: 1.2, ease: "power2.out" })
        .from(".photo-overlay-highlight", { opacity: 0, y: 30, duration: 1.4, ease: "power2.out" }, "+=1.3")
        .from(".photo-overlay-tagline", { opacity: 0, scale: 0.9, duration: 1.2, ease: "back.out(1.5)" }, "+=1.1");
    }
  }

  /* ==========================================================================
     7. SECTION 6: OUR FOUR MEMORIES GALLERY & LIGHTBOX
     ========================================================================== */
  function initGallery() {
    const memoryCards = $$(".memory-card");
    const lightbox = $("#lightbox-modal");
    const lightboxImg = $("#lightbox-image");
    const lightboxCaption = $("#lightbox-caption");
    const closeBtn = $("#lightbox-close-btn");
    const prevBtn = $("#lightbox-prev-btn");
    const nextBtn = $("#lightbox-next-btn");

    if (!lightbox || !lightboxImg) return;

    function openLightbox(index) {
      state.lightboxIndex = (index + CONFIG.galleryData.length) % CONFIG.galleryData.length;
      const data = CONFIG.galleryData[state.lightboxIndex];
      lightboxImg.src = data.src;
      lightboxImg.alt = data.caption;
      if (lightboxCaption) lightboxCaption.textContent = data.caption;
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
    }

    memoryCards.forEach((card) => {
      card.addEventListener("click", () => {
        const index = parseInt(card.getAttribute("data-index") || "0", 10);
        openLightbox(index);
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (prevBtn) prevBtn.addEventListener("click", () => openLightbox(state.lightboxIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => openLightbox(state.lightboxIndex + 1));

    // Close on backdrop click
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target.classList.contains("lightbox-content-wrap")) {
        closeLightbox();
      }
    });

    // Keyboard support
    window.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("active")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") openLightbox(state.lightboxIndex - 1);
      if (e.key === "ArrowRight") openLightbox(state.lightboxIndex + 1);
    });
  }

  /* ==========================================================================
     8. SECTION 7: INTERACTIVE "TAP FOR LOVE"
     ========================================================================== */
  function initHeartInteraction() {
    const heartBtn = $("#interactive-heart");
    const countBadge = $("#tap-count-badge");
    const milestoneBanner = $("#tap-milestone-banner");
    const stageWrap = $(".heart-stage-wrap");

    if (!heartBtn) return;

    heartBtn.addEventListener("click", (e) => {
      state.tapCount++;
      if (countBadge) countBadge.textContent = `Love sparks sent: ${state.tapCount}`;

      // 1. Elastic heart bounce
      if (window.gsap) {
        gsap.fromTo(heartBtn,
          { scale: 0.88 },
          { scale: 1.15, duration: 0.4, ease: "elastic.out(1.5, 0.4)" }
        );
      }

      // 2. Spawn multiple particle hearts + sparkles
      const rect = heartBtn.getBoundingClientRect();
      const clickX = e.clientX || (rect.left + rect.width / 2);
      const clickY = e.clientY || (rect.top + rect.height / 2);

      explodeParticles(clickX, clickY, 18, {
        power: 1.3,
        hearts: true,
        lift: 2.5
      });

      // 3. Floating romantic message
      spawnFloatingLoveMessage(clickX, clickY);

      // 4. Milestone check at around 8 clicks
      if (state.tapCount >= 8 && !state.hasMilestoneShown) {
        state.hasMilestoneShown = true;
        if (milestoneBanner) {
          milestoneBanner.textContent = "Okay... that's enough love for one screen 😂❤️";
          milestoneBanner.classList.add("visible");

          setTimeout(() => {
            milestoneBanner.textContent = "Actually... never mind. There can never be enough.";
            explodeParticles(rect.left + rect.width / 2, rect.top, 50, { power: 1.5, hearts: true });
          }, 2400);
        }
      }
    });

    function spawnFloatingLoveMessage(x, y) {
      const msgText = CONFIG.tapMessages[Math.floor(Math.random() * CONFIG.tapMessages.length)];
      const msg = document.createElement("div");
      msg.className = "tap-floating-msg";
      msg.textContent = msgText;
      msg.style.left = `${x}px`;
      msg.style.top = `${y}px`;
      document.body.appendChild(msg);

      if (window.gsap) {
        gsap.fromTo(msg,
          { opacity: 1, y: 0, scale: 0.8 },
          {
            opacity: 0,
            y: -90,
            scale: 1.15,
            duration: 1.8,
            ease: "power2.out",
            onComplete: () => msg.remove()
          }
        );
      } else {
        setTimeout(() => msg.remove(), 1800);
      }
    }
  }

  /* ==========================================================================
     9. SECTION 8: LOVE METER
     ========================================================================== */
  function initLoveMeter() {
    const slider = $("#love-meter-slider");
    const display = $("#meter-val-text");
    const statusText = $("#meter-status-text");
    const finalStatement = $("#meter-statement");

    if (!slider || !display) return;

    slider.addEventListener("input", (e) => {
      if (state.isMeterOverloaded) return;
      const val = parseInt(e.target.value, 10);
      display.textContent = `${val}%`;

      // Status text updates
      if (val < 25) {
        statusText.textContent = "Measuring Kabir's love...";
        statusText.classList.remove("error-glitch");
      } else if (val < 50) {
        statusText.textContent = "Just getting started...";
        statusText.classList.remove("error-glitch");
      } else if (val < 75) {
        statusText.textContent = "Halfway? Impossible.";
        statusText.classList.remove("error-glitch");
      } else if (val < 99) {
        statusText.textContent = "Still not enough.";
        statusText.classList.remove("error-glitch");
      } else if (val === 99) {
        statusText.textContent = "Almost...";
        statusText.classList.remove("error-glitch");
      } else if (val >= 100) {
        triggerLoveMeterOverload();
      }
    });

    function triggerLoveMeterOverload() {
      state.isMeterOverloaded = true;
      slider.disabled = true;

      statusText.textContent = "ERROR";
      statusText.classList.add("error-glitch");

      // GSAP Counter Animation: 100% -> 101% -> 110% -> 150% -> 500% -> 1000% -> "∞"
      if (window.gsap) {
        const counterObj = { val: 100 };
        const tl = gsap.timeline();
        const targets = [100, 101, 110, 150, 500, 1000];

        targets.forEach((targetNum) => {
          tl.to(counterObj, {
            val: targetNum,
            duration: 0.22,
            ease: "power1.inOut",
            onUpdate: () => {
              display.textContent = `${Math.round(counterObj.val)}%`;
            }
          });
        });

        tl.add(() => {
          display.textContent = "∞";
          statusText.textContent = "Love level: Impossible to measure ❤️";
          statusText.classList.remove("error-glitch");
          if (finalStatement) finalStatement.classList.add("visible");

          // Celebrate with heart particle bursts
          const rect = display.getBoundingClientRect();
          explodeParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, 80, {
            power: 1.8,
            hearts: true
          });
        }, "+=0.15");
      } else {
        display.textContent = "∞";
        statusText.textContent = "Love level: Impossible to measure ❤️";
        statusText.classList.remove("error-glitch");
        if (finalStatement) finalStatement.classList.add("visible");
      }
    }
  }

  /* ==========================================================================
     10. SECTION 9: "MAKE A WISH"
     ========================================================================== */
  function initWish() {
    const wishBtn = $("#btn-make-wish");
    const flame = $("#candle-flame-elem");
    const revealedMsg = $("#wish-revealed-msg");
    const candleAura = $(".candle-aura");

    if (!wishBtn) return;

    wishBtn.addEventListener("click", () => {
      if (state.isWishMade) return;
      state.isWishMade = true;

      wishBtn.disabled = true;
      wishBtn.style.opacity = "0.4";
      wishBtn.style.cursor = "default";

      // 1. Candle flame grows brilliantly
      if (window.gsap) {
        gsap.to(flame, {
          scale: 1.65,
          filter: "drop-shadow(0 0 35px #ffffff)",
          duration: 0.7,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        });
        gsap.to(candleAura, {
          scale: 1.6,
          opacity: 1,
          duration: 0.7,
          yoyo: true,
          repeat: 1
        });
      }

      // 2. Particles rise & fill screen
      const rect = wishBtn.getBoundingClientRect();
      explodeParticles(rect.left + rect.width / 2, rect.top - 60, 90, {
        power: 1.4,
        lift: 3,
        colors: ["#f4e0c4", "#ffea79", "#ffffff", "#ffb3c1"]
      });

      // 3. Beautiful wish message appears
      if (revealedMsg) {
        revealedMsg.classList.add("visible");
        if (window.gsap) {
          gsap.from(".wish-line", {
            opacity: 0,
            y: 20,
            duration: 0.9,
            stagger: 0.45,
            ease: "power2.out"
          });
        }
      }
    });
  }

  /* ==========================================================================
     11. SECTION 13: MUSIC PLAYER (OPTIONAL AUDIO)
     ========================================================================== */
  function initMusic() {
    const musicBtn = $("#floating-music-btn");
    if (!musicBtn) return;

    audioPlayer = new Audio();
    audioPlayer.src = CONFIG.audioSrc;
    audioPlayer.loop = true;
    audioPlayer.preload = "auto";

    // Graceful error handling if file doesn't exist
    audioPlayer.addEventListener("error", () => {
      // Audio is optional; fail silently without console error
      musicBtn.title = "Add assets/audio/romantic.mp3 to enjoy music";
    });

    musicBtn.addEventListener("click", () => {
      if (state.isPlayingMusic) {
        audioPlayer.pause();
        state.isPlayingMusic = false;
        musicBtn.classList.remove("playing");
      } else {
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              state.isPlayingMusic = true;
              musicBtn.classList.add("playing");
            })
            .catch(() => {
              // Browser autoplay policy or missing audio file
              state.isPlayingMusic = false;
              musicBtn.classList.remove("playing");
            });
        }
      }
    });
  }

  function attemptAudioPlay() {
    if (!audioPlayer) return;
    const playPromise = audioPlayer.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          state.isPlayingMusic = true;
          const musicBtn = $("#floating-music-btn");
          if (musicBtn) musicBtn.classList.add("playing");
        })
        .catch(() => {
          // Autoplay prevented by browser, fine
        });
    }
  }

  /* ==========================================================================
     12. SECTION 12: REPLAY OUR SURPRISE
     ========================================================================== */
  function initReplay() {
    const replayBtn = $("#btn-replay");
    if (!replayBtn) return;

    replayBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Reset states softly after scrolling up
      setTimeout(() => {
        const lockScreen = $("#lock-screen");
        const lockCard = $(".lock-card");
        const stage = $("#unlock-stage");

        if (lockScreen && lockCard) {
          lockScreen.classList.remove("unlocked");
          lockScreen.style.opacity = "1";
          lockScreen.style.visibility = "visible";
          lockCard.style.opacity = "1";
          lockCard.style.transform = "none";
          lockCard.style.filter = "none";
          const input = $("#lock-password-input");
          if (input) input.value = "";
          if (stage) {
            stage.classList.remove("active");
            stage.style.display = "";
            stage.style.opacity = "0";
          }
          state.isUnlocked = false;
          state.tapCount = 0;
          state.hasMilestoneShown = false;
          state.isMeterOverloaded = false;
          state.isWishMade = false;

          const countBadge = $("#tap-count-badge");
          if (countBadge) countBadge.textContent = "Love sparks sent: 0";
          const milestoneBanner = $("#tap-milestone-banner");
          if (milestoneBanner) {
            milestoneBanner.classList.remove("visible");
            milestoneBanner.textContent = "";
          }

          const slider = $("#love-meter-slider");
          const meterDisplay = $("#meter-val-text");
          const meterStatus = $("#meter-status-text");
          const meterStatement = $("#meter-statement");
          if (slider) {
            slider.disabled = false;
            slider.value = 0;
          }
          if (meterDisplay) meterDisplay.textContent = "0%";
          if (meterStatus) {
            meterStatus.textContent = "Drag the slider to begin...";
            meterStatus.classList.remove("error-glitch");
          }
          if (meterStatement) meterStatement.classList.remove("visible");

          const wishBtn = $("#btn-make-wish");
          const revealedMsg = $("#wish-revealed-msg");
          if (wishBtn) {
            wishBtn.disabled = false;
            wishBtn.style.opacity = "";
            wishBtn.style.cursor = "";
          }
          if (revealedMsg) revealedMsg.classList.remove("visible");
        }
      }, 600);
    });
  }

  /* ==========================================================================
     MASTER INITIALIZATION
     ========================================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    initParticles();
    initCursor();
    initParallax();
    initPassword();
    initGallery();
    initHeartInteraction();
    initLoveMeter();
    initWish();
    initMusic();
    initReplay();
  });

})();
