import type { JewelColour } from "./jewelColour";
import type { JewelTag } from "./jewelTag";

export const METAL_IDS = [
  "copper",
  "brass",
  "silver",
  "bronze",
  "rose-gold",
  "gold",
  "pewter",
  "steel",
  "white-gold",
  "green-gold",
] as const;
export type MetalId = (typeof METAL_IDS)[number];

export interface MetalDef {
  readonly id: MetalId;
  readonly name: string;
  readonly price: number;
  readonly hardness: number;
  readonly hammers: 1 | 2 | 3;
  readonly warmRate: number;
  readonly tone: JewelColour;
  readonly sparkle: 1 | 2 | 3;
  readonly tags: readonly JewelTag[];
  readonly minReputation: number;
}

export const METALS: readonly MetalDef[] = [
  {
    id: "copper",
    name: "Copper",
    price: 4,
    hardness: 0.2,
    hammers: 1,
    warmRate: 0.35,
    tone: "copper",
    sparkle: 1,
    tags: ["nature", "playful"],
    minReputation: 0,
  },
  {
    id: "brass",
    name: "Brass",
    price: 5,
    hardness: 0.3,
    hammers: 2,
    warmRate: 0.38,
    tone: "gold",
    sparkle: 1,
    tags: ["bold", "classic"],
    minReputation: 0,
  },
  {
    id: "silver",
    name: "Silver",
    price: 12,
    hardness: 0.25,
    hammers: 1,
    warmRate: 0.45,
    tone: "silver",
    sparkle: 2,
    tags: ["classic", "elegant"],
    minReputation: 0,
  },
  {
    id: "bronze",
    name: "Bronze",
    price: 6,
    hardness: 0.35,
    hammers: 3,
    warmRate: 0.38,
    tone: "bronze",
    sparkle: 1,
    tags: ["nature", "classic"],
    minReputation: 3,
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    price: 18,
    hardness: 0.35,
    hammers: 3,
    warmRate: 0.4,
    tone: "rose-gold",
    sparkle: 3,
    tags: ["dainty", "elegant"],
    minReputation: 20,
  },
  {
    id: "gold",
    name: "Gold",
    price: 24,
    hardness: 0.3,
    hammers: 2,
    warmRate: 0.4,
    tone: "gold",
    sparkle: 3,
    tags: ["elegant", "bold"],
    minReputation: 30,
  },
  {
    id: "pewter",
    name: "Pewter",
    price: 4,
    hardness: 0.15,
    hammers: 1,
    warmRate: 0.3,
    tone: "pewter",
    sparkle: 1,
    tags: ["classic", "nature"],
    minReputation: 14,
  },
  {
    id: "steel",
    name: "Steel",
    price: 10,
    hardness: 0.45,
    hammers: 3,
    warmRate: 0.48,
    tone: "steel",
    sparkle: 2,
    tags: ["bold", "classic"],
    minReputation: 20,
  },
  {
    id: "white-gold",
    name: "White Gold",
    price: 22,
    hardness: 0.3,
    hammers: 2,
    warmRate: 0.42,
    tone: "white-gold",
    sparkle: 3,
    tags: ["elegant", "dainty"],
    minReputation: 34,
  },
  {
    id: "green-gold",
    name: "Green Gold",
    price: 20,
    hardness: 0.3,
    hammers: 2,
    warmRate: 0.4,
    tone: "green-gold",
    sparkle: 3,
    tags: ["nature", "elegant"],
    minReputation: 38,
  },
];
