import type { RngState } from "../../../engine/rng";
import { drawInt, drawItem } from "../../../engine/rngDraw";
import type { ConditionGrade } from "../content/condition";
import type { FindId, WornSpotDef } from "../content/find";
import { conditionById, findById } from "./catalog";

export const STAIN_CELL_OPTIONS = [9, 12, 16] as const;
export type StainCells = (typeof STAIN_CELL_OPTIONS)[number];
export const MIN_STAIN_RADIUS = 6;
export const MAX_STAIN_RADIUS = 10;

export interface Stain {
  readonly id: string;
  readonly panel: number;
  readonly cx: number;
  readonly cy: number;
  readonly radius: number;
  readonly cells: StainCells;
}

export type WornSpotIndex = 0 | 1;

export interface OwnedFind {
  readonly id: string;
  readonly findId: FindId;
  readonly grade: ConditionGrade;
  readonly price: number;
  readonly wornSpot: WornSpotIndex | null;
  readonly stains: readonly Stain[];
}

export function stainGrid(cells: StainCells): { readonly rows: number; readonly cols: number } {
  if (cells === 9) return { rows: 3, cols: 3 };
  if (cells === 12) return { rows: 3, cols: 4 };
  return { rows: 4, cols: 4 };
}

export function wornSpotOf(owned: OwnedFind): WornSpotDef | null {
  return owned.wornSpot === null ? null : findById(owned.findId).wornSpots[owned.wornSpot];
}

function rollStain(findId: FindId, index: number, rng: RngState): [Stain, RngState] {
  const panels = findById(findId).panels;
  const [panel, afterPanel] = drawInt(rng, 0, panels.length - 1);
  const size = panels[panel] ?? panels[0];
  if (size === undefined) throw new Error(`Find ${findId} has no panels`);
  const [radius, afterRadius] = drawInt(afterPanel, MIN_STAIN_RADIUS, MAX_STAIN_RADIUS);
  const [cx, afterX] = drawInt(afterRadius, radius, size.width - radius);
  const [cy, afterY] = drawInt(afterX, radius, size.height - radius);
  const [cells, afterCells] = drawItem(afterY, STAIN_CELL_OPTIONS);
  return [{ id: `stain-${index + 1}`, panel, cx, cy, radius, cells }, afterCells];
}

export function rollOwnedFind(
  id: string,
  findId: FindId,
  grade: ConditionGrade,
  price: number,
  rng: RngState,
): [OwnedFind, RngState] {
  const condition = conditionById(grade);
  let state = rng;
  let wornSpot: WornSpotIndex | null = null;
  if (condition.wornSpots > 0) {
    const [spot, afterSpot] = drawInt(state, 0, 1);
    wornSpot = spot === 0 ? 0 : 1;
    state = afterSpot;
  }
  const stains: Stain[] = [];
  for (let index = 0; index < condition.stains; index += 1) {
    const [stain, afterStain] = rollStain(findId, index, state);
    stains.push(stain);
    state = afterStain;
  }
  return [{ id, findId, grade, price, wornSpot, stains }, state];
}
