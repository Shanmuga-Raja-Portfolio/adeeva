import { updateActiveRun } from "../../../engine/activeRunUpdate";
import type { ProductDef } from "../content/product";
import { designFilling } from "./bakeNeeds";
import type { BakeRun } from "./bakeRun";
import { fillingById, productById } from "./catalog";
import type { GameState } from "./gameState";

function runProduct(run: BakeRun): ProductDef | null {
  return run.design.productId === null ? null : productById(run.design.productId);
}

function slotName(product: ProductDef, slot: string): string {
  return product.stackSlots.find((entry) => entry.id === slot)?.name ?? slot;
}

export function slotAssignmentIssue(run: BakeRun, slot: string, pieceId: string): string | null {
  const product = runProduct(run);
  if (product === null || product.stackSlots.length === 0) return "This bake places itself.";
  if (!product.stackSlots.some((entry) => entry.id === slot)) return "That spot is not on the stand.";
  const piece = product.stackPieces.find((entry) => entry.id === pieceId);
  if (piece === undefined) return "That piece is not part of this bake.";
  if (run.batches[piece.batch]?.bake === null) return `The ${piece.name.toLowerCase()} is still in the oven.`;
  if (piece.slot !== slot)
    return `The ${piece.name.toLowerCase()} belongs on the ${slotName(product, piece.slot)}, not the ${slotName(product, slot)}.`;
  const first = product.stackSlots[0];
  if (first !== undefined && slot !== first.id && run.stack[first.id] === undefined)
    return `Start with the ${slotName(product, first.id)}.`;
  const occupant = run.stack[slot];
  if (occupant !== undefined && occupant !== pieceId) return "That spot already has a layer.";
  return null;
}

export function assignStack(state: GameState, slot: string, pieceId: string): GameState {
  return updateActiveRun(state, "stack", (run) => {
    if (slotAssignmentIssue(run, slot, pieceId) !== null || run.stack[slot] === pieceId) return null;
    return { ...run, stack: { ...run.stack, [slot]: pieceId } };
  });
}

export function stackComplete(run: BakeRun): boolean {
  const product = runProduct(run);
  return product !== null && product.stackSlots.every((slot) => run.stack[slot.id] !== undefined);
}

export function needsFilling(run: BakeRun): boolean {
  return run.purpose.kind === "order" && designFilling(run.design) !== null;
}

export function fillIssue(state: GameState, run: BakeRun): string | null {
  const filling = designFilling(run.design);
  const product = runProduct(run);
  if (filling === null || product === null || run.purpose.kind === "tray") return "This bake has no filling.";
  if (run.filled) return "The filling is already in.";
  if (!stackComplete(run)) return "Stack the layers first.";
  if (state.pantry.fillings[filling] < product.fillingJars)
    return `You need ${product.fillingJars} ${product.fillingJars === 1 ? "jar" : "jars"} of ${fillingById(filling).name}.`;
  return null;
}

export function fill(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || run.stage !== "stack" || fillIssue(state, run) !== null) return state;
  const filling = designFilling(run.design);
  const product = runProduct(run);
  if (filling === null || product === null) return state;
  return {
    ...state,
    pantry: {
      ...state.pantry,
      fillings: { ...state.pantry.fillings, [filling]: state.pantry.fillings[filling] - product.fillingJars },
    },
    activeRun: {
      ...run,
      filled: true,
      ingredientValue: run.ingredientValue + fillingById(filling).price * product.fillingJars,
    },
  };
}

export function stackIssues(run: BakeRun): string[] {
  const product = runProduct(run);
  if (product === null) return ["Choose what to bake."];
  const issues = product.stackPieces
    .filter((piece) => !Object.values(run.stack).includes(piece.id))
    .map((piece) => `Place the ${piece.name.toLowerCase()} on the ${slotName(product, piece.slot)}.`);
  if (needsFilling(run) && !run.filled) issues.push("Tap Fill to add the filling.");
  return issues;
}
