import { OVERLAP_EPSILON } from "../../../engine/geometry/overlapEpsilon";
import type { Point } from "../../../engine/geometry/point";
import { polygonsOverlap } from "../../../engine/geometry/polygonOverlap";
import { placedPolygon, polygonBounds } from "../../../engine/geometry/polygonPlacement";
import type { ProductId } from "../content/product";
import { productById } from "./catalog";
import { QUARTER_TURNS, type QuarterTurn } from "./commissionRun";
import type { GameState } from "./gameState";
import type { FloorSet, FloorSpot, ShowroomState } from "./showroomState";

export const FLOOR = { width: 300, depth: 200 } as const;
const RUG_TOP = 30;
const RUG_DEPTH = 150;
const PAD = 4;

export interface Rug {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly depth: number;
}

export function rugsFor(bays: number): Rug[] {
  const gap = 8;
  const width = Math.floor((FLOOR.width - gap * (bays + 1)) / bays);
  return Array.from({ length: bays }, (_, index) => ({
    x: gap + index * (width + gap),
    y: RUG_TOP,
    width,
    depth: RUG_DEPTH,
  }));
}

function footprint(productId: ProductId, rotation: QuarterTurn): { width: number; depth: number } {
  const size = productById(productId).footprint;
  return rotation % 180 === 0 ? size : { width: size.depth, depth: size.width };
}

export function spotPolygon(productId: ProductId, spot: FloorSpot): Point[] {
  const size = productById(productId).footprint;
  return placedPolygon(
    [
      [0, 0],
      [size.width, 0],
      [size.width, size.depth],
      [0, size.depth],
    ],
    spot,
  );
}

interface Row {
  readonly y: number;
  depth: number;
  cursor: number;
}

function rowSpot(rows: Row[], rug: Rug, productId: ProductId): FloorSpot {
  const turns: readonly QuarterTurn[] = [0, 90];
  for (const [index, row] of rows.entries()) {
    const last = index === rows.length - 1;
    for (const rotation of turns) {
      const size = footprint(productId, rotation);
      const fitsWidth = row.cursor + size.width <= rug.width - PAD;
      const fitsDepth = size.depth <= row.depth || (last && row.y + size.depth <= rug.depth - PAD);
      if (!fitsWidth || !fitsDepth) continue;
      const spot = { x: rug.x + row.cursor, y: rug.y + row.y, rotation };
      row.cursor += size.width + PAD;
      row.depth = Math.max(row.depth, size.depth);
      return spot;
    }
  }
  const lastRow = rows[rows.length - 1];
  const y = lastRow === undefined ? PAD : lastRow.y + lastRow.depth + PAD;
  const rotation = turns.reduce<QuarterTurn>((best, turn) => {
    const size = footprint(productId, turn);
    const bestSize = footprint(productId, best);
    return size.width <= rug.width - 2 * PAD && size.depth < bestSize.depth ? turn : best;
  }, 0);
  const size = footprint(productId, rotation);
  rows.push({ y, depth: size.depth, cursor: PAD + size.width + PAD });
  return { x: rug.x + PAD, y: rug.y + y, rotation };
}

export function autoSpots(products: readonly ProductId[], rug: Rug): FloorSpot[] {
  const order = products
    .map((productId, index) => ({ productId, index }))
    .sort((a, b) => {
      const sizeA = productById(a.productId).footprint;
      const sizeB = productById(b.productId).footprint;
      return sizeB.width * sizeB.depth - sizeA.width * sizeA.depth || a.index - b.index;
    });
  const rows: Row[] = [];
  const spots = new Map<number, FloorSpot>();
  for (const entry of order) spots.set(entry.index, rowSpot(rows, rug, entry.productId));
  return products.map((_, index) => spots.get(index) ?? { x: rug.x, y: rug.y, rotation: 0 });
}

function insideRect(polygon: readonly Point[], rect: Rug): boolean {
  const bounds = polygonBounds(polygon);
  return (
    bounds.minX >= rect.x - OVERLAP_EPSILON &&
    bounds.minY >= rect.y - OVERLAP_EPSILON &&
    bounds.maxX <= rect.x + rect.width + OVERLAP_EPSILON &&
    bounds.maxY <= rect.y + rect.depth + OVERLAP_EPSILON
  );
}

export function isOnOwnRug(set: FloorSet, rugs: readonly Rug[]): boolean {
  const rug = rugs[set.bay];
  return (
    rug !== undefined &&
    set.pieces.every((piece) => insideRect(spotPolygon(piece.productId, piece.spot), rug))
  );
}

export function arrangeIssue(
  showroom: ShowroomState,
  setId: string,
  piece: number,
  spot: FloorSpot,
): string | null {
  const set = showroom.floor.find((entry) => entry.setId === setId);
  const target = set?.pieces[piece];
  if (set === undefined || target === undefined) return "That piece is not on the floor.";
  if (!QUARTER_TURNS.includes(spot.rotation) || !Number.isInteger(spot.x) || !Number.isInteger(spot.y))
    return "That spot is not on the floor.";
  const polygon = spotPolygon(target.productId, spot);
  if (!insideRect(polygon, { x: 0, y: 0, width: FLOOR.width, depth: FLOOR.depth }))
    return "Keep it inside the showroom.";
  const others = showroom.floor.flatMap((entry) =>
    entry.pieces.flatMap((other, index) =>
      entry.setId === setId && index === piece ? [] : [spotPolygon(other.productId, other.spot)],
    ),
  );
  return others.some((other) => polygonsOverlap(polygon, other)) ? "It bumps into another piece." : null;
}

export function arrangeFloorPiece(
  state: GameState,
  setId: string,
  piece: number,
  spot: FloorSpot,
): GameState {
  const showroom = state.showroom;
  if (showroom === null || arrangeIssue(showroom, setId, piece, spot) !== null) return state;
  const set = showroom.floor.find((entry) => entry.setId === setId);
  const current = set?.pieces[piece];
  if (current === undefined) return state;
  const same =
    current.spot.x === spot.x && current.spot.y === spot.y && current.spot.rotation === spot.rotation;
  if (same) return state;
  const spotFixed: FloorSpot = { x: spot.x, y: spot.y, rotation: spot.rotation };
  return {
    ...state,
    showroom: {
      ...showroom,
      floor: showroom.floor.map((entry) =>
        entry.setId !== setId
          ? entry
          : {
              ...entry,
              pieces: entry.pieces.map((item, index) =>
                index === piece ? { ...item, spot: spotFixed } : item,
              ),
            },
      ),
    },
  };
}
