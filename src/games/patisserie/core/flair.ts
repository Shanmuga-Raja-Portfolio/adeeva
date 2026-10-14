import { average } from "../../../engine/average";
import { followAccuracy } from "../../../engine/followRecord";
import type { FlourishId } from "../content/flourish";
import { weighScore } from "./bakeQuality";
import type { BakeRun } from "./bakeRun";
import { RIBBON_MIX } from "./design";
import type { TouchScore } from "./fairState";
import { bakeAccuracy, bakeTimeScale, TOGETHER_BATCHES } from "./oven";
import { runPipePaths } from "./pipe";
import { stirDone } from "./stir";
import { batchMix } from "./weigh";

export const FLAIR_BASE = 40;
export const FLAIR_PER_TOUCH = 30;
export const DREAMER_FLAIR_BONUS = 10;
export const DREAMER_FLAIR_COLOURS = 3;

function ribbonStirAccuracy(run: BakeRun): number {
  return average(
    run.batches.flatMap((entry, batch) => {
      const mix = batchMix(run, batch);
      if (mix === null || mix.id !== RIBBON_MIX) return [];
      return [entry.stir !== null && stirDone(entry.stir, mix) ? followAccuracy(entry.stir) : 0];
    }),
  );
}

function togetherAccuracy(run: BakeRun): number {
  return average(
    TOGETHER_BATCHES.map((batch) => {
      const mix = batchMix(run, batch);
      const bake = run.batches[batch]?.bake ?? null;
      return mix === null || bake === null
        ? 0
        : bakeAccuracy(bake, mix, bake.window, bakeTimeScale(run, batch));
    }),
  );
}

function letteringAccuracy(run: BakeRun): number {
  return average(
    runPipePaths(run)
      .filter((path) => path.surface === "plaque")
      .map((path) => run.pipes[path.id]?.accuracy ?? 0),
  );
}

export function touchAccuracy(run: BakeRun, flourish: FlourishId): number {
  switch (flourish) {
    case "blind-scale":
      return weighScore(run);
    case "ribbon-stir":
      return ribbonStirAccuracy(run);
    case "bake-together":
      return togetherAccuracy(run);
    case "plaque-lettering":
      return letteringAccuracy(run);
  }
}

export function touchScores(run: BakeRun): TouchScore[] {
  return run.flourishes.map((flourish) => ({
    flourish,
    accuracy: Math.round(touchAccuracy(run, flourish) * 1000) / 1000,
  }));
}

export function flairScore(touches: readonly TouchScore[], dreamerColours: boolean): number {
  const sum = touches.reduce((total, touch) => total + touch.accuracy, 0);
  const dreamer = dreamerColours ? DREAMER_FLAIR_BONUS : 0;
  return Math.min(100, Math.round(FLAIR_BASE + FLAIR_PER_TOUCH * sum + dreamer));
}
