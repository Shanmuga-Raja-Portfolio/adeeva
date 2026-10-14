import { cappedAccuracy } from "../../../engine/assistCap";
import { average } from "../../../engine/average";
import type { SizzleDef } from "../content/dish";

export const TICKS_PER_SIDE = 360;
export const CENTRE_RATE = 1;
export const RIM_RATE = 0.45;
export const AUTO_OFF_COOK = 1.6;
export const MAX_PAN_TICKS = 3600;
export const SIZZLE_WINDOW = 0.1;
export const SIZZLE_FALLOFF = 0.3;
export const HEAT_FIT_STEP = 0.08;
export const MIN_HEAT = 1;
export const MAX_HEAT = 5;
export const QUICK_SIZZLE_PIECES = 3;
const PIECE_RATE_PATTERN = [1, 0.88, 1.12, 0.94, 1.06] as const;

export const PAN_EVENT_KINDS = ["zone-centre", "zone-rim", "flip", "off"] as const;
export type PanEventKind = (typeof PAN_EVENT_KINDS)[number];
export type PanZone = "centre" | "rim";

export interface PanEvent {
  readonly tick: number;
  readonly kind: PanEventKind;
}

export interface PieceLog {
  readonly events: readonly PanEvent[];
}

export interface SizzleRecord {
  readonly pieces: readonly PieceLog[];
  readonly heat: number;
  readonly assisted: boolean;
}

export interface PieceCook {
  readonly sides: readonly number[];
  readonly offTick: number;
}

export interface SizzleResult {
  readonly accuracy: number;
  readonly heatFit: number;
  readonly sides: readonly number[];
  readonly assisted: boolean;
}

export type Doneness = "pale" | "light" | "golden" | "deep" | "extra-crispy";

export function quickSizzle(def: SizzleDef): SizzleDef {
  return { ...def, count: Math.min(QUICK_SIZZLE_PIECES, def.count) };
}

export function pieceRate(index: number): number {
  return PIECE_RATE_PATTERN[index % PIECE_RATE_PATTERN.length] ?? 1;
}

export function zoneRate(zone: PanZone): number {
  return zone === "centre" ? CENTRE_RATE : RIM_RATE;
}

export function cookPerTick(heat: number, idealDots: number, zone: PanZone, index: number): number {
  return ((heat / idealDots) * zoneRate(zone) * pieceRate(index)) / TICKS_PER_SIDE;
}

export function doneness(cook: number): Doneness {
  if (cook < 0.8) return "pale";
  if (cook < 0.9) return "light";
  if (cook <= 1.1) return "golden";
  if (cook <= 1.3) return "deep";
  return "extra-crispy";
}

function wellOrdered(events: readonly PanEvent[]): boolean {
  return events.every(
    (event, index) =>
      Number.isInteger(event.tick) &&
      event.tick >= 0 &&
      event.tick <= MAX_PAN_TICKS &&
      PAN_EVENT_KINDS.includes(event.kind) &&
      (index === 0 || event.tick > (events[index - 1]?.tick ?? -1)),
  );
}

export function replayPiece(log: PieceLog, heat: number, def: SizzleDef, index: number): PieceCook | null {
  const { events } = log;
  if (!wellOrdered(events)) return null;
  const offs = events.filter((event) => event.kind === "off").length;
  const flips = events.filter((event) => event.kind === "flip").length;
  if (flips > def.flips || offs > 1) return null;
  if (offs === 1 && events[events.length - 1]?.kind !== "off") return null;
  const sides = Array.from({ length: def.flips + 1 }, () => 0);
  let side = 0;
  let zone: PanZone = "centre";
  let tick = 0;
  for (const event of events) {
    const rate = cookPerTick(heat, def.idealDots, zone, index);
    const current = sides[side] ?? 0;
    const reachTick = rate > 0 ? tick + Math.ceil((AUTO_OFF_COOK - current) / rate) : Infinity;
    if (reachTick <= event.tick) {
      sides[side] = current + (reachTick - tick) * rate;
      return { sides, offTick: reachTick };
    }
    sides[side] = current + (event.tick - tick) * rate;
    tick = event.tick;
    if (event.kind === "flip") side += 1;
    else if (event.kind === "zone-centre") zone = "centre";
    else if (event.kind === "zone-rim") zone = "rim";
    else return { sides, offTick: tick };
  }
  return null;
}

export function sideScore(cook: number, window: number): number {
  const miss = Math.abs(cook - 1);
  if (miss <= window) return 1;
  return Math.max(0, 1 - (miss - window) / SIZZLE_FALLOFF);
}

export function heatFit(heat: number, idealDots: number): number {
  return Math.max(0, 1 - HEAT_FIT_STEP * Math.abs(heat - idealDots));
}

export function isValidHeat(heat: number): boolean {
  return Number.isInteger(heat) && heat >= MIN_HEAT && heat <= MAX_HEAT;
}

export function scoreSizzle(def: SizzleDef, record: SizzleRecord, tolerance: number): SizzleResult | null {
  if (!isValidHeat(record.heat) || typeof record.assisted !== "boolean") return null;
  if (record.pieces.length !== def.count) return null;
  const cooks = record.pieces.map((log, index) => replayPiece(log, record.heat, def, index));
  if (cooks.some((cook) => cook === null)) return null;
  const sides = cooks.flatMap((cook) => cook?.sides ?? []);
  const window = SIZZLE_WINDOW * tolerance;
  const fit = heatFit(record.heat, def.idealDots);
  const raw = fit * average(sides.map((cook) => sideScore(cook, window)));
  return {
    accuracy: cappedAccuracy(raw, record.assisted),
    heatFit: fit,
    sides: sides.map((cook) => Math.round(cook * 1000) / 1000),
    assisted: record.assisted,
  };
}
