import { isWeekEnd } from "../../../../../engine/week";
import { CAREER } from "../../../content/career";
import { clientById, weeklyBill, type GameState } from "../../../core";

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
  if (kind === "shift") lines.push(`You washed trays at the café and earned ${CAREER.shiftPay} coins.`);
  if (previous.counter.session !== null)
    lines.push("The counter closed for the week. Leftover treats went to the neighbours.");
  if (isWeekEnd(previous.calendar.day)) {
    const rent = weeklyBill(previous);
    lines.push(rent === 0 ? "A new week begins. No rent to pay." : `Bakery rent paid: ${rent} coins.`);
    lines.push(`This week the town loves: ${next.trends.current.join(" and ")}.`);
  }
  const before = new Set(previous.gigs.offers.map((offer) => offer.id));
  const arrived = next.gigs.offers.filter((offer) => !before.has(offer.id)).map((offer) => offer.clientId);
  if (arrived.length > 0)
    lines.push(`New ${arrived.length === 1 ? "order" : "orders"} pinned up by ${names(arrived)}.`);
  const after = new Set(next.gigs.offers.map((offer) => offer.id));
  const gone = previous.gigs.offers.filter(
    (offer) => !after.has(offer.id) && !next.gigs.active.some((gig) => gig.id === offer.id),
  );
  if (gone.length > 0)
    lines.push(`${gone.length === 1 ? "One request" : `${gone.length} requests`} found another baker.`);
  const lapsed = next.gigs.lapsed.slice(previous.gigs.lapsed.length).map((entry) => entry.clientId);
  if (lapsed.length > 0)
    lines.push(`${names(lapsed)} found another cake in time. There will be other orders!`);
  if (lines.length === 0) lines.push("A quiet night. The oven cools and the street sleeps.");
  return { kind, toDay: next.calendar.day, lines };
}
