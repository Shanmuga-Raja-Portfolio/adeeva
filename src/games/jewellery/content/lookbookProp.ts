import type { JewelTag } from "./jewelTag";

export const PROP_IDS = [
  "sea-shell",
  "pressed-flower",
  "teacup",
  "storybook",
  "ribbon-spool",
  "river-pebble",
  "paper-star",
  "glass-marble",
] as const;
export type PropId = (typeof PROP_IDS)[number];

export interface PropDef {
  readonly id: PropId;
  readonly name: string;
  readonly tags: readonly JewelTag[];
}

export const PROPS: readonly PropDef[] = [
  { id: "sea-shell", name: "Sea Shell", tags: ["nature", "dainty"] },
  { id: "pressed-flower", name: "Pressed Flower", tags: ["nature", "dainty"] },
  { id: "teacup", name: "Teacup", tags: ["classic", "elegant"] },
  { id: "storybook", name: "Storybook", tags: ["dreamy", "classic"] },
  { id: "ribbon-spool", name: "Ribbon Spool", tags: ["playful", "elegant"] },
  { id: "river-pebble", name: "River Pebble", tags: ["nature", "bold"] },
  { id: "paper-star", name: "Paper Star", tags: ["sparkly", "dreamy"] },
  { id: "glass-marble", name: "Glass Marble", tags: ["sparkly", "playful"] },
];
