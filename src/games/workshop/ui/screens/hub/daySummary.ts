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
  if (kind === "shift") lines.push(`You swept Pell's Timber Yard and earned ${CAREER.shiftPay} coins.`);
  if (isWeekEnd(previous.calendar.day)) {
    const rent = weeklyBill(previous);
    lines.push(
      rent === 0 ? "A new week begins. No rent to pay." : `Rent paid to ${CAREER.landlord}: ${rent} coins.`,
    );
    lines.push(`This week folks love: ${next.trends.current.join(" and ")}.`);
  }
  const before = new Set(previous.gigs.offers.map((offer) => offer.id));
  const arrived = next.gigs.offers.filter((offer) => !before.has(offer.id)).map((offer) => offer.clientId);
  if (arrived.length > 0)
    lines.push(`New ${arrived.length === 1 ? "note" : "notes"} pinned to the door by ${names(arrived)}.`);
  const after = new Set(next.gigs.offers.map((offer) => offer.id));
  const gone = previous.gigs.offers.filter(
    (offer) => !after.has(offer.id) && !next.gigs.active.some((gig) => gig.id === offer.id),
  );
  if (gone.length > 0)
    lines.push(`${gone.length === 1 ? "One note" : `${gone.length} notes`} blew away. Others will come.`);
  const lapsed = next.gigs.lapsed.slice(previous.gigs.lapsed.length).map((entry) => entry.clientId);
  if (lapsed.length > 0)
    lines.push(`${names(lapsed)} found another maker in time. There will be other jobs!`);
  if (lines.length === 0) lines.push("A quiet night. The sawdust settles and the road sleeps.");
  return { kind, toDay: next.calendar.day, lines };
}
