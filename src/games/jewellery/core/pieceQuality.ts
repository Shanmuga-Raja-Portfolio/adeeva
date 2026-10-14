import { average } from "../../../engine/average";
import { roundShare as share } from "../../../engine/roundShare";
import { NEUTRAL_JEWEL_TAG, type JewelTag } from "../content/jewelTag";
import { metalById, productById, themeById } from "./catalog";
import { runCutPaths } from "./cutRecord";
import type { GameState } from "./gameState";
import { isJoinDone, joinAccuracy } from "./joiningLamp";
import { runJoints } from "./joinRecord";
import type { PieceRun } from "./pieceRun";
import { polishScore } from "./polish";
import { runSeats } from "./stoneSetting";

export const STONE_WEIGHTS = { cut: 0.3, join: 0.25, set: 0.25, polish: 0.1, metalFit: 0.1 } as const;
const NO_STONE_TOTAL = 1 - STONE_WEIGHTS.set;

export interface QualityBreakdown {
  readonly cut: number;
  readonly join: number;
  readonly set: number;
  readonly polish: number;
  readonly metalFit: number;
  readonly hasStones: boolean;
  readonly quality: number;
}

function cutScore(run: PieceRun): number {
  return average(runCutPaths(run).map((path) => run.cuts[path.id]?.accuracy ?? 0));
}

function joinScore(run: PieceRun): number {
  return average(
    runJoints(run).map((joint) => {
      const record = run.joins[joint.id];
      return record !== undefined && isJoinDone(record, joint.ticks) ? joinAccuracy(record) : 0;
    }),
  );
}

function setScore(run: PieceRun): number {
  return average(runSeats(run).map((seat) => run.sets[seat]?.accuracy ?? 0));
}

export function metalFit(run: PieceRun, wanted: readonly JewelTag[], avoided: readonly string[]): number {
  const metalId = run.design.metalId;
  if (metalId === null || avoided.includes(metalId)) return 0;
  const tags = metalById(metalId).tags;
  return tags.includes(NEUTRAL_JEWEL_TAG) || tags.some((tag) => wanted.includes(tag)) ? 1 : 0;
}

function runMetalFit(state: Pick<GameState, "marketTheme">, run: PieceRun): number {
  if (run.brief === null) return metalFit(run, themeById(state.marketTheme).tags, []);
  return metalFit(run, run.brief.requiredTags, run.brief.avoidMetals);
}

export function pieceQuality(state: Pick<GameState, "marketTheme">, run: PieceRun): QualityBreakdown {
  const hasStones = productById(run.design.productId).seats.length > 0;
  const cut = share(cutScore(run));
  const join = share(joinScore(run));
  const set = hasStones ? share(setScore(run)) : 0;
  const polish = share(polishScore(run));
  const fit = runMetalFit(state, run);
  const total = hasStones ? 1 : NO_STONE_TOTAL;
  const weighted =
    STONE_WEIGHTS.cut * cut +
    STONE_WEIGHTS.join * join +
    (hasStones ? STONE_WEIGHTS.set * set : 0) +
    STONE_WEIGHTS.polish * polish +
    STONE_WEIGHTS.metalFit * fit;
  return { cut, join, set, polish, metalFit: fit, hasStones, quality: Math.round((100 * weighted) / total) };
}
