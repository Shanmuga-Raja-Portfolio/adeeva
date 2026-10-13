import { isColourId, type ColourId } from "../../../engine/palette";
import type { FillingId } from "../content/filling";
import { MIXES, type MixDef, type MixId } from "../content/mix";
import { PATTERN_CHOICES, type PatternChoice } from "../content/pipePattern";
import { TRAY_PRODUCT_IDS, type ProductDef, type ProductId } from "../content/product";
import { updateActiveRun } from "./activeRunUpdate";
import { EMPTY_BATCH, type BakeRun } from "./bakeRun";
import { isFillingId, isMixId, isProductId, mixById, productById } from "./catalog";
import type { GameState } from "./gameState";

export const MAX_ICING_COLOURS = 3;

export function productOptions(run: BakeRun): readonly ProductId[] {
  return run.brief === null ? TRAY_PRODUCT_IDS : run.brief.products;
}

export function mixOptions(product: ProductDef): MixDef[] {
  return MIXES.filter((mix) => mix.kind === product.mixKind);
}

export function batchName(product: ProductDef, batch: number): string {
  if (product.batches === 1) return "The mix";
  return batch === 0 ? "Big tier" : "Small tier";
}

export function maxColours(run: BakeRun): number {
  return run.purpose.kind === "tray" ? 1 : MAX_ICING_COLOURS;
}

export function chooseProduct(state: GameState, productId: ProductId): GameState {
  return updateActiveRun(state, "design", (run) => {
    if (!isProductId(productId) || !productOptions(run).includes(productId)) return null;
    if (run.design.productId === productId) return null;
    const product = productById(productId);
    const options = mixOptions(product);
    const only = options.length === 1 ? (options[0]?.id ?? null) : null;
    return {
      ...run,
      design: {
        ...run.design,
        productId,
        mixIds: Array.from({ length: product.batches }, () => only),
        fillingId: null,
      },
      batches: Array.from({ length: product.batches }, () => EMPTY_BATCH),
      stack: {},
      pipes: {},
    };
  });
}

export function chooseMix(state: GameState, batch: number, mixId: MixId): GameState {
  return updateActiveRun(state, "design", (run) => {
    const productId = run.design.productId;
    if (productId === null || !isMixId(mixId)) return null;
    const product = productById(productId);
    if (!Number.isInteger(batch) || batch < 0 || batch >= product.batches) return null;
    if (mixById(mixId).kind !== product.mixKind || run.design.mixIds[batch] === mixId) return null;
    return {
      ...run,
      design: { ...run.design, mixIds: run.design.mixIds.map((id, index) => (index === batch ? mixId : id)) },
      batches: run.batches.map((entry, index) => (index === batch ? EMPTY_BATCH : entry)),
    };
  });
}

export function chooseFilling(state: GameState, fillingId: FillingId | null): GameState {
  return updateActiveRun(state, "design", (run) => {
    const productId = run.design.productId;
    if (productId === null || run.purpose.kind === "tray") return null;
    const rule = productById(productId).filling;
    if (rule.kind === "none" || rule.kind === "fixed") return null;
    if (fillingId === null ? rule.kind === "required" : !isFillingId(fillingId)) return null;
    if (run.design.fillingId === fillingId) return null;
    return { ...run, design: { ...run.design, fillingId } };
  });
}

export function toggleColour(state: GameState, colour: ColourId): GameState {
  return updateActiveRun(state, "design", (run) => {
    if (!isColourId(colour)) return null;
    const current = run.design.colours;
    const limit = maxColours(run);
    if (current.includes(colour))
      return limit === 1
        ? null
        : { ...run, design: { ...run.design, colours: current.filter((entry) => entry !== colour) } };
    if (limit === 1) return { ...run, design: { ...run.design, colours: [colour] } };
    if (current.length >= limit) return null;
    return { ...run, design: { ...run.design, colours: [...current, colour] } };
  });
}

export function choosePattern(state: GameState, pattern: PatternChoice): GameState {
  return updateActiveRun(state, "design", (run) => {
    if (run.purpose.kind === "tray" || !PATTERN_CHOICES.includes(pattern)) return null;
    if (run.design.pattern === pattern) return null;
    return { ...run, design: { ...run.design, pattern }, pipes: {} };
  });
}

export function designIssues(run: BakeRun): string[] {
  const productId = run.design.productId;
  if (productId === null) return ["Choose what to bake."];
  const product = productById(productId);
  const issues: string[] = [];
  run.design.mixIds.forEach((mixId, batch) => {
    if (mixId === null)
      issues.push(
        product.batches === 1
          ? "Choose a mix."
          : `Choose a mix for the ${batchName(product, batch).toLowerCase()}.`,
      );
  });
  if (product.filling.kind === "required" && run.design.fillingId === null) issues.push("Choose a filling.");
  if (run.design.colours.length === 0) issues.push("Pick an icing colour.");
  return issues;
}
