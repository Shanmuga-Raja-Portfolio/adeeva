import { clientNames } from "../../../../../engine/clientNames";
import { arrivedClientIds, lapsedClientIds } from "../../../../../engine/gigBoardChanges";
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
  if (kind === "shift")
    lines.push(`You stacked shelves at Hollin's Hardware and earned ${CAREER.shiftPay} coins.`);
  if (isWeekEnd(previous.calendar.day)) {
    const rent = weeklyBill(previous);
    lines.push(
      rent === 0 ? "A new week begins. No rent to pay." : `Rent paid to ${CAREER.landlord}: ${rent} coins.`,
    );
    lines.push(`This week the street loves: ${next.trends.current.join(" and ")}.`);
  }
  const arrived = arrivedClientIds(previous.gigs, next.gigs);
  if (arrived.length > 0)
    lines.push(
      `New ${arrived.length === 1 ? "letter" : "letters"} from ${clientNames(arrived, clientById)}.`,
    );
  const lapsed = lapsedClientIds(previous.gigs, next.gigs);
  if (lapsed.length > 0)
    lines.push(`${clientNames(lapsed, clientById)} found another way in time. There will be other rooms!`);
  if (lines.length === 0) lines.push("A quiet night. The street lamps glow and Marigold Row sleeps.");
  return { kind, toDay: next.calendar.day, lines };
}
