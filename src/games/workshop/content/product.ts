import type { BoardSizeId } from "./boardSize";
import type { ExtraNeed } from "./extra";
import type { JointKindId } from "./jointKind";
import type { PartSlot } from "./partOption";

export const PRODUCT_IDS = [
  "birdhouse",
  "step-stool",
  "plant-stand",
  "bookshelf",
  "toy-chest",
  "bedside-table",
  "window-bench",
] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

type PartRole = "panel" | "leg" | "plain";

export interface PartDef {
  readonly id: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly role: PartRole;
}

export interface JointDef {
  readonly id: string;
  readonly kind: JointKindId;
  readonly label: string;
  readonly movingPart: string;
}

interface CanonicalSpot {
  readonly partId: string;
  readonly x: number;
  readonly y: number;
}

interface CanonicalBoard {
  readonly size: BoardSizeId;
  readonly spots: readonly CanonicalSpot[];
}

export interface ProductDef {
  readonly id: ProductId;
  readonly name: string;
  readonly blurb: string;
  readonly parts: readonly PartDef[];
  readonly slots: readonly PartSlot[];
  readonly joints: readonly JointDef[];
  readonly showSurfaces: readonly string[];
  readonly seat: boolean;
  readonly accentPart: string | null;
  readonly canonical: readonly CanonicalBoard[];
  readonly extras: readonly ExtraNeed[];
}

function part(id: string, name: string, width: number, height: number, role: PartRole): PartDef {
  return { id, name, width, height, role };
}

function joint(id: string, kind: JointKindId, label: string, movingPart: string): JointDef {
  return { id, kind, label, movingPart };
}

function spot(partId: string, x: number, y: number): CanonicalSpot {
  return { partId, x, y };
}

