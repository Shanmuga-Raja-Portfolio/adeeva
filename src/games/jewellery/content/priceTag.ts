export const PRICE_TAG_IDS = ["gentle", "fair", "special"] as const;
export type PriceTagId = (typeof PRICE_TAG_IDS)[number];

export interface PriceTagDef {
  readonly id: PriceTagId;
  readonly name: string;
  readonly factor: number;
  readonly hearts: number;
}

export const PRICE_TAGS: readonly PriceTagDef[] = [
  { id: "gentle", name: "Gentle", factor: 0.8, hearts: 1 },
  { id: "fair", name: "Fair", factor: 1, hearts: 2 },
  { id: "special", name: "Special", factor: 1.3, hearts: 3 },
];
