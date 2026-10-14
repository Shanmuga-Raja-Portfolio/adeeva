import { ownEntry } from "../../../engine/ownEntry";
import type { MaterialId } from "../../../engine/palette";
import { recordWithout } from "../../../engine/recordWithout";
import type { SeamProgress } from "../../adeeva/core/dressRun";
import { SEAM_BOUNDS } from "../../adeeva/core/sewing";
import { recordFollow } from "../../../engine/followRecord";
import { findById } from "./catalog";
import { runSeams } from "./runPieces";
import type { FlipRun } from "./flipRun";
import { mainFind } from "./flipTags";
import { isSeamSewn } from "./seamSewn";
import type { GameState } from "./gameState";
import { updateRun } from "./runUpdate";

export function sewMaterial(run: FlipRun): MaterialId | null {
  const owned = mainFind(run);
  return owned === null ? null : findById(owned.findId).material;
}

function hasSeam(run: FlipRun, seamId: string): boolean {
  return runSeams(run).some((seam) => seam.id === seamId);
}

export function recordSeam(state: GameState, seamId: string, sample: SeamProgress): GameState {
  return updateRun(state, "sew", (run) => {
    if (!hasSeam(run, seamId)) return null;
    const stored = recordFollow(ownEntry(run.seams, seamId), sample, SEAM_BOUNDS);
    return stored === null ? null : { ...run, seams: { ...run.seams, [seamId]: stored } };
  });
}

export function resetSeam(state: GameState, seamId: string): GameState {
  return updateRun(state, "sew", (run) => {
    if (!hasSeam(run, seamId) || ownEntry(run.seams, seamId) === undefined) return null;
    return { ...run, seams: recordWithout(run.seams, seamId) };
  });
}

export function isSewingComplete(run: FlipRun): boolean {
  return runSeams(run).every((seam) => isSeamSewn(run, seam.id));
}
