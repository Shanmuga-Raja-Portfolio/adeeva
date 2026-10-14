export const TEA_IDS = ["garden-mint", "apple-cinnamon", "red-bush-vanilla", "hot-cocoa"] as const;
export type TeaId = (typeof TEA_IDS)[number];

export interface TeaDef {
  readonly id: TeaId;
  readonly name: string;
  readonly price: number;
  readonly cupsPerTin: number;
  readonly pourDifficulty: number;
  readonly colour: string;
}

export const TEAS: readonly TeaDef[] = [
  {
    id: "garden-mint",
    name: "Garden Mint",
    price: 6,
    cupsPerTin: 20,
    pourDifficulty: 0.2,
    colour: "#9cc78a",
  },
  {
    id: "apple-cinnamon",
    name: "Apple & Cinnamon",
    price: 6,
    cupsPerTin: 20,
    pourDifficulty: 0.5,
    colour: "#d9944a",
  },
  {
    id: "red-bush-vanilla",
    name: "Red Bush Vanilla",
    price: 6,
    cupsPerTin: 20,
    pourDifficulty: 0.4,
    colour: "#b5523b",
  },
  { id: "hot-cocoa", name: "Hot Cocoa", price: 6, cupsPerTin: 20, pourDifficulty: 0.8, colour: "#6b4232" },
];