export const PRODUCTS: readonly ProductDef[] = [
  {
    id: "birdhouse",
    name: "Garden Birdhouse",
    blurb: "A snug little house for garden birds.",
    parts: [
      part("roof-1", "Left roof", 18, 14, "plain"),
      part("roof-2", "Right roof", 18, 14, "plain"),
      part("side-1", "Left wall", 14, 12, "plain"),
      part("side-2", "Right wall", 14, 12, "plain"),
      part("gable-1", "Front", 16, 14, "panel"),
      part("gable-2", "Back", 16, 14, "panel"),
      part("floor", "Floor", 12, 12, "plain"),
    ],
    slots: ["edge", "accent"],
    joints: [
      joint("peg-1", "peg", "Left roof to front", "roof-1"),
      joint("peg-2", "peg", "Right roof to back", "roof-2"),
      joint("peg-3", "peg", "Left wall to floor", "side-1"),
      joint("peg-4", "peg", "Right wall to floor", "side-2"),
    ],
    showSurfaces: ["roof-1"],
    seat: false,
    accentPart: "gable-1",
    canonical: [
      {
        size: "long",
        spots: [
          spot("roof-1", 0, 0),
          spot("roof-2", 18, 0),
          spot("side-1", 36, 0),
          spot("side-2", 50, 0),
          spot("gable-1", 64, 0),
          spot("gable-2", 80, 0),
          spot("floor", 96, 0),
        ],
      },
    ],
    extras: [],
  },
  {
    id: "step-stool",
    name: "Little Step Stool",
    blurb: "A little stool to hold paint pots and brushes.",
    parts: [
      part("top", "Top", 30, 25, "panel"),
      part("side-1", "Left side", 30, 25, "panel"),
      part("side-2", "Right side", 30, 25, "panel"),
      part("step", "Step", 35, 15, "plain"),
      part("rail", "Rail", 35, 8, "plain"),
    ],
    slots: ["edge", "accent"],
    joints: [
      joint("slot-1", "slot", "Left side to top", "side-1"),
      joint("slot-2", "slot", "Right side to top", "side-2"),
      joint("slot-3", "slot", "Step into the sides", "step"),
      joint("slot-4", "slot", "Rail into the sides", "rail"),
    ],
    showSurfaces: ["top"],
    seat: false,
    accentPart: "side-1",
    canonical: [
      { size: "panel", spots: [spot("top", 0, 0), spot("side-1", 30, 0), spot("side-2", 60, 0)] },
      { size: "long", spots: [spot("step", 0, 0), spot("rail", 35, 0)] },
    ],
    extras: [],
  },
  {
    id: "plant-stand",
    name: "Plant Stand",
    blurb: "A tall stand with a shelf, so ferns can feel grand.",
    parts: [
      part("top", "Top", 25, 18, "panel"),
      part("shelf", "Shelf", 25, 18, "panel"),
      part("leg-1", "Leg 1", 70, 6, "leg"),
      part("leg-2", "Leg 2", 70, 6, "leg"),
      part("leg-3", "Leg 3", 70, 6, "leg"),
      part("leg-4", "Leg 4", 70, 6, "leg"),
    ],
    slots: ["edge", "legs"],
    joints: [
      joint("slot-1", "slot", "Leg 1 to top", "leg-1"),
      joint("slot-2", "slot", "Leg 2 to top", "leg-2"),
      joint("slot-3", "slot", "Leg 3 to top", "leg-3"),
      joint("slot-4", "slot", "Leg 4 to top", "leg-4"),
      joint("peg-1", "peg", "Shelf to front legs", "shelf"),
      joint("peg-2", "peg", "Shelf to back legs", "shelf"),
    ],
    showSurfaces: ["top"],
    seat: false,
    accentPart: null,
    canonical: [
      { size: "short", spots: [spot("top", 0, 0), spot("shelf", 25, 0)] },
      { size: "long", spots: [spot("leg-1", 0, 0), spot("leg-2", 0, 6), spot("leg-3", 0, 12)] },
      { size: "long", spots: [spot("leg-4", 0, 0)] },
    ],
    extras: [],
  },
  {
    id: "bookshelf",
    name: "Wall Bookshelf",
    blurb: "Three sturdy shelves for picture books.",
    parts: [
      part("side-1", "Left side", 55, 18, "panel"),
      part("side-2", "Right side", 55, 18, "panel"),
      part("shelf-1", "Top shelf", 50, 18, "plain"),
      part("shelf-2", "Middle shelf", 50, 18, "plain"),
      part("shelf-3", "Bottom shelf", 50, 18, "plain"),
    ],
    slots: ["edge", "accent"],
    joints: [
      joint("peg-1", "peg", "Top shelf, left", "shelf-1"),
      joint("peg-2", "peg", "Top shelf, right", "shelf-1"),
      joint("peg-3", "peg", "Middle shelf, left", "shelf-2"),
      joint("peg-4", "peg", "Middle shelf, right", "shelf-2"),
      joint("peg-5", "peg", "Bottom shelf, left", "shelf-3"),
      joint("peg-6", "peg", "Bottom shelf, right", "shelf-3"),
    ],
    showSurfaces: ["side-1", "side-2"],
    seat: false,
    accentPart: "side-1",
    canonical: [
      { size: "long", spots: [spot("side-1", 0, 0), spot("side-2", 55, 0)] },
      { size: "long", spots: [spot("shelf-1", 0, 0), spot("shelf-2", 50, 0)] },
      { size: "long", spots: [spot("shelf-3", 0, 0)] },
    ],
    extras: [],
  },
  {
    id: "toy-chest",
    name: "Toy Chest",
    blurb: "A roomy chest with a lid that lifts on two hinges.",
    parts: [
      part("front", "Front", 50, 30, "panel"),
      part("back", "Back", 50, 30, "plain"),
      part("end-1", "Left end", 30, 30, "plain"),
      part("end-2", "Right end", 30, 30, "plain"),
      part("base", "Base", 36, 28, "plain"),
      part("lid", "Lid", 50, 30, "panel"),
    ],
    slots: ["edge", "accent"],
    joints: [
      joint("comb-1", "comb", "Front to left end", "front"),
      joint("comb-2", "comb", "Front to right end", "front"),
      joint("comb-3", "comb", "Back to left end", "back"),
      joint("comb-4", "comb", "Back to right end", "back"),
      joint("peg-1", "peg", "Base, front edge", "base"),
      joint("peg-2", "peg", "Base, back edge", "base"),
    ],
    showSurfaces: ["front", "lid"],
    seat: false,
    accentPart: "front",
    canonical: [
      { size: "panel", spots: [spot("front", 0, 0), spot("end-1", 50, 0)] },
      { size: "panel", spots: [spot("back", 0, 0), spot("end-2", 50, 0)] },
      { size: "panel", spots: [spot("lid", 0, 0), spot("base", 50, 0)] },
    ],
    extras: [{ extra: "brass-hinge", count: 2 }],
  },
  {
    id: "bedside-table",
    name: "Bedside Table",
    blurb: "A neat table for a lamp, a book and a glass of water.",
    parts: [
      part("top", "Top", 45, 35, "panel"),
      part("leg-1", "Leg 1", 65, 6, "leg"),
      part("leg-2", "Leg 2", 65, 6, "leg"),
      part("leg-3", "Leg 3", 65, 6, "leg"),
      part("leg-4", "Leg 4", 65, 6, "leg"),
      part("rail-1", "Front rail", 40, 8, "plain"),
      part("rail-2", "Back rail", 40, 8, "plain"),
    ],
    slots: ["edge", "legs", "accent"],
    joints: [
      joint("slot-1", "slot", "Leg 1 to top", "leg-1"),
      joint("slot-2", "slot", "Leg 2 to top", "leg-2"),
      joint("slot-3", "slot", "Leg 3 to top", "leg-3"),
      joint("slot-4", "slot", "Leg 4 to top", "leg-4"),
      joint("peg-1", "peg", "Front rail", "rail-1"),
      joint("peg-2", "peg", "Back rail", "rail-2"),
    ],
    showSurfaces: ["top"],
    seat: false,
    accentPart: "rail-1",
    canonical: [
      { size: "panel", spots: [spot("top", 0, 0)] },
      { size: "long", spots: [spot("leg-1", 0, 0), spot("leg-2", 0, 6), spot("leg-3", 0, 12)] },
      { size: "long", spots: [spot("leg-4", 0, 0), spot("rail-1", 65, 0), spot("rail-2", 65, 8)] },
    ],
    extras: [],
  },
  {
    id: "window-bench",
    name: "Window Bench",
    blurb: "A long, comfy bench for a sunny window.",
    parts: [
      part("seat", "Seat", 85, 35, "panel"),
      part("leg-1", "Leg 1", 42, 12, "leg"),
      part("leg-2", "Leg 2", 42, 12, "leg"),
      part("leg-3", "Leg 3", 42, 12, "leg"),
      part("leg-4", "Leg 4", 42, 12, "leg"),
      part("rail-1", "Front rail", 80, 8, "plain"),
      part("rail-2", "Back rail", 80, 8, "plain"),
    ],
    slots: ["edge", "legs"],
    joints: [
      joint("slot-1", "slot", "Leg 1 to seat", "leg-1"),
      joint("slot-2", "slot", "Leg 2 to seat", "leg-2"),
      joint("slot-3", "slot", "Leg 3 to seat", "leg-3"),
      joint("slot-4", "slot", "Leg 4 to seat", "leg-4"),
      joint("slot-5", "slot", "Front rail", "rail-1"),
      joint("slot-6", "slot", "Back rail", "rail-2"),
    ],
    showSurfaces: ["seat"],
    seat: true,
    accentPart: null,
    canonical: [
      { size: "panel", spots: [spot("seat", 0, 0)] },
      { size: "long", spots: [spot("leg-1", 0, 0), spot("leg-2", 42, 0)] },
      { size: "long", spots: [spot("leg-3", 0, 0), spot("leg-4", 42, 0)] },
      { size: "long", spots: [spot("rail-1", 0, 0), spot("rail-2", 0, 8)] },
    ],
    extras: [],
  },
];
