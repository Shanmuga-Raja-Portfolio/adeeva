import { colourById } from "../../../../engine/palette";
import { mixHex } from "../../../../ui/art/colourMix";
import type { CushionFabricDef, CushionFabricId } from "../../content/cushionFabric";
import type { PartOptionId, PartSlot } from "../../content/partOption";
import type { ProductId } from "../../content/product";
import type { WoodId } from "../../content/wood";
import {
  clientById,
  cushionFabricById,
  finishById,
  productById,
  runPieces,
  type CommissionRun,
  type FinishChoice,
  type FloorSet,
  type PlacedExtra,
} from "../../core";
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
const LIMED = "#efe7d2";
const MIDNIGHT = "#2f3440";
const STAIN = "#4a2c1c";

function tinted(woodId: WoodId, hex: string, share: number): SurfaceFill {
  return { kind: "wood", look: hexWoodLook(mixHex(woodLook(woodId).base, hex, share)) };
}

function finishFills(finish: FinishChoice, woodId: WoodId): { frame: SurfaceFill; surface: SurfaceFill } {
  const raw: SurfaceFill = { kind: "wood", look: woodLook(woodId) };
  const { finishId, paint } = finish;
  if (finishId === null) return { frame: raw, surface: raw };
  const paintHex = paint === null ? "#cccccc" : colourById(paint).hex;
  const paintFill: SurfaceFill = { kind: "paint", hex: paintHex };
  switch (finishById(finishId).look) {
    case "wood":
      return { frame: raw, surface: raw };
    case "whitewash": {
      const washed = tinted(woodId, WHITEWASH, 0.62);
      return { frame: washed, surface: washed };
    }
    case "limed": {
      const limed = tinted(woodId, LIMED, 0.45);
      return { frame: limed, surface: limed };
    }
    case "stain": {
      const stained = tinted(woodId, STAIN, 0.7);
      return { frame: stained, surface: stained };
    }
    case "midnight": {
      const night = tinted(woodId, MIDNIGHT, 0.82);
      return { frame: night, surface: night };
    }
    case "paint":
      return { frame: paintFill, surface: paintFill };
    case "milk": {
      const milk: SurfaceFill = { kind: "paint", hex: mixHex(paintHex, "#fffaf0", 0.35) };
      return { frame: milk, surface: milk };
    }
    case "two-tone":
      return { frame: paintFill, surface: raw };
    case "wash": {
      const wash = tinted(woodId, paintHex, 0.45);
      return { frame: wash, surface: wash };
    }
  }
}

const SKETCH: SurfaceFill = { kind: "paint", hex: "#fffaf0" };

export function plaqueName(clientId: string): string {
  return clientById(clientId)?.name.split(" ").pop() ?? "";
}

interface LookParts {
  readonly productId: ProductId;
  readonly options: Readonly<Partial<Record<PartSlot, PartOptionId>>>;
  readonly woodId: WoodId | null;
  readonly finish: FinishChoice;
  readonly extras: readonly PlacedExtra[];
  readonly cushion: CushionFabricId | null;
  readonly plaque: string;
}

function lookOf(parts: LookParts): PieceLook {
  const fills =
    parts.woodId === null ? { frame: SKETCH, surface: SKETCH } : finishFills(parts.finish, parts.woodId);
  const seat = productById(parts.productId).seat;
  return {
    productId: parts.productId,
    options: parts.options,
    woodId: parts.woodId,
    frame: fills.frame,
    surface: fills.surface,
    extras: parts.extras,
    cushion: parts.cushion === null || !seat ? null : cushionFabricById(parts.cushion),
    plaque: parts.plaque,
  };
}

export function pieceLook(run: CommissionRun, piece = 0): PieceLook | null {
  const productId = runPieces(run).find((entry) => entry.index === piece)?.productId ?? null;
  if (productId === null) return null;
  return lookOf({
    productId,
    options: run.design.options,
    woodId: run.design.woodId,
    finish: run.finish,
    extras: run.extras.filter((placed) => placed.piece === piece),
    cushion: run.cushion?.fabricId ?? null,
    plaque: run.purpose.kind === "set" ? "Larkspur" : plaqueName(run.brief.clientId),
  });
}

export function setLooks(run: CommissionRun): PieceLook[] {
  return runPieces(run).flatMap((piece) => {
    const look = pieceLook(run, piece.index);
    return look === null ? [] : [look];
  });
}

export function floorLooks(set: FloorSet): PieceLook[] {
  return set.pieces.map((piece) =>
    lookOf({
      productId: piece.productId,
      options: set.options,
      woodId: set.woodId,
      finish: set.finish,
      extras: piece.extras,
      cushion: set.cushion,
      plaque: "Larkspur",
    }),
  );
}
