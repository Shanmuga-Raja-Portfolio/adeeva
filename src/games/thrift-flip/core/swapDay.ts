import { spendHours } from "../../../engine/dayHours";
import { followAccuracy, recordFollow } from "../../../engine/followRecord";
import { clamp } from "../../../engine/clamp";
import { applyStanding } from "../../../engine/standing";
import { SEAM_BOUNDS } from "../../adeeva/core/sewing";
import type { SeamProgress } from "../../adeeva/core/dressRun";
import type { Boutique, SwapDay, SwapTable } from "./boutique";
import { findById } from "./catalog";
import {
  ASSIST_CLEAN_CAP,
  clearedCells,
  FADE_PER_HARSH_TICK,
  MAX_FADE,
  MAX_SCRUB_TICKS,
  scrubGrows,
} from "./clean";
import type { StainWork } from "./flipRun";
import type { GameState } from "./gameState";
import { addKept } from "./keptInUse";
import { rollOwnedFind, type OwnedFind } from "./ownedFind";
import { addScraps } from "./scrap";
import { isSwapDay } from "./seasonCalendar";
import { isStallDay } from "./stallCalendar";
import { queueStoryTrigger } from "./storyQueue";
import { swapLimit } from "./swapRoll";
import { MIN_PULL_CM, maxPull } from "./tolerance";
import { isLineDone, lineAccuracy } from "./unpick";

export const TABLE_HOURS = 1;
export const WELL_MENDED = 0.6;
export const MAX_HALL_REPUTATION = 3;
export const HALL_OFFCUTS = 3;

export function todaysSwapDay(state: Pick<GameState, "boutique" | "calendar">): SwapDay | null {
  const swapDay = state.boutique?.season.swapDay ?? null;
  return swapDay !== null && swapDay.day === state.calendar.day ? swapDay : null;
}

export function hallIssue(state: GameState): string | null {
  if (state.boutique === null) return "Swap & Mend happens at the boutique.";
  if (!isSwapDay(state) || todaysSwapDay(state) === null || isStallDay(state.calendar.day))
    return "Swap & Mend is on day 11 of each season.";
  return null;
}

export function tableOwned(table: SwapTable): OwnedFind {
  return {
    id: table.id,
    findId: table.findId,
    grade: "like-new",
    price: 0,
    wornSpot: null,
    stains: [table.stain],
  };
}

function lineDef(table: SwapTable) {
  const def = findById(table.findId).lines[table.line];
  if (def === undefined) throw new Error(`Table ${table.id} has no stitch line`);
  return def;
}

function scrubAccuracy(state: Pick<GameState, "profile" | "upgrades">, table: SwapTable): number {
  if (table.soaked) return ASSIST_CLEAN_CAP;
  const cleared = clearedCells(state, tableOwned(table), table.stain, table.scrub) / table.stain.cells;
  const fade = Math.min(MAX_FADE, FADE_PER_HARSH_TICK * table.scrub.harshTicks);
  return clamp(cleared * (1 - fade), 0, 1);
}

export function tableDone(state: Pick<GameState, "profile" | "upgrades">, table: SwapTable): boolean {
  if (table.kind === "stitch") return isLineDone(lineDef(table), table.unpick);
  if (table.kind === "seam") return (table.seam?.progress ?? 0) >= 1;
  const cleared = clearedCells(state, tableOwned(table), table.stain, table.scrub) >= table.stain.cells;
  return table.soaked || cleared || table.scrub.scrubTicks >= MAX_SCRUB_TICKS;
}

export function tableAccuracy(state: Pick<GameState, "profile" | "upgrades">, table: SwapTable): number {
  if (table.kind === "stitch") return lineAccuracy(lineDef(table), table.unpick);
  if (table.kind === "seam") return table.seam === null ? 0 : followAccuracy(table.seam);
  return scrubAccuracy(state, table);
}

export function isWellMended(state: GameState, table: SwapTable): boolean {
  if (!tableDone(state, table)) return false;
  return state.profile.difficulty === "relaxed" || tableAccuracy(state, table) >= WELL_MENDED;
}

