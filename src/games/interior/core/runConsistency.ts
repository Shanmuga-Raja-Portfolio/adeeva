import { idNumber } from "../../../engine/idNumber";
import { keysWithin } from "../../../engine/keysWithin";
import { isValidPose } from "../../../engine/placedPose";
import { hasUniqueIds } from "../../../engine/uniqueIds";
import { WALL_IDS } from "../content/roomTemplate";
import { roomById } from "./catalog";
import { DECOR_ROTATION_STEP, MAX_DECOR, STYLE_CANVAS } from "./decorPlacement";
import { FLOOR_PIECES, floorAccuracy, floorIssues, isPastGate } from "./floorLay";
import { placementProblem } from "./floorPlan";
import { canPlaceLight, lightIssues } from "./lightPlacement";
import type { MakeoverRun } from "./makeoverRun";
import { runEdgePaths } from "./paintEdge";
import { ROLL_COLUMNS, ROLL_ROWS } from "./paintRoll";
import { paintIssues } from "./paintScore";
import { MAX_LIGHTS, MAX_PIECES, planIssues } from "./planChoice";
import { isPast, stageIndex } from "./runStage";
import { WIDEST_FLOOR_TOLERANCE_CM } from "./skillTolerance";
import { REVISITABLE_STAGES } from "./stageNavigation";

const ACCURACY_SLACK = 1e-9;

function stagesAreReal(run: MakeoverRun): boolean {
  if (run.reached === run.stage) return true;
  return (
    !run.locked &&
    REVISITABLE_STAGES.includes(run.stage) &&
    stageIndex(run.reached) > stageIndex(run.stage) &&
    stageIndex(run.reached) <= stageIndex("paint")
  );
}

function numbersBelow(items: readonly { readonly id: string }[], prefix: string, next: number): boolean {
  return items.every((item) => {
    const number = idNumber(item.id, prefix);
    return number >= 1 && number < next;
  });
}

function floorRecordsAreReal(run: MakeoverRun): boolean {
  return Object.values(run.floorLaid).every(
    (record) =>
      !isPastGate(record.offset, WIDEST_FLOOR_TOLERANCE_CM) &&
      record.accuracy <= floorAccuracy(record.offset, WIDEST_FLOOR_TOLERANCE_CM) + ACCURACY_SLACK &&
      (record.offset > 0 || record.assisted),
  );
}

function planIsLegal(run: MakeoverRun): boolean {
  const room = roomById(run.brief.roomId);
  const { plan } = run;
  return (
    hasUniqueIds(plan.pieces) &&
    plan.pieces.length <= MAX_PIECES &&
    numbersBelow(plan.pieces, "piece", plan.nextPieceNumber) &&
    plan.pieces.every((piece) => placementProblem(room, plan.pieces, piece) === null) &&
    plan.lights.length <= MAX_LIGHTS &&
    (plan.featurePaint === null || plan.featurePaint !== plan.wallPaint)
  );
}

function workFitsRoom(run: MakeoverRun): boolean {
  const indexes = Array.from({ length: FLOOR_PIECES }, (_, index) => String(index));
  return (
    keysWithin(
      run.edges,
      runEdgePaths(run).map((path) => path.id),
    ) &&
    keysWithin(run.rolls, WALL_IDS) &&
    Object.values(run.rolls).every((roll) => roll.passes.length === ROLL_COLUMNS * ROLL_ROWS) &&
    keysWithin(run.floorLaid, indexes) &&
    keysWithin(
      run.lightPlaces,
      run.plan.lights.map((_, index) => String(index)),
    ) &&
    Object.entries(run.lightPlaces).every(([index, place]) =>
      canPlaceLight(run, Number(index), place.col, place.row),
    ) &&
    floorRecordsAreReal(run) &&
    hasUniqueIds(run.decor) &&
    run.decor.length <= MAX_DECOR &&
    numbersBelow(run.decor, "decor", run.nextDecorNumber) &&
    run.decor.every((item) => isValidPose(STYLE_CANVAS, item) && item.rotation % DECOR_ROTATION_STEP === 0)
  );
}

function workMatchesStage(run: MakeoverRun): boolean {
  const worked =
    Object.keys(run.edges).length > 0 ||
    Object.keys(run.rolls).length > 0 ||
    Object.keys(run.floorLaid).length > 0;
  if (worked && !run.locked) return false;
  if (run.locked && stageIndex(run.stage) < stageIndex("paint")) return false;
  if (isPast(run.stage, "plan") && planIssues(run).length > 0) return false;
  if (isPast(run.stage, "paint") && paintIssues(run).length > 0) return false;
  if (isPast(run.stage, "floor") && floorIssues(run).length > 0) return false;
  if (Object.keys(run.lightPlaces).length > 0 && stageIndex(run.stage) < stageIndex("light")) return false;
  if (isPast(run.stage, "light") && lightIssues(run).length > 0) return false;
  return run.decor.length === 0 || stageIndex(run.stage) >= stageIndex("style");
}

export function isRunConsistent(run: MakeoverRun): boolean {
  return stagesAreReal(run) && planIsLegal(run) && workFitsRoom(run) && workMatchesStage(run);
}
