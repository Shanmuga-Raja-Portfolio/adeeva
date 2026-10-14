import type { CareerFact } from "./CareerStep";

export interface CareerTerms {
  readonly startCoins: number;
  readonly startReputation: number;
  readonly weeklyRent: number;
  readonly shiftName: string;
}

export function careerFacts(terms: CareerTerms): readonly CareerFact[] {
  return [
    { icon: "coin", text: `${terms.startCoins} coins to start` },
    { icon: "star", text: `Reputation ${terms.startReputation}` },
    { icon: "calendar", text: `Rent ${terms.weeklyRent} a week` },
    { icon: "bag", text: `Side job: ${terms.shiftName}` },
  ];
}
