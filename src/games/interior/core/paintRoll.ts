import { ownEntry } from "../../../engine/ownEntry";
import { clamp } from "../../../engine/clamp";
import type { Point } from "../../../engine/geometry/point";
import { polylineLength } from "../../../engine/geometry/polylineLength";
import { projectOnSegment } from "../../../engine/geometry/segmentProjection";
import { WALL_IDS, type WallId } from "../content/roomTemplate";
import { roomById } from "./catalog";
import type { GameState } from "./gameState";
import { ROLLER_LOAD, ROLLER_ZONES, type MakeoverRun, type RollerZone, type RollRecord } from "./makeoverRun";
import { withPaintRun } from "./paintWork";
import { cellZone, zonedWall } from "./twoTone";
import { edgeScore } from "./paintEdge";
import { capped, splatSpeed } from "./skillTolerance";

export const ROLL_COLUMNS = 8;
export const ROLL_ROWS = 5;
export const ROLL_CELL_PX = 64;
export const ROLL_CANVAS = { width: ROLL_COLUMNS * ROLL_CELL_PX, height: ROLL_ROWS * ROLL_CELL_PX } as const;
const ROLLER_REACH_PX = 36;
export const MIN_STROKE_PX = 30;
const MIN_STROKE_MS = 50;
const MAX_STROKE_MS = 600000;
const MAX_STROKE_POINTS = 2000;
export const MAX_STROKES_PER_WALL = 300;
export const MAX_PASSES = 9;
const FULL_COATS = 2;
const WALL_ROLLED_SHARE = 0.9;
const WINDOW_COLUMNS = [3, 4];
const WINDOW_ROWS = [1, 2];
const SPLAT_PENALTY = 0.05;
const SPLAT_FLOOR = 0.7;
const DRY_PENALTY = 0.1;
const MAX_DRY_COUNTED = 3;

interface RollStroke {
  readonly points: readonly Point[];
  readonly durationMs: number;
}

export function emptyRoll(): RollRecord {
  return {
    passes: Array.from({ length: ROLL_COLUMNS * ROLL_ROWS }, () => 0),
    strokes: 0,
    splats: [],
    dryStrokes: 0,
    smudges: 0,
    assisted: false,
    byCrew: false,
  };
}

export function hasWindow(run: Pick<MakeoverRun, "brief">, wall: WallId): boolean {
  return roomById(run.brief.roomId).framedWalls.includes(wall);
}

export function isPaintable(run: Pick<MakeoverRun, "brief">, wall: WallId, cell: number): boolean {
  if (!hasWindow(run, wall)) return true;
  return !(
    WINDOW_COLUMNS.includes(cell % ROLL_COLUMNS) && WINDOW_ROWS.includes(Math.floor(cell / ROLL_COLUMNS))
  );
}

export function paintableCells(run: Pick<MakeoverRun, "brief">, wall: WallId): number[] {
  return Array.from({ length: ROLL_COLUMNS * ROLL_ROWS }, (_, cell) => cell).filter((cell) =>
    isPaintable(run, wall, cell),
  );
}

export function rollRecord(run: MakeoverRun, wall: WallId): RollRecord {
  return ownEntry(run.rolls, wall) ?? emptyRoll();
}

function cellCentre(cell: number): Point {
  return [
    ((cell % ROLL_COLUMNS) + 0.5) * ROLL_CELL_PX,
    (Math.floor(cell / ROLL_COLUMNS) + 0.5) * ROLL_CELL_PX,
  ];
}

export function crossedCells(
  run: Pick<MakeoverRun, "brief">,
  wall: WallId,
  points: readonly Point[],
): number[] {
  const crossed: number[] = [];
  const cells = paintableCells(run, wall);
  for (const [index, end] of points.entries()) {
    const start = points[index - 1];
    if (start === undefined) continue;
    const hits = cells
      .filter((cell) => !crossed.includes(cell))
      .map((cell) => ({ cell, ...projectOnSegment(cellCentre(cell), start, end) }))
      .filter((hit) => hit.distance <= ROLLER_REACH_PX)
      .sort((a, b) => a.t - b.t || a.cell - b.cell);
    crossed.push(...hits.map((hit) => hit.cell));
  }
  return crossed;
}

