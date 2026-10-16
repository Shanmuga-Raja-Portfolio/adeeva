import type { Point } from "../../../engine/geometry/point";
import { nextRandom, type RngState } from "../../../engine/rng";
import type { BoardSizeId } from "../content/boardSize";
import { WOOD_IDS, type WoodId } from "../content/wood";
import { boardSizeById, woodById } from "./catalog";
import type { Knot } from "./ownedBoard";
import { designParts, runCanonical, type RunShape } from "./pieceParts";

const MAX_KNOT_REDRAWS = 10;
export const MIN_KNOT_RADIUS = 2;
export const MAX_KNOT_RADIUS = 4;
const KNOT_SIDES = 12;

interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export function knotPolygon(knot: Knot): Point[] {
  return Array.from({ length: KNOT_SIDES }, (_, index): Point => {
    const angle = (index / KNOT_SIDES) * Math.PI * 2;
    return [knot.x + Math.cos(angle) * knot.r, knot.y + Math.sin(angle) * knot.r];
  });
}

export function canonicalRects(run: RunShape, size: BoardSizeId): Rect[] {
  const parts = designParts(run);
  return runCanonical(run)
    .filter((board) => board.size === size)
    .flatMap((board) =>
      board.spots.flatMap((spot) => {
        const part = parts.find((entry) => entry.id === spot.partId);
        return part === undefined ? [] : [{ x: spot.x, y: spot.y, width: part.width, height: part.height }];
      }),
    );
}

function circleTouchesRect(x: number, y: number, r: number, rect: Rect): boolean {
  const nearestX = Math.min(Math.max(x, rect.x), rect.x + rect.width);
  const nearestY = Math.min(Math.max(y, rect.y), rect.y + rect.height);
  return Math.hypot(x - nearestX, y - nearestY) < r + 0.5;
}

function draw(rng: RngState, min: number, max: number): [number, RngState] {
  const [roll, next] = nextRandom(rng);
  return [Math.round((min + roll * (max - min)) * 2) / 2, next];
}

function seedFor(boardNumber: number, woodId: WoodId, size: BoardSizeId): RngState {
  const woodIndex = WOOD_IDS.indexOf(woodId) + 1;
  const sizeIndex = size === "short" ? 1 : size === "long" ? 2 : 3;
  return (boardNumber * 7919 + woodIndex * 104729 + sizeIndex * 15485863) | 0;
}

export function boardKnots(
  boardNumber: number,
  woodId: WoodId,
  size: BoardSizeId,
  avoid: readonly Rect[],
): Knot[] {
  const board = boardSizeById(size);
  const knotty = woodById(woodId).knotty;
  let rng = seedFor(boardNumber, woodId, size);
  const [countRoll, afterCount] = nextRandom(rng);
  rng = afterCount;
  const count = knotty ? 1 + Math.floor(countRoll * 3) : Math.floor(countRoll * 2);
  const knots: Knot[] = [];
  for (let index = 0; index < count; index += 1) {
    for (let attempt = 0; attempt < MAX_KNOT_REDRAWS; attempt += 1) {
      const [r, afterR] = draw(rng, MIN_KNOT_RADIUS, MAX_KNOT_RADIUS);
      const [x, afterX] = draw(afterR, r, board.width - r);
      const [y, afterY] = draw(afterX, r, board.height - r);
      rng = afterY;
      const blocked =
        avoid.some((rect) => circleTouchesRect(x, y, r, rect)) ||
        knots.some((other) => Math.hypot(other.x - x, other.y - y) < other.r + r + 1);
      if (blocked) continue;
      knots.push({ x, y, r });
      break;
    }
  }
  return knots;
}
