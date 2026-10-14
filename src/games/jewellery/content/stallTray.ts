export const TRAY_CLOTHS = [
  { id: "teal", name: "Teal velvet", hex: "#1f4e5a" },
  { id: "plum", name: "Plum velvet", hex: "#4b2a4f" },
  { id: "ivory", name: "Ivory velvet", hex: "#efe4cc" },
  { id: "sage", name: "Sage velvet", hex: "#6f8f74" },
] as const;
export type TrayClothId = (typeof TRAY_CLOTHS)[number]["id"];

export const TRAY_SIGNS = [
  "Made by hand, just for you",
  "Tiny treasures inside",
  "Every piece is one of a kind",
] as const;

export const TRAY_SLOTS = ["left", "centre", "right"] as const;

export function isTrayClothId(value: string): value is TrayClothId {
  return TRAY_CLOTHS.some((cloth) => cloth.id === value);
}
