import type { RunStage } from "../content/runStage";
import { partOptionById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import { canSewCushion } from "./cushion";
import { extraNumber } from "./finishChoice";
import { stageIndex } from "./hourCost";
import { designJoints, designParts, designSurfaces, runPieces, runSlots } from "./pieceParts";

function atLeast(run: CommissionRun, stage: RunStage): boolean {
  return stageIndex(run.stage) >= stageIndex(stage);
}

function purposeFits(run: CommissionRun): boolean {
  if (run.purpose.kind === "commission") return run.gigId !== null;
  return run.gigId === null && run.design.productId === null;
}

function designFits(run: CommissionRun): boolean {
  const { productId, options, woodId } = run.design;
  if (run.purpose.kind === "commission") {
    if (productId === null) return Object.keys(options).length === 0 && !atLeast(run, "timber");
    if (!run.brief.products.includes(productId)) return false;
  }
  const slots = runSlots(run);
  const slotsFit = Object.entries(options).every(
    ([slot, optionId]) =>
      optionId !== undefined &&
      slots.some((entry) => entry === slot) &&
      partOptionById(optionId).slot === slot,
  );
  const complete = slots.every((slot) => options[slot] !== undefined) && woodId !== null;
  return slotsFit && (complete || !atLeast(run, "timber"));
}

function workFits(run: CommissionRun): boolean {
  const partIds = designParts(run).map((part) => part.id);
  const jointIds = designJoints(run).map((joint) => joint.id);
  const surfaces = designSurfaces(run).map((part) => part.id);
  const pieces = runPieces(run).length;
  const cutsFit = Object.keys(run.cuts).every((key) => partIds.includes(key.slice(0, key.lastIndexOf("#"))));
  const extraIds = run.extras.map((extra) => extra.id);
  const extrasNumbered = extraIds.every(
    (id) => extraNumber(id) >= 1 && extraNumber(id) < run.nextExtraNumber,
  );
  return (
    Object.keys(run.placements).every((id) => partIds.includes(id)) &&
    cutsFit &&
    Object.keys(run.joints).every((id) => jointIds.includes(id)) &&
    Object.keys(run.sanding).every((id) => surfaces.includes(id)) &&
    (Object.keys(run.cuts).length === 0 || atLeast(run, "saw")) &&
    (Object.keys(run.joints).length === 0 || atLeast(run, "join")) &&
    (Object.keys(run.sanding).length === 0 || atLeast(run, "sand")) &&
    (run.extras.length === 0 || atLeast(run, "finish")) &&
    run.extras.every((extra) => extra.piece < pieces) &&
    (run.cushion === null || (atLeast(run, "finish") && canSewCushion(run))) &&
    new Set(extraIds).size === extraIds.length &&
    extrasNumbered
  );
}

function renFits(run: CommissionRun): boolean {
  const pegged = Object.values(run.joints).some((record) => record.byApprentice);
  const sanded = Object.values(run.sanding).some((record) => record.renAccuracy !== null);
  return (!pegged || run.renJobs.includes("pegs")) && (!sanded || run.renJobs.includes("sand"));
}

export function isRunConsistent(run: CommissionRun): boolean {
  return (
    stageIndex(run.reached) >= stageIndex(run.stage) &&
    purposeFits(run) &&
    designFits(run) &&
    workFits(run) &&
    renFits(run)
  );
}
