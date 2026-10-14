import { average } from "../../../engine/average";
import type { Point } from "../../../engine/geometry/point";
import { ownEntry } from "../../../engine/ownEntry";
import type { TrimId } from "../../adeeva/content/trim";
import type { NotionDef, StitchLineDef } from "../content/find";
import { findById } from "./catalog";
import { lineKey, type FlipRun, type UnpickLine } from "./flipRun";
import type { GameState } from "./gameState";
import type { OwnedFind } from "./ownedFind";
import { updateRun } from "./runUpdate";
import { MIN_PULL_CM, maxPull } from "./tolerance";

export const ASSIST_UNPICK_CAP = 0.7;
export const ATTEMPTS_PER_STITCH = 3;
export const SNAG_CONDITION_LOSS = 0.02;
export const MAX_SNAG_LOSS = 0.1;

export const UNTOUCHED_LINE: UnpickLine = { popped: [], snagsAt: [], attempts: 0, assisted: false };

export function stitchPoints(line: StitchLineDef): Point[] {
  const steps = Math.max(1, line.stitches - 1);
  return Array.from({ length: line.stitches }, (_, index): Point => [
    line.from[0] + ((line.to[0] - line.from[0]) * index) / steps,
    line.from[1] + ((line.to[1] - line.from[1]) * index) / steps,
  ]);
}

export function lineRecord(run: FlipRun, findKey: string, line: number): UnpickLine {
  return ownEntry(run.unpick, lineKey(findKey, line)) ?? UNTOUCHED_LINE;
}

export function isLineExhausted(def: StitchLineDef, record: UnpickLine): boolean {
  return record.attempts >= ATTEMPTS_PER_STITCH * def.stitches;
}

export function isLineDone(def: StitchLineDef, record: UnpickLine): boolean {
  return record.popped.length >= def.stitches || isLineExhausted(def, record);
}

export function lineSnags(def: StitchLineDef, record: UnpickLine): number {
  const loose = isLineExhausted(def, record) ? def.stitches - record.popped.length : 0;
  return record.snagsAt.length + loose;
}

export function lineAccuracy(def: StitchLineDef, record: UnpickLine): number {
  const pops = record.popped.length;
  const total = pops + lineSnags(def, record);
  const share = total === 0 ? 0 : pops / total;
  return record.assisted ? Math.min(ASSIST_UNPICK_CAP, share) : share;
}

export function notionSaved(record: UnpickLine, notion: NotionDef, sharpRipper: boolean): boolean {
  const snags = record.snagsAt.filter((stitch) => stitch === notion.stitch).length;
  return record.popped.includes(notion.stitch) && snags < (sharpRipper ? 2 : 1);
}

export function findLines(owned: OwnedFind): readonly StitchLineDef[] {
  return findById(owned.findId).lines;
}

export function findSnags(run: FlipRun, owned: OwnedFind): number {
  return findLines(owned).reduce(
    (sum, def, index) => sum + lineSnags(def, lineRecord(run, owned.id, index)),
    0,
  );
}

export function snagLoss(run: FlipRun, owned: OwnedFind): number {
  return Math.min(MAX_SNAG_LOSS, SNAG_CONDITION_LOSS * findSnags(run, owned));
}

export function unpickAccuracy(run: FlipRun): number {
  return average(
    run.finds.flatMap((owned) =>
      findLines(owned).map((def, index) => lineAccuracy(def, lineRecord(run, owned.id, index))),
    ),
  );
}

export function isUnpickComplete(run: FlipRun): boolean {
  return run.finds.every((owned) =>
    findLines(owned).every((def, index) => isLineDone(def, lineRecord(run, owned.id, index))),
  );
}

export function notionsOnFinds(run: FlipRun): number {
  return run.finds.reduce(
    (sum, owned) => sum + findLines(owned).reduce((count, def) => count + def.notions.length, 0),
    0,
  );
}

export function savedNotions(run: FlipRun, sharpRipper: boolean): TrimId[] {
  return run.finds.flatMap((owned) =>
    findLines(owned).flatMap((def, index) => {
      const record = lineRecord(run, owned.id, index);
      return def.notions
        .filter((notion) => notionSaved(record, notion, sharpRipper))
        .map((notion) => notion.notion);
    }),
  );
}

export interface StitchPull {
  readonly findKey: string;
  readonly line: number;
  readonly stitch: number;
  readonly distanceCm: number;
  readonly assisted: boolean;
}

export function pullStitch(state: GameState, pull: StitchPull): GameState {
  if (!Number.isFinite(pull.distanceCm) || pull.distanceCm < 0) return state;
  if (!pull.assisted && pull.distanceCm < MIN_PULL_CM) return state;
  return updateRun(state, "unpick", (run) => {
    const owned = run.finds.find((entry) => entry.id === pull.findKey);
    const def = owned === undefined ? undefined : findLines(owned)[pull.line];
    if (owned === undefined || def === undefined) return null;
    if (!Number.isInteger(pull.stitch) || pull.stitch < 0 || pull.stitch >= def.stitches) return null;
    const record = lineRecord(run, owned.id, pull.line);
    if (isLineDone(def, record) || record.popped.includes(pull.stitch)) return null;
    const pops = pull.assisted || pull.distanceCm <= maxPull(state, findById(owned.findId).material);
    const next: UnpickLine = {
      popped: pops ? [...record.popped, pull.stitch] : record.popped,
      snagsAt: pops ? record.snagsAt : [...record.snagsAt, pull.stitch],
      attempts: record.attempts + 1,
      assisted: record.assisted || pull.assisted,
    };
    return { ...run, unpick: { ...run.unpick, [lineKey(owned.id, pull.line)]: next } };
  });
}
