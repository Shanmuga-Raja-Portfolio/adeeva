import { average } from "../../../engine/average";
import { followAccuracy } from "../../../engine/followRecord";
import { roundShare as share } from "../../../engine/roundShare";
import type { MixDef } from "../content/mix";
import { designMixes } from "./bakeNeeds";
import type { BakeRun } from "./bakeRun";
import type { Brief } from "./brief";
import { ingredientById } from "./catalog";
import { bakeAccuracy } from "./oven";
import { runPipePaths } from "./pipe";
import { stirDone } from "./stir";
import { batchMix } from "./weigh";
import { weighAccuracy } from "./weighAccuracy";

export const NEUTRAL_MIX_TAG = "classic";
export const ORDER_QUALITY_WEIGHTS = {
  weigh: 0.25,
  stir: 0.15,
  bake: 0.25,
  pipe: 0.3,
  flavourFit: 0.05,
} as const;
export const TRAY_QUALITY_WEIGHTS = { weigh: 0.35, stir: 0.25, bake: 0.4 } as const;

export interface QualityBreakdown {
  readonly weigh: number;
  readonly stir: number;
  readonly bake: number;
  readonly pipe: number;
  readonly flavourFit: number;
  readonly quality: number;
}

function batchMixes(run: BakeRun): { readonly mix: MixDef; readonly batch: number }[] {
  return run.design.mixIds.flatMap((_, batch) => {
    const mix = batchMix(run, batch);
    return mix === null ? [] : [{ mix, batch }];
  });
}

export function weighScore(run: BakeRun): number {
  return average(
    batchMixes(run).flatMap(({ mix, batch }) =>
      mix.weighed.map((amount) => {
        const record = run.batches[batch]?.weighs[amount.ingredient];
        return record === undefined
          ? 0
          : weighAccuracy(record, ingredientById(amount.ingredient), amount.grams, record.band);
      }),
    ),
  );
}

export function stirScore(run: BakeRun): number {
  return average(
    batchMixes(run).map(({ mix, batch }) => {
      const stir = run.batches[batch]?.stir ?? null;
      return stir !== null && stirDone(stir, mix) ? followAccuracy(stir) : 0;
    }),
  );
}

export function bakeScore(run: BakeRun): number {
  return average(
    batchMixes(run).map(({ mix, batch }) => {
      const bake = run.batches[batch]?.bake ?? null;
      return bake === null ? 0 : bakeAccuracy(bake, mix, bake.window);
    }),
  );
}

export function pipeScore(run: BakeRun): number {
  return average(runPipePaths(run).map((path) => run.pipes[path.id]?.accuracy ?? 0));
}

export function flavourFit(run: BakeRun, brief: Brief): number {
  return average(
    designMixes(run.design).map((mix) => {
      if (brief.avoidMixes.includes(mix.id)) return 0;
      return mix.tags.some((tag) => tag === NEUTRAL_MIX_TAG || brief.requiredTags.includes(tag)) ? 1 : 0;
    }),
  );
}

export function bakeQuality(run: BakeRun): QualityBreakdown {
  const weigh = share(weighScore(run));
  const stir = share(stirScore(run));
  const bake = share(bakeScore(run));
  if (run.brief === null) {
    const weights = TRAY_QUALITY_WEIGHTS;
    const weighted = weights.weigh * weigh + weights.stir * stir + weights.bake * bake;
    return { weigh, stir, bake, pipe: 0, flavourFit: 0, quality: Math.round(100 * weighted) };
  }
  const pipe = share(pipeScore(run));
  const fit = share(flavourFit(run, run.brief));
  const weights = ORDER_QUALITY_WEIGHTS;
  const weighted =
    weights.weigh * weigh +
    weights.stir * stir +
    weights.bake * bake +
    weights.pipe * pipe +
    weights.flavourFit * fit;
  return { weigh, stir, bake, pipe, flavourFit: fit, quality: Math.round(100 * weighted) };
}
