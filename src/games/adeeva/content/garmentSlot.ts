export const GARMENT_SLOTS = [
  "bodice-front",
  "bodice-back",
  "neckline",
  "sleeve-left",
  "sleeve-right",
  "skirt-front",
  "skirt-back",
] as const;

export type GarmentSlot = (typeof GARMENT_SLOTS)[number];
