export const WOOD_TONES = [
  { id: "pale-wood", name: "Pale wood", hex: "#e8cf9e" },
  { id: "honey-wood", name: "Honey wood", hex: "#d79a52" },
  { id: "red-wood", name: "Red wood", hex: "#b4603e" },
  { id: "dark-wood", name: "Dark wood", hex: "#6b4228" },
] as const;
export type WoodToneId = (typeof WOOD_TONES)[number]["id"];
