import { isWeekEnd } from "../../../../../engine/week";
import { CAREER } from "../../../content/career";
import { clientById, themeById, weeklyBill, type GameState } from "../../../core";

export type DayEndKind = "rest" | "shift";

export interface DaySummary {
  readonly kind: DayEndKind;
  readonly toDay: number;
  readonly lines: readonly string[];
}

function names(ids: readonly string[]): string {
  return ids.map((id) => clientById(id)?.name ?? "A neighbour").join(", ");
}

export function daySummary(previous: GameState, next: GameState, kind: DayEndKind): DaySummary {
  const lines: string[] = [];
  if (kind === "shift") lines.push(`You sorted beads at the Bead Barn and earned ${CAREER.shiftPay} coins.`);
  if (isWeekEnd(previous.calendar.day)) {
    const rent = weeklyBill(previous);
    lines.push(
      rent === 0 ? "A new week begins. No rent to pay." : `Rent paid to ${CAREER.landlord}: ${rent} coins.`,
    );
    lines.push(`This week shoppers love: ${next.trends.current.join(" and ")}.`);
    lines.push(`Next Market Day theme: ${themeById(next.marketTheme).name}.`);
  }
  const before = new Set(previous.gigs.offers.map((offer) => offer.id));
  const arrived = next.gigs.offers.filter((offer) => !before.has(offer.id)).map((offer) => offer.clientId);
  if (arrived.length > 0)
    lines.push(`New order ${arrived.length === 1 ? "tag" : "tags"} pinned up by ${names(arrived)}.`);
  const lapsed = next.gigs.lapsed.slice(previous.gigs.lapsed.length).map((entry) => entry.clientId);
  if (lapsed.length > 0)
    lines.push(`${names(lapsed)} found another gift in time. There will be other orders!`);
  if (lines.length === 0) lines.push("A quiet night. The lanterns dim and the arcade sleeps.");
  return { kind, toDay: next.calendar.day, lines };
}
