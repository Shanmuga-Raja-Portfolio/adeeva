import { updateActiveRun } from "../../../engine/activeRunUpdate";
import { cappedAccuracy } from "../../../engine/assistCap";
import { average } from "../../../engine/average";
import { clamp } from "../../../engine/clamp";
import { nextRandom } from "../../../engine/rng";
import type { StoneCut } from "../content/stone";
import { productById } from "./catalog";
import type { GameState } from "./gameState";
import { seatCut } from "./partGeometry";
import type { PieceRun, SetRecord } from "./pieceRun";
import { skillMultiplier, type SkillState } from "./skillTolerance";
import { withStones } from "./stock";

const BASE_SEAT_DISTANCE_MM = 0.8;
const BASE_SEAT_ANGLE = 8;
export const SNUG_MARK = 0.8;
const BASE_CLAW_BAND = 0.07;
const CLAW_FALLOFF = 0.15;
export const MAX_CLAW_TRAVEL = 1.2;
export const MAX_STONE_OFFSET_MM = 12;

export interface SetTolerance {
  readonly distance: number;
  readonly angle: number;
  readonly band: number;
}

export interface StonePose {
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
}

export function setTolerance(state: SkillState): SetTolerance {
  const mult = skillMultiplier(state, "magnifier");
  return {
    distance: BASE_SEAT_DISTANCE_MM * mult,
    angle: BASE_SEAT_ANGLE * mult,
    band: BASE_CLAW_BAND * mult,
  };
}

export function clawCount(cut: StoneCut): number {
  return cut === "teardrop" ? 3 : 4;
}

function symmetry(cut: StoneCut): number {
  switch (cut) {
    case "round":
      return 0;
    case "oval":
      return 180;
    case "square":
      return 90;
    case "teardrop":
      return 360;
  }
}

export function angleOff(rotation: number, cut: StoneCut): number {
  const period = symmetry(cut);
  if (period === 0) return 0;
  const turned = ((rotation % period) + period) % period;
  return Math.min(turned, period - turned);
}

export function seatDistance(pose: StonePose): number {
  return Math.hypot(pose.x, pose.y);
}

function seatRatio(pose: StonePose, cut: StoneCut, tolerance: SetTolerance): number {
  const d = seatDistance(pose) / tolerance.distance;
  const a = angleOff(pose.rotation, cut) / tolerance.angle;
  return d * d + a * a;
}

export function isSeated(pose: StonePose, cut: StoneCut, tolerance: SetTolerance): boolean {
  return seatRatio(pose, cut, tolerance) <= 1;
}

export function seatFit(pose: StonePose, cut: StoneCut, tolerance: SetTolerance): number {
  return clamp(1 - 0.5 * seatRatio(pose, cut, tolerance), 0, 1);
}

const EDGE_EPSILON = 1e-9;

export function clawScore(travel: number, band: number): number {
  const off = Math.abs(travel - SNUG_MARK);
  if (off <= band + EDGE_EPSILON) return 1;
  return Math.max(0, 1 - (off - band) / CLAW_FALLOFF);
}

export function isClawBent(travel: number): boolean {
  return travel > 1;
}

export function setAccuracy(
  pose: StonePose,
  claws: readonly number[],
  cut: StoneCut,
  tolerance: SetTolerance,
  assisted: boolean,
): number {
  const raw =
    0.5 * seatFit(pose, cut, tolerance) + 0.5 * average(claws.map((claw) => clawScore(claw, tolerance.band)));
  return cappedAccuracy(raw, assisted);
}

export function startPose(seed: number, seatIndex: number, cut: StoneCut): StonePose {
  const [angleRoll, afterAngle] = nextRandom((seed + Math.imul(seatIndex + 1, 7919)) | 0);
  const [distanceRoll, afterDistance] = nextRandom(afterAngle);
  const [turnRoll, afterTurn] = nextRandom(afterDistance);
  const [signRoll] = nextRandom(afterTurn);
  const angle = angleRoll * 2 * Math.PI;
  const distance = 3 + 2 * distanceRoll;
  const turn = cut === "round" ? 0 : (15 + 15 * turnRoll) * (signRoll < 0.5 ? -1 : 1);
  return {
    x: Math.round(distance * Math.cos(angle) * 100) / 100,
    y: Math.round(distance * Math.sin(angle) * 100) / 100,
    rotation: Math.round(turn),
  };
}

export function runSeats(run: PieceRun): readonly string[] {
  return productById(run.design.productId).seats;
}

function takeStones(state: GameState, run: PieceRun): GameState | null {
  if (run.stonesTaken) return state;
  const stoneId = run.design.stoneId;
  const count = runSeats(run).length;
  if (stoneId === null || state.stock.stones[stoneId] < count) return null;
  return {
    ...state,
    stock: withStones(state.stock, stoneId, -count),
    activeRun: { ...run, stonesTaken: true },
  };
}

function isPoseShape(pose: StonePose): boolean {
  return (
    Number.isFinite(pose.x) &&
    Number.isFinite(pose.y) &&
    Number.isFinite(pose.rotation) &&
    Math.abs(pose.x) <= MAX_STONE_OFFSET_MM &&
    Math.abs(pose.y) <= MAX_STONE_OFFSET_MM
  );
}

function sameSetRecord(a: SetRecord, b: SetRecord): boolean {
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.rotation === b.rotation &&
    a.accuracy === b.accuracy &&
    a.assisted === b.assisted &&
    a.claws.length === b.claws.length &&
    a.claws.every((claw, index) => claw === b.claws[index])
  );
}

export function setStone(
  state: GameState,
  seatKey: string,
  pose: StonePose,
  claws: readonly number[],
  assisted: boolean,
): GameState {
  const run = state.activeRun;
  if (run === null || run.stage !== "set" || typeof assisted !== "boolean" || !isPoseShape(pose))
    return state;
  if (!runSeats(run).includes(seatKey)) return state;
  const cut = seatCut(run.design);
  const tolerance = setTolerance(state);
  if (claws.length !== clawCount(cut)) return state;
  if (!claws.every((claw) => Number.isFinite(claw) && claw >= 0 && claw <= MAX_CLAW_TRAVEL)) return state;
  if (!isSeated(pose, cut, tolerance)) return state;
  const taken = takeStones(state, run);
  if (taken === null) return state;
  return updateActiveRun(taken, "set", (current) => {
    const record: SetRecord = {
      x: pose.x,
      y: pose.y,
      rotation: pose.rotation,
      claws: [...claws],
      accuracy: setAccuracy(pose, claws, cut, tolerance, assisted),
      assisted,
    };
    const before = current.sets[seatKey];
    if (before !== undefined && sameSetRecord(before, record)) return null;
    return { ...current, sets: { ...current.sets, [seatKey]: record } };
  });
}

export function setIssues(run: PieceRun): string[] {
  const left = runSeats(run).filter((seat) => !Object.hasOwn(run.sets, seat)).length;
  return left === 0 ? [] : [`Set ${left} more ${left === 1 ? "stone" : "stones"}.`];
}
