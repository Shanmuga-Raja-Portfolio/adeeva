import { zeroCounts } from "../../../engine/count";
import { weekMoneyLines, type MoneyLine, type WeekMoney } from "../../../engine/weekMoneyLines";
import { weekNumber } from "../../../engine/weekday";

export const MONEY_IN = ["plates", "tips", "bookings", "shows", "work"] as const;
export const MONEY_OUT = ["ingredients", "team", "rent", "upgrades", "pitches"] as const;
export const MONEY_KINDS = [...MONEY_IN, ...MONEY_OUT] as const;
export type MoneyKind = (typeof MONEY_KINDS)[number];

export interface Ledger {
  readonly week: number;
  readonly amounts: Readonly<Record<MoneyKind, number>>;
  readonly unserved: number;
}

const LABELS: Readonly<Record<MoneyKind, string>> = {
  plates: "Plates sold",
  tips: "Happy guests' tips",
  bookings: "Private bookings",
  shows: "Shows and book",
  work: "Pot-wash days",
  ingredients: "Ingredients",
  team: "Team pay",
  rent: "Rent and parking",
  upgrades: "Upgrades",
  pitches: "Pitch fees and helpers",
};

export function emptyLedger(day: number): Ledger {
  return {
    week: weekNumber(day),
    amounts: zeroCounts(MONEY_KINDS),
    unserved: 0,
  };
}

export function withMoney(ledger: Ledger, kind: MoneyKind, amount: number): Ledger {
  if (amount === 0) return ledger;
  return { ...ledger, amounts: { ...ledger.amounts, [kind]: ledger.amounts[kind] + amount } };
}

export function withUnserved(ledger: Ledger, amount: number): Ledger {
  return amount === 0 ? ledger : { ...ledger, unserved: ledger.unserved + amount };
}

function lines(ledger: Ledger, kinds: readonly MoneyKind[]): MoneyLine[] {
  return kinds.map((kind) => ({ label: LABELS[kind], amount: ledger.amounts[kind] }));
}

export function ledgerMoney(ledger: Ledger): WeekMoney {
  return weekMoneyLines(lines(ledger, MONEY_IN), lines(ledger, MONEY_OUT));
}
