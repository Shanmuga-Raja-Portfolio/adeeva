import { useEffect, useRef } from "react";

export const TICKS_PER_SECOND = 60;
export const TICK_SECONDS = 1 / TICKS_PER_SECOND;
const MAX_TICKS_PER_FRAME = 6;
const MAX_FRAME_SECONDS = 0.1;

export function useTickLoop(running: boolean, onTicks: (count: number, seconds: number) => boolean): void {
  const callback = useRef(onTicks);
  useEffect(() => {
    callback.current = onTicks;
  });
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let last: number | null = null;
    let carry = 0;
    const step = (now: number) => {
      const seconds = last === null ? 0 : Math.min(MAX_FRAME_SECONDS, (now - last) / 1000);
      carry += seconds;
      last = now;
      let count = 0;
      while (carry >= TICK_SECONDS && count < MAX_TICKS_PER_FRAME) {
        carry -= TICK_SECONDS;
        count += 1;
      }
      if (!callback.current(count, seconds)) return;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [running]);
}
