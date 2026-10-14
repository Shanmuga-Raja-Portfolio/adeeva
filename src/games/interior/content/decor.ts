import type { RoomColour } from "./roomColour";
import type { RoomTag } from "./roomTag";

export const DECOR_IDS = [
  "cushion-pile",
  "potted-fern",
  "framed-print",
  "woven-basket",
  "round-rug",
  "star-garland",
  "paper-bunting",
  "wall-clock",
] as const;
export type DecorId = (typeof DECOR_IDS)[number];

export interface DecorDef {
  readonly id: DecorId;
  readonly name: string;
  readonly price: number;
  readonly tags: readonly RoomTag[];
  readonly colour: RoomColour | "soft";
  readonly onWall: boolean;
}

export const DECOR: readonly DecorDef[] = [
  { id: "cushion-pile", name: "Cushion Pile", price: 2, tags: ["cosy"], colour: "soft", onWall: false },
  { id: "potted-fern", name: "Potted Fern", price: 3, tags: ["natural"], colour: "emerald", onWall: false },
  { id: "framed-print", name: "Framed Print", price: 3, tags: ["classic"], colour: "navy", onWall: true },
  {
    id: "woven-basket",
    name: "Woven Basket",
    price: 2,
    tags: ["natural", "cosy"],
    colour: "honey-wood",
    onWall: false,
  },
  { id: "round-rug", name: "Round Rug", price: 4, tags: ["cosy"], colour: "soft", onWall: false },
  {
    id: "star-garland",
    name: "Star Garland",
    price: 2,
    tags: ["playful", "bold"],
    colour: "gold",
    onWall: true,
  },
  {
    id: "paper-bunting",
    name: "Paper Bunting",
    price: 2,
    tags: ["playful", "bright"],
    colour: "coral",
    onWall: true,
  },
  {
    id: "wall-clock",
    name: "Wall Clock",
    price: 3,
    tags: ["classic", "calm"],
    colour: "charcoal",
    onWall: true,
  },
];
