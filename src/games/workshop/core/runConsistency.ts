import { partOptionById, productById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import { extraNumber } from "./finishChoice";
import { stageIndex } from "./hourCost";
import type { RunStage } from "../content/runStage";

function atLeast(run: CommissionRun, stage: RunStage): boolean {
  return stageIndex(run.stage) >= stageIndex(stage);
}

function designFits(run: CommissionRun): boolean {
  const { productId, options, woodId } = run.design;
  if (productId === null) return Object.keys(options).length === 0 && !atLeast(run, "timber");
  if (!run.brief.products.includes(productId)) return false;
  const product = productById(productId);
  const slotsFit = Object.entries(options).every(
    ([slot, optionId]) =>
      optionId !== undefined &&
      product.slots.some((entry) => entry === slot) &&
      partOptionById(optionId).slot === slot,
  );
  const complete = product.slots.every((slot) => options[slot] !== undefined) && woodId !== null;
  return slotsFit && (complete || !atLeast(run, "timber"));
}

function workFits(run: CommissionRun): boolean {
  const productId = run.design.productId;
  const product = productId === null ? null : productById(productId);
  const partIds = product?.parts.map((part) => part.id) ?? [];
  const jointIds = product?.joints.map((joint) => joint.id) ?? [];
  const surfaces = product?.showSurfaces ?? [];
  const cutsFit = Object.keys(run.cuts).every((key) => partIds.includes(key.split("#")[0] ?? ""));
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
    (run.cushion === null || (atLeast(run, "finish") && product?.seat === true)) &&
    new Set(extraIds).size === extraIds.length &&
    extrasNumbered
  );
}

export function isRunConsistent(run: CommissionRun): boolean {
  return stageIndex(run.reached) >= stageIndex(run.stage) && designFits(run) && workFits(run);
}
