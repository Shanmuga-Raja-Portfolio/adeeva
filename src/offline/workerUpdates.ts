type Listener = () => void;

const WORKER_URL = "/sw.js";
const listeners = new Set<Listener>();
let waiting: ServiceWorker | null = null;
let dismissed = false;
let restarting = false;

function notify(): void {
  for (const listener of listeners) listener();
}

function announce(worker: ServiceWorker | null): void {
  waiting = worker;
  dismissed = false;
  notify();
}

function offerWhenInstalled(worker: ServiceWorker | null): void {
  if (worker === null) return;
  const check = () => {
    if (worker.state === "installed" && navigator.serviceWorker.controller !== null) announce(worker);
  };
  check();
  worker.addEventListener("statechange", check);
}

function watch(registration: ServiceWorkerRegistration): void {
  if (registration.waiting !== null && navigator.serviceWorker.controller !== null)
    announce(registration.waiting);
  offerWhenInstalled(registration.installing);
  registration.addEventListener("updatefound", () => offerWhenInstalled(registration.installing));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") registration.update().catch(() => undefined);
  });
}

function register(): void {
  navigator.serviceWorker
    .register(WORKER_URL, { scope: "/", updateViaCache: "none" })
    .then(watch)
    .catch(() => undefined);
}

export function startOfflineSupport(): void {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (restarting) window.location.reload();
  });
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}

export function subscribeToUpdate(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function updateIsReady(): boolean {
  return waiting !== null && !dismissed;
}

export function dismissUpdate(): void {
  dismissed = true;
  notify();
}

export function restartIntoUpdate(): void {
  const worker = waiting;
  if (worker === null || worker.state !== "installed") {
    window.location.reload();
    return;
  }
  restarting = true;
  worker.postMessage({ type: "SKIP_WAITING" });
}
