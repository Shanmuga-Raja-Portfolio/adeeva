import type { PurposeId } from "./roomPurpose";
import type { RoomId } from "./roomTemplate";

export const PLOT_IDS = [
  "garden-flat",
  "corner-cottage",
  "blue-door",
  "twin-gables",
  "willow-house",
  "larkspur-end",
] as const;
export type PlotId = (typeof PLOT_IDS)[number];

export type SpaceSide = "front" | "back";

export interface SpaceDef {
  readonly roomId: RoomId;
  readonly side: SpaceSide;
  readonly throughRow: number | null;
}

export interface PlotDef {
  readonly id: PlotId;
  readonly number: number;
  readonly name: string;
  readonly door: string;
  readonly hall: boolean;
  readonly spaces: readonly SpaceDef[];
  readonly purposes: readonly PurposeId[];
  readonly purse: number;
  readonly fee: number;
  readonly typicalSpend: number;
}

export const PLOTS: readonly PlotDef[] = [
  {
    id: "garden-flat",
    number: 1,
    name: "The Garden Flat",
    door: "#7d8a4a",
    hall: false,
    spaces: [
      { roomId: "snug", side: "back", throughRow: 1 },
      { roomId: "main-bedroom", side: "front", throughRow: null },
    ],
    purposes: ["living", "kids"],
    purse: 150,
    fee: 330,
    typicalSpend: 107,
  },
  {
    id: "corner-cottage",
    number: 2,
    name: "Corner Cottage",
    door: "#c8664a",
    hall: true,
    spaces: [
      { roomId: "entry-hall", side: "front", throughRow: 1 },
      { roomId: "living-room", side: "front", throughRow: 1 },
      { roomId: "main-bedroom", side: "back", throughRow: null },
    ],
    purposes: ["living", "kids"],
    purse: 240,
    fee: 340,
    typicalSpend: 162,
  },
  {
    id: "blue-door",
    number: 3,
    name: "The Blue Door",
    door: "#3c6aa8",
    hall: true,
    spaces: [
      { roomId: "entry-hall", side: "front", throughRow: 1 },
      { roomId: "quiet-study", side: "front", throughRow: 1 },
      { roomId: "dining-room", side: "back", throughRow: null },
    ],
    purposes: ["dining", "study"],
    purse: 205,
    fee: 350,
    typicalSpend: 130,
  },
  {
    id: "twin-gables",
    number: 4,
    name: "Twin Gables",
    door: "#9b1b30",
    hall: true,
    spaces: [
      { roomId: "entry-hall", side: "front", throughRow: 1 },
      { roomId: "living-room", side: "front", throughRow: 1 },
      { roomId: "main-bedroom", side: "back", throughRow: 1 },
      { roomId: "kids-room", side: "back", throughRow: null },
    ],
    purposes: ["living", "bedroom", "kids"],
    purse: 330,
    fee: 400,
    typicalSpend: 215,
  },
  {
    id: "willow-house",
    number: 5,
    name: "Willow House",
    door: "#2a8c91",
    hall: true,
    spaces: [
      { roomId: "entry-hall", side: "front", throughRow: 1 },
      { roomId: "dining-room", side: "front", throughRow: 1 },
      { roomId: "kids-room", side: "back", throughRow: 1 },
      { roomId: "garden-room", side: "back", throughRow: null },
    ],
    purposes: ["dining", "play", "garden"],
    purse: 295,
    fee: 410,
    typicalSpend: 183,
  },
  {
    id: "larkspur-end",
    number: 6,
    name: "Larkspur End",
    door: "#5e2a5a",
    hall: true,
    spaces: [
      { roomId: "entry-hall", side: "front", throughRow: 1 },
      { roomId: "show-lounge", side: "front", throughRow: 1 },
      { roomId: "main-bedroom", side: "back", throughRow: 1 },
      { roomId: "snug", side: "back", throughRow: null },
    ],
    purposes: ["living", "bedroom", "snug"],
    purse: 345,
    fee: 460,
    typicalSpend: 219,
  },
];

export const SUGGESTED_WAGE = 14;
export const PHASE_FEE_MULTIPLIER = 1.1;
export const RELAXED_PURSE_MULTIPLIER = 1.2;
