import { average } from "../../../engine/average";
import { followAccuracy } from "../../../engine/followRecord";
import { roundShare } from "../../../engine/roundShare";
import { grainScore } from "../../adeeva/core/grainScore";
import { cleanAccuracy } from "./clean";
import type { FlipRun } from "./flipRun";
import type { GameState } from "./gameState";
import { AUTO_LAYOUT_GRAIN_CAP } from "./layout";
import { restoredAverage } from "./restoration";
import { runKind } from "./runKind";
import { runPieces, runSeams } from "./runPieces";
import { unpickAccuracy } from "./unpick";

export const QUALITY_WEIGHTS = {
  unpick: 0.15,
  clean: 0.05,
  cut: 0.25,
  seams: 0.35,
  grain: 0.05,
  restored: 0.15,
} as const;

export type QualityTerm = keyof typeof QUALITY_WEIGHTS;

export const MEND_QUALITY_WEIGHTS: Readonly<Record<QualityTerm, number>> = {
  unpick: 0.3,
  clean: 0.2,
  cut: 0,
  seams: 0.4,
  grain: 0,
  restored: 0.1,
};

export const ALTER_QUALITY_WEIGHTS: Readonly<Record<QualityTerm, number>> = {
  unpick: 0.2,
  clean: 0,
  cut: 0.3,
  seams: 0.4,
  grain: 0.1,
  restored: 0,
};

export interface QualityBreakdown extends Readonly<Record<QualityTerm, number>> {
  readonly quality: number;
}

export function qualityWeights(run: Pick<FlipRun, "brief">): Readonly<Record<QualityTerm, number>> {
  const kind = runKind(run);
  if (kind === "mend") return MEND_QUALITY_WEIGHTS;
  if (kind === "alter") return ALTER_QUALITY_WEIGHTS;
  return QUALITY_WEIGHTS;
}

function grainShare(run: FlipRun): number {
  const scores = runPieces(run).map((piece) => {
    const placement = run.placements[piece.id];
    return placement === undefined ? 0 : grainScore(piece, placement.rotation);
  });
  const value = average(scores);
  return run.autoLaid ? Math.min(AUTO_LAYOUT_GRAIN_CAP, value) : value;
}

export function flipQuality(state: Pick<GameState, "profile" | "upgrades">, run: FlipRun): QualityBreakdown {
  const terms: Record<QualityTerm, number> = {
    unpick: roundShare(unpickAccuracy(run)),
    clean: roundShare(cleanAccuracy(state, run)),
    cut: roundShare(
      average(runPieces(run).map((piece) => (run.cutDone ? (run.cutAccuracy[piece.id] ?? 0) : 0))),
    ),
    seams: roundShare(
      average(
        runSeams(run).map((seam) => {
          const sewn = run.seams[seam.id];
          return sewn === undefined || sewn.progress < 1 ? 0 : followAccuracy(sewn);
        }),
      ),
    ),
    grain: roundShare(grainShare(run)),
    restored: roundShare(restoredAverage(state, run)),
  };
  const weights = qualityWeights(run);
  const weighted = (Object.keys(QUALITY_WEIGHTS) as QualityTerm[]).reduce(
    (sum, term) => sum + weights[term] * terms[term],
    0,
  );
  return { ...terms, quality: Math.round(100 * weighted) };
}
