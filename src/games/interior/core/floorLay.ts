import { ownEntry } from "../../../engine/ownEntry";
import { sameFields } from "../../../engine/sameFields";
import { updateActiveRun } from "../../../engine/activeRunUpdate";
import { clamp } from "../../../engine/clamp";
import { nextRandom } from "../../../engine/rng";
import type { FloorPattern } from "../content/floor";
import { floorById } from "./catalog";
import type { GameState } from "./gameState";
import type { FloorRecord, MakeoverRun } from "./makeoverRun";
import { capped, floorTolerance } from "./skillTolerance";

export type PieceTone = "plain" | "light" | "dark";

interface FloorPiece {
  readonly index: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly tone: PieceTone;
}

export interface FloorCandidate {
  readonly key: string;
  readonly width: number;
  readonly height: number;
  readonly tone: PieceTone;
}

export const FLOOR_PIECES = 6;
export const FLOOR_PX_PER_CM = 4;
export const FLOOR_GATE = 1.5;
const FLOOR_CURVE = 0.4;
const BOARD_DEPTH = 15;
const TILE = 30;
const TILE_COLUMNS = 3;

const BOARD_LAYOUT: readonly (readonly [number, number, number])[] = [
  [0, 0, 60],
  [60, 0, 60],
  [0, 15, 30],
  [30, 15, 60],
  [0, 30, 60],
  [60, 30, 60],
];

export function floorCanvas(pattern: FloorPattern): { readonly width: number; readonly height: number } {
  return pattern === "boards" ? { width: 120, height: 45 } : { width: 90, height: 60 };
}

export function runPattern(run: MakeoverRun): FloorPattern {
  return run.plan.floor === null ? "boards" : floorById(run.plan.floor).pattern;
}

export function floorPieces(pattern: FloorPattern): FloorPiece[] {
  if (pattern === "boards")
    return BOARD_LAYOUT.map(([x, y, width], index) => ({
      index,
      x,
      y,
      width,
      height: BOARD_DEPTH,
      tone: "plain",
    }));
  return Array.from({ length: FLOOR_PIECES }, (_, index) => {
    const column = index % TILE_COLUMNS;
    const row = Math.floor(index / TILE_COLUMNS);
    const tone: PieceTone = pattern === "checker" ? ((column + row) % 2 === 0 ? "dark" : "light") : "plain";
    return { index, x: column * TILE, y: row * TILE, width: TILE, height: TILE, tone };
  });
}

function candidate(width: number, height: number, tone: PieceTone): FloorCandidate {
  return { key: `${width}x${height}-${tone}`, width, height, tone };
}

function wrongOnes(pattern: FloorPattern, piece: FloorPiece): FloorCandidate[] {
  if (pattern === "boards")
    return [piece.width === 60 ? 30 : 60, 45].map((width) => candidate(width, BOARD_DEPTH, "plain"));
  if (pattern === "checker")
    return [candidate(TILE, TILE, piece.tone === "dark" ? "light" : "dark"), candidate(40, TILE, piece.tone)];
  return [candidate(20, TILE, "plain"), candidate(40, TILE, "plain")];
}

export function rightCandidate(piece: FloorPiece): FloorCandidate {
  return candidate(piece.width, piece.height, piece.tone);
}

export function floorCandidates(run: MakeoverRun, piece: FloorPiece): FloorCandidate[] {
  const pool = [rightCandidate(piece), ...wrongOnes(runPattern(run), piece)];
  let rng = (run.seed + piece.index * 7919) | 0;
  const shuffled: FloorCandidate[] = [];
  while (pool.length > 0) {
    const [roll, next] = nextRandom(rng);
    rng = next;
    shuffled.push(...pool.splice(Math.floor(roll * pool.length), 1));
  }
  return shuffled;
}

export function isRightPiece(run: MakeoverRun, pieceIndex: number, candidateKey: string): boolean {
  const piece = floorPieces(runPattern(run))[pieceIndex];
  return piece !== undefined && rightCandidate(piece).key === candidateKey;
}

export function laidCount(run: MakeoverRun): number {
  let count = 0;
  while (count < FLOOR_PIECES && Object.hasOwn(run.floorLaid, String(count))) count += 1;
  return count;
}

export function floorAccuracy(offset: number, tolerance: number): number {
  return clamp(1 - FLOOR_CURVE * (offset / tolerance) ** 2, 0, 1);
}

export function isPastGate(offset: number, tolerance: number): boolean {
  return !Number.isFinite(offset) || offset < 0 || offset > FLOOR_GATE * tolerance;
}

interface FloorDrop {
  readonly pieceIndex: number;
  readonly candidateKey: string;
  readonly x: number;
  readonly y: number;
  readonly assisted: boolean;
}

export function dropOffset(run: MakeoverRun, drop: Pick<FloorDrop, "pieceIndex" | "x" | "y">): number {
  const piece = floorPieces(runPattern(run))[drop.pieceIndex];
  if (piece === undefined) return Infinity;
  return Math.hypot(drop.x - piece.x, drop.y - piece.y);
}

export function layFloor(state: GameState, drop: FloorDrop): GameState {
  const tolerance = floorTolerance(state);
  return updateActiveRun(state, "floor", (run) => {
    if (!Number.isInteger(drop.pieceIndex) || drop.pieceIndex < 0 || drop.pieceIndex > laidCount(run))
      return null;
    if (drop.pieceIndex >= FLOOR_PIECES || typeof drop.assisted !== "boolean") return null;
    if (!isRightPiece(run, drop.pieceIndex, drop.candidateKey)) return null;
    const exact = dropOffset(run, drop);
    if (isPastGate(exact, tolerance)) return null;
    const offset = Math.round(exact * 100) / 100;
    const record: FloorRecord = {
      offset,
      accuracy: floorAccuracy(offset, tolerance),
      assisted: drop.assisted || offset === 0,
    };
    const key = String(drop.pieceIndex);
    if (sameFields(ownEntry(run.floorLaid, key), record)) return null;
    return { ...run, floorLaid: { ...run.floorLaid, [key]: record } };
  });
}

export function floorScore(state: Pick<GameState, "profile">, run: MakeoverRun): number {
  const total = Array.from({ length: FLOOR_PIECES }, (_, index) => {
    const record = ownEntry(run.floorLaid, String(index));
    return record === undefined ? 0 : capped(state, record.accuracy, record.assisted);
  }).reduce((sum, value) => sum + value, 0);
  return total / FLOOR_PIECES;
}

export function floorIssues(run: MakeoverRun): string[] {
  const left = FLOOR_PIECES - laidCount(run);
  return left === 0 ? [] : [`Lay ${left} more floor ${left === 1 ? "piece" : "pieces"}.`];
}
