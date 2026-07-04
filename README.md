# Board Puzzle

Premium HTML5 Number & Photo Sliding Puzzle — pure HTML/CSS/JS, no frameworks, no canvas, no libraries. Installable PWA, offline-first.

## Features
- Number mode: Classic / Spiral / Snake / Upside Down
- Photo mode: 5 presets + custom upload (center-cropped, no distortion) with Show Numbers toggle
- 3×3, 4×4, 5×5 grids
- Live preview board on the home screen (uses the same renderer as the real game)
- Real sliding puzzle mechanics with row/column multi-tile slides
- Guaranteed solvable shuffle, unlimited undo/redo, move counter, timer, auto-save & resume
- Statistics dashboard (best times, best moves, streaks, per-grid records, achievements)
- Wooden + Glassmorphism themes (Light, Dark, Auto)
- Sound, vibration, PWA install prompt, share
- Confetti + trophy win screen
- Offline first via Service Worker
- Image protection: context menu / drag / selection disabled

## Folder Structure
```
/
├── index.html      Home screen
├── game.html       Game screen
├── style.css       All styles (wooden + glass)
├── script.js       Home controller
├── game.js         Puzzle engine (solved layouts, tryMove, shuffle)
├── preview.js      Board renderer (used by home + game)
├── ui.js           SVG icons, sound, vibration, toast, theme, confetti
├── storage.js      LocalStorage wrapper (settings, stats, achievements, resume)
├── manifest.json   PWA manifest
├── sw.js           Service worker
├── data/           achievements, settings, themes JSON
├── pages/          about / guide / policy popup pages
└── assets/         logo, presets, sounds, images, icons (SVG in code)
```

## Customization
- **Replace logo:** overwrite `assets/logo.png` and both icons in `assets/icons/`.
- **Replace presets:** overwrite `assets/presets/preset-1.jpg` … `preset-5.jpg`.
- **Replace sounds:** overwrite `assets/sounds/click.wav` / `move.wav`.
- **Add new preset:** add file + entry in `script.js` (`PRESETS` array) and `game.html` label list.
- **Theme colors:** edit CSS variables in `style.css` (`:root` and `.theme-dark`).

## Build / Deploy
Zero build. Serve the `puzzle/` folder from any static host (Netlify, GitHub Pages, Cloudflare Pages, S3). For PWA/service-worker to work, serve over HTTPS or `localhost`.

## PWA
On mobile: Chrome/Edge → menu → **Add to Home Screen**. On desktop Chrome/Edge, an install icon appears in the address bar. The in-app *Install App* row also triggers the native prompt when available.
