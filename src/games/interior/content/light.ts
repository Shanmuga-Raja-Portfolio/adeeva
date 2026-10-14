import type { RoomColour } from "./roomColour";
import type { RoomTag } from "./roomTag";

export const LIGHT_IDS = [
  "paper-pendant",
  "arc-lamp",
  "clip-lamp",
  "firefly-string",
  "brass-sconce",
  "dome-pendant",
] as const;
export type LightId = (typeof LIGHT_IDS)[number];

type LightMount = "ceiling" | "floor" | "desk" | "wall";
export type Warmth = "warm" | "cool";
export type LightMood = Warmth | "any";

export interface LightDef {
  readonly id: LightId;
  readonly name: string;
  readonly price: number;
  readonly strength: number;
  readonly radius: number;
  readonly warmth: Warmth;
  readonly mount: LightMount;
  readonly tags: readonly RoomTag[];
  readonly colour: RoomColour;
}

export const LIGHTS: readonly LightDef[] = [
  {
    id: "paper-pendant",
    name: "Paper Pendant",
    price: 5,
    strength: 1,
    radius: 3,
    warmth: "warm",
    mount: "ceiling",
    tags: ["calm"],
    colour: "ivory",
  },
  {
    id: "arc-lamp",
    name: "Arc Floor Lamp",
    price: 4,
    strength: 1.3,
    radius: 3,
    warmth: "warm",
    mount: "floor",
    tags: ["cosy"],
    colour: "gold",
  },
  {
    id: "clip-lamp",
    name: "Clip Desk Lamp",
    price: 2,
    strength: 1.2,
    radius: 3,
    warmth: "cool",
    mount: "desk",
    tags: ["modern"],
    colour: "teal",
  },
  {
    id: "firefly-string",
    name: "Firefly String Lights",
    price: 3,
    strength: 0.8,
    radius: 3,
    warmth: "warm",
    mount: "wall",
    tags: ["playful"],
    colour: "gold",
  },
  {
    id: "brass-sconce",
    name: "Brass Wall Light",
    price: 4,
    strength: 1.3,
    radius: 3,
    warmth: "warm",
    mount: "wall",
    tags: ["classic"],
    colour: "gold",
  },
  {
    id: "dome-pendant",
    name: "Glass Dome Pendant",
    price: 5,
    strength: 1,
    radius: 3,
    warmth: "cool",
    mount: "ceiling",
    tags: ["modern", "bright"],
    colour: "sky",
  },
];
