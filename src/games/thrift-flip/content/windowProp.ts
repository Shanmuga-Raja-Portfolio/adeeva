import type { ColourId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";

export const WINDOW_PROP_IDS = [
  "book-stack",
  "paper-moon",
  "wicker-basket",
  "potted-fern",
  "bike-wheel",
  "string-lights",
  "suitcase",
  "ladder-shelf",
] as const;
export type WindowPropId = (typeof WINDOW_PROP_IDS)[number];

export interface WindowPropDef {
  readonly id: WindowPropId;
  readonly name: string;
  readonly price: number;
  readonly tags: readonly StyleTag[];
  readonly colour: ColourId;
}

export const WINDOW_PROPS: readonly WindowPropDef[] = [
  { id: "book-stack", name: "Book Stack", price: 8, tags: ["classic", "playful"], colour: "teal" },
  { id: "paper-moon", name: "Paper Moon", price: 10, tags: ["dreamy", "romantic"], colour: "ivory" },
  { id: "wicker-basket", name: "Wicker Basket", price: 10, tags: ["casual", "romantic"], colour: "mustard" },
  { id: "potted-fern", name: "Potted Fern", price: 12, tags: ["classic", "dreamy"], colour: "emerald" },
  { id: "bike-wheel", name: "Bicycle Wheel", price: 14, tags: ["sporty", "edgy"], colour: "charcoal" },
  { id: "string-lights", name: "String of Lights", price: 16, tags: ["dreamy", "bold"], colour: "gold" },
  { id: "suitcase", name: "Old Suitcase", price: 18, tags: ["classic", "elegant"], colour: "plum" },
  { id: "ladder-shelf", name: "Ladder Shelf", price: 20, tags: ["casual", "classic"], colour: "coral" },
];
