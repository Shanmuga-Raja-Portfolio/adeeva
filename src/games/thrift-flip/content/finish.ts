import type { ColourId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";

export const PATCH_IDS = [
  "patch-heart",
  "patch-star",
  "patch-round",
  "patch-square",
  "patch-leaf",
  "patch-flower",
  "patch-pocket",
] as const;
export type PatchId = (typeof PATCH_IDS)[number];

export const MARK_IDS = ["mend-cross", "paint-dots", "mend-running", "mend-darn", "stamp-leaf"] as const;
export type MarkId = (typeof MARK_IDS)[number];

export const MEND_MARK_IDS: readonly MarkId[] = ["mend-cross", "mend-running", "mend-darn"];
export const COLOURED_MARK_IDS: readonly MarkId[] = ["paint-dots", "stamp-leaf"];
export const BOUTIQUE_FINISH_IDS: readonly (PatchId | MarkId)[] = [
  "patch-leaf",
  "patch-flower",
  "patch-pocket",
  "mend-running",
  "mend-darn",
  "stamp-leaf",
];

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
  { id: "patch-leaf", name: "Leaf Patch", tags: ["classic", "dreamy"] },
  { id: "patch-flower", name: "Flower Patch", tags: ["romantic", "playful"] },
  { id: "patch-pocket", name: "Pocket Patch", tags: ["casual"] },
];

export const MARKS: readonly MarkDef[] = [
  { id: "mend-cross", name: "Visible Mend Stitch", price: 1, tags: ["edgy", "casual"] },
  { id: "paint-dots", name: "Fabric Paint Dots", price: 2, tags: ["bold", "playful"] },
  { id: "mend-running", name: "Running Stitch Mend", price: 1, tags: ["classic", "elegant"] },
  { id: "mend-darn", name: "Woven Darn", price: 2, tags: ["casual", "classic"] },
  { id: "stamp-leaf", name: "Leaf Stamp Print", price: 2, tags: ["dreamy", "bold"] },
];

export const PAINT_COLOURS: readonly ColourId[] = ["coral", "mustard", "teal", "lavender", "ivory", "rose"];

export const MAX_SCRAPS = 12;
export const SCRAP_AREA_CM2 = 600;
export const MAX_SCRAPS_PER_FIND = 3;
