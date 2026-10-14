import { updateActiveRun } from "../../../engine/activeRunUpdate";
import { isColourId, type ColourId } from "../../../engine/palette";
import type { FillingId } from "../content/filling";
import { MAX_FLOURISHES, type FlourishId } from "../content/flourish";
import { PLAQUE_WORDS, type PlaqueWord } from "../content/letterPath";
import { MIXES, type MixDef, type MixId } from "../content/mix";
import { PATTERN_CHOICES, type PatternChoice } from "../content/pipePattern";
import { TRAY_PRODUCT_IDS, type ProductDef, type ProductId } from "../content/product";
import { EMPTY_BATCH, isCustomBake, TRAY_SPLITS, type BakeRun } from "./bakeRun";
import { isFillingId, isFlourishId, isMixId, isProductId, mixById, productById } from "./catalog";
import type { GameState } from "./gameState";

export const MAX_ICING_COLOURS = 3;
export const SALON_TRAY_COLOURS = 2;
export const RIBBON_MIX: MixId = "ribbon-chiffon";

export function productOptions(run: BakeRun): readonly ProductId[] {
  if (run.brief !== null) return run.brief.products;
  if (run.purpose.kind === "tray") return TRAY_PRODUCT_IDS;
  return run.design.productId === null ? [] : [run.design.productId];
}

export function mixOptions(product: ProductDef): MixDef[] {
  return MIXES.filter((mix) => mix.kind === product.mixKind);
}

export function batchName(product: ProductDef, batch: number): string {
  return product.batchNames[batch] ?? product.batchNames[0] ?? "The mix";
}

export function maxColours(run: BakeRun): number {
  if (run.purpose.kind === "tray") return 1;
  if (run.purpose.kind === "salon-tray") return SALON_TRAY_COLOURS;
  return MAX_ICING_COLOURS;
}

function designLocked(run: BakeRun): boolean {
  return run.purpose.kind === "salon-tray";
}

export function chooseProduct(state: GameState, productId: ProductId): GameState {
  return updateActiveRun(state, "design", (run) => {
    if (designLocked(run) || !isProductId(productId) || !productOptions(run).includes(productId)) return null;
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
      flourishes: run.flourishes.filter((flourish) => flourishFits(flourish, product, [])),
    };
  });
}

export function chooseMix(state: GameState, batch: number, mixId: MixId): GameState {
  return updateActiveRun(state, "design", (run) => {
    const productId = run.design.productId;
    if (designLocked(run) || productId === null || !isMixId(mixId)) return null;
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
    if (productId === null || !isCustomBake(run)) return null;
    const rule = productById(productId).filling;
    if (rule.kind === "none" || rule.kind === "fixed") return null;
    if (fillingId === null ? rule.kind === "required" : !isFillingId(fillingId)) return null;
    if (run.design.fillingId === fillingId) return null;
    return { ...run, design: { ...run.design, fillingId } };
  });
}

export function toggleColour(state: GameState, colour: ColourId): GameState {
  return updateActiveRun(state, "design", (run) => {
    if (designLocked(run) || !isColourId(colour)) return null;
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
    if (!isCustomBake(run) || !PATTERN_CHOICES.includes(pattern)) return null;
    if (run.design.pattern === pattern) return null;
    return { ...run, design: { ...run.design, pattern }, pipes: {} };
  });
}

export function chooseSplit(state: GameState, split: number): GameState {
  return updateActiveRun(state, "design", (run) => {
    if (run.purpose.kind !== "salon-tray" || !TRAY_SPLITS.some((entry) => entry === split)) return null;
    if (run.design.split === split) return null;
    return { ...run, design: { ...run.design, split } };
  });
}

export function flourishFits(
  flourish: FlourishId,
  product: ProductDef,
  mixIds: readonly (MixId | null)[],
): boolean {
  switch (flourish) {
    case "bake-together":
      return product.batches >= 2;
    case "ribbon-stir":
      return product.mixKind === "sponge" && (mixIds.length === 0 || mixIds.includes(RIBBON_MIX));
    case "blind-scale":
    case "plaque-lettering":
      return true;
  }
}

export function flourishIssue(run: BakeRun, flourish: FlourishId): string | null {
  if (run.purpose.kind !== "showpiece") return "Extra touches are for Fair showpieces.";
  if (run.design.productId === null) return "Choose what to bake first.";
  const product = productById(run.design.productId);
  if (!run.flourishes.includes(flourish) && run.flourishes.length >= MAX_FLOURISHES)
    return `Pick up to ${MAX_FLOURISHES} extra touches.`;
  if (flourish === "bake-together" && product.batches < 2) return "Baking together needs two or more tiers.";
  if (flourish === "ribbon-stir" && product.mixKind !== "sponge") return "Fold, then whisk needs a sponge.";
  return null;
}

export function toggleFlourish(state: GameState, flourish: FlourishId): GameState {
  return updateActiveRun(state, "design", (run) => {
    if (!isFlourishId(flourish) || flourishIssue(run, flourish) !== null) return null;
    const chosen = run.flourishes.includes(flourish)
      ? run.flourishes.filter((entry) => entry !== flourish)
      : [...run.flourishes, flourish];
    return {
      ...run,
      flourishes: chosen,
      word: chosen.includes("plaque-lettering") ? run.word : null,
      pipes: {},
      batches: flourish === "blind-scale" ? run.batches.map(() => EMPTY_BATCH) : run.batches,
    };
  });
}

export function chooseWord(state: GameState, word: PlaqueWord): GameState {
  return updateActiveRun(state, "design", (run) => {
    if (!run.flourishes.includes("plaque-lettering") || !PLAQUE_WORDS.includes(word)) return null;
    if (run.word === word) return null;
    return { ...run, word, pipes: {} };
  });
}

function flourishDesignIssues(run: BakeRun, product: ProductDef): string[] {
  const issues: string[] = [];
  if (run.flourishes.includes("plaque-lettering") && run.word === null)
    issues.push("Choose a word for the plaque.");
  for (const flourish of run.flourishes)
    if (!flourishFits(flourish, product, run.design.mixIds))
      issues.push(
        flourish === "ribbon-stir"
          ? "Fold, then whisk needs Ribbon Chiffon in one of the tiers."
          : "That extra touch does not suit this bake.",
      );
  return issues;
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
  if (isCustomBake(run) && product.filling.kind === "required" && run.design.fillingId === null)
    issues.push("Choose a filling.");
  if (run.design.colours.length === 0) issues.push("Pick an icing colour.");
  return [...issues, ...flourishDesignIssues(run, product)];
}
