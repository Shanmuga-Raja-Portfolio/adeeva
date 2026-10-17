import type { Rotation } from "../../../engine/geometry/rotation";
import { NECKLACE_HOLDERS, type ChainId } from "./extra";
import type { JewelTag } from "./jewelTag";
import type { OptionSlot } from "./partOption";
import type { StockSizeId } from "./stockSize";

export const PRODUCT_IDS = [
  "stack-ring",
  "stone-ring",
  "shape-pendant",
  "stone-pendant",
  "clip-pair",
  "drop-pair",
  "charm-bracelet",
  "motif-ring",
  "stone-drops",
  "bangle",
  "coat-badge",
  "bag-charm",
  "friendship-halves",
  "hair-slide",
] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

export const STALL_PRODUCT_IDS = ["stack-ring", "shape-pendant", "drop-pair", "bangle", "bag-charm"] as const;
export type StallProductId = (typeof STALL_PRODUCT_IDS)[number];

type PartOutline = "band" | "shape" | "seat" | "loop" | "half" | "bar";

export const PRODUCT_KINDS = ["ring", "pendant", "earrings", "bracelet", "badge", "charm", "slide"] as const;
export type ProductKind = (typeof PRODUCT_KINDS)[number];

export interface HolderNeed {
  readonly choices: readonly ChainId[];
  readonly count: number;
}

export interface PartDef {
  readonly key: string;
  readonly name: string;
  readonly outline: PartOutline;
  readonly width: number;
  readonly height: number;
  readonly mirrored: boolean;
  readonly accent: boolean;
}

export interface JointDef {
  readonly id: string;
  readonly name: string;
  readonly ticks: number;
}

interface CanonicalPlacement {
  readonly size: StockSizeId;
  readonly x: number;
  readonly y: number;
  readonly rotation: Rotation;
}

export interface ProductDef {
  readonly id: ProductId;
  readonly name: string;
  readonly kind: ProductKind;
  readonly tags: readonly JewelTag[];
  readonly slots: readonly OptionSlot[];
  readonly parts: readonly PartDef[];
  readonly joints: readonly JointDef[];
  readonly seats: readonly string[];
  readonly holder: HolderNeed | null;
  readonly clipSets: number;
  readonly canonical: Readonly<Record<string, CanonicalPlacement>>;
  readonly stallBase: number;
  readonly lineBase: number;
}

const NECKLACE: HolderNeed = { choices: NECKLACE_HOLDERS, count: 1 };

const RING_SEAM = 300;
const SEAM = 240;

function part(key: string, name: string, outline: PartOutline, width: number, height: number): PartDef {
  return { key, name, outline, width, height, mirrored: false, accent: false };
}

function at(size: StockSizeId, x: number, y: number): CanonicalPlacement {
  return { size, x, y, rotation: 0 };
}

