import { updateActiveRun } from "../../../engine/activeRunUpdate";
import { isCount } from "../../../engine/count";
import { PAIR_PRODUCT_IDS, type ProductId } from "../content/product";
import type { GameState } from "./gameState";
import { MAX_JOIN_TICKS, warmthBand, warmthStep, type JoinZone } from "./joiningLamp";
import { runJoints } from "./joinRecord";
import type { JoinRecord, PieceRun } from "./pieceRun";
import { skillMultiplier, type SkillState } from "./skillTolerance";
import { queueStoryTrigger } from "./storyQueue";

const TWIN_STARTS = [0.7, 0.76] as const;
const BASE_ZONE_WIDTH = 0.15;
const STAND_MULTIPLIER = 1.15;
export const TWIN_GLOW_TICKS = 90;

export interface TwinSeam {
  readonly insideTicks: number;
  readonly overTicks: number;
  readonly doneAt: number;
}

export interface TwinLamp {
  readonly warmth: number;
  readonly ticks: number;
  readonly seams: readonly [TwinSeam, TwinSeam];
}

const COLD_SEAM: TwinSeam = { insideTicks: 0, overTicks: 0, doneAt: 0 };
export const COLD_TWIN: TwinLamp = { warmth: 0, ticks: 0, seams: [COLD_SEAM, COLD_SEAM] };

export function isPairProduct(productId: ProductId): boolean {
  return PAIR_PRODUCT_IDS.includes(productId);
}

export function twinOffered(state: Pick<GameState, "career">, run: PieceRun): boolean {
  return state.career === "collection" && isPairProduct(run.design.productId);
}

export function twinZones(state: SkillState): readonly [JoinZone, JoinZone] {
  const stand = state.upgrades.includes("twin-lamp-stand") ? STAND_MULTIPLIER : 1;
  const width = BASE_ZONE_WIDTH * skillMultiplier(state, "gentle-lamp") * stand;
  return [
    { from: TWIN_STARTS[0], to: TWIN_STARTS[0] + width },
    { from: TWIN_STARTS[1], to: TWIN_STARTS[1] + width },
  ];
}

function seamTick(seam: TwinSeam, band: string, tick: number, needed: number): TwinSeam {
  if (seam.insideTicks >= needed) return seam;
  const insideTicks = seam.insideTicks + (band === "inside" ? 1 : 0);
  return {
    insideTicks,
    overTicks: seam.overTicks + (band === "over" ? 1 : 0),
    doneAt: insideTicks >= needed ? tick : seam.doneAt,
  };
}

export function twinTick(
  lamp: TwinLamp,
  holding: boolean,
  warmRate: number,
  zones: readonly [JoinZone, JoinZone],
  needed: readonly [number, number],
): TwinLamp {
  const warmth = warmthStep(lamp.warmth, holding, warmRate);
  const bands = [warmthBand(warmth, zones[0]), warmthBand(warmth, zones[1])] as const;
  if (lamp.ticks === 0 && bands[0] !== "inside" && bands[1] !== "inside") return { ...lamp, warmth };
  const tick = lamp.ticks + 1;
  return {
    warmth,
    ticks: tick,
    seams: [
      seamTick(lamp.seams[0], bands[0], tick, needed[0]),
      seamTick(lamp.seams[1], bands[1], tick, needed[1]),
    ],
  };
}

export function overlapCentre(zones: readonly [JoinZone, JoinZone]): number {
  return (Math.max(zones[0].from, zones[1].from) + Math.min(zones[0].to, zones[1].to)) / 2;
}

export function twinSteadyTick(
  lamp: TwinLamp,
  zones: readonly [JoinZone, JoinZone],
  needed: readonly [number, number],
): TwinLamp {
  const tick = lamp.ticks + 1;
  return {
    warmth: overlapCentre(zones),
    ticks: tick,
    seams: [
      seamTick(lamp.seams[0], "inside", tick, needed[0]),
      seamTick(lamp.seams[1], "inside", tick, needed[1]),
    ],
  };
}

export function twinDone(lamp: TwinLamp, needed: readonly [number, number]): boolean {
  return lamp.seams[0].insideTicks >= needed[0] && lamp.seams[1].insideTicks >= needed[1];
}

export function twinGlows(seams: readonly [TwinSeam, TwinSeam]): boolean {
  return Math.abs(seams[0].doneAt - seams[1].doneAt) <= TWIN_GLOW_TICKS;
}

function seamFits(seam: TwinSeam, ticks: number, needed: number): boolean {
  return (
    isCount(seam.insideTicks) &&
    isCount(seam.overTicks) &&
    isCount(seam.doneAt) &&
    seam.insideTicks + seam.overTicks <= ticks &&
    seam.insideTicks >= needed &&
    seam.doneAt >= needed &&
    seam.doneAt <= ticks
  );
}

export function recordTwinJoin(
  state: GameState,
  ticks: number,
  seams: readonly [TwinSeam, TwinSeam],
  assisted: boolean,
): GameState {
  const run = state.activeRun;
  if (run === null || !twinOffered(state, run) || typeof assisted !== "boolean") return state;
  if (!isCount(ticks) || ticks > MAX_JOIN_TICKS || seams.length !== 2) return state;
  const joints = runJoints(run);
  const [first, second] = joints;
  if (joints.length !== 2 || first === undefined || second === undefined) return state;
  if (Object.keys(run.joins).length > 0) return state;
  if (!seamFits(seams[0], ticks, first.ticks) || !seamFits(seams[1], ticks, second.ticks)) return state;
  const glow = twinGlows(seams);
  const record = (seam: TwinSeam): JoinRecord => ({
    ticks,
    insideTicks: seam.insideTicks,
    overTicks: seam.overTicks,
    assisted,
    twin: true,
  });
  const joined = updateActiveRun(state, "join", (current) => ({
    ...current,
    joins: { [first.id]: record(seams[0]), [second.id]: record(seams[1]) },
    twinGlow: glow,
  }));
  return glow && joined !== state ? queueStoryTrigger(joined, "first-twin") : joined;
}

export function twinRecordsFit(run: PieceRun): boolean {
  const records = Object.values(run.joins);
  const twins = records.filter((record) => record.twin);
  if (twins.length === 0) return !run.twinGlow;
  if (!isPairProduct(run.design.productId) || twins.length !== records.length || twins.length !== 2)
    return false;
  const [a, b] = twins;
  return a !== undefined && b !== undefined && a.ticks === b.ticks;
}
