import type { FinishId } from "../../../content/finish";
import type { GlazeColour } from "../../../content/jewelColour";
import type { MetalId } from "../../../content/metal";
import { SHAPE_IDS, type ShapeId } from "../../../content/partOption";
import type { ProductId } from "../../../content/product";
import type { StoneId } from "../../../content/stone";
import {
  coloredHolder,
  defaultOptions,
  oseiSuggestion,
  productById,
  slotStone,
  type CollectionBrief,
  type CollectionState,
  type GameState,
  type PieceSource,
  type PlacedCharm,
} from "../../../core";

export interface BoardDraft {
  readonly products: readonly ProductId[];
  readonly motif: ShapeId | null;
  readonly metalId: MetalId | null;
  readonly hero: StoneId | null;
  readonly accent: StoneId | null;
  readonly finish: FinishId | null;
  readonly glaze: GlazeColour | null;
}

const CHARM_CARRIERS: readonly ProductId[] = ["bangle", "hair-slide", "charm-bracelet"];

export function startingDraft(state: GameState, collection: CollectionState): BoardDraft {
  const suggestion = oseiSuggestion(state, collection);
  if (state.profile.difficulty === "relaxed" && suggestion !== null) return suggestion;
  const run = state.activeRun;
  if (run !== null && run.stage !== "done" && run.purpose.kind === "collection")
    return {
      products: [run.design.productId],
      motif: SHAPE_IDS.find((id) => id === run.design.options.shape) ?? null,
      metalId: run.design.metalId,
      hero: run.design.stoneId,
      accent: null,
      finish: null,
      glaze: null,
    };
  return { products: [], motif: null, metalId: null, hero: null, accent: null, finish: null, glaze: null };
}

export function draftBrief(draft: BoardDraft): CollectionBrief | null {
  if (draft.motif === null || draft.metalId === null || draft.finish === null) return null;
  return {
    products: draft.products,
    motif: draft.motif,
    metalId: draft.metalId,
    hero: draft.hero,
    accent: draft.accent,
    finish: draft.finish,
    glaze: draft.finish === "glaze" ? (draft.glaze ?? "sky") : null,
  };
}

export function draftMissing(draft: BoardDraft): string | null {
  if (draft.products.length === 0) return "Add pieces to your line.";
  if (draft.motif === null) return "Pick a motif.";
  if (draft.metalId === null) return "Pick a metal.";
  if (draft.finish === null) return "Pick a finish.";
  return null;
}

export function previewSource(draft: BoardDraft, productId: ProductId): PieceSource {
  const product = productById(productId);
  const motif = draft.motif ?? "circle";
  const options = product.slots.includes("shape")
    ? { ...defaultOptions(productId), shape: motif }
    : defaultOptions(productId);
  const chain = product.holder?.choices[0] ?? null;
  const charms: PlacedCharm[] =
    CHARM_CARRIERS.includes(productId) && draft.motif !== null
      ? [
          {
            id: "preview-motif",
            charmId: "motif-charm",
            shape: motif,
            x: 120,
            y: 196,
            rotation: 0,
            scale: 1.3,
            layer: 1,
          },
        ]
      : [];
  const brief = draftBrief({
    ...draft,
    motif,
    metalId: draft.metalId ?? "silver",
    finish: draft.finish ?? "high-shine",
  });
  return {
    productId,
    options,
    metalId: draft.metalId,
    stoneId: brief === null ? null : slotStone(brief, productId),
    finish: draft.finish ?? "high-shine",
    glaze: draft.finish === "glaze" ? (draft.glaze ?? "sky") : null,
    chain,
    cordColour: coloredHolder(chain) ? "lavender" : null,
    charms,
  };
}
