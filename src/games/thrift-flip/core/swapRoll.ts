import type { RngState } from "../../../engine/rng";
import { drawDistinct, drawInt, drawItem } from "../../../engine/rngDraw";
import { FINDS } from "../content/find";
import { SWAP_NEIGHBOURS, SWAP_REQUESTS, SWAP_TABLE_KINDS } from "../content/swapNeighbour";
import type { SwapDay, SwapSlot, SwapTable } from "./boutique";
import { findById } from "./catalog";
import type { GameState } from "./gameState";
import { rollGrade, unlockedFinds } from "./marketRail";
import { rollOwnedFind } from "./ownedFind";
import { UNTOUCHED_LINE } from "./unpick";

export const BASE_SWAP_TABLES = 6;
export const BASE_SWAPS = 3;
export const SWAP_SHELF_TABLES = 1;
export const SWAP_SHELF_SWAPS = 2;
export const SWAP_RAIL_SIZE = 6;

export function swapTableCount(state: Pick<GameState, "upgrades">): number {
  return BASE_SWAP_TABLES + (state.upgrades.includes("swap-shelf") ? SWAP_SHELF_TABLES : 0);
}

export function swapLimit(state: Pick<GameState, "upgrades">): number {
  return BASE_SWAPS + (state.upgrades.includes("swap-shelf") ? SWAP_SHELF_SWAPS : 0);
}

function rollTable(index: number, rng: RngState): [SwapTable, RngState] {
  const [find, afterFind] = drawItem(rng, FINDS);
  const [neighbour, afterNeighbour] = drawItem(afterFind, SWAP_NEIGHBOURS);
  const [kind, afterKind] = drawItem(afterNeighbour, SWAP_TABLE_KINDS);
  const [line, afterLine] = drawInt(afterKind, 0, find.lines.length - 1);
  const [owned, afterStain] = rollOwnedFind(`table-${index + 1}`, find.id, "like-new", 0, afterLine);
  const stain = owned.stains[0];
  if (stain === undefined) throw new Error(`Table ${index + 1} has no stain`);
  return [
    {
      id: `table-${index + 1}`,
      neighbour: neighbour.name,
      request: SWAP_REQUESTS[kind].replace("[item]", findById(find.id).name.toLowerCase()),
      findId: find.id,
      kind,
      line,
      stain,
      unpick: UNTOUCHED_LINE,
      scrub: { cellTicks: Array.from({ length: stain.cells }, () => 0), harshTicks: 0, scrubTicks: 0 },
      soaked: false,
      seam: null,
      charged: false,
      rewarded: false,
    },
    afterStain,
  ];
}

export function rollSwapDay(state: GameState, day: number): [SwapDay, RngState] {
  let rng = state.rng;
  const tables: SwapTable[] = [];
  for (let index = 0; index < swapTableCount(state); index += 1) {
    const [table, after] = rollTable(index, rng);
    tables.push(table);
    rng = after;
  }
  const pool = unlockedFinds(state);
  const [picked, afterPick] = drawDistinct(rng, pool, Math.min(SWAP_RAIL_SIZE, pool.length));
  rng = afterPick;
  const rail: SwapSlot[] = picked.map((find, index) => {
    const [grade, afterGrade] = rollGrade(rng);
    rng = afterGrade;
    return { id: `swap-${day}-${index + 1}`, findId: find.id, grade, taken: false };
  });
  return [{ day, committed: false, tables, rail, swaps: 0 }, rng];
}
