export const INGREDIENT_IDS = [
  "flour",
  "caster-sugar",
  "icing-sugar",
  "butter",
  "milk",
  "cocoa",
  "vanilla",
  "lemon-zest",
  "honey",
  "eggs",
] as const;
export type IngredientId = (typeof INGREDIENT_IDS)[number];

export type WeighMode = "pour" | "piece" | "crack";

export interface IngredientDef {
  readonly id: IngredientId;
  readonly name: string;
  readonly packAmount: number;
  readonly price: number;
  readonly mode: WeighMode;
  readonly pourDifficulty: number;
  readonly pieceGrams: number;
  readonly colour: string;
}

export const INGREDIENTS: readonly IngredientDef[] = [
  {
    id: "flour",
    name: "Plain Flour",
    packAmount: 500,
    price: 4,
    mode: "pour",
    pourDifficulty: 0.6,
    pieceGrams: 1,
    colour: "#f5efe2",
  },
  {
    id: "caster-sugar",
    name: "Fine Sugar",
    packAmount: 500,
    price: 4,
    mode: "pour",
    pourDifficulty: 0.2,
    pieceGrams: 1,
    colour: "#fbf8f2",
  },
  {
    id: "icing-sugar",
    name: "Icing Sugar",
    packAmount: 500,
    price: 4,
    mode: "pour",
    pourDifficulty: 0.7,
    pieceGrams: 1,
    colour: "#ffffff",
  },
  {
    id: "butter",
    name: "Butter",
    packAmount: 500,
    price: 8,
    mode: "piece",
    pourDifficulty: 0,
    pieceGrams: 25,
    colour: "#f6d77a",
  },
  {
    id: "milk",
    name: "Milk",
    packAmount: 1000,
    price: 3,
    mode: "pour",
    pourDifficulty: 0.1,
    pieceGrams: 1,
    colour: "#fdfcf7",
  },
  {
    id: "cocoa",
    name: "Cocoa Powder",
    packAmount: 250,
    price: 8,
    mode: "pour",
    pourDifficulty: 0.8,
    pieceGrams: 1,
    colour: "#6b4232",
  },
  {
    id: "vanilla",
    name: "Vanilla Drops",
    packAmount: 50,
    price: 6,
    mode: "piece",
    pourDifficulty: 0,
    pieceGrams: 1,
    colour: "#4a2c1d",
  },
  {
    id: "lemon-zest",
    name: "Lemon Zest",
    packAmount: 60,
    price: 5,
    mode: "pour",
    pourDifficulty: 0.5,
    pieceGrams: 1,
    colour: "#f2d23c",
  },
  {
    id: "honey",
    name: "Clover Honey",
    packAmount: 350,
    price: 8,
    mode: "pour",
    pourDifficulty: 0.9,
    pieceGrams: 1,
    colour: "#e3a234",
  },
  {
    id: "eggs",
    name: "Eggs",
    packAmount: 6,
    price: 6,
    mode: "crack",
    pourDifficulty: 0,
    pieceGrams: 1,
    colour: "#f3e2c8",
  },
];
