import { cappedAccuracy } from "../../../engine/assistCap";
import { clamp } from "../../../engine/clamp";
import type { CuisineId } from "../content/cuisine";
import type { TasteDef } from "../content/dish";
import { JAR_IDS, SAVOURY_JAR, type JarId, type TastePoint } from "../content/seasoning";
import { cuisineById, jarById } from "./catalog";

export const COMPASS_REACH = 6;
export const MAX_SAVOURY = 3;
export const MAX_PINCHES = 20;
export const MAX_TASTES = 20;
export const TASTE_RADIUS = 1;
export const TASTE_FALLOFF = 3;
export const SAVOURY_FACTOR = 0.85;
export const TIDY_SPARE = 2;
export const TIDY_COST = 0.05;
export const TIDY_FLOOR = 0.6;
export const FREE_TASTES = 3;
export const TASTE_COST = 0.03;
export const TASTE_FLOOR = 0.85;
const SEARCH_DEPTH = 6;

export interface TasteState {
  readonly point: TastePoint;
  readonly savoury: number;
}

export interface TasteRecord {
  readonly pinches: readonly JarId[];
  readonly tastes: number;
  readonly assisted: boolean;
}

export interface TasteResult {
  readonly accuracy: number;
  readonly point: TastePoint;
  readonly savoury: number;
  readonly pinches: number;
  readonly tastes: number;
  readonly solved: boolean;
  readonly assisted: boolean;
}

export function cuisineJars(cuisine: CuisineId): JarId[] {
  return [...cuisineById(cuisine).jars, SAVOURY_JAR];
}

export function dishTasteStart(def: TasteDef): TasteState {
  return { point: def.start, savoury: 0 };
}

export function addPinch(state: TasteState, jarId: JarId): TasteState {
  const jar = jarById(jarId);
  return {
    point: [
      clamp(state.point[0] + jar.vector[0], -COMPASS_REACH, COMPASS_REACH),
      clamp(state.point[1] + jar.vector[1], -COMPASS_REACH, COMPASS_REACH),
    ],
    savoury: clamp(state.savoury + jar.savoury, 0, MAX_SAVOURY),
  };
}

export function tasteAfter(start: TasteState, pinches: readonly JarId[]): TasteState {
  return pinches.reduce(addPinch, start);
}

export function tasteDistance(point: TastePoint, target: TastePoint): number {
  return Math.hypot(point[0] - target[0], point[1] - target[1]);
}

function combinations(jars: readonly JarId[], size: number, from = 0): JarId[][] {
  if (size === 0) return [[]];
  return jars
    .slice(from)
    .flatMap((jar, offset) => combinations(jars, size - 1, from + offset).map((rest) => [jar, ...rest]));
}

function reaches(start: TasteState, pinches: readonly JarId[], def: TasteDef): JarId[] | null {
  const point = pinches.reduce<TastePoint>(
    (sum, id) => [sum[0] + jarById(id).vector[0], sum[1] + jarById(id).vector[1]],
    start.point,
  );
  const savoury = pinches.reduce((sum, id) => sum + jarById(id).savoury, start.savoury);
  if (point[0] !== def.target[0] || point[1] !== def.target[1] || savoury > def.savoury) return null;
  return [...pinches, ...Array.from({ length: def.savoury - savoury }, () => SAVOURY_JAR)];
}

export function bestPinches(def: TasteDef, jars: readonly JarId[], start: TasteState): JarId[] | null {
  let best: JarId[] | null = null;
  for (let size = 0; size <= SEARCH_DEPTH; size += 1)
    for (const pinches of combinations(jars, size)) {
      const solution = reaches(start, pinches, def);
      if (solution !== null && (best === null || solution.length < best.length)) best = solution;
    }
  return best;
}

export function minimumPinches(def: TasteDef, jars: readonly JarId[], start: TasteState): number {
  return bestPinches(def, jars, start)?.length ?? Infinity;
}

export function minimumPointPinches(def: TasteDef, jars: readonly JarId[]): number {
  const pointOnly = jars.filter((jar) => jar !== SAVOURY_JAR);
  for (let size = 0; size <= SEARCH_DEPTH; size += 1)
    for (const pinches of combinations(pointOnly, size)) {
      const point = pinches.reduce<TastePoint>(
        (sum, id) => [sum[0] + jarById(id).vector[0], sum[1] + jarById(id).vector[1]],
        def.start,
      );
      if (point[0] === def.target[0] && point[1] === def.target[1]) return size;
    }
  return Infinity;
}

export function isValidTasteRecord(record: TasteRecord, jars: readonly JarId[]): boolean {
  return (
    typeof record.assisted === "boolean" &&
    record.pinches.length <= MAX_PINCHES &&
    record.pinches.every((jar) => JAR_IDS.includes(jar) && jars.includes(jar)) &&
    Number.isInteger(record.tastes) &&
    record.tastes >= 0 &&
    record.tastes <= MAX_TASTES
  );
}

export function tasteRadius(tolerance: number): number {
  return TASTE_RADIUS * tolerance;
}

export function scoreTaste(
  def: TasteDef,
  jars: readonly JarId[],
  start: TasteState,
  record: TasteRecord,
  tolerance: number,
  freeTastes: boolean,
): TasteResult {
  const final = tasteAfter(start, record.pinches);
  const radius = tasteRadius(tolerance);
  const distance = tasteDistance(final.point, def.target);
  const base = distance <= radius ? 1 : Math.max(0, 1 - (distance - radius) / TASTE_FALLOFF);
  const savouryFactor = SAVOURY_FACTOR ** Math.abs(final.savoury - def.savoury);
  const minimum = minimumPinches(def, jars, start);
  const spare = Number.isFinite(minimum) ? Math.max(0, record.pinches.length - (minimum + TIDY_SPARE)) : 0;
  const tidy = Math.max(TIDY_FLOOR, 1 - TIDY_COST * spare);
  const extraTastes = Math.max(0, record.tastes - FREE_TASTES);
  const tasted = freeTastes ? 1 : Math.max(TASTE_FLOOR, 1 - TASTE_COST * extraTastes);
  return {
    accuracy: cappedAccuracy(base * savouryFactor * tidy * tasted, record.assisted),
    point: final.point,
    savoury: final.savoury,
    pinches: record.pinches.length,
    tastes: record.tastes,
    solved: distance <= radius && final.savoury === def.savoury,
    assisted: record.assisted,
  };
}

export function suggestedJar(def: TasteDef, jars: readonly JarId[], current: TasteState): JarId | null {
  return bestPinches(def, jars, current)?.[0] ?? null;
}
