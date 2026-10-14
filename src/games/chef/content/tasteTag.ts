export const TASTE_TAGS = [
  "comforting",
  "fresh",
  "zesty",
  "warming",
  "crunchy",
  "hearty",
  "delicate",
  "colourful",
  "smoky",
  "bold",
] as const;

export type TasteTag = (typeof TASTE_TAGS)[number];
