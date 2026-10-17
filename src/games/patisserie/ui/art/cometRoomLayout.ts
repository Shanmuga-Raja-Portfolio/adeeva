import type { AvatarPose } from "../../../../ui/art/avatar/ArmPose";

export interface TableSpot {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly cloth: string;
  readonly clothShade: string;
  readonly teapot: string;
}

export interface Seat {
  readonly x: number;
  readonly facing: 1 | -1;
  readonly line: number;
  readonly back: boolean;
}

export interface RoomLayout {
  readonly tables: readonly TableSpot[];
  readonly seats: readonly Seat[];
  readonly guestScale: number;
  readonly cat: readonly [number, number] | null;
  readonly lamps: readonly (readonly [number, number])[];
  readonly palms: readonly (readonly [number, number, number])[];
}

const MINT_TABLE = { cloth: "#e7f1dc", clothShade: "#b9d3a0", teapot: "#a9c98b" };
const PEACH_TABLE = { cloth: "#fde6cf", clothShade: "#f0c49c", teapot: "#9fd0ee" };
const ROSE_TABLE = { cloth: "#f7dbe6", clothShade: "#e4a9bf", teapot: "#b9a7dc" };

export const LAYOUTS: Readonly<Record<"room" | "hub", RoomLayout>> = {
  room: {
    tables: [
      { x: 400, y: 414, scale: 0.8, ...MINT_TABLE },
      { x: 650, y: 418, scale: 0.8, ...PEACH_TABLE },
      { x: 990, y: 414, scale: 0.8, ...ROSE_TABLE },
    ],
    seats: [
      { x: 700, facing: 1, line: 416, back: true },
      { x: 598, facing: -1, line: 416, back: true },
      { x: 452, facing: -1, line: 416, back: true },
    ],
    guestScale: 0.34,
    cat: null,
    lamps: [
      [400, 196],
      [650, 186],
      [990, 196],
    ],
    palms: [
      [760, 372, 1.1],
      [1150, 372, 1],
    ],
  },
  hub: {
    tables: [{ x: 742, y: 468, scale: 0.95, ...PEACH_TABLE }],
    seats: [
      { x: 796, facing: 1, line: 466, back: true },
      { x: 688, facing: -1, line: 466, back: true },
      { x: 858, facing: -1, line: 498, back: false },
      { x: 612, facing: 1, line: 498, back: false },
    ],
    guestScale: 0.44,
    cat: [600, 600],
    lamps: [[742, 196]],
    palms: [[1160, 384, 1]],
  },
};

export const GUEST_POSES: readonly AvatarPose[] = ["chat", "poised-right", "present", "poised"];
