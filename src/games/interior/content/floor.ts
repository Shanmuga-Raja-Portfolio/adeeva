import type { RoomColour } from "./roomColour";
import type { RoomTag } from "./roomTag";

export const FLOOR_IDS = [
  "pine-boards",
  "oak-boards",
  "walnut-boards",
  "cork-tiles",
  "cloud-carpet",
  "terracotta",
  "checkerboard",
] as const;
export type FloorId = (typeof FLOOR_IDS)[number];

export type FloorPattern = "boards" | "tiles" | "checker";

export const CELLS_PER_PACK = 10;

export interface FloorDef {
  readonly id: FloorId;
  readonly name: string;
  readonly pattern: FloorPattern;
  readonly colours: readonly RoomColour[];
  readonly pricePerPack: number;
  readonly tags: readonly RoomTag[];
}

export const FLOORS: readonly FloorDef[] = [
  {
    id: "pine-boards",
    name: "Pine Boards",
    pattern: "boards",
    colours: ["pale-wood"],
    pricePerPack: 2,
    tags: ["natural", "cosy"],
  },
  {
    id: "oak-boards",
    name: "Oak Boards",
    pattern: "boards",
    colours: ["honey-wood"],
    pricePerPack: 4,
    tags: ["classic", "natural"],
  },
  {
    id: "walnut-boards",
    name: "Walnut Boards",
    pattern: "boards",
    colours: ["dark-wood"],
    pricePerPack: 5,
    tags: ["classic", "bold"],
  },
  {
    id: "cork-tiles",
    name: "Cork Tiles",
    pattern: "tiles",
    colours: ["honey-wood"],
    pricePerPack: 3,
    tags: ["calm", "natural"],
  },
  {
    id: "cloud-carpet",
    name: "Cloud Carpet Tiles",
    pattern: "tiles",
    colours: ["sky"],
    pricePerPack: 3,
    tags: ["cosy", "calm"],
  },
  {
    id: "terracotta",
    name: "Terracotta Tiles",
    pattern: "tiles",
    colours: ["coral"],
    pricePerPack: 4,
    tags: ["bright", "natural"],
  },
  {
    id: "checkerboard",
    name: "Checkerboard Tiles",
    pattern: "checker",
    colours: ["black", "ivory"],
    pricePerPack: 4,
    tags: ["bold", "playful"],
  },
];
