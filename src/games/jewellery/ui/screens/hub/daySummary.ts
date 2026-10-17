import { clientNames } from "../../../../../engine/clientNames";
import { arrivedClientIds, lapsedClientIds } from "../../../../../engine/gigBoardChanges";
import { isWeekEnd } from "../../../../../engine/week";
import { LANDLORD } from "../../../content/career";
import { careerById, clientById, themeById, weeklyBill, type GameState } from "../../../core";

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
  if (isWeekEnd(previous.calendar.day)) {
    const rent = weeklyBill(previous, previous.calendar.day);
    lines.push(
      rent === 0 ? "A new week begins. No rent to pay." : `Rent paid to ${LANDLORD}: ${rent} coins.`,
    );
    lines.push(`This week shoppers love: ${next.trends.current.join(" and ")}.`);
    lines.push(`Next Market Day theme: ${themeById(next.marketTheme).name}.`);
  }
  const arrived = arrivedClientIds(previous.gigs, next.gigs);
  if (arrived.length > 0)
    lines.push(
      `New order ${arrived.length === 1 ? "tag" : "tags"} pinned up by ${clientNames(arrived, clientById)}.`,
    );
  const lapsed = lapsedClientIds(previous.gigs, next.gigs);
  if (lapsed.length > 0)
    lines.push(`${clientNames(lapsed, clientById)} found another gift in time. There will be other orders!`);
  if (lines.length === 0) lines.push("A quiet night. The lanterns dim and the arcade sleeps.");
  return { kind, toDay: next.calendar.day, lines };
}
