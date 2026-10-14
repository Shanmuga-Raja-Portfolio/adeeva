import type { StyleTag } from "../../../engine/styleTag";
import type { FillingId } from "./filling";
import type { MixKind } from "./mix";

export const PRODUCT_IDS = [
  "cupcake-tray",
  "layer-cake",
  "two-tier-cake",
  "fruit-tart",
  "iced-biscuits",
  "petit-fours",
  "tartlet-set",
  "spiral-roll",
  "biscuit-wreath",
  "three-tier-cake",
] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

export const TRAY_PRODUCT_IDS = ["cupcake-tray", "iced-biscuits"] as const satisfies readonly ProductId[];
export type TrayProductId = (typeof TRAY_PRODUCT_IDS)[number];

export const COUNTER_PRODUCT_IDS = [
  "cupcake-tray",
  "iced-biscuits",
  "petit-fours",
  "tartlet-set",
  "spiral-roll",
] as const satisfies readonly ProductId[];
export type CounterProductId = (typeof COUNTER_PRODUCT_IDS)[number];

export type FillingRule =
  | { readonly kind: "none" }
  | { readonly kind: "optional" }
  | { readonly kind: "required" }
  | { readonly kind: "fixed"; readonly filling: FillingId };

export interface StackSlotDef {
  readonly id: string;
  readonly name: string;
}

export interface StackPieceDef {
  readonly id: string;
  readonly name: string;
  readonly slot: string;
  readonly batch: number;
}

export interface ProductDef {
  readonly id: ProductId;
  readonly name: string;
  readonly mixKind: MixKind;
  readonly batches: number;
  readonly batchNames: readonly string[];
  readonly frostedUnits: number;
  readonly icingOnly: boolean;
  readonly filling: FillingRule;
  readonly fillingJars: number;
  readonly stackSlots: readonly StackSlotDef[];
  readonly stackPieces: readonly StackPieceDef[];
  readonly tags: readonly StyleTag[];
  readonly pieces: number;
}

export const PRODUCTS: readonly ProductDef[] = [
  {
    id: "cupcake-tray",
    name: "Cupcake Tray",
    mixKind: "sponge",
    batches: 1,
    batchNames: ["The mix"],
    frostedUnits: 1,
    icingOnly: false,
    filling: { kind: "optional" },
    fillingJars: 1,
    stackSlots: [],
    stackPieces: [],
    tags: ["playful"],
    pieces: 6,
  },
  {
    id: "layer-cake",
    name: "Two-Layer Cake",
    mixKind: "sponge",
    batches: 1,
    batchNames: ["The mix"],
    frostedUnits: 1,
    icingOnly: false,
    filling: { kind: "required" },
    fillingJars: 1,
    stackSlots: [
      { id: "stand", name: "cake stand" },
      { id: "on-top", name: "top of the cake" },
    ],
    stackPieces: [
      { id: "base-layer", name: "Flat layer", slot: "stand", batch: 0 },
      { id: "dome-layer", name: "Domed layer", slot: "on-top", batch: 0 },
    ],
    tags: ["classic"],
    pieces: 1,
  },
  {
    id: "two-tier-cake",
    name: "Two-Tier Celebration Cake",
    mixKind: "sponge",
    batches: 2,
    batchNames: ["Big tier", "Small tier"],
    frostedUnits: 2,
    icingOnly: false,
    filling: { kind: "required" },
    fillingJars: 2,
    stackSlots: [
      { id: "stand", name: "cake stand" },
      { id: "on-top", name: "top of the big tier" },
    ],
    stackPieces: [
      { id: "big-tier", name: "Big tier", slot: "stand", batch: 0 },
      { id: "small-tier", name: "Small tier", slot: "on-top", batch: 1 },
    ],
    tags: ["elegant", "regal"],
    pieces: 1,
  },
  {
    id: "fruit-tart",
    name: "Glazed Fruit Tart",
    mixKind: "shortcrust",
    batches: 1,
    batchNames: ["The mix"],
    frostedUnits: 0,
    icingOnly: false,
    filling: { kind: "fixed", filling: "vanilla-cream" },
    fillingJars: 1,
    stackSlots: [],
    stackPieces: [],
    tags: ["elegant", "romantic"],
    pieces: 1,
  },
  {
    id: "iced-biscuits",
    name: "Iced Biscuit Set",
    mixKind: "biscuit",
    batches: 1,
    batchNames: ["The mix"],
    frostedUnits: 1,
    icingOnly: true,
    filling: { kind: "none" },
    fillingJars: 0,
    stackSlots: [],
    stackPieces: [],
    tags: ["playful", "casual"],
    pieces: 6,
  },
  {
    id: "petit-fours",
    name: "Petits Fours",
    mixKind: "sponge",
    batches: 1,
    batchNames: ["The mix"],
    frostedUnits: 1,
    icingOnly: true,
    filling: { kind: "optional" },
    fillingJars: 1,
    stackSlots: [],
    stackPieces: [],
    tags: ["elegant", "dreamy"],
    pieces: 6,
  },
  {
    id: "tartlet-set",
    name: "Tartlet Set",
    mixKind: "shortcrust",
    batches: 1,
    batchNames: ["The mix"],
    frostedUnits: 0,
    icingOnly: false,
    filling: { kind: "required" },
    fillingJars: 1,
    stackSlots: [],
    stackPieces: [],
    tags: ["elegant", "casual"],
    pieces: 6,
  },
  {
    id: "spiral-roll",
    name: "Spiral Roll",
    mixKind: "sponge",
    batches: 1,
    batchNames: ["The mix"],
    frostedUnits: 1,
    icingOnly: false,
    filling: { kind: "required" },
    fillingJars: 1,
    stackSlots: [{ id: "board", name: "serving board" }],
    stackPieces: [{ id: "rolled-sponge", name: "Rolled sponge", slot: "board", batch: 0 }],
    tags: ["playful", "classic"],
    pieces: 6,
  },
  {
    id: "biscuit-wreath",
    name: "Biscuit Wreath",
    mixKind: "biscuit",
    batches: 2,
    batchNames: ["First six", "Second six"],
    frostedUnits: 2,
    icingOnly: true,
    filling: { kind: "none" },
    fillingJars: 0,
    stackSlots: [
      { id: "ring-left", name: "left of the ring" },
      { id: "ring-right", name: "right of the ring" },
    ],
    stackPieces: [
      { id: "first-six", name: "First six biscuits", slot: "ring-left", batch: 0 },
      { id: "second-six", name: "Second six biscuits", slot: "ring-right", batch: 1 },
    ],
    tags: ["playful", "dreamy"],
    pieces: 12,
  },
  {
    id: "three-tier-cake",
    name: "Three-Tier Garden Cake",
    mixKind: "sponge",
    batches: 3,
    batchNames: ["Big tier", "Middle tier", "Small tier"],
    frostedUnits: 3,
    icingOnly: false,
    filling: { kind: "required" },
    fillingJars: 3,
    stackSlots: [
      { id: "stand", name: "cake stand" },
      { id: "on-big", name: "top of the big tier" },
      { id: "on-middle", name: "top of the middle tier" },
    ],
    stackPieces: [
      { id: "big-tier", name: "Big tier", slot: "stand", batch: 0 },
      { id: "middle-tier", name: "Middle tier", slot: "on-big", batch: 1 },
      { id: "small-tier", name: "Small tier", slot: "on-middle", batch: 2 },
    ],
    tags: ["regal", "elegant"],
    pieces: 1,
  },
];
