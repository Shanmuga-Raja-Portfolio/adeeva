export const CLOSER_WEIGHT = 0.7;
export const OPENER_WEIGHT = 0.3;
export const WEAK_OPENER = 60;

export function closerStrength(scoresInOrder: readonly number[]): number {
  const best = Math.max(0, ...scoresInOrder);
  const opener = scoresInOrder[0] ?? 0;
  const middle = scoresInOrder[1] ?? 0;
  const closer = scoresInOrder[scoresInOrder.length - 1] ?? 0;
  const closing = best === 0 ? 100 : (100 * closer) / best;
  const opening = opener >= middle ? 100 : WEAK_OPENER;
  return Math.round(CLOSER_WEIGHT * closing + OPENER_WEIGHT * opening);
}
