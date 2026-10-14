import { cappedAccuracy } from "../../../engine/assistCap";
import { clamp } from "../../../engine/clamp";
import { isCount } from "../../../engine/count";
import type { JoinRecord } from "./pieceRun";
import { skillMultiplier, type SkillState } from "./skillTolerance";

const LAMP_TICKS_PER_SECOND = 60;
const ZONE_START = 0.7;
const BASE_ZONE_WIDTH = 0.15;
const COOL_RATE = 0.3;
const OVERHEAT_WEIGHT = 1.5;
export const MAX_JOIN_TICKS = 3600;

export interface JoinZone {
  readonly from: number;
  readonly to: number;
}

export interface LampState {
  readonly warmth: number;
  readonly ticks: number;
  readonly insideTicks: number;
  readonly overTicks: number;
}

export const COLD_LAMP: LampState = { warmth: 0, ticks: 0, insideTicks: 0, overTicks: 0 };

export function joinZone(state: SkillState): JoinZone {
  return { from: ZONE_START, to: ZONE_START + BASE_ZONE_WIDTH * skillMultiplier(state, "gentle-lamp") };
}

export function zoneCentre(zone: JoinZone): number {
  return (zone.from + zone.to) / 2;
}

export function warmthBand(warmth: number, zone: JoinZone): "below" | "inside" | "over" {
  if (warmth > zone.to) return "over";
  return warmth >= zone.from ? "inside" : "below";
}

export function warmthStep(warmth: number, holding: boolean, warmRate: number): number {
  const change = (holding ? warmRate : -COOL_RATE) / LAMP_TICKS_PER_SECOND;
  return clamp(warmth + change, 0, 1);
}

export function lampTick(lamp: LampState, holding: boolean, warmRate: number, zone: JoinZone): LampState {
  const warmth = warmthStep(lamp.warmth, holding, warmRate);
  const band = warmthBand(warmth, zone);
  if (lamp.ticks === 0 && band !== "inside") return { ...lamp, warmth };
  return {
    warmth,
    ticks: lamp.ticks + 1,
    insideTicks: lamp.insideTicks + (band === "inside" ? 1 : 0),
    overTicks: lamp.overTicks + (band === "over" ? 1 : 0),
  };
}

export function joinAccuracy(record: JoinRecord): number {
  const counted = record.insideTicks + record.overTicks;
  if (counted === 0) return 0;
  const raw = clamp(1 - (OVERHEAT_WEIGHT * record.overTicks) / counted, 0, 1);
  return cappedAccuracy(raw, record.assisted);
}

export function isJoinDone(record: JoinRecord | undefined, needed: number): boolean {
  return record !== undefined && record.insideTicks >= needed;
}

export function isJoinRecordShape(record: JoinRecord): boolean {
  return (
    isCount(record.ticks) &&
    isCount(record.insideTicks) &&
    isCount(record.overTicks) &&
    record.insideTicks + record.overTicks <= record.ticks &&
    record.ticks <= MAX_JOIN_TICKS &&
    typeof record.assisted === "boolean"
  );
}

export function joinGrows(before: JoinRecord | undefined, sample: JoinRecord): boolean {
  if (before === undefined) return sample.ticks > 0;
  return (
    sample.ticks > before.ticks &&
    sample.insideTicks >= before.insideTicks &&
    sample.overTicks >= before.overTicks &&
    sample.ticks - before.ticks >=
      sample.insideTicks - before.insideTicks + sample.overTicks - before.overTicks
  );
}
