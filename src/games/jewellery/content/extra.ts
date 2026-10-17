import type { ColourId } from "../../../engine/palette";
import type { JewelTag } from "./jewelTag";

export const CHAIN_IDS = [
  "fine-chain",
  "rope-chain",
  "silk-cord",
  "beaded-cord",
  "velvet-ribbon",
  "bag-clip",
] as const;
export type ChainId = (typeof CHAIN_IDS)[number];

export const NECKLACE_HOLDERS: readonly ChainId[] = [
  "fine-chain",
  "rope-chain",
  "silk-cord",
  "beaded-cord",
  "velvet-ribbon",
];

export const CHARM_IDS = [
  "star-charm",
  "leaf-charm",
  "pearl-drop",
  "motif-charm",
  "moon-charm",
  "shell-charm",
] as const;
export type CharmId = (typeof CHARM_IDS)[number];

export const MOTIF_CHARM: CharmId = "motif-charm";

export const EXTRA_IDS = [...CHAIN_IDS, ...CHARM_IDS] as const;
export type ExtraId = (typeof EXTRA_IDS)[number];

export interface ExtraDef {
  readonly id: ExtraId;
  readonly name: string;
  readonly price: number;
  readonly tags: readonly JewelTag[];
  readonly colour: ColourId | "metal" | "cord";
}

export const EXTRAS: readonly ExtraDef[] = [
  { id: "fine-chain", name: "Fine Chain", price: 4, tags: ["dainty"], colour: "metal" },
  { id: "rope-chain", name: "Rope Chain", price: 6, tags: ["bold"], colour: "metal" },
  { id: "silk-cord", name: "Silk Cord", price: 3, tags: ["nature"], colour: "cord" },
  { id: "beaded-cord", name: "Beaded Cord", price: 4, tags: ["playful"], colour: "cord" },
  { id: "velvet-ribbon", name: "Velvet Ribbon", price: 3, tags: ["elegant"], colour: "cord" },
  { id: "bag-clip", name: "Bag Clip", price: 3, tags: ["playful"], colour: "charcoal" },
  { id: "star-charm", name: "Tiny Star Charm", price: 2, tags: ["sparkly"], colour: "gold" },
  { id: "leaf-charm", name: "Tiny Leaf Charm", price: 2, tags: ["nature"], colour: "sage" },
  { id: "pearl-drop", name: "Pearl Drop", price: 3, tags: ["elegant"], colour: "ivory" },
  { id: "motif-charm", name: "Motif Charm", price: 2, tags: [], colour: "metal" },
  { id: "moon-charm", name: "Tiny Moon Charm", price: 2, tags: ["dreamy"], colour: "ivory" },
  { id: "shell-charm", name: "Tiny Shell Charm", price: 2, tags: ["nature"], colour: "blush" },
];

export function isChainId(value: string): value is ChainId {
  return CHAIN_IDS.some((id) => id === value);
}

export function isCharmId(value: string): value is CharmId {
  return CHARM_IDS.some((id) => id === value);
}

export const CLIP_SET = { name: "Clips & rings", price: 2 } as const;
