import { clientNames } from "../../../../../engine/clientNames";
import { arrivedClientIds, lapsedClientIds, vanishedOfferCount } from "../../../../../engine/gigBoardChanges";
import { isWeekEnd } from "../../../../../engine/week";
import { CAREER } from "../../../content/career";
import { clientById, weeklyBill, type GameState } from "../../../core";

export type DayEndKind = "rest" | "shift";

export interface DaySummary {
  readonly kind: DayEndKind;
  readonly toDay: number;
  readonly lines: readonly string[];
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
  const arrived = arrivedClientIds(previous.gigs, next.gigs);
  if (arrived.length > 0)
    lines.push(
      `New ${arrived.length === 1 ? "order" : "orders"} pinned up by ${clientNames(arrived, clientById)}.`,
    );
  const gone = vanishedOfferCount(previous.gigs, next.gigs);
  if (gone > 0) lines.push(`${gone === 1 ? "One request" : `${gone} requests`} found another baker.`);
  const lapsed = lapsedClientIds(previous.gigs, next.gigs);
  if (lapsed.length > 0)
    lines.push(`${clientNames(lapsed, clientById)} found another cake in time. There will be other orders!`);
  if (lines.length === 0) lines.push("A quiet night. The oven cools and the street sleeps.");
  return { kind, toDay: next.calendar.day, lines };
}
