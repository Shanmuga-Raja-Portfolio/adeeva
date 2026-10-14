import { updateActiveRun } from "../../../engine/activeRunUpdate";
import { cappedAccuracy } from "../../../engine/assistCap";
import type { MixDef } from "../content/mix";
import type { BakeAttempt, BakeRecord, BakeRun } from "./bakeRun";
import type { GameState } from "./gameState";
import { skillTolerance } from "./skillTolerance";
import { batchMix } from "./weigh";

export const HEAT_DOTS = 5;
export const HEAT_SPEEDUP = 0.16;
export const BASE_BAKE_WINDOW = 0.06;
export const OVEN_LAMP_MULTIPLIER = 1.2;
export const TIMING_FALLOFF = 0.25;
export const TURN_MOMENT = 0.5;
export const TURN_WINDOW = 0.15;
export const UNEVEN_SCORE = 0.6;
export const AUTO_OUT_MULTIPLE = 2;
export const REAL_SECONDS_PER_MINUTE = 0.3;
export const TOGETHER_BATCHES = [0, 1] as const;
export const TOGETHER_SMALL_SCALE = 0.75;

export const COLOUR_STOPS = ["pale", "light", "golden", "deep", "toasty"] as const;
export type ColourStop = (typeof COLOUR_STOPS)[number];

export function bakesTogether(run: BakeRun): boolean {
  return run.flourishes.includes("bake-together");
}

export function bakeTimeScale(run: BakeRun, batch: number): number {
  return bakesTogether(run) && batch === 1 ? TOGETHER_SMALL_SCALE : 1;
}

export function doneTime(mix: MixDef, heat: number, scale = 1): number {
  return mix.minutes * scale * (1 - HEAT_SPEEDUP * (heat - mix.idealHeat));
}

export function bakeShare(mix: MixDef, heat: number, minutes: number, scale = 1): number {
  return minutes / doneTime(mix, heat, scale);
}

export function colourStop(share: number): ColourStop {
  if (share < 0.8) return "pale";
  if (share < 0.94) return "light";
  if (share <= 1.06) return "golden";
  if (share <= 1.25) return "deep";
  return "toasty";
}

export function autoOutMinutes(mix: MixDef, heat: number, scale = 1): number {
  return Math.ceil(AUTO_OUT_MULTIPLE * doneTime(mix, heat, scale));
}

export function bakeWindow(state: GameState): number {
  return BASE_BAKE_WINDOW * skillTolerance(state, { upgrade: "oven-lamp", multiplier: OVEN_LAMP_MULTIPLIER });
}

export function heatScore(mix: MixDef, heat: number): number {
  return Math.max(0, 1 - 0.6 * Math.abs(heat - mix.idealHeat));
}

export function timingScore(share: number, window: number): number {
  const miss = Math.abs(share - 1);
  if (miss <= window) return 1;
  return Math.max(0, 1 - (miss - window) / TIMING_FALLOFF);
}

export function evenScore(mix: MixDef, heat: number, turnedMinutes: number | null, scale = 1): number {
  if (turnedMinutes === null) return UNEVEN_SCORE;
  const share = turnedMinutes / doneTime(mix, heat, scale);
  return Math.abs(share - TURN_MOMENT) <= TURN_WINDOW ? 1 : UNEVEN_SCORE;
}

export function bakeAccuracy(record: BakeAttempt, mix: MixDef, window: number, scale = 1): number {
  const share = bakeShare(mix, record.heat, record.takenMinutes, scale);
  const raw =
    0.2 * heatScore(mix, record.heat) +
    0.6 * timingScore(share, window) +
    0.2 * evenScore(mix, record.heat, record.turnedMinutes, scale);
  return cappedAccuracy(raw, record.assisted);
}

export function isBakeRecordValid(record: BakeAttempt, mix: MixDef, scale = 1): boolean {
  const { heat, turnedMinutes, takenMinutes } = record;
  if (!Number.isInteger(heat) || heat < 1 || heat > HEAT_DOTS) return false;
  if (!Number.isInteger(takenMinutes) || takenMinutes < 1 || takenMinutes > autoOutMinutes(mix, heat, scale))
    return false;
  if (
    turnedMinutes !== null &&
    (!Number.isInteger(turnedMinutes) || turnedMinutes < 1 || turnedMinutes >= takenMinutes)
  )
    return false;
  return typeof record.assisted === "boolean";
}

export function bakeBatch(state: GameState, batch: number, record: BakeAttempt): GameState {
  return updateActiveRun(state, "bake", (run) => {
    const mix = batchMix(run, batch);
    const entry = run.batches[batch];
    if (mix === null || entry === undefined || entry.stir === null || entry.bake !== null) return null;
    if (batch > 0 && run.batches[batch - 1]?.bake === null) return null;
    if (bakesTogether(run) && TOGETHER_BATCHES.some((paired) => paired === batch)) return null;
    if (!isBakeRecordValid(record, mix)) return null;
    const bake: BakeRecord = {
      heat: record.heat,
      turnedMinutes: record.turnedMinutes,
      takenMinutes: record.takenMinutes,
      assisted: record.assisted,
      window: bakeWindow(state),
    };
    return {
      ...run,
      batches: run.batches.map((current, index) => (index === batch ? { ...current, bake } : current)),
    };
  });
}
