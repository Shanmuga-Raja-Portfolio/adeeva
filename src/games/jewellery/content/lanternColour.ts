export const LANTERN_COLOUR_IDS = ["amber", "rose", "moon-white", "teal"] as const;
export type LanternColourId = (typeof LANTERN_COLOUR_IDS)[number];

export interface LanternColourDef {
  readonly id: LanternColourId;
  readonly name: string;
  readonly word: string;
  readonly hex: string;
  readonly glow: string;
}

export const LANTERN_COLOURS: readonly LanternColourDef[] = [
  { id: "amber", name: "Amber", word: "warm", hex: "#f2a93b", glow: "#ffd98a" },
  { id: "rose", name: "Rose", word: "sweet", hex: "#e8789c", glow: "#ffc2d6" },
  { id: "moon-white", name: "Moon-white", word: "soft", hex: "#f1ecd9", glow: "#fffbe9" },
  { id: "teal", name: "Teal", word: "cool", hex: "#3fa9a6", glow: "#a8ecea" },
];
