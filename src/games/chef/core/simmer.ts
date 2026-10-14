import { cappedAccuracy } from "../../../engine/assistCap";
import { clamp } from "../../../engine/clamp";
import { followAccuracy, type FollowBounds, type FollowProgress } from "../../../engine/followRecord";
import type { Point } from "../../../engine/geometry/point";
import type { SimmerDef, SimmerPath } from "../content/dish";

export const SIMMER_CANVAS = 400;
export const SIMMER_HALO = 28;
export const ASSIST_HALO = 1.6;
export const TICKS_PER_LAP = 240;
export const MIN_TICKS_PER_LAP = 40;
export const MAX_TICKS_PER_LAP = 1200;
export const LEVEL_BAND = 0.06;
export const LEVEL_FALLOFF = 0.2;
export const TARGET_SHARE = 0.8;
export const FOLLOW_WEIGHT = 0.7;
export const LEVEL_WEIGHT = 0.3;
const MIN_LEVEL = 0.05;
const PATH_RADIUS = 110;

export interface SimmerResult {
  readonly accuracy: number;
  readonly follow: number;
  readonly level: number;
  readonly levelScore: number;
  readonly assisted: boolean;
}

export function simmerBounds(laps: number): FollowBounds {
  return { units: laps, minTicksPerUnit: MIN_TICKS_PER_LAP, maxTicksPerUnit: MAX_TICKS_PER_LAP };
}

export function simmerHalo(tolerance: number, assisted: boolean): number {
  return SIMMER_HALO * tolerance * (assisted ? ASSIST_HALO : 1);
}

export function simmerLevel(def: SimmerDef, laps: number, progress: number): number {
  const fall = ((def.startLevel - def.targetLevel) * progress) / (laps * TARGET_SHARE);
  return Math.max(MIN_LEVEL, def.startLevel - fall);
}

export function progressAtTarget(laps: number): number {
  return laps * TARGET_SHARE;
}

export function levelScore(level: number, target: number): number {
  const miss = Math.abs(level - target);
  if (miss <= LEVEL_BAND) return 1;
  return Math.max(0, 1 - (miss - LEVEL_BAND) / LEVEL_FALLOFF);
}

export function scoreSimmer(def: SimmerDef, laps: number, follow: FollowProgress): SimmerResult {
  const level = Math.round(simmerLevel(def, laps, follow.progress) * 100) / 100;
  const followShare = followAccuracy(follow);
  const levelPart = levelScore(level, def.targetLevel);
  return {
    accuracy: cappedAccuracy(FOLLOW_WEIGHT * followShare + LEVEL_WEIGHT * levelPart, follow.assisted),
    follow: followShare,
    level,
    levelScore: levelPart,
    assisted: follow.assisted,
  };
}

export function guidePoint(path: SimmerPath, lapShare: number): Point {
  const angle = clamp(lapShare, 0, 1) * Math.PI * 2;
  const centre = SIMMER_CANVAS / 2;
  if (path === "circle")
    return [
      centre + PATH_RADIUS * Math.cos(angle - Math.PI / 2),
      centre + PATH_RADIUS * Math.sin(angle - Math.PI / 2),
    ];
  if (path === "figure-eight")
    return [centre + PATH_RADIUS * Math.sin(angle), centre + PATH_RADIUS * 0.6 * Math.sin(2 * angle)];
  const sweep = (lapShare * 4) % 1;
  const across = Math.floor(lapShare * 4) % 2 === 0 ? sweep : 1 - sweep;
  return [centre - PATH_RADIUS + across * PATH_RADIUS * 2, centre - PATH_RADIUS * 0.7 * Math.cos(angle)];
}
