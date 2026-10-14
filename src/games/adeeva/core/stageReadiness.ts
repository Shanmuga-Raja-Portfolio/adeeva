import { PART_CATEGORIES } from "../content/garmentPart";
import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { fabricById, partById } from "./catalog";
import { hoursShortfallReason } from "../../../engine/dayHours";
import { fabricsNeedingCut } from "./designFabrics";
import type { DressRun } from "./dressRun";
import type { GameState, Inventory } from "./gameState";
import { stageCompletionHours } from "./hourCost";
import { requiredPieces } from "./requiredPieces";
import { requiredSeams } from "./requiredSeams";

function fabricName(fabricId: string): string {
  return fabricById(fabricId)?.name ?? fabricId;
}

function sketchIssues(run: DressRun): string[] {
  return PART_CATEGORIES.flatMap((category) => {
    const partId = run.design.parts[category];
    if (partId === null) return [`Choose a ${category}.`];
    const part = partById(partId);
    if (part !== undefined && part.pieces.length > 0 && run.design.fabrics[category] === null)
      return [`Pick a fabric for the ${category}.`];
    return [];
  });
}

function fabricIssues(run: DressRun, inventory: Inventory): string[] {
  return fabricsNeedingCut(run.design)
    .filter((fabricId) => (inventory.fabricMetres[fabricId] ?? 0) <= 0)
    .map((fabricId) => `Buy some ${fabricName(fabricId)} at the shop.`);
}

function cutIssues(run: DressRun): string[] {
  return fabricsNeedingCut(run.design)
    .filter((fabricId) => !run.cutFabrics.includes(fabricId))
    .map((fabricId) => `Lay out and cut the ${fabricName(fabricId)}.`);
}

function assembleIssues(run: DressRun): string[] {
  const assembled = new Set(Object.values(run.assembly));
  return requiredPieces(run.design)
    .filter((entry) => !assembled.has(entry.piece.id))
    .map((entry) => `Place the ${entry.piece.name.toLowerCase()} on the form.`);
}

function sewIssues(run: DressRun): string[] {
  return requiredSeams(run.design)
    .filter((entry) => (run.seams[entry.seam.id]?.progress ?? 0) < 1)
    .map((entry) => `Sew the ${entry.seam.name.toLowerCase()}.`);
}

export function stageCompletionIssues(run: DressRun, inventory: Inventory): string[] {
  switch (run.stage) {
    case "sketch":
      return sketchIssues(run);
    case "fabric":
      return [...sketchIssues(run), ...fabricIssues(run, inventory)];
    case "cut":
      return cutIssues(run);
    case "assemble":
      return assembleIssues(run);
    case "sew":
      return sewIssues(run);
    case "review":
      return ["Deliver the dress to finish."];
    case "done":
      return ["This dress is finished."];
    case "brief":
    case "decorate":
      return [];
  }
}

export function canAdvance(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null) return actionCheck(["No dress in progress."]);
  const issues = stageCompletionIssues(run, state.inventory);
  if (issues.length > 0) return actionCheck(issues);
  const hoursReason = hoursShortfallReason(
    state.calendar,
    stageCompletionHours(run.stage, state.studio.assistantHired),
  );
  return actionCheck(hoursReason === null ? [] : [hoursReason]);
}
