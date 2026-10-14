import type { TraitDef } from "../../../engine/trait";

export const TRAITS: readonly TraitDef[] = [
  {
    id: "dreamer",
    name: "Dreamer",
    tagline: "Every scrap has a story to tell.",
    perk: "Patchwork heart: +15% fee when a flip has 3+ colours or feels dreamy or bold.",
    voice: "wistful and imaginative",
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    tagline: "Small pulls, steady hands.",
    perk: "Steady hands: every stitch pull, scrub, cut and seam is more forgiving.",
    voice: "precise and earnest",
  },
  {
    id: "trendsetter",
    name: "Trendsetter",
    tagline: "You spot the next big thing on the rail.",
    perk: "You hear the market buzz: see next week's crowd early.",
    voice: "upbeat and confident",
  },
  {
    id: "charmer",
    name: "Charmer",
    tagline: "Everyone stops at your stall to chat.",
    perk: "Regulars come back: 10% tip on happy deliveries, and fair sales bring extra buzz.",
    voice: "warm and chatty",
  },
];
