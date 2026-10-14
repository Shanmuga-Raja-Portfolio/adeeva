import type { Point } from "../../../../engine/geometry/point";
import type { RoomTemplate } from "../../content/roomTemplate";

export const CUTAWAY_WIDTH = 640;
export const CUTAWAY_HEIGHT = 420;

const CELL = 56;
const SHIFT = 16;
const DEPTH = 24;
const WALL = 150;
const MARGIN_X = 22;
const MARGIN_TOP = 18;
const MARGIN_BOTTOM = 30;

export interface CutawayFrame {
  readonly scale: number;
  readonly ox: number;
  readonly oy: number;
  readonly cell: number;
  readonly shift: number;
  readonly depth: number;
  readonly wall: number;
  readonly cols: number;
  readonly rows: number;
}

export function cutawayFrame(room: Pick<RoomTemplate, "cols" | "rows">): CutawayFrame {
  const width = room.cols * CELL + room.rows * SHIFT;
  const height = WALL + room.rows * DEPTH;
  const scale = Math.min(
    (CUTAWAY_WIDTH - 2 * MARGIN_X) / width,
    (CUTAWAY_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM) / height,
  );
  const usedWidth = width * scale;
  const usedHeight = height * scale;
  const left = (CUTAWAY_WIDTH - usedWidth) / 2;
  const top = MARGIN_TOP + (CUTAWAY_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM - usedHeight) / 2;
  return {
    scale,
    ox: left + room.rows * SHIFT * scale,
    oy: top + WALL * scale,
    cell: CELL * scale,
    shift: SHIFT * scale,
    depth: DEPTH * scale,
    wall: WALL * scale,
    cols: room.cols,
    rows: room.rows,
  };
}

export function floorPoint(frame: CutawayFrame, col: number, row: number): Point {
  return [frame.ox + col * frame.cell - row * frame.shift, frame.oy + row * frame.depth];
}

export function pointsAttr(points: readonly Point[]): string {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

export function floorQuad(
  frame: CutawayFrame,
  col: number,
  row: number,
  width: number,
  depth: number,
): Point[] {
  return [
    floorPoint(frame, col, row),
    floorPoint(frame, col + width, row),
    floorPoint(frame, col + width, row + depth),
    floorPoint(frame, col, row + depth),
  ];
}

export function lifted(point: Point, height: number): Point {
  return [point[0], point[1] - height];
}
