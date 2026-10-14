import { useEffect, useEffectEvent, useState } from "react";

export function useShowClock(durationMs: number, onDone: () => void): number {
  const [elapsed, setElapsed] = useState(0);
  const finish = useEffectEvent(onDone);
  useEffect(() => {
    let frame = 0;
    let origin: number | null = null;
    const tick = (now: number) => {
      origin ??= now;
      const value = Math.min(durationMs, now - origin);
      setElapsed(value);
      if (value < durationMs) frame = requestAnimationFrame(tick);
      else finish();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationMs]);
  return elapsed;
}
