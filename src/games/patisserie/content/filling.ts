import type { StyleTag } from "../../../engine/styleTag";

export const FILLING_IDS = ["raspberry-jam", "vanilla-cream", "honey-cream"] as const;
export type FillingId = (typeof FILLING_IDS)[number];

export interface FillingDef {
  readonly id: FillingId;
  readonly name: string;
  readonly price: number;
  readonly tags: readonly StyleTag[];
  readonly colour: string;
}

export const FILLINGS: readonly FillingDef[] = [
  { id: "raspberry-jam", name: "Raspberry Jam", price: 6, tags: ["romantic", "playful"], colour: "#c2304f" },
  { id: "vanilla-cream", name: "Vanilla Cream", price: 7, tags: ["classic", "dreamy"], colour: "#fbf1d6" },
  { id: "honey-cream", name: "Honey Cream", price: 8, tags: ["classic", "romantic"], colour: "#f1cd7c" },
];
