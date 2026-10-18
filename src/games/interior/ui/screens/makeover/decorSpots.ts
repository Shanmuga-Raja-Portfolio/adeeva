import type { Point } from "../../../../../engine/geometry/point";
import type { FurnitureId } from "../../../content/furniture";
import type { RoomTemplate } from "../../../content/roomTemplate";
import { furnitureById, pieceCells, type PlacedDecor, type PlacedPiece } from "../../../core";
import { cutawayFrame, floorPoint, lifted } from "../../art/cutawayFrame";

export interface DecorSpot {
  readonly x: number;
  readonly y: number;
}

const SURFACES: Readonly<Partial<Record<FurnitureId, number>>> = {
  "coffee-table": 0.42,
  "dining-table": 0.86,
  "bedside-table": 0.62,
  "chest-of-drawers": 0.95,
  sideboard: 0.82,
  "console-table": 0.86,
  desk: 0.86,
};

const FLOOR_LIFT = 18;
const CLEAR = 44;
const SNAP_RADIUS = 56;

function overlaps(spans: readonly (readonly [number, number])[], from: number, to: number): boolean {
  return spans.some(([a, b]) => from < b && to > a);
}

function wallSpots(room: RoomTemplate, pieces: readonly PlacedPiece[]): Point[] {
  const frame = cutawayFrame(room);
  const backWindows = room.windows
    .filter((window) => window.wall === "back")
    .map((w) => [w.from, w.to] as const);
  const tallBack = pieces
    .filter((piece) => furnitureById(piece.furnitureId).tall)
    .flatMap((piece) =>
      pieceCells(piece)
        .filter(([, row]) => row === 0)
        .map(([col]) => [col, col + 1] as const),
    );
  const back = Array.from({ length: room.cols }, (_, col) => col)
    .filter(
      (col) => !overlaps(backWindows, col + 0.1, col + 0.9) && !overlaps(tallBack, col + 0.1, col + 0.9),
    )
    .map((col) => lifted(floorPoint(frame, col + 0.5, 0), frame.wall * 0.6));
  return back;
}

function floorSpots(room: RoomTemplate, pieces: readonly PlacedPiece[]): Point[] {
  const frame = cutawayFrame(room);
  const taken = new Set(pieces.flatMap((piece) => pieceCells(piece).map(([col, row]) => `${col},${row}`)));
  const free: Point[] = [];
  for (let row = 0; row < room.rows; row += 1)
    for (let col = 0; col < room.cols; col += 1) {
      const doorway = row === room.rows - 1 && (col === room.doorCol || col === room.doorCol + 1);
      if (!taken.has(`${col},${row}`) && !doorway) {
        const [x, y] = floorPoint(frame, col + 0.5, row + 0.6);
        free.push([x, y - FLOOR_LIFT]);
      }
    }
  const tops = pieces.flatMap((piece): Point[] => {
    const lift = SURFACES[piece.furnitureId];
    if (lift === undefined) return [];
    const cells = pieceCells(piece);
    const cols = cells.map(([col]) => col);
    const rows = cells.map(([, row]) => row);
    const midCol = (Math.min(...cols) + Math.max(...cols) + 1) / 2;
    const front = Math.max(...rows) + 1;
    const [x, y] = floorPoint(frame, midCol, front - 0.5);
    return [[x, y - lift * frame.cell - FLOOR_LIFT]];
  });
  return [...tops, ...free];
}

export function decorSpots(
  room: RoomTemplate,
  pieces: readonly PlacedPiece[],
  onWall: boolean,
  decor: readonly PlacedDecor[],
  movingId: string | null,
): DecorSpot[] {
  const others = decor.filter((item) => item.id !== movingId);
  const spots = onWall ? wallSpots(room, pieces) : floorSpots(room, pieces);
  return spots
    .filter(([x, y]) => others.every((item) => Math.hypot(item.x - x, item.y - y) > CLEAR))
    .map(([x, y]) => ({ x: Math.round(x), y: Math.round(y) }));
}

export function nearestSpot(spots: readonly DecorSpot[], x: number, y: number): DecorSpot | null {
  const best = spots.reduce<DecorSpot | null>(
    (found, spot) =>
      found === null || Math.hypot(spot.x - x, spot.y - y) < Math.hypot(found.x - x, found.y - y)
        ? spot
        : found,
    null,
  );
  return best !== null && Math.hypot(best.x - x, best.y - y) <= SNAP_RADIUS ? best : null;
}
