import type { DifficultyId } from "./difficulty";
import type { TraitId } from "./trait";

const PASS_BASE_SHARE = 0.8;
const PASS_SCORE_SHARE = 0.4;
const CHARMER_TIP_SHARE = 0.1;
const LATE_PENALTY_SHARE: Readonly<Record<DifficultyId, number>> = {
  relaxed: 0,
  standard: 0,
  challenging: 0.5,
};
export const SOFT_FAIL_FEE_SHARE = 0.4;
const SOFT_FAIL_REPUTATION = -1;
const HARD_FAIL_REPUTATION = -3;
const PASS_REPUTATION_MIN = 1;
const PASS_REPUTATION_RANGE = 2;

export type RewardOutcome = "pass" | "soft-fail" | "fail";

export interface RewardLine {
  readonly label: string;
  readonly amount: number;
}

export interface RewardCore {
  readonly outcome: RewardOutcome;
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
  readonly lines: readonly RewardLine[];
}

export interface RewardTerms {
  readonly passed: boolean;
  readonly score: number;
  readonly stars: number;
  readonly fee: number;
  readonly late: boolean;
  readonly difficulty: DifficultyId;
  readonly trait: TraitId;
  readonly bonusLines: readonly RewardLine[];
  readonly extraBuzz: number;
}

function passReward(terms: RewardTerms): RewardCore {
  const { fee } = terms;
  const lines: RewardLine[] = [
    { label: "Fee", amount: Math.round(fee * (PASS_BASE_SHARE + (PASS_SCORE_SHARE * terms.score) / 100)) },
    ...terms.bonusLines,
  ];
  if (terms.trait === "charmer")
    lines.push({ label: "Charmer tip", amount: Math.round(fee * CHARMER_TIP_SHARE) });
  const latePenalty = terms.late ? Math.round(fee * LATE_PENALTY_SHARE[terms.difficulty]) : 0;
  if (latePenalty > 0) lines.push({ label: "Late delivery", amount: -latePenalty });
  return {
    outcome: "pass",
    coins: Math.max(
      0,
      lines.reduce((sum, line) => sum + line.amount, 0),
    ),
    reputation: PASS_REPUTATION_MIN + Math.round((PASS_REPUTATION_RANGE * terms.score) / 100),
    buzz: 1 + terms.stars + terms.extraBuzz,
    lines,
  };
}

export function settleReward(terms: RewardTerms): RewardCore {
  if (terms.passed || terms.difficulty === "relaxed") return passReward(terms);
  if (terms.difficulty === "standard") {
    const amount = Math.round(terms.fee * SOFT_FAIL_FEE_SHARE);
    return {
      outcome: "soft-fail",
      coins: amount,
      reputation: terms.trait === "charmer" ? 0 : SOFT_FAIL_REPUTATION,
      buzz: 0,
      lines: [{ label: "Part of the fee", amount }],
    };
  }
  return { outcome: "fail", coins: 0, reputation: HARD_FAIL_REPUTATION, buzz: 0, lines: [] };
}
