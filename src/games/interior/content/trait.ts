import type { TraitDef } from "../../../engine/trait";

export const TRAITS: readonly TraitDef[] = [
  {
    id: "dreamer",
    name: "Dreamer",
    tagline: "You see a whole room before the first tin opens.",
    perk: "Big ideas: +15% fee for colourful or bold rooms.",
    voice: "wistful and imaginative",
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    tagline: "Straight edges, snug floors, not a drip in sight.",
    perk: "Steady hands: edging, rolling and floors are 20% more forgiving.",
    voice: "precise and earnest",
  },
  {
    id: "trendsetter",
    name: "Trendsetter",
    tagline: "You know what the street will love next.",
    perk: "You spot what the street will love next week.",
    voice: "upbeat and confident",
  },
  {
    id: "charmer",
    name: "Charmer",
    tagline: "Every neighbour stops by for a chat.",
    perk: "Biscuits and chats: a 10% tip on every happy reveal.",
    voice: "warm and chatty",
  },
];
