import { clamp } from "../../../engine/clamp";

const BONUS_FROM = 20;
const BONUS_SPAN = 40;

export function marketReputationBonus(reputation: number): number {
  return 1 + clamp(reputation - BONUS_FROM, 0, BONUS_SPAN) / BONUS_SPAN;
}
