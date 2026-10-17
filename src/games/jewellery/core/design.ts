import { updateActiveRun } from "../../../engine/activeRunUpdate";
import type { MetalId } from "../content/metal";
import { OPTIONS, type OptionDef, type OptionId, type OptionSlot } from "../content/partOption";
import type { ProductId } from "../content/product";
import type { StoneId } from "../content/stone";
import { isMetalId, isOptionId, isStoneId, metalById, optionById, productById, stoneById } from "./catalog";
import { designLocked, lockedSlots } from "./designLocks";
import type { GameState } from "./gameState";
import type { DesignOptions } from "./pieceLook";
import type { PieceRun } from "./pieceRun";

export function slotOptions(slot: OptionSlot): readonly OptionDef[] {
  return OPTIONS.filter((option) => option.slot === slot);
}

export function defaultOptions(productId: ProductId): DesignOptions {
  const options: Partial<Record<OptionSlot, OptionId>> = {};
  for (const slot of productById(productId).slots) {
    const first = slotOptions(slot)[0];
    if (first !== undefined) options[slot] = first.id;
  }
  return options;
}

export function metalLocked(state: GameState, metalId: MetalId): boolean {
  return state.reputation < metalById(metalId).minReputation;
}

export function stoneLocked(state: GameState, stoneId: StoneId): boolean {
  return state.reputation < stoneById(stoneId).minReputation;
}

function redesigned(run: PieceRun, design: PieceRun["design"]): PieceRun {
  return { ...run, design, plan: {} };
}

export function chooseOption(state: GameState, slot: OptionSlot, optionId: OptionId): GameState {
  if (!isOptionId(optionId)) return state;
  return updateActiveRun(state, "design", (run) => {
    const option = optionById(optionId);
    if (option.slot !== slot || !productById(run.design.productId).slots.includes(slot)) return null;
    if (lockedSlots(run).includes(slot)) return null;
    if (run.design.options[slot] === optionId) return null;
    return redesigned(run, { ...run.design, options: { ...run.design.options, [slot]: optionId } });
  });
}

export function chooseMetal(state: GameState, metalId: MetalId): GameState {
  if (!isMetalId(metalId) || metalLocked(state, metalId)) return state;
  return updateActiveRun(state, "design", (run) =>
    designLocked(run) || run.design.metalId === metalId ? null : redesigned(run, { ...run.design, metalId }),
  );
}

export function chooseStone(state: GameState, stoneId: StoneId): GameState {
  if (!isStoneId(stoneId) || stoneLocked(state, stoneId)) return state;
  return updateActiveRun(state, "design", (run) => {
    if (designLocked(run) || productById(run.design.productId).seats.length === 0) return null;
    if (run.design.stoneId === stoneId) return null;
    return redesigned(run, { ...run.design, stoneId });
  });
}

export function designIssues(state: GameState, run: PieceRun): string[] {
  const product = productById(run.design.productId);
  const issues: string[] = [];
  for (const slot of product.slots)
    if (run.design.options[slot] === undefined) issues.push(`Pick a ${slot}.`);
  const { metalId, stoneId } = run.design;
  if (metalId === null) issues.push("Pick a metal.");
  else if (metalLocked(state, metalId)) issues.push(`${metalById(metalId).name} is still locked.`);
  if (product.seats.length > 0) {
    if (stoneId === null) issues.push("Pick a stone.");
    else if (stoneLocked(state, stoneId)) issues.push(`${stoneById(stoneId).name} is still locked.`);
  }
  return issues;
}