export const PRODUCTS: readonly ProductDef[] = [
  {
    id: "stack-ring",
    name: "Stacking Ring",
    kind: "ring",
    tags: ["classic"],
    slots: ["band"],
    parts: [part("band", "Band", "band", 56, 3)],
    joints: [{ id: "ring-seam", name: "Ring seam", ticks: RING_SEAM }],
    seats: [],
    holder: null,
    clipSets: 0,
    canonical: { band: at("strip", 12, 3.5) },
    stallBase: 22,
    lineBase: 34,
  },
  {
    id: "stone-ring",
    name: "Stone Ring",
    kind: "ring",
    tags: ["classic"],
    slots: ["band"],
    parts: [part("band", "Band", "band", 56, 4), part("seat", "Stone seat", "seat", 10, 10)],
    joints: [
      { id: "ring-seam", name: "Ring seam", ticks: RING_SEAM },
      { id: "seat", name: "Stone seat", ticks: SEAM },
    ],
    seats: ["seat"],
    holder: null,
    clipSets: 0,
    canonical: { band: at("strip", 12, 3), seat: at("sheet", 15, 15) },
    stallBase: 22,
    lineBase: 52,
  },
  {
    id: "shape-pendant",
    name: "Shape Pendant",
    kind: "pendant",
    tags: ["elegant"],
    slots: ["shape", "accent"],
    parts: [
      { ...part("plate", "Pendant", "shape", 26, 26), accent: true },
      part("loop", "Loop", "loop", 10, 4),
    ],
    joints: [{ id: "loop", name: "Loop", ticks: SEAM }],
    seats: [],
    holder: NECKLACE,
    clipSets: 0,
    canonical: { plate: at("sheet", 2, 2), loop: at("sheet", 29, 2) },
    stallBase: 30,
    lineBase: 44,
  },
  {
    id: "stone-pendant",
    name: "Stone Pendant",
    kind: "pendant",
    tags: ["elegant"],
    slots: ["shape"],
    parts: [
      part("plate", "Pendant", "shape", 22, 22),
      part("seat", "Stone seat", "seat", 10, 10),
      part("loop", "Loop", "loop", 10, 4),
    ],
    joints: [
      { id: "seat", name: "Stone seat", ticks: SEAM },
      { id: "loop", name: "Loop", ticks: SEAM },
    ],
    seats: ["seat"],
    holder: NECKLACE,
    clipSets: 0,
    canonical: { plate: at("sheet", 2, 2), seat: at("sheet", 27, 2), loop: at("sheet", 27, 16) },
    stallBase: 30,
    lineBase: 56,
  },
  {
    id: "clip-pair",
    name: "Clip Earrings",
    kind: "earrings",
    tags: ["dainty"],
    slots: ["shape"],
    parts: [
      part("face-l", "Left face", "shape", 10, 10),
      { ...part("face-r", "Right face", "shape", 10, 10), mirrored: true },
      part("seat-l", "Left seat", "seat", 6, 6),
      { ...part("seat-r", "Right seat", "seat", 6, 6), mirrored: true },
    ],
    joints: [
      { id: "clip-l", name: "Left clip", ticks: SEAM },
      { id: "clip-r", name: "Right clip", ticks: SEAM },
    ],
    seats: ["seat-l", "seat-r"],
    holder: null,
    clipSets: 1,
    canonical: {
      "face-l": at("sheet", 3, 3),
      "face-r": at("sheet", 16, 3),
      "seat-l": at("sheet", 3, 17),
      "seat-r": at("sheet", 16, 17),
    },
    stallBase: 30,
    lineBase: 52,
  },
  {
    id: "drop-pair",
    name: "Drop Earrings",
    kind: "earrings",
    tags: ["elegant"],
    slots: ["shape"],
    parts: [
      part("drop-l", "Left drop", "shape", 12, 24),
      { ...part("drop-r", "Right drop", "shape", 12, 24), mirrored: true },
    ],
    joints: [
      { id: "clip-loop-l", name: "Left clip loop", ticks: SEAM },
      { id: "clip-loop-r", name: "Right clip loop", ticks: SEAM },
    ],
    seats: [],
    holder: null,
    clipSets: 1,
    canonical: { "drop-l": at("sheet", 4, 8), "drop-r": at("sheet", 22, 8) },
    stallBase: 30,
    lineBase: 46,
  },
  {
    id: "charm-bracelet",
    name: "Charm Bracelet",
    kind: "bracelet",
    tags: ["playful"],
    slots: ["shape"],
    parts: [
      part("charm-1", "First charm", "shape", 12, 12),
      part("charm-2", "Second charm", "shape", 12, 12),
      part("charm-3", "Third charm", "shape", 12, 12),
    ],
    joints: [
      { id: "jump-1", name: "First little ring", ticks: SEAM },
      { id: "jump-2", name: "Second little ring", ticks: SEAM },
      { id: "jump-3", name: "Third little ring", ticks: SEAM },
    ],
    seats: [],
    holder: NECKLACE,
    clipSets: 0,
    canonical: {
      "charm-1": at("sheet", 1.5, 2),
      "charm-2": at("sheet", 14, 2),
      "charm-3": at("sheet", 26.5, 2),
    },
    stallBase: 30,
    lineBase: 50,
  },
  {
    id: "motif-ring",
    name: "Motif Ring",
    kind: "ring",
    tags: ["classic"],
    slots: ["band", "shape"],
    parts: [part("band", "Band", "band", 56, 3), part("top", "Motif top", "shape", 12, 12)],
    joints: [
      { id: "ring-seam", name: "Ring seam", ticks: RING_SEAM },
      { id: "top", name: "Motif top", ticks: SEAM },
    ],
    seats: [],
    holder: null,
    clipSets: 0,
    canonical: { band: at("strip", 12, 3.5), top: at("sheet", 2, 2) },
    stallBase: 26,
    lineBase: 42,
  },
  {
    id: "stone-drops",
    name: "Stone Drops",
    kind: "earrings",
    tags: ["elegant"],
    slots: ["shape"],
    parts: [
      part("drop-l", "Left drop", "shape", 12, 24),
      { ...part("drop-r", "Right drop", "shape", 12, 24), mirrored: true },
      part("seat-l", "Left seat", "seat", 6, 6),
      { ...part("seat-r", "Right seat", "seat", 6, 6), mirrored: true },
    ],
    joints: [
      { id: "clip-loop-l", name: "Left clip loop", ticks: SEAM },
      { id: "clip-loop-r", name: "Right clip loop", ticks: SEAM },
    ],
    seats: ["seat-l", "seat-r"],
    holder: null,
    clipSets: 1,
    canonical: {
      "drop-l": at("sheet", 2, 2),
      "drop-r": at("sheet", 15, 2),
      "seat-l": at("sheet", 29, 2),
      "seat-r": at("sheet", 29, 10),
    },
    stallBase: 34,
    lineBase: 58,
  },
  {
    id: "bangle",
    name: "Bangle",
    kind: "bracelet",
    tags: ["bold"],
    slots: ["band", "accent"],
    parts: [{ ...part("band", "Band", "band", 80, 5), accent: true }],
    joints: [{ id: "ring-seam", name: "Bangle seam", ticks: RING_SEAM }],
    seats: [],
    holder: null,
    clipSets: 0,
    canonical: { band: at("strip", 0, 2.5) },
    stallBase: 26,
    lineBase: 40,
  },
  {
    id: "coat-badge",
    name: "Coat Badge",
    kind: "badge",
    tags: ["playful"],
    slots: ["shape", "accent"],
    parts: [
      { ...part("plate", "Badge", "shape", 30, 30), accent: true },
      part("bar", "Clip bar", "bar", 24, 4),
    ],
    joints: [{ id: "bar", name: "Clip bar", ticks: SEAM }],
    seats: [],
    holder: null,
    clipSets: 1,
    canonical: { plate: at("sheet", 2, 2), bar: at("sheet", 2, 34) },
    stallBase: 26,
    lineBase: 40,
  },
  {
    id: "bag-charm",
    name: "Bag Charm",
    kind: "charm",
    tags: ["playful"],
    slots: ["shape"],
    parts: [part("plate", "Charm", "shape", 26, 26), part("loop", "Loop", "loop", 10, 4)],
    joints: [{ id: "loop", name: "Loop", ticks: SEAM }],
    seats: [],
    holder: { choices: ["bag-clip"], count: 1 },
    clipSets: 0,
    canonical: { plate: at("sheet", 2, 2), loop: at("sheet", 29, 2) },
    stallBase: 26,
    lineBase: 38,
  },
  {
    id: "friendship-halves",
    name: "Friendship Halves",
    kind: "pendant",
    tags: ["playful"],
    slots: ["shape"],
    parts: [
      part("half-l", "Left half", "half", 14, 26),
      { ...part("half-r", "Right half", "half", 14, 26), mirrored: true },
      part("loop-l", "Left loop", "loop", 10, 4),
      { ...part("loop-r", "Right loop", "loop", 10, 4), mirrored: true },
    ],
    joints: [
      { id: "loop-l", name: "Left loop", ticks: SEAM },
      { id: "loop-r", name: "Right loop", ticks: SEAM },
    ],
    seats: [],
    holder: { choices: NECKLACE_HOLDERS, count: 2 },
    clipSets: 0,
    canonical: {
      "half-l": at("sheet", 2, 2),
      "half-r": at("sheet", 18, 2),
      "loop-l": at("sheet", 2, 31),
      "loop-r": at("sheet", 18, 31),
    },
    stallBase: 30,
    lineBase: 48,
  },
  {
    id: "hair-slide",
    name: "Hair Slide",
    kind: "slide",
    tags: ["dainty"],
    slots: ["band", "accent"],
    parts: [{ ...part("plate", "Slide", "band", 36, 10), accent: true }],
    joints: [{ id: "clip", name: "Slide clip", ticks: SEAM }],
    seats: [],
    holder: null,
    clipSets: 1,
    canonical: { plate: at("strip", 2, 0) },
    stallBase: 24,
    lineBase: 36,
  },
];

export const PAIR_PRODUCT_IDS: readonly ProductId[] = [
  "clip-pair",
  "drop-pair",
  "stone-drops",
  "friendship-halves",
];
