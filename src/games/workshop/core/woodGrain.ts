import { average } from "../../../engine/average";
import type { PartDef } from "../content/product";
import type { CommissionRun, PartPlacement, QuarterTurn } from "./commissionRun";
import { designParts, type RunPart } from "./pieceParts";

const ALONG_SCORE = 1;
const STUBBY_ACROSS_SCORE = 0.85;
const LONG_ACROSS_SCORE = 0.7;
const SKINNY_ACROSS_SCORE = 0.5;
export const SHOW_ME_GRAIN_CAP = 0.9;

export function aspectRatio(part: PartDef): number {
  return Math.max(part.width, part.height) / Math.min(part.width, part.height);
}

export function isAlongGrain(rotation: QuarterTurn): boolean {
  return rotation % 180 === 0;
}

export function woodGrain(part: PartDef, rotation: QuarterTurn): number {
  if (isAlongGrain(rotation)) return ALONG_SCORE;
  const aspect = aspectRatio(part);
  if (aspect < 1.5) return STUBBY_ACROSS_SCORE;
  if (aspect <= 2.5) return LONG_ACROSS_SCORE;
  return SKINNY_ACROSS_SCORE;
}

export function placementGrain(part: PartDef, placement: PartPlacement): number {
  const score = woodGrain(part, placement.rotation);
  return placement.assisted ? Math.min(SHOW_ME_GRAIN_CAP, score) : score;
}

export function runGrain(run: CommissionRun, parts: readonly RunPart[] = designParts(run)): number {
  if (parts.length === 0) return 0;
  return average(
    parts.map((part) => {
      const placement = Object.hasOwn(run.placements, part.id) ? run.placements[part.id] : undefined;
      return placement === undefined ? 0 : placementGrain(part, placement);
    }),
  );
}
