import type { TraitDef } from "../../../engine/trait";

export const TRAITS: readonly TraitDef[] = [
  {
    id: "dreamer",
    name: "Dreamer",
    tagline: "You see a plate as a little painting.",
    perk: "Colour on the plate: +15% when you use 3+ garnish colours or a bold dish.",
    voice: "imaginative and bright",
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    tagline: "Every cut on the beat, every rim wiped.",
    perk: "Steady hands: chopping, sizzling, simmering, tasting and plating are all more forgiving.",
    voice: "careful and earnest",
  },
  {
    id: "trendsetter",
    name: "Trendsetter",
    tagline: "You always know what Larkspur wants to eat.",
    perk: "You know Larkspur's next craving: see next week's tags early.",
    voice: "upbeat and confident",
  },
  {
    id: "charmer",
    name: "Charmer",
    tagline: "Everyone on the line likes working with you.",
    perk: "Warm kitchen: 10% tips on happy services, and your team cooks a little better beside you.",
    voice: "warm and friendly",
  },
];
