/* ============================================================
   countdown.js — reusable countdown to Nida's birthday (Sept 15)
   ============================================================ */

function resolveBirthdayTarget(options = {}) {
  if (options.target instanceof Date) return options.target;
  if (typeof options.target === "string") {
    // Full local datetime: YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss
    const full = options.target.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (full) {
      return new Date(+full[1], +full[2] - 1, +full[3], +full[4], +full[5], +(full[6] || 0), 0);
    }
    // Date only → noon local (birthday moment)
    const m = options.target.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      return new Date(+m[1], +m[2] - 1, +m[3], 12, 0, 0, 0);
    }
    return new Date(options.target);
  }
  if (typeof window.getBirthdayDate === "function") {
    return window.getBirthdayDate();
  }
  const cfg = window.birthdayConfig;
  if (cfg?.birthdayYear) {
    return new Date(
      cfg.birthdayYear,
      cfg.birthdayMonth - 1,
      cfg.birthdayDay,
      cfg.birthdayHour ?? 12,
      cfg.birthdayMinute ?? 0,
      0,
      0
    );
  }
  // Fallback: September 15, 2026 at 12:00 PM local
  return new Date(2026, 8, 15, 12, 0, 0, 0);
}

function initCountdown(rootSelector = "[data-countdown]", options = {}) {
  const root = typeof rootSelector === "string"
    ? document.querySelector(rootSelector)
    : rootSelector;

  if (!root) return null;

  const target = resolveBirthdayTarget(options);

  const showDays = options.showDays !== false;
  const completeText = options.completeText || "It's time ❤️";

  root.innerHTML = "";
  root.setAttribute("role", "timer");
  root.setAttribute("aria-live", "polite");
  root.dataset.target = target.toString();

  const units = showDays
    ? [
        { key: "days", label: "Days" },
        { key: "hours", label: "Hours" },
        { key: "minutes", label: "Minutes" },
        { key: "seconds", label: "Seconds" },
      ]
    : [
        { key: "hours", label: "Hours" },
        { key: "minutes", label: "Minutes" },
        { key: "seconds", label: "Seconds" },
      ];

  const els = {};

  units.forEach((u) => {
    const unit = document.createElement("div");
    unit.className = "countdown__unit";
    unit.innerHTML = `
      <div class="countdown__value" data-unit="${u.key}">00</div>
      <div class="countdown__label">${u.label}</div>
    `;
    root.appendChild(unit);
    els[u.key] = unit.querySelector(".countdown__value");
  });

  let intervalId = null;
  let completed = false;

  function pad(n) {
    return String(Math.max(0, Math.floor(n))).padStart(2, "0");
  }

  function getRemaining() {
    const diff = target.getTime() - Date.now();

    if (diff <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (!showDays) {
      return {
        total: diff,
        hours: Math.floor(diff / 3600000),
        minutes,
        seconds,
      };
    }

    return { total: diff, days, hours, minutes, seconds };
  }

  function render() {
    const r = getRemaining();

    if (r.total <= 0) {
      if (!completed) {
        completed = true;
        root.innerHTML = `<p class="countdown-complete">${completeText}</p>`;
        if (typeof options.onComplete === "function") options.onComplete();
        if (intervalId) clearInterval(intervalId);
      }
      return;
    }

    if (showDays && els.days) els.days.textContent = pad(r.days);
    if (els.hours) els.hours.textContent = pad(r.hours);
    if (els.minutes) els.minutes.textContent = pad(r.minutes);
    if (els.seconds) els.seconds.textContent = pad(r.seconds);
  }

  render();
  intervalId = setInterval(render, 1000);

  return {
    destroy() {
      if (intervalId) clearInterval(intervalId);
    },
    getRemaining,
    target,
  };
}

window.initCountdown = initCountdown;
window.resolveBirthdayTarget = resolveBirthdayTarget;
