import { clamp } from "../../../engine/clamp";

export const EVENNESS_SPREAD_COST = 2;

export function setEvenness(qualities: readonly number[]): number {
  if (qualities.length === 0) return 0;
  const spread = Math.max(...qualities) - Math.min(...qualities);
  return clamp(100 - EVENNESS_SPREAD_COST * spread, 0, 100);
}
