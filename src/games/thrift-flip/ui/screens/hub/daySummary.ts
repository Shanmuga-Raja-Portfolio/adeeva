import { careerOf, isWeekEnd, type GameState } from "../../../core";

export type DayEndKind = "rest" | "shift";

export interface DaySummary {
  readonly fromDay: number;
  readonly toDay: number;
  readonly lines: readonly string[];
}

export function daySummary(from: GameState, to: GameState, kind: DayEndKind): DaySummary {
  const lines: string[] = [];
  const career = careerOf(from);
  if (kind === "shift") lines.push(`${career.shiftLine} and earned ${career.shiftPay} coins.`);
  if (isWeekEnd(from.calendar.day)) {
    const rent = from.coins + (kind === "shift" ? career.shiftPay : 0) - to.coins;
    lines.push(
      rent > 0
        ? `${career.rentName} paid: ${rent} coins.`
        : `No ${career.rentName.toLowerCase()} this week. Lovely!`,
    );
  }
  if (
    to.boutique !== null &&
    from.boutique !== null &&
    to.boutique.season.number > from.boutique.season.number
  )
    lines.push("A new season begins on Larkspur Row!");
  if (to.boutique?.season.swapDay?.day === to.calendar.day)
    lines.push("Swap & Mend is on today in the hall.");
  const newOffers = to.gigs.offers.filter(
    (offer) => !from.gigs.offers.some((entry) => entry.id === offer.id),
  ).length;
  if (newOffers > 0) lines.push(`${newOffers} new ${newOffers === 1 ? "request" : "requests"} on the board.`);
  lines.push(
    to.boutique === null ? "Fresh finds are hanging on the rail." : "Fresh finds are on the boutique rail.",
  );
  return { fromDay: from.calendar.day, toDay: to.calendar.day, lines };
}
