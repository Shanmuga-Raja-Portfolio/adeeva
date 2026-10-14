import type { RoomColour } from "./roomColour";
import type { RoomTag } from "./roomTag";

export const FURNITURE_IDS = [
  "single-bed",
  "bunk-bed",
  "desk",
  "desk-chair",
  "wardrobe",
  "bookcase",
  "sofa",
  "armchair",
  "coffee-table",
  "dining-table",
  "toy-box",
  "window-seat",
] as const;
export type FurnitureId = (typeof FURNITURE_IDS)[number];

export type Cell = readonly [number, number];

export interface FurnitureDef {
  readonly id: FurnitureId;
  readonly name: string;
  readonly width: number;
  readonly depth: number;
  readonly tall: boolean;
  readonly useCells: readonly Cell[];
  readonly tucksIn: boolean;
  readonly needsNeighbour: boolean;
  readonly spot: boolean;
  readonly holdsLamp: boolean;
  readonly underWindow: boolean;
  readonly price: number;
  readonly tags: readonly RoomTag[];
  readonly colour: RoomColour | "soft";
}

function front(width: number, row: number): Cell[] {
  return Array.from({ length: width }, (_, column): Cell => [column, row]);
}

const SIDE: readonly Cell[] = [
  [2, 0],
  [2, 1],
  [2, 2],
  [2, 3],
];

const PIECE = {
  tall: false,
  useCells: [],
  tucksIn: false,
  needsNeighbour: false,
  spot: false,
  holdsLamp: false,
  underWindow: false,
} as const;

export const FURNITURE: readonly FurnitureDef[] = [
  {
    ...PIECE,
    id: "single-bed",
    name: "Single Bed",
    width: 2,
    depth: 4,
    useCells: SIDE,
    spot: true,
    price: 12,
    tags: ["cosy"],
    colour: "soft",
  },
  {
    ...PIECE,
    id: "bunk-bed",
    name: "Bunk Bed",
    width: 2,
    depth: 4,
    tall: true,
    useCells: SIDE,
    spot: true,
    price: 18,
    tags: ["playful"],
    colour: "pale-wood",
  },
  {
    ...PIECE,
    id: "desk",
    name: "Writing Desk",
    width: 2,
    depth: 1,
    useCells: front(2, 1),
    spot: true,
    holdsLamp: true,
    price: 8,
    tags: ["modern", "classic"],
    colour: "pale-wood",
  },
  {
    ...PIECE,
    id: "desk-chair",
    name: "Desk Chair",
    width: 1,
    depth: 1,
    tucksIn: true,
    price: 3,
    tags: ["modern"],
    colour: "charcoal",
  },
  {
    ...PIECE,
    id: "wardrobe",
    name: "Wardrobe",
    width: 3,
    depth: 1,
    tall: true,
    useCells: front(3, 1),
    price: 10,
    tags: ["classic"],
    colour: "honey-wood",
  },
  {
    ...PIECE,
    id: "bookcase",
    name: "Bookcase",
    width: 2,
    depth: 1,
    tall: true,
    useCells: front(2, 1),
    spot: true,
    price: 7,
    tags: ["classic"],
    colour: "honey-wood",
  },
  {
    ...PIECE,
    id: "sofa",
    name: "Sofa",
    width: 4,
    depth: 2,
    useCells: front(4, 2),
    spot: true,
    price: 16,
    tags: ["cosy"],
    colour: "soft",
  },
  {
    ...PIECE,
    id: "armchair",
    name: "Armchair",
    width: 2,
    depth: 2,
    useCells: front(2, 2),
    spot: true,
    price: 9,
    tags: ["cosy", "classic"],
    colour: "soft",
  },
  {
    ...PIECE,
    id: "coffee-table",
    name: "Coffee Table",
    width: 2,
    depth: 1,
    needsNeighbour: true,
    price: 5,
    tags: ["modern"],
    colour: "dark-wood",
  },
  {
    ...PIECE,
    id: "dining-table",
    name: "Table for Two",
    width: 2,
    depth: 2,
    useCells: [
      [-1, 0],
      [-1, 1],
      [2, 0],
      [2, 1],
    ],
    spot: true,
    holdsLamp: true,
    price: 10,
    tags: ["natural"],
    colour: "honey-wood",
  },
  {
    ...PIECE,
    id: "toy-box",
    name: "Toy Box",
    width: 2,
    depth: 1,
    useCells: front(2, 1),
    price: 4,
    tags: ["playful"],
    colour: "coral",
  },
  {
    ...PIECE,
    id: "window-seat",
    name: "Window Seat",
    width: 3,
    depth: 1,
    useCells: front(3, 1),
    spot: true,
    underWindow: true,
    price: 8,
    tags: ["cosy"],
    colour: "soft",
  },
];
