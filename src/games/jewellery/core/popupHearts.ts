export interface HeartCandidate {
  readonly id: string;
  readonly appeal: number;
}

const BASE_EXTRA = 2;
const OVERALL_PIVOT = 60;
const OVERALL_STEP = 10;

export function popupHeartTotal(pieces: number, overall: number, windowStands: boolean): number {
  const total = Math.max(pieces, pieces + BASE_EXTRA + Math.round((overall - OVERALL_PIVOT) / OVERALL_STEP));
  return total + (windowStands ? 1 : 0);
}

export function shareByAppeal(candidates: readonly HeartCandidate[], extra: number): number[] {
  if (candidates.length === 0 || extra <= 0) return candidates.map(() => 0);
  const total = candidates.reduce((sum, candidate) => sum + Math.max(0, candidate.appeal), 0);
  const quotas = candidates.map((candidate) =>
    total === 0 ? extra / candidates.length : (extra * Math.max(0, candidate.appeal)) / total,
  );
  const whole = quotas.map((quota) => Math.floor(quota));
  let left = extra - whole.reduce((sum, value) => sum + value, 0);
  const order = quotas
    .map((quota, index) => ({ index, rest: quota - Math.floor(quota) }))
    .sort((a, b) => b.rest - a.rest || a.index - b.index);
  for (const entry of order) {
    if (left <= 0) break;
    whole[entry.index] = (whole[entry.index] ?? 0) + 1;
    left -= 1;
  }
  return whole;
}

export function popupHearts(
  candidates: readonly HeartCandidate[],
  overall: number,
  windowStands: boolean,
  plinthId: string,
): Map<string, number> {
  const total = popupHeartTotal(candidates.length, overall, windowStands);
  const shared = shareByAppeal(candidates, total - candidates.length);
  return new Map(
    candidates.map((candidate, index) => [
      candidate.id,
      1 + (shared[index] ?? 0) + (candidate.id === plinthId ? 1 : 0),
    ]),
  );
}
