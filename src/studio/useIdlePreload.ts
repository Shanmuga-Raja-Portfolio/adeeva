import { useEffect } from "react";

const FALLBACK_DELAY_MS = 200;
const IDLE_TIMEOUT_MS = 2000;

function whenIdle(work: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(work, { timeout: IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(work, FALLBACK_DELAY_MS);
  return () => window.clearTimeout(handle);
}

export function useIdlePreload(loads: readonly (() => Promise<unknown>)[]): void {
  useEffect(() => {
    let stopped = false;
    let cancel = () => {};
    const next = (index: number) => {
      const load = loads[index];
      if (stopped || load === undefined) return;
      cancel = whenIdle(() => {
        const advance = () => next(index + 1);
        load().then(advance, advance);
      });
    };
    next(0);
    return () => {
      stopped = true;
      cancel();
    };
  }, [loads]);
}
