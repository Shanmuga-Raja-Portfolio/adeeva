import type { Rotation } from "../../../engine/geometry/rotation";
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
] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

export const STALL_PRODUCT_IDS = ["stack-ring", "shape-pendant", "drop-pair"] as const;
export type StallProductId = (typeof STALL_PRODUCT_IDS)[number];

type PartOutline = "band" | "shape" | "seat" | "loop";

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
  readonly kind: "ring" | "pendant" | "earrings" | "bracelet";
  readonly tags: readonly JewelTag[];
  readonly slots: readonly OptionSlot[];
  readonly parts: readonly PartDef[];
  readonly joints: readonly JointDef[];
  readonly seats: readonly string[];
  readonly needsChain: boolean;
  readonly clipSets: number;
  readonly canonical: Readonly<Record<string, CanonicalPlacement>>;
  readonly stallBase: number;
}

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
    needsChain: false,
    clipSets: 0,
    canonical: { band: at("strip", 12, 3.5) },
    stallBase: 22,
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
    needsChain: false,
    clipSets: 0,
    canonical: { band: at("strip", 12, 3), seat: at("sheet", 15, 15) },
    stallBase: 22,
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
    needsChain: true,
    clipSets: 0,
    canonical: { plate: at("sheet", 2, 2), loop: at("sheet", 29, 2) },
    stallBase: 30,
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
    needsChain: true,
    clipSets: 0,
    canonical: { plate: at("sheet", 2, 2), seat: at("sheet", 27, 2), loop: at("sheet", 27, 16) },
    stallBase: 30,
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
    needsChain: false,
    clipSets: 1,
    canonical: {
      "face-l": at("sheet", 3, 3),
      "face-r": at("sheet", 16, 3),
      "seat-l": at("sheet", 3, 17),
      "seat-r": at("sheet", 16, 17),
    },
    stallBase: 30,
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
    needsChain: false,
    clipSets: 1,
    canonical: { "drop-l": at("sheet", 4, 8), "drop-r": at("sheet", 22, 8) },
    stallBase: 30,
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
    needsChain: true,
    clipSets: 0,
    canonical: {
      "charm-1": at("sheet", 1.5, 2),
      "charm-2": at("sheet", 14, 2),
      "charm-3": at("sheet", 26.5, 2),
    },
    stallBase: 30,
  },
];
