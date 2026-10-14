import type { TraitDef } from "../../../engine/trait";

export const TRAITS: readonly TraitDef[] = [
  {
    id: "dreamer",
    name: "Dreamer",
    tagline: "Your sketches start as daydreams.",
    perk: "Big ideas: +15% fee when a piece shows 3 or more colours.",
    voice: "wistful and imaginative",
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    tagline: "Measure twice, smile once.",
    perk: "Steady hands: sawing, joining and sanding are 20% more forgiving.",
    voice: "precise and earnest",
  },
  {
    id: "trendsetter",
    name: "Trendsetter",
    tagline: "You make tomorrow's favourite today.",
    perk: "You spot what neighbours like before they do.",
    voice: "upbeat and confident",
  },
  {
    id: "charmer",
    name: "Charmer",
    tagline: "The kettle is always on in your garage.",
    perk: "Everyone stays for tea: a 10% tip on every happy delivery.",
    voice: "warm and chatty",
  },
];
