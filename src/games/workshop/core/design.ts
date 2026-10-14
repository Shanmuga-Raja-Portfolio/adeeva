import { updateActiveRun } from "../../../engine/activeRunUpdate";
import { PART_OPTION_IDS, type PartOptionId, type PartSlot } from "../content/partOption";
import type { ProductId } from "../content/product";
import { WOOD_IDS, type WoodId } from "../content/wood";
import { partOptionById, productById, woodById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import type { GameState } from "./gameState";

export function woodLockReason(state: Pick<GameState, "reputation">, woodId: WoodId): string | null {
  const wood = woodById(woodId);
  return state.reputation >= wood.minReputation
    ? null
    : `${wood.name} unlocks at reputation ${wood.minReputation}.`;
}

export function designIssues(run: CommissionRun): string[] {
  const { productId, options, woodId } = run.design;
  if (productId === null) return ["Pick what to make."];
  const issues = productById(productId)
    .slots.filter((slot) => options[slot] === undefined)
    .map((slot) => `Pick a choice for the ${slot}.`);
  if (woodId === null) issues.push("Pick a wood.");
  return issues;
}

export function chooseProduct(state: GameState, productId: ProductId): GameState {
  return updateActiveRun(state, "design", (run) => {
    if (!run.brief.products.includes(productId) || run.design.productId === productId) return null;
    return { ...run, design: { ...run.design, productId, options: {} }, placements: {} };
  });
}

export function chooseOption(state: GameState, slot: PartSlot, optionId: PartOptionId): GameState {
  if (!PART_OPTION_IDS.includes(optionId) || partOptionById(optionId).slot !== slot) return state;
  return updateActiveRun(state, "design", (run) => {
    const productId = run.design.productId;
    if (productId === null || !productById(productId).slots.includes(slot)) return null;
    if (run.design.options[slot] === optionId) return null;
    return { ...run, design: { ...run.design, options: { ...run.design.options, [slot]: optionId } } };
  });
}

export function chooseWood(state: GameState, woodId: WoodId): GameState {
  if (!WOOD_IDS.includes(woodId) || woodLockReason(state, woodId) !== null) return state;
  return updateActiveRun(state, "design", (run) =>
    run.design.woodId === woodId ? null : { ...run, design: { ...run.design, woodId }, placements: {} },
  );
}
