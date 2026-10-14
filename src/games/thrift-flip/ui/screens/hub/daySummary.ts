import { CAREER } from "../../../content/career";
import { isWeekEnd, type GameState } from "../../../core";

export type DayEndKind = "rest" | "shift";

export interface DaySummary {
  readonly fromDay: number;
  readonly toDay: number;
  readonly lines: readonly string[];
}

export function daySummary(from: GameState, to: GameState, kind: DayEndKind): DaySummary {
  const lines: string[] = [];
  if (kind === "shift") lines.push(`You sorted the swap shop and earned ${CAREER.shiftPay} coins.`);
  if (isWeekEnd(from.calendar.day)) {
    const rent = from.coins + (kind === "shift" ? CAREER.shiftPay : 0) - to.coins;
    lines.push(rent > 0 ? `Stall rent paid: ${rent} coins.` : "No stall rent this week. Lovely!");
  }
  const newOffers = to.gigs.offers.filter(
    (offer) => !from.gigs.offers.some((entry) => entry.id === offer.id),
  ).length;
  if (newOffers > 0) lines.push(`${newOffers} new ${newOffers === 1 ? "request" : "requests"} on the board.`);
  lines.push("Fresh finds are hanging on the rail.");
  return { fromDay: from.calendar.day, toDay: to.calendar.day, lines };
}
