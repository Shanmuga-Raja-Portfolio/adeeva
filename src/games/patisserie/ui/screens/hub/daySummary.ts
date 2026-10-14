import { clientNames } from "../../../../../engine/clientNames";
import { arrivedClientIds, lapsedClientIds, vanishedOfferCount } from "../../../../../engine/gigBoardChanges";
import { isWeekEnd } from "../../../../../engine/week";
import { careerById, clientById, rentLabel, seasonByNumber, weeklyBill, type GameState } from "../../../core";

export type DayEndKind = "rest" | "shift";

export interface DaySummary {
  readonly kind: DayEndKind;
  readonly toDay: number;
  readonly lines: readonly string[];
}

export function daySummary(previous: GameState, next: GameState, kind: DayEndKind): DaySummary {
  const lines: string[] = [];
  const career = careerById(previous.career);
  if (kind === "shift") lines.push(`${career.shiftLine} and earned ${career.shiftPay} coins.`);
  const salonSummary = next.salon?.lastSummary ?? null;
  if (salonSummary !== null && salonSummary !== previous.salon?.lastSummary)
    lines.push(
      `The Comet Room served ${salonSummary.served} of ${salonSummary.tables} tables and earned ${salonSummary.coins} coins.`,
    );
  if (next.fair !== null && previous.fair !== null && next.fair.seasonNumber > previous.fair.seasonNumber)
    lines.push(
      `Fair Season ${next.fair.seasonNumber} begins: ${seasonByNumber(next.fair.seasonNumber).name}!`,
    );
  if (previous.counter.session !== null)
    lines.push("The counter closed for the week. Leftover treats went to the neighbours.");
  if (isWeekEnd(previous.calendar.day)) {
    const rent = weeklyBill(previous);
    lines.push(
      rent === 0 ? "A new week begins. No rent to pay." : `${rentLabel(previous)} paid: ${rent} coins.`,
    );
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