export function wellMendedCount(state: GameState): number {
  return (todaysSwapDay(state)?.tables ?? []).filter((table) => table.rewarded && isWellMended(state, table))
    .length;
}

export function tableIssue(state: GameState, tableId: string): string | null {
  const hall = hallIssue(state);
  if (hall !== null) return hall;
  const table = todaysSwapDay(state)?.tables.find((entry) => entry.id === tableId);
  if (table === undefined) return "That table is not in the hall today.";
  if (tableDone(state, table)) return "This table is all mended.";
  if (!table.charged && state.calendar.hoursLeft < TABLE_HOURS)
    return "Each table takes an hour. End the day to rest.";
  return null;
}

function withSwapDay(state: GameState, boutique: Boutique, swapDay: SwapDay): GameState {
  return { ...state, boutique: { ...boutique, season: { ...boutique.season, swapDay } } };
}

export function commitHall(state: GameState): GameState {
  const boutique = state.boutique;
  const swapDay = todaysSwapDay(state);
  if (boutique === null || swapDay === null || swapDay.committed) return state;
  const offcuts = Array.from({ length: HALL_OFFCUTS }, () => ({
    name: "Off-cut from the hall",
    colour: "sage" as const,
    print: "check" as const,
    material: "cotton" as const,
    tags: ["casual" as const],
  }));
  const scraps = addScraps(state.stock.scraps, offcuts, state.next.scrap);
  const committed = withSwapDay(state, boutique, { ...swapDay, committed: true });
  return queueStoryTrigger(
    {
      ...committed,
      calendar: { ...committed.calendar, marketOpen: false },
      stock: { ...committed.stock, scraps: scraps.scraps },
      next: { ...committed.next, scrap: scraps.nextNumber },
    },
    "swap-day",
  );
}

function rewardTable(state: GameState, table: SwapTable): GameState {
  if (table.rewarded || !tableDone(state, table)) return state;
  const boutique = state.boutique;
  const swapDay = todaysSwapDay(state);
  if (boutique === null || swapDay === null) return state;
  const marked = { ...table, rewarded: true };
  const before = wellMendedCount(state);
  const updated = withSwapDay(state, boutique, {
    ...swapDay,
    tables: swapDay.tables.map((entry) => (entry.id === table.id ? marked : entry)),
  });
  if (!isWellMended(updated, marked)) return updated;
  const after = before + 1;
  const reputation =
    Math.min(MAX_HALL_REPUTATION, Math.floor(after / 2)) -
    Math.min(MAX_HALL_REPUTATION, Math.floor(before / 2));
  return addKept(applyStanding(updated, { coins: 0, reputation, buzz: 1 }), 1);
}

function workTable(
  state: GameState,
  tableId: string,
  change: (table: SwapTable) => SwapTable | null,
): GameState {
  if (tableIssue(state, tableId) !== null) return state;
  const swapDay = todaysSwapDay(state);
  const table = swapDay?.tables.find((entry) => entry.id === tableId);
  if (swapDay === null || table === undefined) return state;
  const changed = change(table);
  if (changed === null) return state;
  const next = { ...changed, charged: true };
  const paid = table.charged ? state : spendHours(state, TABLE_HOURS);
  if (paid === null) return state;
  const committed = commitHall(paid);
  const boutique = committed.boutique;
  const current = todaysSwapDay(committed);
  if (boutique === null || current === null) return state;
  const stored = withSwapDay(committed, boutique, {
    ...current,
    tables: current.tables.map((entry) => (entry.id === tableId ? next : entry)),
  });
  return rewardTable(stored, next);
}

export interface TablePull {
  readonly tableId: string;
  readonly stitch: number;
  readonly distanceCm: number;
  readonly assisted: boolean;
}

