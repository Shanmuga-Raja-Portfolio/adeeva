type Listener = () => void;
export type SignInState = "signed-in" | "signed-out" | "unknown";

const PROBE_URL = "/sw.js";
const SIGN_IN_FLAG = "signin";
const listeners = new Set<Listener>();
let state: SignInState = "unknown";
let asked = 0;

export function readSignIn(response: Pick<Response, "type" | "status">): SignInState {
  if (response.type === "opaqueredirect") return "signed-out";
  if (response.status >= 300 && response.status < 400) return "signed-out";
  if (response.status === 401 || response.status === 403) return "signed-out";
  return response.status === 200 ? "signed-in" : "unknown";
}

function settle(next: SignInState): void {
  if (next === "unknown" || next === state) return;
  state = next;
  for (const listener of listeners) listener();
}

function probe(): void {
  if (!navigator.onLine) return;
  asked += 1;
  const ticket = asked;
  fetch(PROBE_URL, { method: "HEAD", cache: "no-store", redirect: "manual", credentials: "same-origin" })
    .then((response) => {
      if (ticket === asked) settle(readSignIn(response));
    })
    .catch(() => undefined);
}

function forgetSignInFlag(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(SIGN_IN_FLAG)) return;
  url.searchParams.delete(SIGN_IN_FLAG);
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

export function watchSignIn(): void {
  forgetSignInFlag();
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  if (navigator.serviceWorker.controller === null) return;
  probe();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") probe();
  });
  window.addEventListener("online", probe);
}

export function subscribeToSignIn(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function signInState(): SignInState {
  return state;
}

export function signInAgain(): void {
  window.location.assign(`/?${SIGN_IN_FLAG}=1`);
}
