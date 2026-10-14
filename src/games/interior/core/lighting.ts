import type { Cell } from "../content/furniture";
import type { LightId, LightMood } from "../content/light";
import type { RoomTemplate } from "../content/roomTemplate";
import { furnitureById, lightById } from "./catalog";
import {
  cellKey,
  doorSwing,
  inRoom,
  isWallEdge,
  pieceCells,
  pieceUseCells,
  roomCells,
  type PlacedPiece,
} from "./floorPlan";

const LIT_HUNDREDTHS = 60;
const SUN_STEPS = [30, 60, 100] as const;
const LIT_WEIGHT = 0.8;
const MOOD_WEIGHT = 0.2;

export interface PlacedLight {
  readonly lightId: LightId;
  readonly col: number;
  readonly row: number;
}

export interface Spot {
  readonly pieceId: string;
  readonly cells: readonly Cell[];
}

interface SpotLight {
  readonly spot: Spot;
  readonly hundredths: number;
  readonly lit: boolean;
}

function luxAt(cell: Cell, lights: readonly PlacedLight[]): number {
  return lights.reduce((sum, light) => {
    const def = lightById(light.lightId);
    const distance = Math.hypot(cell[0] - light.col, cell[1] - light.row);
    return sum + def.strength * Math.max(0, 1 - distance / def.radius);
  }, 0);
}

export function sunIcons(hundredths: number): number {
  return SUN_STEPS.filter((step) => hundredths >= step).length;
}

function roomSpots(room: RoomTemplate, pieces: readonly PlacedPiece[]): Spot[] {
  return pieces.flatMap((piece) => {
    if (!furnitureById(piece.furnitureId).spot) return [];
    const cells = pieceUseCells(piece).filter((cell) => inRoom(room, cell));
    return cells.length === 0 ? [] : [{ pieceId: piece.id, cells }];
  });
}

export function spotLight(spot: Spot, lights: readonly PlacedLight[]): SpotLight {
  const total = spot.cells.reduce((sum, cell) => sum + luxAt(cell, lights), 0);
  const hundredths = Math.round((100 * total) / spot.cells.length);
  return { spot, hundredths, lit: hundredths >= LIT_HUNDREDTHS };
}

export function litSpots(room: RoomTemplate, pieces: readonly PlacedPiece[], lights: readonly PlacedLight[]) {
  const spots = roomSpots(room, pieces).map((spot) => spotLight(spot, lights));
  return { spots, lit: spots.filter((entry) => entry.lit).length, total: spots.length };
}

export function moodMatch(mood: LightMood, lights: readonly PlacedLight[]): number {
  if (mood === "any") return 1;
  if (lights.length === 0) return 0;
  return lights.filter((light) => lightById(light.lightId).warmth === mood).length / lights.length;
}

export function lightScore(
  room: RoomTemplate,
  pieces: readonly PlacedPiece[],
  lights: readonly PlacedLight[],
  mood: LightMood,
): number {
  if (lights.length === 0) return 0;
  const { lit, total } = litSpots(room, pieces, lights);
  const share = total === 0 ? 1 : lit / total;
  return LIT_WEIGHT * share + MOOD_WEIGHT * moodMatch(mood, lights);
}

export function canMountAt(
  room: RoomTemplate,
  pieces: readonly PlacedPiece[],
  others: readonly PlacedLight[],
  lightId: LightId,
  cell: Cell,
): boolean {
  if (!inRoom(room, cell)) return false;
  const key = cellKey(cell);
  if (others.some((light) => light.col === cell[0] && light.row === cell[1])) return false;
  const mount = lightById(lightId).mount;
  if (mount === "ceiling") return true;
  const door = new Set(doorSwing(room).map(cellKey));
  if (mount === "wall") return isWallEdge(room, cell) && !door.has(key);
  if (mount === "desk")
    return pieces.some(
      (piece) =>
        furnitureById(piece.furnitureId).holdsLamp &&
        pieceCells(piece).some((entry) => cellKey(entry) === key),
    );
  const blocked = new Set([
    ...pieces.flatMap((piece) => [...pieceCells(piece), ...pieceUseCells(piece)]).map(cellKey),
    ...door,
  ]);
  return !blocked.has(key);
}

export function mountCells(
  room: RoomTemplate,
  pieces: readonly PlacedPiece[],
  others: readonly PlacedLight[],
  lightId: LightId,
): Cell[] {
  return roomCells(room).filter((cell) => canMountAt(room, pieces, others, lightId, cell));
}

function improvement(
  room: RoomTemplate,
  pieces: readonly PlacedPiece[],
  before: readonly PlacedLight[],
  after: readonly PlacedLight[],
) {
  const was = roomSpots(room, pieces).map((spot) => spotLight(spot, before));
  const now = roomSpots(room, pieces).map((spot) => spotLight(spot, after));
  let newlyLit = 0;
  let gain = 0;
  was.forEach((entry, index) => {
    const next = now[index];
    if (entry.lit || next === undefined) return;
    if (next.lit) newlyLit += 1;
    gain += Math.min(next.hundredths, LIT_HUNDREDTHS) - entry.hundredths;
  });
  return { newlyLit, gain };
}

export function bestLightCell(
  room: RoomTemplate,
  pieces: readonly PlacedPiece[],
  placed: readonly PlacedLight[],
  lightId: LightId,
): Cell | null {
  let best: { cell: Cell; newlyLit: number; gain: number } | null = null;
  for (const cell of mountCells(room, pieces, placed, lightId)) {
    const score = improvement(room, pieces, placed, [...placed, { lightId, col: cell[0], row: cell[1] }]);
    if (
      best === null ||
      score.newlyLit > best.newlyLit ||
      (score.newlyLit === best.newlyLit && score.gain > best.gain)
    )
      best = { cell, ...score };
  }
  return best === null ? null : best.cell;
}
