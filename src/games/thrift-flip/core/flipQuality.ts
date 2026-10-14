import { average } from "../../../engine/average";
import { roundShare } from "../../../engine/roundShare";
import { grainScore } from "../../adeeva/core/grainScore";
import { followAccuracy } from "../../../engine/followRecord";
import { cleanAccuracy } from "./clean";
import { flipPieces, flipSeams } from "./flipPieces";
import type { FlipRun } from "./flipRun";
import type { GameState } from "./gameState";
import { AUTO_LAYOUT_GRAIN_CAP } from "./layout";
import { restoredAverage } from "./restoration";
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

export interface QualityBreakdown extends Readonly<Record<QualityTerm, number>> {
  readonly quality: number;
}

function grainShare(run: FlipRun): number {
  const scores = flipPieces(run.design).map((piece) => {
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
      average(flipPieces(run.design).map((piece) => (run.cutDone ? (run.cutAccuracy[piece.id] ?? 0) : 0))),
    ),
    seams: roundShare(
      average(
        flipSeams(run.design).map((seam) => {
          const sewn = run.seams[seam.id];
          return sewn === undefined || sewn.progress < 1 ? 0 : followAccuracy(sewn);
        }),
      ),
    ),
    grain: roundShare(grainShare(run)),
    restored: roundShare(restoredAverage(state, run)),
  };
  const weighted = (Object.keys(QUALITY_WEIGHTS) as QualityTerm[]).reduce(
    (sum, term) => sum + QUALITY_WEIGHTS[term] * terms[term],
    0,
  );
  return { ...terms, quality: Math.round(100 * weighted) };
}
