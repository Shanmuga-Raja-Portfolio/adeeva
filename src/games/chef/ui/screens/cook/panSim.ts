import type { SizzleDef } from "../../../content/dish";
import {
  AUTO_OFF_COOK,
  cookPerTick,
  MAX_PAN_TICKS,
  type PanEvent,
  type PanZone,
  type SizzleRecord,
} from "../../../core";

export const PAN_CENTRE = 200;
export const PAN_RADIUS = 168;
export const CENTRE_SHARE = 0.55;
export const READY_COOK = 0.95;

export interface PieceSim {
  readonly sides: readonly number[];
  readonly side: number;
  readonly zone: PanZone;
  readonly off: boolean;
  readonly events: readonly PanEvent[];
  readonly x: number;
  readonly y: number;
}

export interface PanSim {
  readonly heat: number;
  readonly tick: number;
  readonly pieces: readonly PieceSim[];
}

export function startPan(def: SizzleDef, heat: number): PanSim {
  return {
    heat,
    tick: 0,
    pieces: Array.from({ length: def.count }, (_, index) => {
      const angle = (index / def.count) * Math.PI * 2 - Math.PI / 2;
      const ring = def.count === 1 ? 0 : 52;
      return {
        sides: Array.from({ length: def.flips + 1 }, () => 0),
        side: 0,
        zone: "centre",
        off: false,
        events: [],
        x: PAN_CENTRE + Math.cos(angle) * ring,
        y: PAN_CENTRE + Math.sin(angle) * ring,
      };
    }),
  };
}

function withEvent(piece: PieceSim, event: PanEvent): PieceSim | null {
  const last = piece.events[piece.events.length - 1];
  if (piece.off || (last !== undefined && last.tick >= event.tick)) return null;
  return { ...piece, events: [...piece.events, event] };
}

function replacePiece(sim: PanSim, index: number, piece: PieceSim | null): PanSim {
  if (piece === null) return sim;
  return { ...sim, pieces: sim.pieces.map((entry, at) => (at === index ? piece : entry)) };
}

export function stepPan(sim: PanSim, def: SizzleDef, ticks: number): PanSim {
  let next = sim;
  for (let step = 0; step < ticks; step += 1) {
    const tick = next.tick + 1;
    const pieces = next.pieces.map((piece, index) => {
      if (piece.off) return piece;
      const cooked =
        (piece.sides[piece.side] ?? 0) + cookPerTick(next.heat, def.idealDots, piece.zone, index);
      const sides = piece.sides.map((value, at) => (at === piece.side ? cooked : value));
      if (cooked < AUTO_OFF_COOK && tick < MAX_PAN_TICKS) return { ...piece, sides };
      return { ...piece, sides, off: true, events: [...piece.events, { tick, kind: "off" as const }] };
    });
    next = { ...next, tick, pieces };
    if (pieces.every((piece) => piece.off)) return next;
  }
  return next;
}

export function flipPiece(sim: PanSim, def: SizzleDef, index: number): PanSim {
  const piece = sim.pieces[index];
  if (piece === undefined || piece.side >= def.flips) return sim;
  const flipped = withEvent(piece, { tick: sim.tick, kind: "flip" });
  return replacePiece(sim, index, flipped === null ? null : { ...flipped, side: piece.side + 1 });
}

export function tossPan(sim: PanSim, def: SizzleDef): PanSim {
  return sim.pieces.reduce(
    (next, piece, index) => (piece.side === 0 ? flipPiece(next, def, index) : next),
    sim,
  );
}

export function movePiece(sim: PanSim, index: number, zone: PanZone, x: number, y: number): PanSim {
  const piece = sim.pieces[index];
  if (piece === undefined || piece.off) return sim;
  if (piece.zone === zone) return replacePiece(sim, index, { ...piece, x, y });
  const moved = withEvent(piece, { tick: sim.tick, kind: zone === "centre" ? "zone-centre" : "zone-rim" });
  return replacePiece(sim, index, moved === null ? null : { ...moved, zone, x, y });
}

export function takeOff(sim: PanSim, index: number): PanSim {
  const piece = sim.pieces[index];
  if (piece === undefined) return sim;
  const off = withEvent(piece, { tick: sim.tick, kind: "off" });
  return replacePiece(sim, index, off === null ? null : { ...off, off: true });
}

export function panDone(sim: PanSim): boolean {
  return sim.pieces.every((piece) => piece.off);
}

export function panRecord(sim: PanSim, assisted: boolean): SizzleRecord {
  return { heat: sim.heat, assisted, pieces: sim.pieces.map((piece) => ({ events: piece.events })) };
}

export function readyFor(piece: PieceSim, def: SizzleDef): "flip" | "off" | null {
  if (piece.off || (piece.sides[piece.side] ?? 0) < READY_COOK) return null;
  return piece.side < def.flips ? "flip" : "off";
}

export function zoneAt(x: number, y: number): PanZone {
  return Math.hypot(x - PAN_CENTRE, y - PAN_CENTRE) <= PAN_RADIUS * CENTRE_SHARE ? "centre" : "rim";
}

export function clampToPan(x: number, y: number): readonly [number, number] {
  const distance = Math.hypot(x - PAN_CENTRE, y - PAN_CENTRE);
  const limit = PAN_RADIUS - 30;
  if (distance <= limit) return [x, y];
  return [
    PAN_CENTRE + ((x - PAN_CENTRE) / distance) * limit,
    PAN_CENTRE + ((y - PAN_CENTRE) / distance) * limit,
  ];
}

export function panNeedsYou(sim: PanSim, def: SizzleDef): boolean {
  return sim.pieces.some((piece) => readyFor(piece, def) !== null);
}
