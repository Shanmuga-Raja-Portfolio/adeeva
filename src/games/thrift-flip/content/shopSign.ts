export const SHOP_SIGN_IDS = [
  "second-bloom",
  "mended-and-merry",
  "the-turnaround",
  "patch-and-pocket",
] as const;
export type ShopSignId = (typeof SHOP_SIGN_IDS)[number];

export interface ShopSignDef {
  readonly id: ShopSignId;
  readonly name: string;
  readonly motto: string;
}

export const SHOP_SIGNS: readonly ShopSignDef[] = [
  { id: "second-bloom", name: "Second Bloom", motto: "Every thread blooms twice." },
  { id: "mended-and-merry", name: "Mended & Merry", motto: "Fixed with a smile." },
  { id: "the-turnaround", name: "The Turnaround", motto: "Old things, new turns." },
  { id: "patch-and-pocket", name: "Patch & Pocket", motto: "A patch for every story." },
];
