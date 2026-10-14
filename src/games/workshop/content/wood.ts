import type { WoodTag } from "./woodTag";
import type { WoodToneId } from "./woodTone";

export const WOOD_IDS = [
  "pine",
  "spruce",
  "poplar",
  "cedar",
  "larch",
  "birch",
  "beech",
  "ash",
  "maple",
  "cherry",
  "oak",
  "walnut",
] as const;
export type WoodId = (typeof WOOD_IDS)[number];

export interface WoodDef {
  readonly id: WoodId;
  readonly name: string;
  readonly price: number;
  readonly hardness: number;
  readonly knotty: boolean;
  readonly tone: WoodToneId;
  readonly tags: readonly WoodTag[];
  readonly minReputation: number;
}

export const WOODS: readonly WoodDef[] = [
  {
    id: "pine",
    name: "Pine",
    price: 6,
    hardness: 0.1,
    knotty: true,
    tone: "honey-wood",
    tags: ["rustic", "natural"],
    minReputation: 0,
  },
  {
    id: "spruce",
    name: "Spruce",
    price: 6,
    hardness: 0.1,
    knotty: false,
    tone: "pale-wood",
    tags: ["natural", "cosy"],
    minReputation: 0,
  },
  {
    id: "poplar",
    name: "Poplar",
    price: 7,
    hardness: 0.2,
    knotty: false,
    tone: "pale-wood",
    tags: ["modern"],
    minReputation: 0,
  },
  {
    id: "cedar",
    name: "Cedar",
    price: 8,
    hardness: 0.15,
    knotty: true,
    tone: "red-wood",
    tags: ["rustic", "cosy"],
    minReputation: 0,
  },
  {
    id: "larch",
    name: "Larch",
    price: 8,
    hardness: 0.3,
    knotty: true,
    tone: "honey-wood",
    tags: ["rustic", "sturdy"],
    minReputation: 0,
  },
  {
    id: "birch",
    name: "Birch",
    price: 9,
    hardness: 0.4,
    knotty: false,
    tone: "pale-wood",
    tags: ["modern", "natural"],
    minReputation: 3,
  },
  {
    id: "beech",
    name: "Beech",
    price: 10,
    hardness: 0.5,
    knotty: false,
    tone: "pale-wood",
    tags: ["sturdy", "classic"],
    minReputation: 5,
  },
  {
    id: "ash",
    name: "Ash",
    price: 11,
    hardness: 0.5,
    knotty: false,
    tone: "pale-wood",
    tags: ["sturdy", "modern"],
    minReputation: 8,
  },
  {
    id: "maple",
    name: "Maple",
    price: 12,
    hardness: 0.6,
    knotty: false,
    tone: "pale-wood",
    tags: ["classic", "modern"],
    minReputation: 10,
  },
  {
    id: "cherry",
    name: "Cherry",
    price: 13,
    hardness: 0.5,
    knotty: false,
    tone: "red-wood",
    tags: ["elegant", "cosy"],
    minReputation: 12,
  },
  {
    id: "oak",
    name: "Oak",
    price: 14,
    hardness: 0.6,
    knotty: false,
    tone: "honey-wood",
    tags: ["classic", "sturdy"],
    minReputation: 12,
  },
  {
    id: "walnut",
    name: "Walnut",
    price: 20,
    hardness: 0.55,
    knotty: false,
    tone: "dark-wood",
    tags: ["elegant", "classic"],
    minReputation: 15,
  },
];

export function hammersFor(wood: WoodDef): number {
  if (wood.hardness < 0.3) return 1;
  if (wood.hardness <= 0.5) return 2;
  return 3;
}
