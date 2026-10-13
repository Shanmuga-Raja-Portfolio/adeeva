import type { FollowProgress } from "../../../../../engine/followRecord";
import { TICK_SECONDS } from "../../../../../ui/kit/useTickLoop";
import { isInStirBand, isStirring, lapDirection, MAX_SPOON_SPEED, STIR_CENTRE_SPEED } from "../../../core";

const FOLLOW_RATE = 14;
const SPLASH_FADE = 1.6;

export interface StirSim {
  readonly spoon: number;
  readonly finger: number | null;
  readonly progress: number;
  readonly ticks: number;
  readonly insideTicks: number;
  readonly speed: number;
  readonly splash: number;
}

export function resumeStir(stored: FollowProgress | null): StirSim {
  return {
    spoon: -Math.PI / 2,
    finger: null,
    progress: stored?.progress ?? 0,
    ticks: stored?.ticks ?? 0,
    insideTicks: stored?.insideTicks ?? 0,
    speed: 0,
    splash: 0,
  };
}

function shortest(delta: number): number {
  return Math.atan2(Math.sin(delta), Math.cos(delta));
}

export function stirTick(sim: StirSim, laps: number, halfWidth: number): StirSim {
  const splash = Math.max(0, sim.splash - SPLASH_FADE * TICK_SECONDS);
  if (sim.finger === null || sim.progress >= laps) return { ...sim, speed: 0, splash };
  const maxStep = MAX_SPOON_SPEED * TICK_SECONDS;
  const wanted = shortest(sim.finger - sim.spoon) * (1 - Math.exp(-FOLLOW_RATE * TICK_SECONDS));
  const step = Math.max(-maxStep, Math.min(maxStep, wanted));
  const speed = step / TICK_SECONDS;
  const spoon = sim.spoon + step;
  const rightWay = Math.sign(speed) === lapDirection(sim.progress);
  if (!isStirring(speed) || !rightWay) return { ...sim, spoon, speed, splash };
  const inside = isInStirBand(speed, halfWidth);
  const tooFast = Math.abs(speed) > STIR_CENTRE_SPEED + halfWidth;
  const lapEnd = Math.floor(sim.progress) + 1;
  const progress = Math.min(laps, Math.min(lapEnd, sim.progress + Math.abs(step) / (2 * Math.PI)));
  return {
    spoon,
    finger: sim.finger,
    progress,
    ticks: sim.ticks + 1,
    insideTicks: sim.insideTicks + (inside ? 1 : 0),
    speed,
    splash: tooFast ? 1 : splash,
  };
}
