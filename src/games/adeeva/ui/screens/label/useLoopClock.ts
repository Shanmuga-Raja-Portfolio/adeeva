import { useEffect, useState } from "react";

export function useLoopClock(periodMs: number, running: boolean): number {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let origin: number | null = null;
    const tick = (now: number) => {
      origin ??= now;
      setPhase(((now - origin) % periodMs) / periodMs);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [periodMs, running]);
  return running ? phase : 0;
}
