export const WALL_IDS = ["back", "side"] as const;
export type WallId = (typeof WALL_IDS)[number];

export const ROOM_IDS = [
  "reading-nook",
  "shared-bedroom",
  "first-flat",
  "living-room",
  "cafe-corner",
  "attic-room",
  "quiet-study",
  "show-lounge",
  "entry-hall",
  "snug",
  "kids-room",
  "home-office",
  "dining-room",
  "loft-studio",
  "garden-room",
  "main-bedroom",
] as const;
export type RoomId = (typeof ROOM_IDS)[number];

interface WindowDef {
  readonly wall: WallId;
  readonly from: number;
  readonly to: number;
}

export interface RoomTemplate {
  readonly id: RoomId;
  readonly name: string;
  readonly cols: number;
  readonly rows: number;
  readonly doorCol: number;
  readonly windows: readonly WindowDef[];
  readonly roofWindow: boolean;
  readonly framedWalls: readonly WallId[];
  readonly throughRow: number | null;
}

export const ROOMS: readonly RoomTemplate[] = [
  {
    id: "reading-nook",
    name: "Reading Nook",
    cols: 5,
    rows: 4,
    doorCol: 3,
    windows: [{ wall: "back", from: 1, to: 3 }],
    roofWindow: false,
    framedWalls: ["back"],
    throughRow: null,
  },
  {
    id: "shared-bedroom",
    name: "Shared Bedroom",
    cols: 6,
    rows: 5,
    doorCol: 4,
    windows: [{ wall: "back", from: 2, to: 4 }],
    roofWindow: false,
    framedWalls: ["back"],
    throughRow: null,
  },
  {
    id: "first-flat",
    name: "First Flat",
    cols: 7,
    rows: 6,
    doorCol: 5,
    windows: [
      { wall: "back", from: 1, to: 3 },
      { wall: "back", from: 4, to: 6 },
    ],
    roofWindow: false,
    framedWalls: ["back"],
    throughRow: null,
  },
  {
    id: "living-room",
    name: "Front Room",
    cols: 8,
    rows: 6,
    doorCol: 6,
    windows: [
      { wall: "back", from: 3, to: 5 },
      { wall: "side", from: 2, to: 4 },
    ],
    roofWindow: false,
    framedWalls: ["back", "side"],
    throughRow: null,
  },
  {
    id: "cafe-corner",
    name: "Café Corner",
    cols: 7,
    rows: 5,
    doorCol: 5,
    windows: [
      { wall: "back", from: 1, to: 3 },
      { wall: "back", from: 4, to: 6 },
    ],
    roofWindow: false,
    framedWalls: ["back"],
    throughRow: null,
  },
  {
    id: "attic-room",
    name: "Attic Bedroom",
    cols: 6,
    rows: 5,
    doorCol: 4,
    windows: [],
    roofWindow: true,
    framedWalls: ["back"],
    throughRow: null,
  },
  {
    id: "quiet-study",
    name: "Quiet Study",
    cols: 6,
    rows: 5,
    doorCol: 4,
    windows: [{ wall: "side", from: 1, to: 3 }],
    roofWindow: false,
    framedWalls: ["side"],
    throughRow: null,
  },
  {
    id: "show-lounge",
    name: "Show Home Lounge",
    cols: 9,
    rows: 7,
    doorCol: 7,
    windows: [
      { wall: "back", from: 1, to: 3 },
      { wall: "back", from: 6, to: 8 },
    ],
    roofWindow: false,
    framedWalls: ["back"],
    throughRow: null,
  },
  {
    id: "entry-hall",
    name: "Entrance Hall",
    cols: 4,
    rows: 6,
    doorCol: 1,
    windows: [{ wall: "side", from: 2, to: 4 }],
    roofWindow: false,
    framedWalls: ["side"],
    throughRow: null,
  },
  {
    id: "snug",
    name: "Snug",
    cols: 5,
    rows: 4,
    doorCol: 3,
    windows: [{ wall: "back", from: 1, to: 3 }],
    roofWindow: false,
    framedWalls: ["back"],
    throughRow: null,
  },
  {
    id: "kids-room",
    name: "Little Bedroom",
    cols: 5,
    rows: 5,
    doorCol: 3,
    windows: [{ wall: "back", from: 1, to: 3 }],
    roofWindow: false,
    framedWalls: ["back"],
    throughRow: null,
  },
  {
    id: "home-office",
    name: "Home Office",
    cols: 5,
    rows: 5,
    doorCol: 3,
    windows: [{ wall: "side", from: 1, to: 3 }],
    roofWindow: false,
    framedWalls: ["side"],
    throughRow: null,
  },
  {
    id: "dining-room",
    name: "Dining Room",
    cols: 6,
    rows: 5,
    doorCol: 4,
    windows: [{ wall: "back", from: 1, to: 5 }],
    roofWindow: false,
    framedWalls: ["back"],
    throughRow: null,
  },
  {
    id: "loft-studio",
    name: "Loft Studio",
    cols: 6,
    rows: 5,
    doorCol: 4,
    windows: [],
    roofWindow: true,
    framedWalls: ["back"],
    throughRow: null,
  },
  {
    id: "garden-room",
    name: "Garden Room",
    cols: 7,
    rows: 5,
    doorCol: 5,
    windows: [
      { wall: "back", from: 1, to: 3 },
      { wall: "back", from: 4, to: 6 },
      { wall: "side", from: 1, to: 3 },
    ],
    roofWindow: false,
    framedWalls: ["back", "side"],
    throughRow: null,
  },
  {
    id: "main-bedroom",
    name: "Main Bedroom",
    cols: 7,
    rows: 6,
    doorCol: 5,
    windows: [{ wall: "back", from: 2, to: 5 }],
    roofWindow: false,
    framedWalls: ["back"],
    throughRow: null,
  },
];
