import type { PartCategory } from "../content/garmentPart";
import { updateActiveRun } from "./activeRunUpdate";
import { fabricById, isPartCategory, partById } from "./catalog";
import type { DressRun, PiecePlacement } from "./dressRun";
import type { GameState } from "./gameState";
import { requiredPieces } from "./requiredPieces";
import { isFabricUnlocked } from "./shop";

function prunePlacements(run: DressRun): DressRun {
  const kept: Record<string, PiecePlacement> = {};
  for (const entry of requiredPieces(run.design)) {
    const placement = run.placements[entry.piece.id];
    if (placement !== undefined && placement.fabricId === entry.fabricId) kept[entry.piece.id] = placement;
  }
  return { ...run, placements: kept };
}

export function fabricChoiceIssue(state: GameState, fabricId: string): string | null {
  const fabric = fabricById(fabricId);
  if (fabric === undefined) return "That fabric does not exist.";
  const owned = (state.inventory.fabricMetres[fabricId] ?? 0) > 0;
  if (!owned && !isFabricUnlocked(state, fabric))
    return `${fabric.name} unlocks at reputation ${fabric.unlockReputation}.`;
  return null;
}

export function chooseSketchPart(state: GameState, category: PartCategory, partId: string): GameState {
  const part = partById(partId);
  if (part === undefined || part.category !== category) return state;
  return updateActiveRun(state, "sketch", (run) => {
    if (run.design.parts[category] === partId) return null;
    return prunePlacements({
      ...run,
      design: { ...run.design, parts: { ...run.design.parts, [category]: partId } },
    });
  });
}

export function chooseSketchFabric(state: GameState, category: PartCategory, fabricId: string): GameState {
  if (!isPartCategory(category) || fabricChoiceIssue(state, fabricId) !== null) return state;
  return updateActiveRun(state, "sketch", (run) => {
    if (run.design.fabrics[category] === fabricId) return null;
    return prunePlacements({
      ...run,
      design: { ...run.design, fabrics: { ...run.design.fabrics, [category]: fabricId } },
    });
  });
}