function wellFormed(stroke: RollStroke): boolean {
  return (
    stroke.points.length >= 2 &&
    stroke.points.length <= MAX_STROKE_POINTS &&
    stroke.points.every((point) => Number.isFinite(point[0]) && Number.isFinite(point[1])) &&
    Number.isFinite(stroke.durationMs) &&
    stroke.durationMs >= MIN_STROKE_MS &&
    stroke.durationMs <= MAX_STROKE_MS &&
    polylineLength(stroke.points) >= MIN_STROKE_PX
  );
}

function strokeSpeed(stroke: RollStroke): number {
  return (polylineLength(stroke.points) * 1000) / stroke.durationMs;
}

export function isSplat(state: GameState, stroke: RollStroke): boolean {
  return strokeSpeed(stroke) > splatSpeed(state);
}

function splatPoint(point: Point): Point {
  return [
    Math.round(clamp(point[0], 0, ROLL_CANVAS.width)),
    Math.round(clamp(point[1], 0, ROLL_CANVAS.height)),
  ];
}

export function rollStroke(state: GameState, wall: WallId, stroke: RollStroke): GameState {
  if (!WALL_IDS.includes(wall) || !wellFormed(stroke)) return state;
  return withPaintRun(state, (run) => {
    const record = rollRecord(run, wall);
    if (record.strokes >= MAX_STROKES_PER_WALL) return null;
    const passes = [...record.passes];
    let load = run.roller;
    let smudges = record.smudges;
    const dry = load === 0;
    const zoned = zonedWall(run, wall);
    if (!dry)
      for (const cell of crossedCells(run, wall, stroke.points)) {
        if (load === 0) break;
        load -= 1;
        if (zoned && cellZone(Math.floor(cell / ROLL_COLUMNS)) !== run.rollerZone) {
          smudges += 1;
          continue;
        }
        passes[cell] = Math.min(MAX_PASSES, (passes[cell] ?? 0) + 1);
      }
    const end = stroke.points[stroke.points.length - 1];
    const splat = isSplat(state, stroke) && end !== undefined;
    const next: RollRecord = {
      ...record,
      passes,
      strokes: record.strokes + 1,
      dryStrokes: record.dryStrokes + (dry ? 1 : 0),
      smudges,
      splats: splat ? [...record.splats, splatPoint(end)] : record.splats,
    };
    return { ...run, roller: load, rolls: { ...run.rolls, [wall]: next } };
  });
}

export function reloadRoller(state: GameState): GameState {
  return withPaintRun(state, (run) => (run.roller === ROLLER_LOAD ? null : { ...run, roller: ROLLER_LOAD }));
}

export function pickTray(state: GameState, zone: RollerZone): GameState {
  if (!ROLLER_ZONES.includes(zone)) return state;
  return withPaintRun(state, (run) => {
    if (run.plan.lowerPaint === null) return null;
    if (run.rollerZone === zone && run.roller === ROLLER_LOAD) return null;
    return { ...run, rollerZone: zone, roller: ROLLER_LOAD };
  });
}

export function rollCoverage(run: MakeoverRun, wall: WallId): number {
  const cells = paintableCells(run, wall);
  const passes = rollRecord(run, wall).passes;
  const coats = cells.reduce((sum, cell) => sum + Math.min(passes[cell] ?? 0, FULL_COATS), 0);
  return coats / (FULL_COATS * cells.length);
}

export function coatedShare(run: MakeoverRun, wall: WallId): number {
  const cells = paintableCells(run, wall);
  const passes = rollRecord(run, wall).passes;
  return cells.filter((cell) => (passes[cell] ?? 0) > 0).length / cells.length;
}

export function isWallRolled(run: MakeoverRun, wall: WallId): boolean {
  return coatedShare(run, wall) >= WALL_ROLLED_SHARE;
}

export function rollScore(state: Pick<GameState, "profile">, run: MakeoverRun, wall: WallId): number {
  const record = rollRecord(run, wall);
  if (record.byCrew) return rollCoverage(run, wall) * edgeScore(state, run, wall);
  const raw =
    rollCoverage(run, wall) *
    Math.max(SPLAT_FLOOR, 1 - SPLAT_PENALTY * (record.splats.length + record.smudges)) *
    (1 - DRY_PENALTY * Math.min(MAX_DRY_COUNTED, record.dryStrokes));
  return capped(state, raw, record.assisted);
}
