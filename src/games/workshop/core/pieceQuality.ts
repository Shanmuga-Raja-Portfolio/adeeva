import { average } from "../../../engine/average";
import { NEUTRAL_TAG } from "../content/woodTag";
import { productById, woodById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import { cushionSeamAccuracy } from "./cushion";
import type { GameState } from "./gameState";
import { runJointAccuracy, seatedJointCount } from "./joint";
import {
  designJoints,
  designParts,
  designSurfaces,
  partsOfPiece,
  runPieces,
  type RunJoint,
  type RunPart,
} from "./pieceParts";
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

interface RunScope {
  readonly parts: readonly RunPart[];
  readonly joints: readonly RunJoint[];
  readonly surfaces: readonly RunPart[];
  readonly seat: boolean;
}

function runScope(run: CommissionRun, piece: number | null): RunScope {
  const parts = designParts(run);
  const joints = designJoints(run);
  const surfaces = designSurfaces(run);
  if (piece === null)
    return {
      parts,
      joints,
      surfaces,
      seat: runPieces(run).some((entry) => productById(entry.productId).seat),
    };
  const product = runPieces(run).find((entry) => entry.index === piece)?.productId;
  return {
    parts: partsOfPiece(parts, piece),
    joints: partsOfPiece(joints, piece),
    surfaces: partsOfPiece(surfaces, piece),
    seat: product !== undefined && productById(product).seat,
  };
}

function runSandAccuracy(run: CommissionRun, scope: RunScope): number {
  const seam = scope.seat ? cushionSeamAccuracy(run.cushion) : null;
  const scores = [...surfaceScores(run, scope.surfaces), ...(seam === null ? [] : [seam])];
  return scores.length === 0 ? 0 : average(scores);
}

export function pieceQuality(
  state: GameState,
  run: CommissionRun,
  piece: number | null = null,
): QualityBreakdown {
  const scope = runScope(run, piece);
  const saw = runSawAccuracy(state, run, scope.parts);
  const join = runJointAccuracy(run, scope.joints);
  const sand = runSandAccuracy(run, scope);
  const grain = runGrain(run, scope.parts);
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
  const scope = runScope(run, null);
  return {
    parts: scope.parts.length,
    sawn: sawnPartCount(state, run, scope.parts),
    joints: scope.joints.length,
    seated: seatedJointCount(run, scope.joints),
    surfaces: scope.surfaces.length,
    sanded: sandedSurfaceCount(run, scope.surfaces),
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
