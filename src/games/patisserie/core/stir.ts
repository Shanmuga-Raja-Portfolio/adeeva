import { updateActiveRun } from "../../../engine/activeRunUpdate";
import { recordFollow, type FollowProgress } from "../../../engine/followRecord";
import type { MixDef } from "../content/mix";
import type { GameState } from "./gameState";
import { skillTolerance } from "./skillTolerance";
import { batchMix } from "./weigh";

export const STIR_CENTRE_SPEED = 3.5;
export const BASE_STIR_HALF_WIDTH = 1;
export const STIFFNESS_NARROWING = 0.4;
export const ASSIST_STIR_WIDENING = 1.6;
export const MAX_SPOON_SPEED = 9;
export const MIN_SPOON_SPEED = 0.5;
export const MIN_TICKS_PER_LAP = 40;
export const MAX_TICKS_PER_LAP = 1200;

export function stirHalfWidth(state: GameState, mix: MixDef, assisted: boolean): number {
  const stiffness = 1 - STIFFNESS_NARROWING * mix.stiffness;
  const assist = assisted ? ASSIST_STIR_WIDENING : 1;
  return BASE_STIR_HALF_WIDTH * stiffness * skillTolerance(state, null) * assist;
}

export function isStirring(speed: number): boolean {
  return Math.abs(speed) >= MIN_SPOON_SPEED;
}

export function isInStirBand(speed: number, halfWidth: number): boolean {
  return Math.abs(Math.abs(speed) - STIR_CENTRE_SPEED) <= halfWidth;
}

export function lapDirection(lap: number): 1 | -1 {
  return Math.floor(lap) % 2 === 0 ? 1 : -1;
}

export function recordStir(state: GameState, batch: number, sample: FollowProgress): GameState {
  return updateActiveRun(state, "mix", (run) => {
    const mix = batchMix(run, batch);
    const entry = run.batches[batch];
    if (mix === null || entry === undefined || !entry.committed) return null;
    const stir = recordFollow(entry.stir ?? undefined, sample, {
      units: mix.laps,
      minTicksPerUnit: MIN_TICKS_PER_LAP,
      maxTicksPerUnit: MAX_TICKS_PER_LAP,
    });
    if (stir === null) return null;
    return {
      ...run,
      batches: run.batches.map((current, index) => (index === batch ? { ...current, stir } : current)),
    };
  });
}

export function stirDone(stir: FollowProgress | null, mix: MixDef): boolean {
  return stir !== null && stir.progress >= mix.laps;
}
