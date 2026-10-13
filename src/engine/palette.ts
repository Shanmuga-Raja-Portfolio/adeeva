import { requireById } from "./catalog";

export const COLOURS = [
  { id: "ivory", name: "Ivory", hex: "#f4ecd8" },
  { id: "blush", name: "Blush", hex: "#f2c4c9" },
  { id: "rose", name: "Rose", hex: "#d0587e" },
  { id: "ruby", name: "Ruby", hex: "#9b1b30" },
  { id: "coral", name: "Coral", hex: "#f07f63" },
  { id: "mustard", name: "Mustard", hex: "#d9a42b" },
  { id: "sage", name: "Sage", hex: "#9cb59a" },
  { id: "emerald", name: "Emerald", hex: "#1f7a55" },
  { id: "teal", name: "Teal", hex: "#2a8c91" },
  { id: "sky", name: "Sky", hex: "#9fd0ee" },
  { id: "navy", name: "Navy", hex: "#22305a" },
  { id: "lavender", name: "Lavender", hex: "#b9a7dc" },
  { id: "plum", name: "Plum", hex: "#5e2a5a" },
  { id: "charcoal", name: "Charcoal", hex: "#3a3a40" },
  { id: "black", name: "Black", hex: "#141216" },
  { id: "gold", name: "Gold", hex: "#c9a227" },
] as const;

export type ColourId = (typeof COLOURS)[number]["id"];
export type ColourDef = (typeof COLOURS)[number];

export function isColourId(value: string): value is ColourId {
  return COLOURS.some((colour) => colour.id === value);
}

export function colourById(id: ColourId): ColourDef {
  return requireById(COLOURS, id, "colour");
}

export const PRINTS = ["solid", "floral", "stripe", "dot", "check", "sparkle"] as const;
export type PrintId = (typeof PRINTS)[number];

export const MATERIAL_IDS = ["cotton", "linen", "wool", "silk", "satin", "velvet", "tulle", "denim"] as const;
export type MaterialId = (typeof MATERIAL_IDS)[number];
