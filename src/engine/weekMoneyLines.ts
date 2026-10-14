export interface MoneyLine {
  readonly label: string;
  readonly amount: number;
}

export type MoneyTrend = "up" | "down" | "level";

export interface WeekMoney {
  readonly moneyIn: readonly MoneyLine[];
  readonly moneyOut: readonly MoneyLine[];
  readonly totalIn: number;
  readonly totalOut: number;
  readonly leftOver: number;
  readonly trend: MoneyTrend;
}

function nonZero(lines: readonly MoneyLine[]): MoneyLine[] {
  return lines.filter((line) => line.amount !== 0);
}

function total(lines: readonly MoneyLine[]): number {
  return lines.reduce((sum, line) => sum + line.amount, 0);
}

export function weekMoneyLines(moneyIn: readonly MoneyLine[], moneyOut: readonly MoneyLine[]): WeekMoney {
  const incoming = nonZero(moneyIn);
  const outgoing = nonZero(moneyOut);
  const totalIn = total(incoming);
  const totalOut = total(outgoing);
  const leftOver = totalIn - totalOut;
  return {
    moneyIn: incoming,
    moneyOut: outgoing,
    totalIn,
    totalOut,
    leftOver,
    trend: leftOver > 0 ? "up" : leftOver < 0 ? "down" : "level",
  };
}
