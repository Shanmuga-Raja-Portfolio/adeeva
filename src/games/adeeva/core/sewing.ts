import { updateActiveRun } from "./activeRunUpdate";
import type { SeamProgress } from "./dressRun";
import type { GameState } from "./gameState";
import { ownEntry } from "../../../engine/ownEntry";
import { recordWithout } from "../../../engine/recordWithout";
import { requiredSeam } from "./requiredSeams";

const UNSEWN_SEAM: SeamProgress = { progress: 0, ticks: 0, insideTicks: 0, assisted: false };

export const MIN_TICKS_PER_SEAM = 60;
export const MAX_TICKS_PER_SEAM = 1200;

function isCount(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

function isWellFormed(sample: SeamProgress): boolean {
  return (
    Number.isFinite(sample.progress) &&
    sample.progress > 0 &&
    sample.progress <= 1 &&
    isCount(sample.ticks) &&
    isCount(sample.insideTicks) &&
    sample.insideTicks <= sample.ticks &&
    typeof sample.assisted === "boolean"
  );
}

function continuesSeam(existing: SeamProgress, sample: SeamProgress): boolean {
  const addedProgress = sample.progress - existing.progress;
  const addedTicks = sample.ticks - existing.ticks;
  const addedInside = sample.insideTicks - existing.insideTicks;
  return (
    existing.progress < 1 &&
    addedProgress > 0 &&
    addedTicks > 0 &&
    addedTicks >= addedProgress * MIN_TICKS_PER_SEAM &&
    addedTicks <= addedProgress * MAX_TICKS_PER_SEAM + 1 &&
    addedInside >= 0 &&
    addedInside <= addedTicks
  );
}

export function recordSeam(state: GameState, seamId: string, sample: SeamProgress): GameState {
  if (!isWellFormed(sample)) return state;
  return updateActiveRun(state, "sew", (run) => {
    if (requiredSeam(run.design, seamId) === undefined) return null;
    const existing = ownEntry(run.seams, seamId) ?? UNSEWN_SEAM;
    if (!continuesSeam(existing, sample)) return null;
    const stored: SeamProgress = {
      progress: sample.progress,
      ticks: sample.ticks,
      insideTicks: sample.insideTicks,
      assisted: existing.assisted || sample.assisted,
    };
    return { ...run, seams: { ...run.seams, [seamId]: stored } };
  });
}

export function resetSeam(state: GameState, seamId: string): GameState {
  return updateActiveRun(state, "sew", (run) => {
    if (requiredSeam(run.design, seamId) === undefined || ownEntry(run.seams, seamId) === undefined)
      return null;
    return { ...run, seams: recordWithout(run.seams, seamId) };
  });
}
