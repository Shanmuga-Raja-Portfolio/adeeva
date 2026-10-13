import { PART_CATEGORIES, type PartCategory } from "../content/garmentPart";
import { GARMENT_SLOTS, type GarmentSlot } from "../content/garmentSlot";
import type { TrimId } from "../content/trim";
import type { Brief } from "./brief";
import type { Rotation } from "../../../engine/geometry/rotation";
import type { RunStage } from "./runStage";

export type RunPurpose =
  { readonly kind: "gig"; readonly gigId: string } | { readonly kind: "look"; readonly lookIndex: number };

export interface Design {
  readonly parts: Readonly<Record<PartCategory, string | null>>;
  readonly fabrics: Readonly<Record<PartCategory, string | null>>;
}

export interface PiecePlacement {
  readonly fabricId: string;
  readonly x: number;
  readonly y: number;
  readonly rotation: Rotation;
}

export interface SeamProgress {
  readonly progress: number;
  readonly ticks: number;
  readonly insideTicks: number;
  readonly assisted: boolean;
}

export interface Decoration {
  readonly id: string;
  readonly trimId: TrimId;
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly scale: number;
  readonly layer: number;
}

export interface DressRun {
  readonly id: string;
  readonly purpose: RunPurpose;
  readonly brief: Brief;
  readonly stage: RunStage;
  readonly startedDay: number;
  readonly design: Design;
  readonly placements: Readonly<Record<string, PiecePlacement>>;
  readonly cutFabrics: readonly string[];
  readonly cutAccuracy: Readonly<Record<string, number>>;
  readonly assembly: Readonly<Record<GarmentSlot, string | null>>;
  readonly seams: Readonly<Record<string, SeamProgress>>;
  readonly decorations: readonly Decoration[];
  readonly nextDecorationNumber: number;
  readonly fabricSpend: number;
}

function emptyCategoryRecord(): Record<PartCategory, string | null> {
  return Object.fromEntries(PART_CATEGORIES.map((category) => [category, null])) as Record<
    PartCategory,
    string | null
  >;
}

function emptyAssembly(): Record<GarmentSlot, string | null> {
  return Object.fromEntries(GARMENT_SLOTS.map((slot) => [slot, null])) as Record<GarmentSlot, string | null>;
}

export function createDressRun(id: string, purpose: RunPurpose, brief: Brief, day: number): DressRun {
  return {
    id,
    purpose,
    brief,
    stage: "brief",
    startedDay: day,
    design: { parts: emptyCategoryRecord(), fabrics: emptyCategoryRecord() },
    placements: {},
    cutFabrics: [],
    cutAccuracy: {},
    assembly: emptyAssembly(),
    seams: {},
    decorations: [],
    nextDecorationNumber: 1,
    fabricSpend: 0,
  };
}
