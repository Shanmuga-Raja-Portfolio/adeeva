import type { ColourId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";

export const PATCH_IDS = ["patch-heart", "patch-star", "patch-round", "patch-square"] as const;
export type PatchId = (typeof PATCH_IDS)[number];

export const MARK_IDS = ["mend-cross", "paint-dots"] as const;
export type MarkId = (typeof MARK_IDS)[number];

export interface PatchDef {
  readonly id: PatchId;
  readonly name: string;
  readonly tags: readonly StyleTag[];
}

export interface MarkDef {
  readonly id: MarkId;
  readonly name: string;
  readonly price: number;
  readonly tags: readonly StyleTag[];
}

export const PATCHES: readonly PatchDef[] = [
  { id: "patch-heart", name: "Heart Patch", tags: ["playful", "romantic"] },
  { id: "patch-star", name: "Star Patch", tags: ["bold", "playful"] },
  { id: "patch-round", name: "Round Patch", tags: ["casual"] },
  { id: "patch-square", name: "Square Patch", tags: ["classic"] },
];

export const MARKS: readonly MarkDef[] = [
  { id: "mend-cross", name: "Visible Mend Stitch", price: 1, tags: ["edgy", "casual"] },
  { id: "paint-dots", name: "Fabric Paint Dots", price: 2, tags: ["bold", "playful"] },
];

export const PAINT_COLOURS: readonly ColourId[] = ["coral", "mustard", "teal", "lavender", "ivory", "rose"];

export const MAX_SCRAPS = 12;
export const SCRAP_AREA_CM2 = 600;
export const MAX_SCRAPS_PER_FIND = 3;
