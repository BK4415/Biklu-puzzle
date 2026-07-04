/* ==================================================================
   Board Puzzle — Home Screen Controller
   ================================================================== */
(function () {
  const S = window.PuzzleStorage, UI = window.PuzzleUI, G = window.PuzzleGame, P = window.PuzzlePreview;

  // ---------- Icon injection ----------
  const set = (id, name) => { const el = document.getElementById(id); if (el) el.innerHTML = UI.icon(name); };
  document.getElementById("btnInfo").innerHTML = UI.icon("info");
  document.getElementById("btnTheme").innerHTML = UI.icon("theme");
  document.querySelectorAll(".selector .arrow").forEach(a => {
    a.innerHTML = UI.icon(a.dataset.dir === "-1" ? "left" : "right");
  });
  document.getElementById("resumePlay").innerHTML = UI.icon("play");
  document.getElementById("uploadIcon").innerHTML = UI.icon("upload");
  document.getElementById("eyeIcon").innerHTML = UI.icon("eye");
  ["i1","i2","i3"].forEach(i => set(i, "right"));
  set("i4","install"); set("i5","share"); set("i6","right");

  // ---------- State ----------
  const s = S.get().settings;
  const state = {
    style: s.style,         // "number" | "photo"
    mode: s.mode,           // classic | spiral | snake | upside
    preset: s.preset,       // 1..5
    grid: s.grid,           // 3|4|5
    showNumbers: s.showNumbers,
    photo: null             // custom uploaded photo dataURL (session only)
  };
  UI.applyTheme(s.theme);

  const NUMBER_MODES = [
    { id: "classic", label: "Classic" },
    { id: "spiral",  label: "Spiral" },
    { id: "snake",   label: "Snake" },
    { id: "upside",  label: "Upside Down" }
  ];
  const PRESETS = [
    { id: 1, label: "Raj" },
    { id: 2, label: "Ronit" },
    { id: 3, label: "Aradhya" },
    { id: 4, label: "Lovely" },
    { id: 5, label: "Biklu" }
  ];

  // ---------- Preview render ----------
  const previewWrap = document.getElementById("previewWrap");
  function previewSize() { return Math.min(window.innerWidth - 60, 340); }

  function renderPreview() {
    const n = state.grid;
    const solved = state.style === "photo"
      ? G.solvedPhoto(n)
      : G.solvedFor(state.mode, n);
    P.renderBoard(previewWrap, {
      board: solved, n, style: state.style, mode: state.mode,
      preset: state.preset, photo: state.photo,
      showNumbers: state.showNumbers, size: previewSize(),
      interactive: false
    });
  }

  // ---------- Selectors ----------
  const styleVal = document.getElementById("styleVal");
  const modeVal = document.getElementById("modeVal");
  const photoTools = document.getElementById("photoTools");

  function refreshLabels() {
    styleVal.textContent = state.style === "photo" ? "Photo" : "Number";
    if (state.style === "photo") {
      modeVal.textContent = PRESETS.find(p => p.id === state.preset)?.label || "Raj";
      photoTools.style.display = "flex";
    } else {
      modeVal.textContent = NUMBER_MODES.find(m => m.id === state.mode)?.label || "Classic";
      photoTools.style.display = "none";
    }
    document.querySelectorAll(".pill").forEach(p => {
      p.classList.toggle("active", parseInt(p.dataset.n, 10) === state.grid);
    });
  }

  function saveSettings() {
    S.updateSettings({
      style: state.style, mode: state.mode, preset: state.preset,
      grid: state.grid, showNumbers: state.showNumbers
    });
  }

  function updateAll() { refreshLabels(); renderPreview(); saveSettings(); refreshResume(); }

  document.getElementById("styleSel").addEventListener("click", (e) => {
    const btn = e.target.closest(".arrow"); if (!btn) return;
    state.style = state.style === "number" ? "photo" : "number";
    UI.playSound("click"); UI.vibrate();
    updateAll();
  });

  document.getElementById("modeSel").addEventListener("click", (e) => {
    const btn = e.target.closest(".arrow"); if (!btn) return;
    const dir = parseInt(btn.dataset.dir, 10);
    UI.playSound("click"); UI.vibrate();
    if (state.style === "photo") {
      const i = PRESETS.findIndex(p => p.id === state.preset);
      state.preset = PRESETS[(i + dir + PRESETS.length) % PRESETS.length].id;
      state.photo = null; // clear custom on preset change
    } else {
      const i = NUMBER_MODES.findIndex(m => m.id === state.mode);
      state.mode = NUMBER_MODES[(i + dir + NUMBER_MODES.length) % NUMBER_MODES.length].id;
    }
    updateAll();
  });

  document.querySelectorAll(".pill").forEach(p => {
    p.addEventListener("click", () => {
      state.grid = parseInt(p.dataset.n, 10);
      UI.playSound("click"); UI.vibrate();
      updateAll();
    });
  });

  // Number toggle (photo)
  document.getElementById("numToggle").addEventListener("click", () => {
    state.showNumbers = !state.showNumbers;
    document.getElementById("eyeIcon").innerHTML = UI.icon(state.showNumbers ? "eye" : "eyeOff");
    document.getElementById("numLabel").textContent = state.showNumbers ? "Numbers" : "Hidden";
    UI.playSound("click");
    updateAll();
  });

  // Upload
  document.getElementById("fileInput").addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      // Center-crop to square via a hidden img+CSS trick: use image directly (background-size cover
      // already handles slicing correctly since we render each tile with the same background image
      // and position by percentage). To ensure no distortion we make a square via a temp image.
      const img = new Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        // Use SVG string to crop (no canvas as per requirement) → fallback: pass original,
        // rely on background-size (n*100%) & positioning; for non-square images center-crop
        // via an intermediate SVG data URL:
        const svg =
          `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>` +
          `<image href='${r.result}' x='${-sx}' y='${-sy}' width='${img.width}' height='${img.height}' preserveAspectRatio='none'/></svg>`;
        state.photo = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
        UI.toast("Photo loaded");
        updateAll();
      };
      img.src = r.result;
    };
    r.readAsDataURL(f);
  });

  // ---------- Resume card ----------
  const resumeCard = document.getElementById("resumeCard");
  const resumeVal = document.getElementById("resumeVal");
  function refreshResume() {
    const g = S.get().currentGame;
    if (g && !G.isSolved(g.board, g.solved)) {
      const label = g.style === "photo"
        ? (PRESETS.find(p => p.id === g.preset)?.label || "Photo")
        : (NUMBER_MODES.find(m => m.id === g.mode)?.label || "Classic");
      resumeVal.textContent = `${g.n}×${g.n} • ${label}`;
      resumeCard.style.display = "flex";
    } else {
      resumeCard.style.display = "none";
    }
  }
  resumeCard.addEventListener("click", () => { UI.playSound("click"); location.href = "game.html?resume=1"; });

  // ---------- Play ----------
  document.getElementById("btnPlay").addEventListener("click", () => {
    UI.playSound("click"); UI.vibrate(20);
    // if starting fresh, wipe currentGame so game.html builds new
    S.clearCurrentGame();
    // stash custom photo into settings-like session storage
    sessionStorage.setItem("boardPuzzle.photo", state.photo || "");
    location.href = "game.html";
  });

  // ---------- Theme ----------
  document.getElementById("btnTheme").addEventListener("click", () => {
    const order = ["auto","light","dark"];
    const cur = S.get().settings.theme;
    const next = order[(order.indexOf(cur) + 1) % order.length];
    S.updateSettings({ theme: next });
    UI.applyTheme(next);
    UI.toast("Theme: " + next);
    UI.playSound("click");
    document.getElementById("thVal").textContent = next.charAt(0).toUpperCase() + next.slice(1);
    updateAll();
  });

  // ---------- Panels ----------
  const overlay = document.getElementById("overlay");
  const panelL = document.getElementById("panelLeft");
  const panelR = document.getElementById("panelRight");
  function openPanel(p) { p.classList.add("open"); overlay.classList.add("show"); }
  function closePanels() { panelL.classList.remove("open"); panelR.classList.remove("open"); overlay.classList.remove("show"); }
  overlay.addEventListener("click", closePanels);

  document.getElementById("btnInfo").addEventListener("click", () => { UI.playSound("click"); openPanel(panelL); });

  // Swipe gestures to open panels
  let tx = 0, ty = 0;
  document.addEventListener("touchstart", e => { const t = e.touches[0]; tx = t.clientX; ty = t.clientY; }, { passive: true });
  document.addEventListener("touchend", e => {
    const t = e.changedTouches[0]; const dx = t.clientX - tx, dy = t.clientY - ty;
    if (Math.abs(dx) < 60 || Math.abs(dy) > 80) return;
    if (dx > 0 && tx < 40) openPanel(panelL);
    else if (dx < 0 && tx > window.innerWidth - 40) openPanel(panelR);
  });

  // Dashboard swipe from right edge — also allow opening via long-press theme (n/a). Add manual entry:
  // (Info panel's rows already cover most; dashboard opens via swipe from right edge on touch OR button below.)
  // Add a small dashboard trigger — double-tap logo.
  let lastTap = 0;
  document.querySelector(".logo").addEventListener("click", () => {
    const now = Date.now();
    if (now - lastTap < 400) { openPanel(panelR); refreshDashboard(); }
    lastTap = now;
  });

  // Info panel actions
  document.querySelectorAll("[data-doc]").forEach(row => {
    row.addEventListener("click", () => {
      UI.playSound("click");
      const doc = row.dataset.doc;
      const frame = document.getElementById("docFrame");
      frame.src = `pages/${doc}.html`;
      document.getElementById("docModal").classList.add("show");
    });
  });
  window.addEventListener("message", (e) => { if (e.data === "closeDoc") document.getElementById("docModal").classList.remove("show"); });
  document.getElementById("docModal").addEventListener("click", (e) => {
    if (e.target.id === "docModal") e.currentTarget.classList.remove("show");
  });

  // Toggles
  function bindSwitch(id, key) {
    const el = document.getElementById(id);
    const v = S.get().settings[key];
    el.classList.toggle("on", v);
    el.parentElement.addEventListener("click", () => {
      const cur = !S.get().settings[key];
      S.updateSettings({ [key]: cur });
      el.classList.toggle("on", cur);
      UI.playSound("click");
    });
  }
  bindSwitch("swMusic","music"); bindSwitch("swSound","sound"); bindSwitch("swVib","vibration");
  document.getElementById("thVal").textContent = (S.get().settings.theme || "auto").replace(/^./, c=>c.toUpperCase());
  document.getElementById("rowTheme").addEventListener("click", () => document.getElementById("btnTheme").click());

  document.getElementById("rowReset").addEventListener("click", () => {
    if (confirm("Reset all statistics and achievements?")) { S.resetStats(); UI.toast("Statistics reset"); refreshDashboard(); }
  });

  // ---------- Install PWA flow ----------
  let deferredPrompt = null;
  const installRow  = document.getElementById("rowInstall");
  const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  const INSTALL_DISMISS_KEY = "boardPuzzle.installDismissed";

  // Floating install banner (created on demand, once eligibility is known)
  function ensureInstallBanner() {
    let el = document.getElementById("installBanner");
    if (el) return el;
    el = document.createElement("div");
    el.id = "installBanner";
    el.className = "install-banner";
    el.innerHTML = `
      <div class="ib-icon">${UI.icon("install")}</div>
      <div class="ib-text">
        <b>Install Board Puzzle</b>
        <span>Play offline from your home screen</span>
      </div>
      <button class="ib-btn" id="ibInstall">Install</button>
      <button class="ib-close" id="ibClose" aria-label="Dismiss">×</button>`;
    document.body.appendChild(el);
    el.querySelector("#ibClose").addEventListener("click", () => {
      el.classList.remove("show");
      try { localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now())); } catch {}
    });
    el.querySelector("#ibInstall").addEventListener("click", () => triggerInstall());
    return el;
  }

  function shouldShowBanner() {
    if (isStandalone()) return false;
    try {
      const t = parseInt(localStorage.getItem(INSTALL_DISMISS_KEY) || "0", 10);
      // re-show after 7 days
      if (t && Date.now() - t < 7 * 24 * 60 * 60 * 1000) return false;
    } catch {}
    return true;
  }

  function showInstallAffordance() {
    if (!shouldShowBanner()) return;
    const el = ensureInstallBanner();
    requestAnimationFrame(() => el.classList.add("show"));
  }

  async function triggerInstall() {
    UI.playSound("click");
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice.catch(() => null);
      deferredPrompt = null;
      const banner = document.getElementById("installBanner");
      if (banner) banner.classList.remove("show");
      if (choice && choice.outcome === "accepted") UI.toast("Installing…");
      else UI.toast("Install cancelled");
    } else if (isIOS) {
      UI.toast("Tap Share → Add to Home Screen");
    } else if (isStandalone()) {
      UI.toast("Already installed");
    } else {
      UI.toast("Use browser menu → Add to Home Screen");
    }
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallAffordance();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    const banner = document.getElementById("installBanner");
    if (banner) banner.classList.remove("show");
    UI.toast("Installed! 🎉");
  });

  // iOS has no beforeinstallprompt — surface the banner ourselves
  if (isIOS && !isStandalone()) setTimeout(showInstallAffordance, 1200);

  installRow.addEventListener("click", triggerInstall);

  document.getElementById("rowShare").addEventListener("click", async () => {
    UI.playSound("click");
    const text = "Play Board Puzzle! I'll add link later.";
    if (navigator.share) { try { await navigator.share({ text }); } catch{} }
    else { try { await navigator.clipboard.writeText(text); UI.toast("Copied"); } catch { UI.toast(text); } }
  });

  // ---------- Dashboard ----------
  function refreshDashboard(){
    const st = S.get().stats;
    const winPct = st.played ? Math.round((st.won / st.played) * 100) : 0;
    const cards = [
      ["Played", st.played], ["Won", st.won], ["Win %", winPct + "%"],
      ["Current Streak", st.currentStreak], ["Longest Streak", st.longestStreak],
      ["Achievements", Object.keys(S.get().achievements).length]
    ];
    document.getElementById("statGrid").innerHTML = cards.map(([k,v]) =>
      `<div class="stat-card"><div class="k">${k}</div><div class="v">${v}</div></div>`).join("");
    const gr = ["3x3","4x4","5x5"].map(k => {
      const t = st.bestTimes[k], m = st.bestMoves[k];
      return `<div class="stat-card" style="grid-column:span 2;text-align:left;display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <b>${k}</b>
        <span style="opacity:.8;font-size:13px">${t ? UI.formatTime(t) : "--:--"} • ${m ?? "—"} moves</span>
      </div>`;
    }).join("");
    document.getElementById("gridRecords").innerHTML = gr;

    fetch("data/achievements.json").then(r=>r.json()).then(d => {
      const unlocked = S.get().achievements;
      document.getElementById("achList").innerHTML = d.achievements.map(a => {
        const u = !!unlocked[a.id];
        return `<div class="stat-card" style="grid-column:span 2;text-align:left;margin-bottom:6px;opacity:${u?1:.5}">
          <div class="k">${u ? "✓ Unlocked" : "Locked"}</div>
          <div class="v" style="font-size:14px">${a.name}</div>
          <div style="font-size:12px;opacity:.7">${a.desc}</div></div>`;
      }).join("");
    }).catch(()=>{});
  }

  // Initial render
  refreshLabels(); renderPreview(); refreshResume();

  window.addEventListener("resize", renderPreview);

  // React to system theme changes when in auto
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (S.get().settings.theme === "auto") UI.applyTheme("auto");
  });
})();
