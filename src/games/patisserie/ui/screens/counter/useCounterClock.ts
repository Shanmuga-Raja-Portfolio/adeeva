import { useEffect, useState } from "react";

const STEP_MS = 250;

export function useCounterClock(limitSeconds: number | null, onTimeUp: () => void): number {
  const [elapsed, setElapsed] = useState(0);
  const finished = limitSeconds !== null && elapsed >= limitSeconds;

  useEffect(() => {
    if (limitSeconds === null || finished) return;
    const handle = window.setInterval(() => {
      if (document.visibilityState === "visible") setElapsed((current) => current + STEP_MS / 1000);
    }, STEP_MS);
    return () => window.clearInterval(handle);
  }, [limitSeconds, finished]);

  useEffect(() => {
    if (finished) onTimeUp();
  }, [finished, onTimeUp]);

  return elapsed;
}
