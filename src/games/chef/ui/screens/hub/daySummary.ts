import { clientNames } from "../../../../../engine/clientNames";
import { arrivedClientIds, lapsedClientIds } from "../../../../../engine/gigBoardChanges";
import { isWeekEnd } from "../../../../../engine/week";
import { CAREER } from "../../../content/career";
import {
  awardById,
  clientById,
  cuisineById,
  festivalById,
  isFamilyMeal,
  isServiceNight,
  mentorFor,
  pathById,
  rungById,
  weeklyBill,
  type GameState,
} from "../../../core";

export type DayEndKind = "rest" | "potwash";

export interface DaySummary {
  readonly kind: DayEndKind;
  readonly toDay: number;
  readonly lines: readonly string[];
}

function pathLines(previous: GameState, next: GameState): string[] {
  const path = next.path;
  if (path === null) return [];
  const lines: string[] = [];
  const won = path.awards.filter((award) => !(previous.path?.awards ?? []).includes(award));
  for (const award of won) lines.push(`You won the ${awardById(award).name} award!`);
  if (path.kind === "restaurant" && isServiceNight(next.calendar.day))
    lines.push("Tonight is a service night on Quayside Lane.");
  if (path.kind === "truck" && previous.path?.kind === "truck" && path.board !== previous.path.board)
    lines.push(
      `This week's festivals: ${path.board.map((slot) => festivalById(slot.festivalId).name).join(", ")}.`,
    );
  return lines;
}

export function daySummary(previous: GameState, next: GameState, kind: DayEndKind): DaySummary {
  const lines: string[] = [];
  if (kind === "potwash")
    lines.push(`You washed pots at the Hall all day and earned ${CAREER.potWashPay} coins.`);
  if (isWeekEnd(previous.calendar.day)) {
    const rent = weeklyBill(previous);
    const paid =
      previous.path === null
        ? `Rent paid for ${rungById(previous.rung).home}`
        : `Paid for ${pathById(previous.path.kind).home}`;
    lines.push(rent === 0 ? "A new week begins. No rent to pay." : `${paid}: ${rent} coins.`);
    lines.push(`This week Larkspur is craving: ${next.trends.current.join(" and ")}.`);
  }
  if (isFamilyMeal(next.calendar.day))
    lines.push("Today is Family Meal: no shifts or tests, just good food together.");
  const lesson = next.board.lesson;
  if (lesson !== null)
    lines.push(`A lesson with ${mentorFor(lesson.cuisine).name} is pinned to the class board.`);
  if (next.board.shifts.length > 0 && next.rung !== "head")
    lines.push(
      `Shifts tonight at ${next.board.shifts
        .map((shift) => shift.cuisines.map((cuisine) => cuisineById(cuisine).counter).join(" + "))
        .join(" or ")}.`,
    );
  const arrived = arrivedClientIds(previous.gigs, next.gigs);
  if (arrived.length > 0)
    lines.push(`New ${arrived.length === 1 ? "order" : "orders"} from ${clientNames(arrived, clientById)}.`);
  const lapsed = lapsedClientIds(previous.gigs, next.gigs);
  if (lapsed.length > 0)
    lines.push(`${clientNames(lapsed, clientById)} found another cook in time. There will be other orders!`);
  lines.push(...pathLines(previous, next));
  if (lines.length === 0) lines.push("A quiet night. The lamps dim and the Hall sleeps.");
  return { kind, toDay: next.calendar.day, lines };
}
