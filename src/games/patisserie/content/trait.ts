import type { TraitDef } from "../../../engine/trait";

export const TRAITS: readonly TraitDef[] = [
  {
    id: "dreamer",
    name: "Dreamer",
    tagline: "Your cakes start as daydreams.",
    perk: "Sugar clouds: +15% fee when a bake uses 3+ icing colours or feels dreamy or bold.",
    voice: "wistful and imaginative",
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    tagline: "Every gram, every minute, just so.",
    perk: "Steady hands: weighing, stirring, oven timing and piping are all more forgiving.",
    voice: "precise and earnest",
  },
  {
    id: "trendsetter",
    name: "Trendsetter",
    tagline: "You bake tomorrow's favourite today.",
    perk: "You know what the town's craving: see next week's favourites early.",
    voice: "upbeat and confident",
  },
  {
    id: "charmer",
    name: "Charmer",
    tagline: "Everyone on the street knows your name.",
    perk: "Friendly counter: a 10% tip on happy orders, and a little extra per box.",
    voice: "warm and chatty",
  },
];
