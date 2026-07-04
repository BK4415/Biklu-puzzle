/* ==========================================================================
   Board Puzzle — Service Worker
   Strategy:
     • Precache full app shell + data + assets on install (offline-first)
     • Navigations: network-first with cache fallback (fresh HTML when online)
     • Same-origin static (css/js/json/img/audio/svg): stale-while-revalidate
     • Cross-origin: pass-through
     • Version bump forces old caches to be purged on activate
   ========================================================================== */

const VERSION = "v4";
const CACHE   = `board-puzzle-${VERSION}`;
const SCOPE   = new URL(self.registration.scope);

/* Full app-shell manifest — every file the game needs to run offline */
const PRECACHE = [
  "./",
  "./index.html",
  "./game.html",
  "./manifest.json",
  "./style.css",
  "./script.js",
  "./game.js",
  "./preview.js",
  "./ui.js",
  "./storage.js",

  "./data/achievements.json",
  "./data/settings.json",
  "./data/themes.json",

  "./pages/about.html",
  "./pages/guide.html",
  "./pages/policy.html",

  "./assets/logo.png",
  "./assets/images/trophy.png",
  "./assets/sounds/click.wav",
  "./assets/sounds/move.wav",
  "./assets/presets/preset-1.jpg",
  "./assets/presets/preset-2.jpg",
  "./assets/presets/preset-3.jpg",
  "./assets/presets/preset-4.jpg",
  "./assets/presets/preset-5.jpg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

/* ---------- Install: precache everything, tolerate individual failures ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Add one-by-one so a single 404 does not abort the whole install
    await Promise.all(PRECACHE.map(async (url) => {
      try {
        const req = new Request(url, { cache: "reload" });
        const res = await fetch(req);
        if (res && (res.ok || res.type === "opaque")) await cache.put(url, res.clone());
      } catch (_) { /* ignore — will be fetched lazily later */ }
    }));
    await self.skipWaiting();
  })());
});

/* ---------- Activate: purge old versions, take control immediately ---------- */
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k.startsWith("board-puzzle-") && k !== CACHE)
          .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

/* ---------- Helpers ---------- */
const isSameOrigin = (url) => url.origin === SCOPE.origin;

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(req) || await cache.match("./index.html");
    if (cached) return cached;
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function staleWhileRevalidate(req) {
  const cache  = await caches.open(CACHE);
  const cached = await cache.match(req);
  const network = fetch(req).then((res) => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return cached || (await network) || new Response("Offline", { status: 503 });
}

/* ---------- Fetch router ---------- */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (!isSameOrigin(url)) return; // let the browser handle cross-origin

  // Navigations → network-first (falls back to cached index for offline SPA feel)
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(networkFirst(req));
    return;
  }

  // Everything else same-origin → stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req));
});

/* ---------- Message channel: allow page to trigger immediate activation ---------- */
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
