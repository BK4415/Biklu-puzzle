/* ========================================================================
   game.js — Pure sliding puzzle engine + solvable shuffle + solved layouts
   No DOM. No canvas.
   ======================================================================== */

/** Build a solved-layout array [1..n*n-1, 0] where 0 = empty. */
function solvedClassic(n) {
  const arr = [];
  for (let i = 1; i < n * n; i++) arr.push(i);
  arr.push(0);
  return arr;
}
function solvedUpsideDown(n) {
  const arr = [0];
  for (let i = n * n - 1; i >= 1; i--) arr.push(i);
  return arr.reverse().map((v, i, a) => a[a.length - 1 - i]).reverse();
  // simpler:
}
// Cleaner upside down: reverse of classic
function solvedUpsideDownV2(n) {
  const c = solvedClassic(n);
  return c.slice().reverse();
}
function solvedSpiral(n) {
  const g = Array.from({ length: n }, () => Array(n).fill(0));
  let x = 0, y = 0, dx = 1, dy = 0, num = 1;
  for (let i = 0; i < n * n; i++) {
    g[y][x] = num++;
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || nx >= n || ny < 0 || ny >= n || g[ny][nx] !== 0) {
      // rotate right
      [dx, dy] = [-dy, dx];
    }
    x += dx; y += dy;
  }
  const flat = g.flat();
  // Replace the largest (n*n) with 0 (empty)
  return flat.map(v => (v === n * n ? 0 : v));
}
function solvedSnake(n) {
  const arr = [];
  let num = 1;
  for (let r = 0; r < n; r++) {
    const row = [];
    for (let c = 0; c < n; c++) row.push(num++);
    if (r % 2 === 1) row.reverse();
    arr.push(...row);
  }
  return arr.map(v => (v === n * n ? 0 : v));
}

/** Get the solved layout for a given mode & size. */
function solvedFor(mode, n) {
  switch (mode) {
    case "upside": return solvedUpsideDownV2(n);
    case "spiral": return solvedSpiral(n);
    case "snake": return solvedSnake(n);
    case "classic":
    default: return solvedClassic(n);
  }
}

/** For photo mode, tile ids always run 1..n*n-1 in classic order (photo slice = id-1). */
function solvedPhoto(n) { return solvedClassic(n); }

/** Index math helpers. */
const rc = (i, n) => [Math.floor(i / n), i % n];
const idx = (r, c, n) => r * n + c;

/** Return indices adjacent to the empty cell. */
function movableIndices(board, n) {
  const e = board.indexOf(0);
  const [er, ec] = rc(e, n);
  const out = [];
  if (er > 0) out.push(idx(er - 1, ec, n));
  if (er < n - 1) out.push(idx(er + 1, ec, n));
  if (ec > 0) out.push(idx(er, ec - 1, n));
  if (ec < n - 1) out.push(idx(er, ec + 1, n));
  return out;
}

/** Attempt to slide tile at `i`. Supports full row/col slides (real puzzle rules). */
function tryMove(board, n, i) {
  const e = board.indexOf(0);
  if (i === e) return null;
  const [er, ec] = rc(e, n);
  const [tr, tc] = rc(i, n);
  if (er !== tr && ec !== tc) return null;

  const nb = board.slice();
  if (er === tr) {
    // same row: shift horizontally
    const dir = ec > tc ? -1 : 1; // empty moves toward tile
    for (let c = ec; c !== tc; c += dir) {
      nb[idx(er, c, n)] = nb[idx(er, c + dir, n)];
    }
    nb[i] = 0;
  } else {
    const dir = er > tr ? -1 : 1;
    for (let r = er; r !== tr; r += dir) {
      nb[idx(r, ec, n)] = nb[idx(r + dir, ec, n)];
    }
    nb[i] = 0;
  }
  return nb;
}

/** Shuffle by performing random legal moves — guaranteed solvable. */
function shuffle(solved, n, steps = 200) {
  let board = solved.slice();
  let last = -1;
  for (let s = 0; s < steps; s++) {
    const moves = movableIndices(board, n).filter(m => m !== last);
    const pick = moves[Math.floor(Math.random() * moves.length)];
    last = board.indexOf(0);
    board = tryMove(board, n, pick) || board;
  }
  // ensure not already solved
  if (board.every((v, i) => v === solved[i])) return shuffle(solved, n, steps);
  return board;
}

function isSolved(board, solved) {
  for (let i = 0; i < board.length; i++) if (board[i] !== solved[i]) return false;
  return true;
}

window.PuzzleGame = {
  solvedFor, solvedPhoto, solvedClassic,
  movableIndices, tryMove, shuffle, isSolved, rc, idx
};
