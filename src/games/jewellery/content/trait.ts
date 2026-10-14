import type { TraitDef } from "../../../engine/trait";

export const TRAITS: readonly TraitDef[] = [
  {
    id: "dreamer",
    name: "Dreamer",
    tagline: "Your pieces start as night-sky doodles.",
    perk: "Starry ideas: +15% fee when a piece shows 3 colours or feels dreamy or bold.",
    voice: "wistful and imaginative",
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    tagline: "Every edge exact, every claw snug.",
    perk: "Steady hands: cutting, joining and setting are 20% more forgiving.",
    voice: "precise and earnest",
  },
  {
    id: "trendsetter",
    name: "Trendsetter",
    tagline: "You know what shines before it's popular.",
    perk: "You spot what the arcade loves before anyone else.",
    voice: "upbeat and confident",
  },
  {
    id: "charmer",
    name: "Charmer",
    tagline: "Everyone in the arcade stops to chat.",
    perk: "Shoppers linger at your stall: a 10% tip on every happy sale.",
    voice: "warm and chatty",
  },
];
