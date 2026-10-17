import { isCount } from "../../../engine/count";
import { keysWithin } from "../../../engine/keysWithin";
import { productById } from "./catalog";
import { runCutPaths } from "./cutRecord";
import { isJoinDone, isJoinRecordShape } from "./joiningLamp";
import { runJoints } from "./joinRecord";
import { MAX_PASSES, POLISH_CELLS, polishIssues } from "./polish";
import type { PieceRun } from "./pieceRun";
import { stageIndex, type RunStage } from "./runStage";
import { plannedSizes } from "./sheetPlan";
import { runStages } from "./stageNavigation";
import { clawCount, runSeats } from "./stoneSetting";
import { seatCut } from "./partGeometry";
import { coloredHolder } from "./displayChoice";
import { MOTIF_CHARM } from "../content/extra";
import { twinRecordsFit } from "./twinLamp";

function stagesAreReal(run: PieceRun): boolean {
  const stages = runStages(run);
  return (
    stages.includes(run.stage) &&
    stages.includes(run.reached) &&
    stageIndex(run.reached) >= stageIndex(run.stage)
  );
}

function past(run: PieceRun, stage: RunStage): boolean {
  return stageIndex(run.stage) > stageIndex(stage);
}

function workFitsProduct(run: PieceRun): boolean {
  const product = productById(run.design.productId);
  const seats = runSeats(run);
  const cut = seatCut(run.design);
  return (
    product.slots.every((slot) => run.design.options[slot] !== undefined) &&
    keysWithin(run.design.options, product.slots) &&
    (seats.length > 0 || run.design.stoneId === null) &&
    keysWithin(
      run.plan,
      product.parts.map((part) => part.key),
    ) &&
    keysWithin(
      run.cuts,
      runCutPaths(run).map((path) => path.id),
    ) &&
    keysWithin(
      run.joins,
      runJoints(run).map((joint) => joint.id),
    ) &&
    Object.values(run.joins).every(isJoinRecordShape) &&
    keysWithin(run.sets, seats) &&
    Object.values(run.sets).every((record) => record.claws.length === clawCount(cut)) &&
    keysWithin(
      run.polish,
      product.parts.map((part) => part.key),
    ) &&
    Object.values(run.polish).every(
      (record) =>
        record.passes.length === POLISH_CELLS &&
        record.passes.every((passes) => isCount(passes) && passes <= MAX_PASSES),
    ) &&
    (run.display.chain === null || (product.holder?.choices.includes(run.display.chain) ?? false))
  );
}

function consumedMatchesPlan(run: PieceRun): boolean {
  const planned = plannedSizes(run);
  return (
    run.consumed !== null &&
    run.consumed.length === planned.length &&
    run.consumed.every((size, index) => size === planned[index])
  );
}

function workMatchesStage(run: PieceRun): boolean {
  if (past(run, "design") && run.design.metalId === null) return false;
  if (Object.keys(run.cuts).length > 0 && !consumedMatchesPlan(run)) return false;
  if (Object.keys(run.sets).length > 0 && !run.stonesTaken) return false;
  if (past(run, "cut") && runCutPaths(run).some((path) => !Object.hasOwn(run.cuts, path.id))) return false;
  if (past(run, "join") && runJoints(run).some((joint) => !isJoinDone(run.joins[joint.id], joint.ticks)))
    return false;
  if (past(run, "set") && runSeats(run).some((seat) => !Object.hasOwn(run.sets, seat))) return false;
  return !(past(run, "polish") && polishIssues(run).length > 0);
}

function lineWorkFits(run: PieceRun): boolean {
  const collection = run.purpose.kind === "collection";
  const seats = runSeats(run).length;
  if (!collection && (run.potStones.length > 0 || run.lineSheet)) return false;
  if (run.potStones.length > seats || new Set(run.potStones).size !== run.potStones.length) return false;
  if (collection && run.stonesTaken && run.potStones.length !== seats) return false;
  if (run.lineSheet && !(run.consumed ?? []).includes("wide")) return false;
  return run.display.charms.every((charm) => (charm.charmId === MOTIF_CHARM) === (charm.shape !== null));
}

export function isRunConsistent(run: PieceRun): boolean {
  if ((run.purpose.kind === "order") !== (run.brief !== null)) return false;
  if (run.brief !== null && run.brief.productId !== run.design.productId) return false;
  if ((run.display.glaze !== null) !== (run.display.finish === "glaze")) return false;
  if ((run.display.cordColour !== null) !== coloredHolder(run.display.chain)) return false;
  return (
    stagesAreReal(run) &&
    workFitsProduct(run) &&
    workMatchesStage(run) &&
    twinRecordsFit(run) &&
    lineWorkFits(run)
  );
}
