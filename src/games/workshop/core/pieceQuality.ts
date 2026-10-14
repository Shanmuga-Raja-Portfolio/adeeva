import { average } from "../../../engine/average";
import { NEUTRAL_TAG } from "../content/woodTag";
import { woodById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import { cushionSeamAccuracy } from "./cushion";
import type { GameState } from "./gameState";
import { runJointAccuracy, seatedJointCount } from "./joint";
import { designJoints, designParts, designSurfaces } from "./pieceParts";
import { sandedSurfaceCount, surfaceScores } from "./sanding";
import { runSawAccuracy, sawnPartCount } from "./sawRecord";
import { runGrain } from "./woodGrain";

export const QUALITY_WEIGHTS = { saw: 0.25, join: 0.35, sand: 0.15, grain: 0.15, woodFit: 0.1 } as const;

export interface QualityBreakdown {
  readonly saw: number;
  readonly join: number;
  readonly sand: number;
  readonly grain: number;
  readonly woodFit: number;
  readonly quality: number;
}

export interface ConstructionCount {
  readonly parts: number;
  readonly sawn: number;
  readonly joints: number;
  readonly seated: number;
  readonly surfaces: number;
  readonly sanded: number;
}

function woodFits(run: CommissionRun): boolean {
  const woodId = run.design.woodId;
  if (woodId === null || run.brief.avoidWoods.includes(woodId)) return false;
  const tags = woodById(woodId).tags;
  return tags.includes(NEUTRAL_TAG) || run.brief.requiredTags.some((tag) => tags.includes(tag));
}

function runSandAccuracy(run: CommissionRun): number {
  const seam = cushionSeamAccuracy(run.cushion);
  const scores = [...surfaceScores(run), ...(seam === null ? [] : [seam])];
  return scores.length === 0 ? 0 : average(scores);
}

export function pieceQuality(state: GameState, run: CommissionRun): QualityBreakdown {
  const saw = runSawAccuracy(state, run);
  const join = runJointAccuracy(run);
  const sand = runSandAccuracy(run);
  const grain = runGrain(run);
  const woodFit = woodFits(run) ? 1 : 0;
  const weights = QUALITY_WEIGHTS;
  const raw =
    weights.saw * saw +
    weights.join * join +
    weights.sand * sand +
    weights.grain * grain +
    weights.woodFit * woodFit;
  return { saw, join, sand, grain, woodFit, quality: Math.round(100 * raw) };
}

export function constructionCount(state: GameState, run: CommissionRun): ConstructionCount {
  return {
    parts: designParts(run.design).length,
    sawn: sawnPartCount(state, run),
    joints: designJoints(run.design).length,
    seated: seatedJointCount(run),
    surfaces: designSurfaces(run.design).length,
    sanded: sandedSurfaceCount(run),
  };
}

export function isConstructionComplete(count: ConstructionCount): boolean {
  return (
    count.parts > 0 &&
    count.sawn === count.parts &&
    count.seated === count.joints &&
    count.sanded === count.surfaces
  );
}
