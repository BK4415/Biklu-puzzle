/* ========================================================================
   storage.js — LocalStorage wrapper for Board Puzzle
   ======================================================================== */
const KEY = "boardPuzzle.v1";

const defaults = {
  settings: {
    music: true, sound: true, vibration: true, theme: "auto",
    grid: 3, style: "number", mode: "classic", preset: 1,
    showNumbers: true, language: "en"
  },
  stats: {
    played: 0, won: 0, currentStreak: 0, longestStreak: 0,
    bestTimes: {}, bestMoves: {}, perMode: {}
  },
  achievements: {},
  currentGame: null
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(defaults);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(defaults), ...parsed,
      settings: { ...defaults.settings, ...(parsed.settings || {}) },
      stats: { ...defaults.stats, ...(parsed.stats || {}) } };
  } catch { return structuredClone(defaults); }
}

let state = load();

const Storage = {
  get: () => state,
  save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} },
  updateSettings(patch) { state.settings = { ...state.settings, ...patch }; this.save(); },
  setCurrentGame(g) { state.currentGame = g; this.save(); },
  clearCurrentGame() { state.currentGame = null; this.save(); },

  /** Record a completed win and update bests + streaks. */
  recordWin({ grid, mode, moves, time }) {
    const s = state.stats;
    s.played++; s.won++; s.currentStreak++;
    if (s.currentStreak > s.longestStreak) s.longestStreak = s.currentStreak;
    const key = `${grid}x${grid}`;
    const isBestTime = !s.bestTimes[key] || time < s.bestTimes[key];
    const isBestMoves = !s.bestMoves[key] || moves < s.bestMoves[key];
    if (isBestTime) s.bestTimes[key] = time;
    if (isBestMoves) s.bestMoves[key] = moves;
    const mk = `${key}-${mode}`;
    if (!s.perMode[mk] || moves < s.perMode[mk].moves) s.perMode[mk] = { moves, time };
    this.save();
    return { isBestTime, isBestMoves };
  },
  recordPlay() { state.stats.played++; state.stats.currentStreak = 0; this.save(); },
  resetStats() { state.stats = structuredClone(defaults.stats); state.achievements = {}; this.save(); },
  unlock(id) { if (!state.achievements[id]) { state.achievements[id] = Date.now(); this.save(); return true; } return false; }
};

window.PuzzleStorage = Storage;
