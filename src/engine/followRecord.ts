import { cappedAccuracy } from "./assistCap";
import { isCount } from "./count";

export interface FollowProgress {
  readonly progress: number;
  readonly ticks: number;
  readonly insideTicks: number;
  readonly assisted: boolean;
}

export interface FollowBounds {
  readonly units: number;
  readonly minTicksPerUnit: number;
  readonly maxTicksPerUnit: number;
}

export const UNSTARTED_FOLLOW: FollowProgress = { progress: 0, ticks: 0, insideTicks: 0, assisted: false };

function isWellFormed(sample: FollowProgress, units: number): boolean {
  return (
    Number.isFinite(sample.progress) &&
    sample.progress > 0 &&
    sample.progress <= units &&
    isCount(sample.ticks) &&
    isCount(sample.insideTicks) &&
    sample.insideTicks <= sample.ticks &&
    typeof sample.assisted === "boolean"
  );
}

function continues(existing: FollowProgress, sample: FollowProgress, bounds: FollowBounds): boolean {
  const addedProgress = sample.progress - existing.progress;
  const addedTicks = sample.ticks - existing.ticks;
  const addedInside = sample.insideTicks - existing.insideTicks;
  return (
    existing.progress < bounds.units &&
    addedProgress > 0 &&
    addedTicks > 0 &&
    addedTicks >= addedProgress * bounds.minTicksPerUnit &&
    addedTicks <= addedProgress * bounds.maxTicksPerUnit + 1 &&
    addedInside >= 0 &&
    addedInside <= addedTicks
  );
}

export function recordFollow(
  existing: FollowProgress | undefined,
  sample: FollowProgress,
  bounds: FollowBounds,
): FollowProgress | null {
  const before = existing ?? UNSTARTED_FOLLOW;
  if (!isWellFormed(sample, bounds.units) || !continues(before, sample, bounds)) return null;
  return {
    progress: sample.progress,
    ticks: sample.ticks,
    insideTicks: sample.insideTicks,
    assisted: before.assisted || sample.assisted,
  };
}

export function followAccuracy(follow: FollowProgress): number {
  if (follow.ticks === 0) return 0;
  return cappedAccuracy(follow.insideTicks / follow.ticks, follow.assisted);
}
