import type { SeamProgress } from "./dressRun";

export const ASSIST_SEW_ACCURACY_CAP = 0.8;

export function seamAccuracy(seam: SeamProgress): number {
  if (seam.ticks === 0) return 0;
  const share = seam.insideTicks / seam.ticks;
  return seam.assisted ? Math.min(ASSIST_SEW_ACCURACY_CAP, share) : share;
}
