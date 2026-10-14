import { updateActiveRun } from "../../../engine/activeRunUpdate";
import type { Point } from "../../../engine/geometry/point";
import { polygonsOverlap } from "../../../engine/geometry/polygonOverlap";
import { placedPolygon, polygonBounds } from "../../../engine/geometry/polygonPlacement";
import { isRotation, type Rotation } from "../../../engine/geometry/rotation";
import { recordWithout } from "../../../engine/recordWithout";
import { HINTS } from "../content/hints";
import type { PartDef } from "../content/product";
import { STOCK_SIZE_IDS, type StockSizeId } from "../content/stockSize";
import { isStockSizeId, productById, productPart, stockSizeById } from "./catalog";
import type { GameState } from "./gameState";
import { designInput, partOutline } from "./partGeometry";
import type { PieceRun, Placement } from "./pieceRun";
import { ownedSizes } from "./stock";

const EDGE_EPSILON = 0.01;
const SEARCH_STEP = 1;
const SEARCH_ROTATIONS: readonly Rotation[] = [0, 90, 45, 135];

export function placedPart(run: PieceRun, part: PartDef, placement: Placement): Point[] {
  return placedPolygon(partOutline(part, designInput(run.design)), placement);
}

export function planSheets(state: GameState, run: PieceRun): StockSizeId[] {
  if (run.consumed !== null) return [...run.consumed];
  const metalId = run.design.metalId;
  return metalId === null ? [] : ownedSizes(state.stock, metalId);
}

function inBounds(polygon: readonly Point[], size: StockSizeId): boolean {
  const sheet = stockSizeById(size);
  const bounds = polygonBounds(polygon);
  return (
    bounds.minX >= -EDGE_EPSILON &&
    bounds.minY >= -EDGE_EPSILON &&
    bounds.maxX <= sheet.width + EDGE_EPSILON &&
    bounds.maxY <= sheet.height + EDGE_EPSILON
  );
}

function isPlacementShape(placement: Placement): boolean {
  return (
    isStockSizeId(placement.size) &&
    Number.isFinite(placement.x) &&
    Number.isFinite(placement.y) &&
    isRotation(placement.rotation)
  );
}

export function placementIssue(
  state: GameState,
  run: PieceRun,
  partKey: string,
  placement: Placement,
): string | null {
  const part = productPart(run.design.productId, partKey);
  if (part === undefined || !isPlacementShape(placement)) return "That piece doesn't belong here.";
  if (!planSheets(state, run).includes(placement.size)) return "You don't have that sheet of this metal.";
  const polygon = placedPart(run, part, placement);
  if (!inBounds(polygon, placement.size)) return HINTS.ownSpace;
  const overlaps = Object.entries(run.plan).some(([otherKey, other]) => {
    if (otherKey === partKey || other.size !== placement.size) return false;
    const otherPart = productPart(run.design.productId, otherKey);
    return otherPart !== undefined && polygonsOverlap(polygon, placedPart(run, otherPart, other));
  });
  return overlaps ? HINTS.ownSpace : null;
}

export function placePart(state: GameState, partKey: string, placement: Placement): GameState {
  return updateActiveRun(state, "plan", (run) => {
    if (placementIssue(state, run, partKey, placement) !== null) return null;
    const current = run.plan[partKey];
    if (
      current !== undefined &&
      current.size === placement.size &&
      current.x === placement.x &&
      current.y === placement.y &&
      current.rotation === placement.rotation
    )
      return null;
    return { ...run, plan: { ...run.plan, [partKey]: placement } };
  });
}

export function removePart(state: GameState, partKey: string): GameState {
  return updateActiveRun(state, "plan", (run) => {
    if (!Object.hasOwn(run.plan, partKey)) return null;
    return { ...run, plan: recordWithout(run.plan, partKey) };
  });
}

export function freeSpot(state: GameState, run: PieceRun, part: PartDef): Placement | null {
  const canonical = productById(run.design.productId).canonical[part.key];
  if (canonical !== undefined && placementIssue(state, run, part.key, canonical) === null) return canonical;
  const sheets = planSheets(state, run);
  const sizes = [
    ...sheets.filter((size) => size === canonical?.size),
    ...sheets.filter((size) => size !== canonical?.size),
  ];
  for (const size of sizes) {
    const sheet = stockSizeById(size);
    for (const rotation of SEARCH_ROTATIONS)
      for (let y = 0.5; y < sheet.height; y += SEARCH_STEP)
        for (let x = 0.5; x < sheet.width; x += SEARCH_STEP) {
          const placement: Placement = { size, x, y, rotation };
          if (placementIssue(state, run, part.key, placement) === null) return placement;
        }
  }
  return null;
}

export function showMePlan(state: GameState): GameState {
  return updateActiveRun(state, "plan", (run) => {
    let next = run;
    for (const part of productById(run.design.productId).parts) {
      if (Object.hasOwn(next.plan, part.key)) continue;
      const spot = freeSpot(state, next, part);
      if (spot !== null) next = { ...next, plan: { ...next.plan, [part.key]: spot } };
    }
    return next;
  });
}

export function plannedSizes(run: PieceRun): StockSizeId[] {
  const used = Object.values(run.plan).map((placement) => placement.size);
  return STOCK_SIZE_IDS.filter((size) => used.includes(size));
}

export function planIssues(state: GameState, run: PieceRun): string[] {
  const parts = productById(run.design.productId).parts;
  const left = parts.filter((part) => !Object.hasOwn(run.plan, part.key)).length;
  if (left > 0) return [`Place ${left} more ${left === 1 ? "shape" : "shapes"} on the metal.`];
  const broken = parts.some((part) => {
    const placement = run.plan[part.key];
    return placement === undefined || placementIssue(state, run, part.key, placement) !== null;
  });
  return broken ? [HINTS.ownSpace] : [];
}
