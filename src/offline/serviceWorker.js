const BUILD = __MAKER_BUILD__;
const CACHE_PREFIX = "maker-studio-";
const CACHE_NAME = `${CACHE_PREFIX}${BUILD.version}`;
const SHELL_URL = "/";
const PRECACHE_LANES = 6;
const HOST_PATHS = ["/cdn-cgi/", "/sw.js"];
const SIGN_IN_FLAG = "signin";

function cacheable(response) {
  return response.status === 200 && response.type === "basic" && !response.redirected;
}

async function precacheAll() {
  const reused = await caches.has(CACHE_NAME);
  const cache = await caches.open(CACHE_NAME);
  const queue = [...BUILD.assets];
  const stop = new AbortController();
  const lane = async () => {
    for (let asset = queue.shift(); asset !== undefined && !stop.signal.aborted; asset = queue.shift()) {
      const response = await fetch(
        new Request(asset.url, {
          cache: "reload",
          redirect: "error",
          integrity: asset.integrity,
          signal: stop.signal,
        }),
      );
      if (!cacheable(response)) throw new Error(`Could not keep ${asset.url} for offline play`);
      await cache.put(asset.url, response);
    }
  };
  try {
    await Promise.all(Array.from({ length: PRECACHE_LANES }, lane));
  } catch (error) {
    stop.abort();
    if (!reused) await caches.delete(CACHE_NAME);
    throw error;
  }
}

async function dropOldCaches() {
  const names = await caches.keys();
  const old = names.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME);
  await Promise.all(old.map((name) => caches.delete(name)));
}

async function openShell(request) {
  const cache = await caches.open(CACHE_NAME);
  return (await cache.match(SHELL_URL)) ?? fetch(request);
}

function needsSignIn(response) {
  return (
    response.type === "opaqueredirect" ||
    (response.status >= 300 && response.status < 400) ||
    response.status === 401 ||
    response.status === 403
  );
}

async function signIn(request) {
  const cache = await caches.open(CACHE_NAME);
  const shell = await cache.match(SHELL_URL);
  const answer = await fetch(request).catch(() => null);
  if (answer !== null && (shell === undefined || needsSignIn(answer))) return answer;
  return shell ?? Response.error();
}

async function fromCache(request) {
  const cache = await caches.open(CACHE_NAME);
  const kept = await cache.match(request, { ignoreVary: true });
  return kept ?? fetch(request);
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheAll());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(dropOldCaches());
});

self.addEventListener("message", (event) => {
  if (event.data !== null && typeof event.data === "object" && event.data.type === "SKIP_WAITING")
    self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (HOST_PATHS.some((path) => url.pathname.startsWith(path))) return;
  if (request.mode === "navigate") {
    event.respondWith(url.searchParams.has(SIGN_IN_FLAG) ? signIn(request) : openShell(request));
    return;
  }
  if (request.headers.has("range")) return;
  event.respondWith(fromCache(request));
});
