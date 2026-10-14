import { average } from "../../../engine/average";
import { isCount } from "../../../engine/count";
import { ownEntry } from "../../../engine/ownEntry";
import { findById } from "./catalog";
import { stainKey, type FlipRun, type StainWork } from "./flipRun";
import type { GameState } from "./gameState";
import type { OwnedFind, Stain } from "./ownedFind";
import { updateRun } from "./runUpdate";
import { ticksToClear } from "./tolerance";

export const ASSIST_CLEAN_CAP = 0.7;
export const MAX_SCRUB_TICKS = 1200;
export const FADE_PER_HARSH_TICK = 0.002;
export const MAX_FADE = 0.3;

type CleanState = Pick<GameState, "profile" | "upgrades">;

export function stainWork(run: FlipRun, findKey: string, stain: Stain): StainWork {
  return (
    ownEntry(run.clean, stainKey(findKey, stain.id)) ?? {
      cellTicks: Array.from({ length: stain.cells }, () => 0),
      harshTicks: 0,
      scrubTicks: 0,
    }
  );
}

export function cellThreshold(state: CleanState, owned: OwnedFind, stain: Stain): number {
  return ticksToClear(state, findById(owned.findId).material) / stain.cells;
}

export function clearedCells(state: CleanState, owned: OwnedFind, stain: Stain, work: StainWork): number {
  const threshold = cellThreshold(state, owned, stain);
  return work.cellTicks.filter((ticks) => ticks >= threshold).length;
}

export function stainDirt(state: CleanState, run: FlipRun, owned: OwnedFind, stain: Stain): number {
  if (run.soaked) return 0;
  return 1 - clearedCells(state, owned, stain, stainWork(run, owned.id, stain)) / stain.cells;
}

export function stainFade(run: FlipRun, owned: OwnedFind, stain: Stain): number {
  if (run.soaked) return 0;
  return Math.min(MAX_FADE, FADE_PER_HARSH_TICK * stainWork(run, owned.id, stain).harshTicks);
}

export function isStainDone(state: CleanState, run: FlipRun, owned: OwnedFind, stain: Stain): boolean {
  const work = stainWork(run, owned.id, stain);
  return (
    run.soaked || work.scrubTicks >= MAX_SCRUB_TICKS || clearedCells(state, owned, stain, work) >= stain.cells
  );
}

function accuracyOver(state: CleanState, run: FlipRun, finds: readonly OwnedFind[]): number {
  const stains = finds.flatMap((owned) => owned.stains.map((stain) => ({ owned, stain })));
  if (stains.length === 0) return run.soaked ? ASSIST_CLEAN_CAP : 1;
  const dirt = average(stains.map(({ owned, stain }) => stainDirt(state, run, owned, stain)));
  const fade = average(stains.map(({ owned, stain }) => stainFade(run, owned, stain)));
  const share = (1 - dirt) * (1 - fade);
  return run.soaked ? Math.min(ASSIST_CLEAN_CAP, share) : share;
}

export function findCleanAccuracy(state: CleanState, run: FlipRun, owned: OwnedFind): number {
  return accuracyOver(state, run, [owned]);
}

export function cleanAccuracy(state: CleanState, run: FlipRun): number {
  return accuracyOver(state, run, run.finds);
}

export function isCleanComplete(state: CleanState, run: FlipRun): boolean {
  return run.finds.every((owned) => owned.stains.every((stain) => isStainDone(state, run, owned, stain)));
}

export interface ScrubSample {
  readonly findKey: string;
  readonly stainId: string;
  readonly cellTicks: readonly number[];
  readonly harshTicks: number;
  readonly scrubTicks: number;
}

export function scrubGrows(
  before: StainWork,
  sample: Pick<ScrubSample, "cellTicks" | "harshTicks" | "scrubTicks">,
  cells: number,
): boolean {
  if (sample.cellTicks.length !== cells || !sample.cellTicks.every(isCount)) return false;
  if (!isCount(sample.harshTicks) || !isCount(sample.scrubTicks)) return false;
  const moving = sample.cellTicks.reduce((sum, ticks) => sum + ticks, 0);
  const grows =
    sample.cellTicks.every((ticks, index) => ticks >= (before.cellTicks[index] ?? 0)) &&
    sample.harshTicks >= before.harshTicks &&
    sample.scrubTicks > before.scrubTicks;
  return (
    grows &&
    sample.harshTicks <= sample.scrubTicks &&
    moving + sample.harshTicks <= sample.scrubTicks &&
    sample.scrubTicks <= MAX_SCRUB_TICKS
  );
}

export function scrubStain(state: GameState, sample: ScrubSample): GameState {
  return updateRun(state, "clean", (run) => {
    if (run.soaked) return null;
    const owned = run.finds.find((entry) => entry.id === sample.findKey);
    const stain = owned?.stains.find((entry) => entry.id === sample.stainId);
    if (owned === undefined || stain === undefined) return null;
    const before = stainWork(run, owned.id, stain);
    if (!scrubGrows(before, sample, stain.cells)) return null;
    const work: StainWork = {
      cellTicks: [...sample.cellTicks],
      harshTicks: sample.harshTicks,
      scrubTicks: sample.scrubTicks,
    };
    return { ...run, clean: { ...run.clean, [stainKey(owned.id, stain.id)]: work } };
  });
}

export function soakStains(state: GameState): GameState {
  return updateRun(state, "clean", (run) => (run.soaked ? null : { ...run, soaked: true }));
}
