export const WOOD_TAGS = [
  "classic",
  "rustic",
  "modern",
  "playful",
  "elegant",
  "cosy",
  "sturdy",
  "natural",
] as const;
export type WoodTag = (typeof WOOD_TAGS)[number];

export const NEUTRAL_TAG: WoodTag = "natural";
