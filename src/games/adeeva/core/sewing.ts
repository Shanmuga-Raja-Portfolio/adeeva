import { recordFollow, type FollowBounds } from "../../../engine/followRecord";
import { updateActiveRun } from "./activeRunUpdate";
import type { SeamProgress } from "./dressRun";
import type { GameState } from "./gameState";
import { ownEntry } from "../../../engine/ownEntry";
import { recordWithout } from "../../../engine/recordWithout";
import { requiredSeam } from "./requiredSeams";

export const MIN_TICKS_PER_SEAM = 60;
export const MAX_TICKS_PER_SEAM = 1200;

export const SEAM_BOUNDS: FollowBounds = {
  units: 1,
  minTicksPerUnit: MIN_TICKS_PER_SEAM,
  maxTicksPerUnit: MAX_TICKS_PER_SEAM,
};

export function recordSeam(state: GameState, seamId: string, sample: SeamProgress): GameState {
  return updateActiveRun(state, "sew", (run) => {
    if (requiredSeam(run.design, seamId) === undefined) return null;
    const stored = recordFollow(ownEntry(run.seams, seamId), sample, SEAM_BOUNDS);
    return stored === null ? null : { ...run, seams: { ...run.seams, [seamId]: stored } };
  });
}

export function resetSeam(state: GameState, seamId: string): GameState {
  return updateActiveRun(state, "sew", (run) => {
    if (requiredSeam(run.design, seamId) === undefined || ownEntry(run.seams, seamId) === undefined)
      return null;
    return { ...run, seams: recordWithout(run.seams, seamId) };
  });
}
