export const UPGRADE_IDS = [
  "steady-peg",
  "gentle-lamp",
  "magnifier",
  "comfy-stool",
  "sorting-tray",
  "twin-lamp-stand",
  "light-box",
  "window-stands",
] as const;
export type UpgradeId = (typeof UPGRADE_IDS)[number];

export interface UpgradeDef {
  readonly id: UpgradeId;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly minReputation: number;
  readonly loftSpot: number | null;
}

export const UPGRADES: readonly UpgradeDef[] = [
  {
    id: "steady-peg",
    name: "Steady Bench Peg",
    description: "Holds the metal still: cutting is 15% more forgiving.",
    price: 140,
    minReputation: 6,
    loftSpot: null,
  },
  {
    id: "gentle-lamp",
    name: "Gentle Lamp",
    description: "A softer glow: the gold zone is 15% wider.",
    price: 150,
    minReputation: 12,
    loftSpot: null,
  },
  {
    id: "magnifier",
    name: "Magnifier Stand",
    description: "See every claw: setting stones is 15% more forgiving.",
    price: 160,
    minReputation: 18,
    loftSpot: null,
  },
  {
    id: "comfy-stool",
    name: "Comfy Bench Stool",
    description: "Work one more hour every day.",
    price: 220,
    minReputation: 26,
    loftSpot: null,
  },
  {
    id: "sorting-tray",
    name: "Stone Sorting Tray",
    description: "Kemi's tray sorts by type and tint, and 2-shimmer stones cost 1 less.",
    price: 140,
    minReputation: 0,
    loftSpot: 1,
  },
  {
    id: "twin-lamp-stand",
    name: "Twin Lamp Stand",
    description: "Both Twin Lamp gold zones are 15% wider.",
    price: 150,
    minReputation: 0,
    loftSpot: 1,
  },
  {
    id: "light-box",
    name: "Lookbook Light Box",
    description: "The Lookbook sparkle spot is 20% easier to find.",
    price: 160,
    minReputation: 0,
    loftSpot: 2,
  },
  {
    id: "window-stands",
    name: "Velvet Window Stands",
    description: "One more heart shared out at every Pop-up Window.",
    price: 180,
    minReputation: 0,
    loftSpot: 3,
  },
];
