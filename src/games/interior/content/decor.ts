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
  "shell-jar",
  "boat-print",
  "herb-pots",
  "record-frame",
  "book-stack",
  "map-poster",
  "clay-vase",
  "planet-mobile",
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
  {
    id: "shell-jar",
    name: "Shell Jar",
    price: 2,
    tags: ["calm", "natural"],
    colour: "ivory",
    onWall: false,
  },
  {
    id: "boat-print",
    name: "Sailing Boat Print",
    price: 3,
    tags: ["calm", "classic"],
    colour: "sky",
    onWall: true,
  },
  {
    id: "herb-pots",
    name: "Herb Pots",
    price: 3,
    tags: ["natural", "bright"],
    colour: "emerald",
    onWall: false,
  },
  {
    id: "record-frame",
    name: "Framed Records",
    price: 3,
    tags: ["classic", "bold"],
    colour: "charcoal",
    onWall: true,
  },
  {
    id: "book-stack",
    name: "Book Stack",
    price: 2,
    tags: ["cosy", "classic"],
    colour: "ruby",
    onWall: false,
  },
  {
    id: "map-poster",
    name: "Treasure Map Poster",
    price: 2,
    tags: ["playful", "bold"],
    colour: "mustard",
    onWall: true,
  },
  {
    id: "clay-vase",
    name: "Clay Vase",
    price: 3,
    tags: ["natural", "modern"],
    colour: "coral",
    onWall: false,
  },
  {
    id: "planet-mobile",
    name: "Planet Mobile",
    price: 3,
    tags: ["playful", "bold"],
    colour: "navy",
    onWall: true,
  },
];
