import { clientNames } from "../../../../../engine/clientNames";
import { arrivedClientIds, lapsedClientIds, vanishedOfferCount } from "../../../../../engine/gigBoardChanges";
import { isWeekEnd } from "../../../../../engine/week";
import {
  careerOf,
  clientById,
  isOpenHouseDay,
  QUIET_OPEN_HOUSE,
  rentFor,
  rentLabel,
  renWageDue,
  setTemplateById,
  type GameState,
} from "../../../core";

export type DayEndKind = "rest" | "shift";

export interface DaySummary {
  readonly kind: DayEndKind;
  readonly toDay: number;
  readonly lines: readonly string[];
}

function openHouseLines(previous: GameState, next: GameState): string[] {
  const day = previous.calendar.day;
  if (!isOpenHouseDay(previous, day)) return [];
  const before = previous.showroom?.floor ?? [];
  const after = next.showroom?.floor ?? [];
  const sold = before.find((set) => !after.some((entry) => entry.setId === set.setId));
  return [
    sold === undefined
      ? `Open House: ${QUIET_OPEN_HOUSE}`
      : `Open House: the ${setTemplateById(sold.templateId).name} went home with a family for ${sold.price} coins!`,
  ];
}

function seasonLines(previous: GameState, next: GameState): string[] {
  const before = previous.showroom;
  const after = next.showroom;
  if (before === null || after === null || after.seasonNumber === before.seasonNumber) return [];
  return [`A new season begins at the showroom: season ${after.seasonNumber}. Pick a Fair theme!`];
}

export function daySummary(previous: GameState, next: GameState, kind: DayEndKind): DaySummary {
  const lines: string[] = [];
  const career = careerOf(previous);
  if (kind === "shift") lines.push(`${career.shiftLine} and earned ${career.shiftPay} coins.`);
  lines.push(...openHouseLines(previous, next));
  if (isWeekEnd(previous.calendar.day)) {
    const rent = rentFor(previous, previous.calendar.day);
    const wage = renWageDue(previous, previous.calendar.day);
    lines.push(
      rent === 0
        ? "A new week begins. No rent to pay."
        : `${rentLabel(previous, previous.calendar.day)} paid to ${career.landlord}: ${rent} coins.`,
    );
    if (wage > 0) lines.push(`Ren's wage for next week: ${wage} coins. Thank you, Ren!`);
    lines.push(`This week folks love: ${next.trends.current.join(" and ")}.`);
  }
  lines.push(...seasonLines(previous, next));
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
