import { colourById } from "../../../../engine/palette";
import { mixHex } from "../../../../ui/art/colourMix";
import type { CushionFabricDef } from "../../content/cushionFabric";
import type { PartOptionId, PartSlot } from "../../content/partOption";
import type { ProductId } from "../../content/product";
import type { WoodId } from "../../content/wood";
import { clientById, cushionFabricById, finishById, type CommissionRun, type PlacedExtra } from "../../core";
import { hexWoodLook, woodLook, type WoodLook } from "./woodLook";

export type SurfaceFill =
  { readonly kind: "wood"; readonly look: WoodLook } | { readonly kind: "paint"; readonly hex: string };

export interface PieceLook {
  readonly productId: ProductId;
  readonly options: Readonly<Partial<Record<PartSlot, PartOptionId>>>;
  readonly woodId: WoodId | null;
  readonly frame: SurfaceFill;
  readonly surface: SurfaceFill;
  readonly extras: readonly PlacedExtra[];
  readonly cushion: CushionFabricDef | null;
  readonly plaque: string;
}

const WHITEWASH = "#f6efe0";

function finishFills(run: CommissionRun, woodId: WoodId): { frame: SurfaceFill; surface: SurfaceFill } {
  const raw: SurfaceFill = { kind: "wood", look: woodLook(woodId) };
  const { finishId, paint } = run.finish;
  if (finishId === null) return { frame: raw, surface: raw };
  const paintFill: SurfaceFill = { kind: "paint", hex: paint === null ? "#cccccc" : colourById(paint).hex };
  switch (finishById(finishId).look) {
    case "wood":
      return { frame: raw, surface: raw };
    case "whitewash": {
      const washed: SurfaceFill = {
        kind: "wood",
        look: hexWoodLook(mixHex(woodLook(woodId).base, WHITEWASH, 0.62)),
      };
      return { frame: washed, surface: washed };
    }
    case "stain": {
      const stained: SurfaceFill = {
        kind: "wood",
        look: hexWoodLook(mixHex(woodLook(woodId).base, "#4a2c1c", 0.7)),
      };
      return { frame: stained, surface: stained };
    }
    case "paint":
      return { frame: paintFill, surface: paintFill };
    case "two-tone":
      return { frame: paintFill, surface: raw };
  }
}

const SKETCH: SurfaceFill = { kind: "paint", hex: "#fffaf0" };

function plaqueName(clientId: string): string {
  return clientById(clientId)?.name.split(" ").pop() ?? "";
}

export function pieceLook(run: CommissionRun): PieceLook | null {
  const { productId, woodId } = run.design;
  if (productId === null) return null;
  const fills = woodId === null ? { frame: SKETCH, surface: SKETCH } : finishFills(run, woodId);
  return {
    productId,
    options: run.design.options,
    woodId,
    frame: fills.frame,
    surface: fills.surface,
    extras: run.extras,
    cushion: run.cushion === null ? null : cushionFabricById(run.cushion.fabricId),
    plaque: plaqueName(run.brief.clientId),
  };
}
