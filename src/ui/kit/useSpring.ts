import { useRef, useState } from "react";
import { TICK_SECONDS, useTickLoop } from "./useTickLoop";

export interface SpringFeel {
  readonly stiffness: number;
  readonly damping: number;
  readonly rest: number;
}

export function useSpring(target: number, still: boolean, feel: SpringFeel): number {
  const [shown, setShown] = useState(target);
  const motion = useRef({ value: target, speed: 0 });
  useTickLoop(!still && shown !== target, (count) => {
    const state = motion.current;
    for (let tick = 0; tick < count; tick += 1) {
      const pull = feel.stiffness * (target - state.value) - feel.damping * state.speed;
      state.speed += pull * TICK_SECONDS;
      state.value += state.speed * TICK_SECONDS;
    }
    if (Math.abs(target - state.value) < feel.rest && Math.abs(state.speed) < feel.rest) {
      state.value = target;
      state.speed = 0;
      setShown(target);
      return false;
    }
    setShown(state.value);
    return true;
  });
  if (still) return target;
  return shown;
}
