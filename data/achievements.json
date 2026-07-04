/* ========================================================================
   ui.js — Reusable UI helpers: SVG icons, sound, vibration, toast, theme
   ======================================================================== */

const ICONS = {
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M11 12h1v5h1"/></svg>',
  theme: '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  left: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.35 20.35 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a20.42 20.42 0 0 1-3.17 4.39M14.12 14.12A3 3 0 1 1 9.88 9.88M1 1l22 22"/></svg>',
  upload: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>',
  exit: '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
  shuffle: '<svg viewBox="0 0 24 24"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
  undo: '<svg viewBox="0 0 24 24"><path d="M3 7v6h6M3 13a9 9 0 1 0 3-7"/></svg>',
  redo: '<svg viewBox="0 0 24 24"><path d="M21 7v6h-6M21 13a9 9 0 1 1-3-7"/></svg>',
  share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
  install: '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M21 21H3"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14zM20 17v4H6.5"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3l8 4v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  trophy: '<svg viewBox="0 0 24 24"><path d="M8 21h8M12 17v4M17 4h4v3a4 4 0 0 1-4 4M7 4H3v3a4 4 0 0 0 4 4M17 4H7v6a5 5 0 0 0 10 0V4z"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2V10z"/></svg>'
};

const UI = {
  icons: ICONS,
  icon(name) { return ICONS[name] || ""; },

  playSound(type) {
    const s = window.PuzzleStorage.get().settings;
    if (!s.sound) return;
    try {
      const a = new Audio(`assets/sounds/${type}.wav`);
      a.volume = 0.6;
      a.play().catch(() => {});
    } catch {}
  },

  vibrate(ms = 15) {
    const s = window.PuzzleStorage.get().settings;
    if (s.vibration && navigator.vibrate) navigator.vibrate(ms);
  },

  toast(msg, ms = 1600) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove("show"), ms);
  },

  applyTheme(name) {
    let theme = name;
    if (theme === "auto") {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.body.classList.toggle("theme-dark", theme === "dark");
  },

  confetti(count = 60) {
    const colors = ["#c68a3f", "#e0a75e", "#ffb84d", "#8b5a22", "#f4d79b", "#7a4a1e"];
    for (let i = 0; i < count; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = colors[i % colors.length];
      c.style.animation = `fall ${1.6 + Math.random() * 1.4}s ${Math.random() * 0.4}s linear forwards`;
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3500);
    }
  },

  formatTime(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
};

/* Disable context menu, drag, selection globally for security */
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("dragstart", e => e.preventDefault());
document.addEventListener("selectstart", e => e.preventDefault());

window.PuzzleUI = UI;
