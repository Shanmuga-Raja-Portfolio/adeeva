import type { StyleTag } from "../../../engine/styleTag";
import type { IngredientId } from "./ingredient";

export const MIX_IDS = [
  "vanilla-sponge",
  "cocoa-sponge",
  "lemon-sponge",
  "honey-sponge",
  "shortcrust",
  "biscuit-dough",
] as const;
export type MixId = (typeof MIX_IDS)[number];

export type MixKind = "sponge" | "shortcrust" | "biscuit";

export interface WeighedAmount {
  readonly ingredient: IngredientId;
  readonly grams: number;
}

export interface MixDef {
  readonly id: MixId;
  readonly name: string;
  readonly kind: MixKind;
  readonly weighed: readonly WeighedAmount[];
  readonly eggs: number;
  readonly idealHeat: number;
  readonly minutes: number;
  readonly laps: number;
  readonly stiffness: number;
  readonly tags: readonly StyleTag[];
  readonly colour: string;
}

export const MIXES: readonly MixDef[] = [
  {
    id: "vanilla-sponge",
    name: "Vanilla Cloud",
    kind: "sponge",
    weighed: [
      { ingredient: "flour", grams: 200 },
      { ingredient: "caster-sugar", grams: 180 },
      { ingredient: "butter", grams: 175 },
      { ingredient: "milk", grams: 30 },
    ],
    eggs: 3,
    idealHeat: 3,
    minutes: 24,
    laps: 3,
    stiffness: 0.3,
    tags: ["classic"],
    colour: "#f3d996",
  },
  {
    id: "cocoa-sponge",
    name: "Midnight Cocoa",
    kind: "sponge",
    weighed: [
      { ingredient: "flour", grams: 170 },
      { ingredient: "cocoa", grams: 40 },
      { ingredient: "caster-sugar", grams: 180 },
      { ingredient: "butter", grams: 175 },
    ],
    eggs: 3,
    idealHeat: 3,
    minutes: 26,
    laps: 3,
    stiffness: 0.35,
    tags: ["bold", "edgy"],
    colour: "#7a4a35",
  },
  {
    id: "lemon-sponge",
    name: "Sunny Lemon",
    kind: "sponge",
    weighed: [
      { ingredient: "flour", grams: 200 },
      { ingredient: "caster-sugar", grams: 180 },
      { ingredient: "butter", grams: 175 },
      { ingredient: "lemon-zest", grams: 12 },
    ],
    eggs: 3,
    idealHeat: 3,
    minutes: 24,
    laps: 3,
    stiffness: 0.3,
    tags: ["playful", "casual"],
    colour: "#f6df7c",
  },
  {
    id: "honey-sponge",
    name: "Honeycomb Gold",
    kind: "sponge",
    weighed: [
      { ingredient: "flour", grams: 200 },
      { ingredient: "honey", grams: 120 },
      { ingredient: "caster-sugar", grams: 60 },
      { ingredient: "butter", grams: 175 },
    ],
    eggs: 3,
    idealHeat: 2,
    minutes: 30,
    laps: 3,
    stiffness: 0.4,
    tags: ["classic", "romantic"],
    colour: "#e8b45a",
  },
  {
    id: "shortcrust",
    name: "Crumbly Crust",
    kind: "shortcrust",
    weighed: [
      { ingredient: "flour", grams: 220 },
      { ingredient: "butter", grams: 110 },
      { ingredient: "icing-sugar", grams: 50 },
      { ingredient: "milk", grams: 30 },
    ],
    eggs: 1,
    idealHeat: 4,
    minutes: 18,
    laps: 2,
    stiffness: 0.7,
    tags: ["classic", "elegant"],
    colour: "#e9c27f",
  },
  {
    id: "biscuit-dough",
    name: "Snap Biscuit",
    kind: "biscuit",
    weighed: [
      { ingredient: "flour", grams: 300 },
      { ingredient: "butter", grams: 200 },
      { ingredient: "caster-sugar", grams: 100 },
      { ingredient: "vanilla", grams: 5 },
    ],
    eggs: 1,
    idealHeat: 2,
    minutes: 12,
    laps: 2,
    stiffness: 0.8,
    tags: ["playful", "classic"],
    colour: "#efcf8e",
  },
];
