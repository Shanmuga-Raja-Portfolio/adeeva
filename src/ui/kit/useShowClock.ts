import { useEffect, useEffectEvent, useState } from "react";
import { nextShowElapsed } from "./showClockStep";

export function useShowClock(durationMs: number, onDone: () => void): number {
  const [elapsed, setElapsed] = useState(0);
  const finish = useEffectEvent(onDone);
  useEffect(() => {
    let frame = 0;
    let last: number | null = null;
    let played = 0;
    const tick = (now: number) => {
      played = nextShowElapsed(played, last === null ? 0 : now - last, durationMs);
      last = now;
      setElapsed(played);
      if (played < durationMs) frame = requestAnimationFrame(tick);
      else finish();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationMs]);
  return elapsed;
}
