import type { RewardLine } from "./reward";

const FINE_MATERIAL_SHARE_PER_GRADE = 0.15;
const FINE_MATERIAL_REPUTATION_GRADE = 3;

interface FineMaterialBonus {
  readonly lines: readonly RewardLine[];
  readonly reputation: number;
}

export function fineMaterialBonus(fee: number, grade: number, label: string): FineMaterialBonus {
  const amount = Math.round(fee * FINE_MATERIAL_SHARE_PER_GRADE * Math.max(0, grade - 1));
  return {
    lines: amount > 0 ? [{ label, amount }] : [],
    reputation: grade >= FINE_MATERIAL_REPUTATION_GRADE ? 1 : 0,
  };
}
