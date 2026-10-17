import { updateActiveRun } from "../../../engine/activeRunUpdate";
import { recordWithout } from "../../../engine/recordWithout";
import type { JointDef } from "../content/product";
import { productById } from "./catalog";
import type { GameState } from "./gameState";
import { isJoinDone, isJoinRecordShape, joinGrows } from "./joiningLamp";
import type { JoinRecord, PieceRun } from "./pieceRun";

export function runJoints(run: PieceRun): readonly JointDef[] {
  return productById(run.design.productId).joints;
}

export function recordJoin(state: GameState, jointId: string, sample: JoinRecord): GameState {
  if (!isJoinRecordShape(sample)) return state;
  return updateActiveRun(state, "join", (run) => {
    const joint = runJoints(run).find((entry) => entry.id === jointId);
    if (joint === undefined) return null;
    const before = run.joins[jointId];
    if (before?.twin === true || isJoinDone(before, joint.ticks) || !joinGrows(before, sample)) return null;
    const record: JoinRecord = {
      ticks: sample.ticks,
      insideTicks: sample.insideTicks,
      overTicks: sample.overTicks,
      assisted: (before?.assisted ?? false) || sample.assisted,
      twin: false,
    };
    return { ...run, joins: { ...run.joins, [jointId]: record } };
  });
}

export function restartJoin(state: GameState, jointId: string): GameState {
  return updateActiveRun(state, "join", (run) => {
    const joint = runJoints(run).find((entry) => entry.id === jointId);
    const record = run.joins[jointId];
    if (joint === undefined || record === undefined || record.twin) return null;
    if (isJoinDone(record, joint.ticks)) return null;
    return { ...run, joins: recordWithout(run.joins, jointId) };
  });
}

export function joinIssues(run: PieceRun): string[] {
  const left = runJoints(run).filter((joint) => !isJoinDone(run.joins[joint.id], joint.ticks)).length;
  return left === 0 ? [] : [`Join ${left} more ${left === 1 ? "seam" : "seams"}.`];
}
