import { updateActiveRun } from "../../../engine/activeRunUpdate";
import {
  followAccuracy,
  recordFollow,
  type FollowBounds,
  type FollowProgress,
} from "../../../engine/followRecord";
import { CUSHION_FABRIC_IDS, type CushionFabricId } from "../content/cushionFabric";
import { cushionFabricById, productById } from "./catalog";
import type { CommissionRun, CushionWork } from "./commissionRun";
import type { GameState } from "./gameState";

const MIN_SEAM_TICKS = 60;
const MAX_SEAM_TICKS = 1200;
export const CUSHION_HOURS = 1;

export const CUSHION_SEAM_BOUNDS: FollowBounds = {
  units: 1,
  minTicksPerUnit: MIN_SEAM_TICKS,
  maxTicksPerUnit: MAX_SEAM_TICKS,
};

const CUSHION_SEAM_PROFILE: readonly number[] = [0, 0.18, 0.05, -0.16, -0.04, 0.2, 0.02, -0.12, 0];

export function seamLineAt(progress: number): number {
  const profile = CUSHION_SEAM_PROFILE;
  const position = Math.min(1, Math.max(0, progress)) * (profile.length - 1);
  const index = Math.floor(position);
  const from = profile[index] ?? 0;
  const to = profile[Math.min(profile.length - 1, index + 1)] ?? from;
  const eased = (1 - Math.cos((position - index) * Math.PI)) / 2;
  return from + (to - from) * eased;
}

export function isNeedleOnSeam(progress: number, offset: number, band: number): boolean {
  return Math.abs(seamLineAt(progress) - offset) <= band;
}

export function canSewCushion(run: CommissionRun): boolean {
  return run.design.productId !== null && productById(run.design.productId).seat;
}

export function cushionPrice(cushion: CushionWork | null): number {
  return cushion === null ? 0 : cushionFabricById(cushion.fabricId).price;
}

export function isCushionSewn(cushion: CushionWork | null): boolean {
  return cushion !== null && cushion.seam !== null && cushion.seam.progress >= CUSHION_SEAM_BOUNDS.units;
}

export function cushionSeamAccuracy(cushion: CushionWork | null): number | null {
  if (cushion === null || cushion.seam === null || !isCushionSewn(cushion)) return null;
  return followAccuracy(cushion.seam);
}

export function chooseCushion(state: GameState, fabricId: CushionFabricId | null): GameState {
  if (fabricId !== null && !CUSHION_FABRIC_IDS.includes(fabricId)) return state;
  const run = state.activeRun;
  if (run === null || run.stage !== "finish" || !canSewCushion(run)) return state;
  if ((run.cushion?.fabricId ?? null) === fabricId) return state;
  const next: CushionWork | null = fabricId === null ? null : { fabricId, seam: null };
  const change = cushionPrice(next) - cushionPrice(run.cushion);
  if (change > state.coins) return state;
  return { ...state, coins: state.coins - change, activeRun: { ...run, cushion: next } };
}

export function recordCushionSeam(state: GameState, sample: FollowProgress): GameState {
  return updateActiveRun(state, "finish", (run) => {
    const cushion = run.cushion;
    if (cushion === null) return null;
    const seam = recordFollow(cushion.seam ?? undefined, sample, CUSHION_SEAM_BOUNDS);
    return seam === null ? null : { ...run, cushion: { ...cushion, seam } };
  });
}

export function resetCushionSeam(state: GameState): GameState {
  return updateActiveRun(state, "finish", (run) => {
    const cushion = run.cushion;
    if (cushion === null || cushion.seam === null) return null;
    return { ...run, cushion: { ...cushion, seam: null } };
  });
}
