/* ========================================================================
   preview.js — Renders a board (used by both live preview & real game).
   renderBoard(container, options)
   options: { board, solved, n, style, mode, preset, photo (dataURL|null),
              showNumbers, size, interactive, onMove }
   ======================================================================== */

function photoSrc(preset, custom) {
  if (custom) return custom;
  return `assets/presets/preset-${preset}.jpg`;
}

/** Build a full board element. */
function renderBoard(container, o) {
  const { board, n, style, showNumbers, size, interactive = false, photo, preset } = o;
  container.innerHTML = "";
  const boardEl = document.createElement("div");
  boardEl.className = "board";
  boardEl.style.width = size + "px";
  boardEl.style.height = size + "px";
  // Allow swipes to be captured without page scrolling / native gestures
  if (interactive) boardEl.style.touchAction = "none";

  const inner = document.createElement("div");
  inner.className = "board-inner";
  inner.style.gridTemplateColumns = `repeat(${n},1fr)`;
  inner.style.width = "100%";
  inner.style.height = "100%";
  boardEl.appendChild(inner);

  const src = style === "photo" ? photoSrc(preset, photo) : null;
  const fontSize = Math.max(10, (size / n) * (n === 3 ? 0.42 : n === 4 ? 0.34 : 0.26));

  board.forEach((val, i) => {
    const t = document.createElement("div");
    t.className = "tile" + (val === 0 ? " empty" : "") + (style === "photo" && val !== 0 ? " photo" : "");
    t.style.fontSize = fontSize + "px";
    t.dataset.index = i;
    t.dataset.value = val;

    if (val !== 0) {
      if (style === "photo" && src) {
        const idx = val - 1;
        const r = Math.floor(idx / n), c = idx % n;
        t.style.backgroundImage = `url("${src}")`;
        t.style.backgroundSize = `${n * 100}% ${n * 100}%`;
        t.style.backgroundPosition = `${(c / (n - 1)) * 100}% ${(r / (n - 1)) * 100}%`;
        if (showNumbers) {
          const num = document.createElement("span");
          num.className = "num";
          num.textContent = val;
          t.appendChild(num);
        }
      } else {
        const num = document.createElement("span");
        num.className = "num";
        num.textContent = val;
        t.appendChild(num);
      }
    }
    inner.appendChild(t);
  });

  container.appendChild(boardEl);
  return boardEl;
}

/**
 * Attach unified pointer (touch + mouse) handling to a board container.
 *   • Tap on a tile → slide that tile (row/column slide if applicable).
 *   • Swipe left/right/up/down → slide the tile(s) between the empty cell
 *     and the touched tile in that direction.
 *
 * The container is expected to hold `.tile[data-index]` children.
 * Listener is attached once; it keeps working after re-renders because it
 * lives on the outer wrapper, not on individual tiles.
 */
function attachSwipe(container, getState, onMove) {
  if (container.__swipeBound) return;
  container.__swipeBound = true;

  const TAP_MAX = 10;      // px — below this counts as a tap
  const SWIPE_MIN = 22;    // px — minimum travel to register as swipe

  let sx = 0, sy = 0, sIdx = -1, active = false;

  const getTileIndex = (target) => {
    const tile = target && target.closest && target.closest(".tile");
    if (!tile || tile.classList.contains("empty")) return -1;
    return parseInt(tile.dataset.index, 10);
  };

  const start = (e) => {
    const point = e.touches ? e.touches[0] : e;
    const idx = getTileIndex(document.elementFromPoint(point.clientX, point.clientY));
    if (idx < 0) return;
    active = true;
    sIdx = idx;
    sx = point.clientX; sy = point.clientY;
  };

  const move = (e) => {
    // Block scroll while a swipe on the board is in progress
    if (active && e.cancelable) e.preventDefault();
  };

  const end = (e) => {
    if (!active) return;
    active = false;
    const point = e.changedTouches ? e.changedTouches[0] : e;
    const dx = point.clientX - sx;
    const dy = point.clientY - sy;
    const ax = Math.abs(dx), ay = Math.abs(dy);

    const { board, n } = getState();
    const empty = board.indexOf(0);
    const tRow = Math.floor(sIdx / n), tCol = sIdx % n;
    const eRow = Math.floor(empty / n), eCol = empty % n;

    // Tap → move that tile (row/col slide handled by engine)
    if (ax < TAP_MAX && ay < TAP_MAX) { onMove(sIdx); return; }
    if (Math.max(ax, ay) < SWIPE_MIN) return;

    let dir; // "left" | "right" | "up" | "down"
    if (ax > ay) dir = dx < 0 ? "left" : "right";
    else         dir = dy < 0 ? "up"   : "down";

    // Swipe only slides when the empty cell lies on the correct side
    // relative to the swiped tile along the swipe axis.
    let valid = false;
    if (dir === "left"  && eRow === tRow && eCol <  tCol) valid = true;
    if (dir === "right" && eRow === tRow && eCol >  tCol) valid = true;
    if (dir === "up"    && eCol === tCol && eRow <  tRow) valid = true;
    if (dir === "down"  && eCol === tCol && eRow >  tRow) valid = true;

    if (valid) onMove(sIdx);
  };

  container.addEventListener("touchstart", start, { passive: true });
  container.addEventListener("touchmove",  move,  { passive: false });
  container.addEventListener("touchend",   end);
  container.addEventListener("touchcancel", () => { active = false; });
  container.addEventListener("mousedown", start);
  container.addEventListener("mouseup",   end);
  container.addEventListener("mouseleave", () => { active = false; });
}

window.PuzzlePreview = { renderBoard, attachSwipe, photoSrc };
