import { isNeedleOnLine, type SeamProgress } from "../../../core";
import { TICK_SECONDS } from "../../../../../ui/kit/useTickLoop";

const MIN_SPEED = 70;
const MAX_SPEED = 230;
const RAMP_SECONDS = 2.2;
const STEER_RESPONSE = 14;
export const STEER_LIMIT = 1.3;

export interface SewSimulation {
  readonly progress: number;
  readonly offset: number;
  readonly holdSeconds: number;
  readonly ticks: number;
  readonly insideTicks: number;
  readonly onLine: boolean;
}

export interface SewInput {
  readonly held: boolean;
  readonly steer: number;
}

export function resumeSimulation(stored: SeamProgress | undefined): SewSimulation {
  return {
    progress: stored?.progress ?? 0,
    offset: 0,
    holdSeconds: 0,
    ticks: stored?.ticks ?? 0,
    insideTicks: stored?.insideTicks ?? 0,
    onLine: true,
  };
}

export function sewSpeed(holdSeconds: number): number {
  return MIN_SPEED + (MAX_SPEED - MIN_SPEED) * Math.min(1, holdSeconds / RAMP_SECONDS);
}

export function sewTick(
  sim: SewSimulation,
  input: SewInput,
  profile: readonly number[],
  band: number,
  seamLength: number,
): SewSimulation {
  const steer = Math.max(-STEER_LIMIT, Math.min(STEER_LIMIT, input.steer));
  const offset = sim.offset + (steer - sim.offset) * (1 - Math.exp(-TICK_SECONDS * STEER_RESPONSE));
  if (!input.held || sim.progress >= 1) return { ...sim, offset, holdSeconds: 0 };
  const holdSeconds = sim.holdSeconds + TICK_SECONDS;
  const progress = Math.min(1, sim.progress + (sewSpeed(holdSeconds) * TICK_SECONDS) / seamLength);
  const onLine = isNeedleOnLine(profile, progress, offset, band);
  return {
    progress,
    offset,
    holdSeconds,
    ticks: sim.ticks + 1,
    insideTicks: sim.insideTicks + (onLine ? 1 : 0),
    onLine,
  };
}
