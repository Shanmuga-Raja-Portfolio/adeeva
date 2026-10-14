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
  if (kind === "shift") lines.push(`You swept Pell's Timber Yard and earned ${CAREER.shiftPay} coins.`);
  if (isWeekEnd(previous.calendar.day)) {
    const rent = weeklyBill(previous);
    lines.push(
      rent === 0 ? "A new week begins. No rent to pay." : `Rent paid to ${CAREER.landlord}: ${rent} coins.`,
    );
    lines.push(`This week folks love: ${next.trends.current.join(" and ")}.`);
  }
  const arrived = arrivedClientIds(previous.gigs, next.gigs);
  if (arrived.length > 0)
    lines.push(
      `New ${arrived.length === 1 ? "note" : "notes"} pinned to the door by ${clientNames(arrived, clientById)}.`,
    );
  const gone = vanishedOfferCount(previous.gigs, next.gigs);
  if (gone > 0) lines.push(`${gone === 1 ? "One note" : `${gone} notes`} blew away. Others will come.`);
  const lapsed = lapsedClientIds(previous.gigs, next.gigs);
  if (lapsed.length > 0)
    lines.push(`${clientNames(lapsed, clientById)} found another maker in time. There will be other jobs!`);
  if (lines.length === 0) lines.push("A quiet night. The sawdust settles and the road sleeps.");
  return { kind, toDay: next.calendar.day, lines };
}
