import { useEffect, useState } from "react";

export function useCountUp(target: number, durationMs: number, delayMs: number, instant: boolean): number {
  const [value, setValue] = useState(instant ? target : 0);
  useEffect(() => {
    if (instant) return;
    let frame = 0;
    let begin: number | null = null;
    const step = (now: number) => {
      begin ??= now + delayMs;
      const t = Math.min(1, Math.max(0, (now - begin) / durationMs));
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs, delayMs, instant]);
  return instant ? target : value;
}
