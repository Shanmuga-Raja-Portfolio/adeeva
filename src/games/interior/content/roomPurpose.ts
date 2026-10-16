import type { MustHave } from "./client";
import type { LightMood } from "./light";
import type { RoomTag } from "./roomTag";

export const PURPOSE_IDS = [
  "hall",
  "living",
  "bedroom",
  "kids",
  "study",
  "dining",
  "snug",
  "play",
  "garden",
] as const;
export type PurposeId = (typeof PURPOSE_IDS)[number];

export interface PurposeDef {
  readonly id: PurposeId;
  readonly name: string;
  readonly minCells: number;
  readonly windowWish: number;
  readonly quiet: boolean;
  readonly mustHaves: readonly MustHave[];
  readonly tag: RoomTag;
  readonly mood: LightMood;
  readonly blurb: string;
}

export const PURPOSES: readonly PurposeDef[] = [
  {
    id: "hall",
    name: "Entrance Hall",
    minCells: 0,
    windowWish: 0,
    quiet: false,
    mustHaves: [
      { itemId: "console-table", count: 1 },
      { itemId: "hall-bench", count: 1 },
    ],
    tag: "classic",
    mood: "warm",
    blurb: "The first hello. Somewhere to drop keys and pull off boots.",
  },
  {
    id: "living",
    name: "Living Room",
    minCells: 35,
    windowWish: 1,
    quiet: false,
    mustHaves: [
      { itemId: "sofa", count: 1 },
      { itemId: "armchair", count: 1 },
    ],
    tag: "cosy",
    mood: "warm",
    blurb: "Where everyone piles in for films and stories.",
  },
  {
    id: "bedroom",
    name: "Main Bedroom",
    minCells: 30,
    windowWish: 1,
    quiet: true,
    mustHaves: [
      { itemId: "double-bed", count: 1 },
      { itemId: "bedside-table", count: 2 },
    ],
    tag: "calm",
    mood: "warm",
    blurb: "A quiet room for sleepy mornings.",
  },
  {
    id: "kids",
    name: "Little Bedroom",
    minCells: 20,
    windowWish: 1,
    quiet: true,
    mustHaves: [
      { itemId: "single-bed", count: 1 },
      { itemId: "toy-box", count: 1 },
    ],
    tag: "playful",
    mood: "any",
    blurb: "A snug room for the smallest person in the home.",
  },
  {
    id: "study",
    name: "Study",
    minCells: 20,
    windowWish: 0,
    quiet: true,
    mustHaves: [
      { itemId: "desk", count: 1 },
      { itemId: "desk-chair", count: 1 },
    ],
    tag: "modern",
    mood: "cool",
    blurb: "A calm corner for homework and big ideas.",
  },
  {
    id: "dining",
    name: "Dining Room",
    minCells: 30,
    windowWish: 1,
    quiet: false,
    mustHaves: [{ itemId: "dining-set", count: 1 }],
    tag: "natural",
    mood: "warm",
    blurb: "Long suppers and board games on the table.",
  },
  {
    id: "snug",
    name: "Snug",
    minCells: 20,
    windowWish: 0,
    quiet: true,
    mustHaves: [
      { itemId: "armchair", count: 1 },
      { itemId: "bookcase", count: 1 },
    ],
    tag: "cosy",
    mood: "warm",
    blurb: "A tiny hideaway for reading on rainy days.",
  },
  {
    id: "play",
    name: "Playroom",
    minCells: 25,
    windowWish: 1,
    quiet: false,
    mustHaves: [
      { itemId: "play-tent", count: 1 },
      { itemId: "bean-bag", count: 1 },
    ],
    tag: "playful",
    mood: "any",
    blurb: "Tents, bean bags and room to tumble.",
  },
  {
    id: "garden",
    name: "Garden Room",
    minCells: 30,
    windowWish: 2,
    quiet: false,
    mustHaves: [
      { itemId: "daybed", count: 1 },
      { itemId: "plant-stand", count: 1 },
    ],
    tag: "natural",
    mood: "any",
    blurb: "Sunshine, plants and a daybed for lazy afternoons.",
  },
];
