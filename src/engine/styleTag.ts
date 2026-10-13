export const STYLE_TAGS = [
  "elegant",
  "playful",
  "romantic",
  "edgy",
  "casual",
  "classic",
  "bold",
  "dreamy",
  "sporty",
  "regal",
] as const;

export type StyleTag = (typeof STYLE_TAGS)[number];
