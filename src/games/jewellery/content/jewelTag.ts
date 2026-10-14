export const JEWEL_TAGS = [
  "classic",
  "dainty",
  "bold",
  "playful",
  "elegant",
  "nature",
  "sparkly",
  "dreamy",
] as const;
export type JewelTag = (typeof JEWEL_TAGS)[number];

export const NEUTRAL_JEWEL_TAG: JewelTag = "classic";
