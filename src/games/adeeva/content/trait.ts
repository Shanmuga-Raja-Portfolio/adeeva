import type { TraitDef } from "../../../engine/trait";

export const TRAITS: readonly TraitDef[] = [
  {
    id: "dreamer",
    name: "Dreamer",
    tagline: "Your sketchbook never sleeps.",
    perk: "+15% fee when a design uses three or more colours or feels dreamy or bold.",
    voice: "wistful and imaginative",
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    tagline: "Measure twice, cut once, admire forever.",
    perk: "Wider cutting and sewing tolerance, so every line is easier to hit.",
    voice: "precise and earnest",
  },
  {
    id: "trendsetter",
    name: "Trendsetter",
    tagline: "You knew it was cool before it was cool.",
    perk: "See next week's trends early. +10% fee for every trend a design matches.",
    voice: "upbeat and confident",
  },
  {
    id: "charmer",
    name: "Charmer",
    tagline: "Every client leaves as a friend.",
    perk: "A 10% tip on every happy delivery, and a near miss never hurts your reputation.",
    voice: "warm and chatty",
  },
];