export function pullTableStitch(state: GameState, pull: TablePull): GameState {
  if (!Number.isFinite(pull.distanceCm) || pull.distanceCm < 0) return state;
  if (!pull.assisted && pull.distanceCm < MIN_PULL_CM) return state;
  return workTable(state, pull.tableId, (table) => {
    if (table.kind !== "stitch") return null;
    const def = lineDef(table);
    const record = table.unpick;
    if (!Number.isInteger(pull.stitch) || pull.stitch < 0 || pull.stitch >= def.stitches) return null;
    if (record.popped.includes(pull.stitch)) return null;
    const pops = pull.assisted || pull.distanceCm <= maxPull(state, findById(table.findId).material);
    return {
      ...table,
      unpick: {
        popped: pops ? [...record.popped, pull.stitch] : record.popped,
        snagsAt: pops ? record.snagsAt : [...record.snagsAt, pull.stitch],
        attempts: record.attempts + 1,
        assisted: record.assisted || pull.assisted,
      },
    };
  });
}

export function scrubTable(state: GameState, tableId: string, sample: StainWork): GameState {
  return workTable(state, tableId, (table) => {
    if (table.kind !== "stain" || table.soaked) return null;
    if (!scrubGrows(table.scrub, sample, table.stain.cells)) return null;
    return { ...table, scrub: { ...sample, cellTicks: [...sample.cellTicks] } };
  });
}

export function soakTable(state: GameState, tableId: string): GameState {
  return workTable(state, tableId, (table) => (table.kind !== "stain" ? null : { ...table, soaked: true }));
}

export function sewTable(state: GameState, tableId: string, sample: SeamProgress): GameState {
  return workTable(state, tableId, (table) => {
    if (table.kind !== "seam") return null;
    const stored = recordFollow(table.seam ?? undefined, sample, SEAM_BOUNDS);
    return stored === null ? null : { ...table, seam: stored };
  });
}

export function resetTableSeam(state: GameState, tableId: string): GameState {
  if (tableIssue(state, tableId) !== null) return state;
  const boutique = state.boutique;
  const swapDay = todaysSwapDay(state);
  const table = swapDay?.tables.find((entry) => entry.id === tableId);
  if (boutique === null || swapDay === null || table === undefined || table.seam === null) return state;
  return withSwapDay(state, boutique, {
    ...swapDay,
    tables: swapDay.tables.map((entry) => (entry.id === tableId ? { ...entry, seam: null } : entry)),
  });
}

export function swapIssue(state: GameState, slotId: string, findKey: string): string | null {
  const hall = hallIssue(state);
  if (hall !== null) return hall;
  const swapDay = todaysSwapDay(state);
  if (swapDay === null) return "Swap & Mend is on day 11 of each season.";
  if (swapDay.swaps >= swapLimit(state)) return "That's all the swaps for today.";
  const slot = swapDay.rail.find((entry) => entry.id === slotId);
  if (slot === undefined || slot.taken) return "That find has already found a new home.";
  if (!state.stock.finds.some((owned) => owned.id === findKey)) return "Swap a find from your stockroom.";
  if (state.activeRun?.finds.some((owned) => owned.id === findKey) === true)
    return "That find is on your bench. Set the flip aside first.";
  return null;
}

export function swapFind(state: GameState, slotId: string, findKey: string): GameState {
  if (swapIssue(state, slotId, findKey) !== null) return state;
  const committed = commitHall(state);
  const boutique = committed.boutique;
  const swapDay = todaysSwapDay(committed);
  const slot = swapDay?.rail.find((entry) => entry.id === slotId);
  if (boutique === null || swapDay === null || slot === undefined) return state;
  const [owned, rng] = rollOwnedFind(
    `find-${committed.next.find}`,
    slot.findId,
    slot.grade,
    0,
    committed.rng,
  );
  const swapped = withSwapDay(
    {
      ...committed,
      rng,
      stock: {
        ...committed.stock,
        finds: [...committed.stock.finds.filter((entry) => entry.id !== findKey), owned],
      },
      next: { ...committed.next, find: committed.next.find + 1 },
    },
    boutique,
    {
      ...swapDay,
      swaps: swapDay.swaps + 1,
      rail: swapDay.rail.map((entry) => (entry.id === slotId ? { ...entry, taken: true } : entry)),
    },
  );
  return addKept(swapped, 1);
}
