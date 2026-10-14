export const UPGRADE_IDS = ["steady-peg", "gentle-lamp", "magnifier", "comfy-stool"] as const;
export type UpgradeId = (typeof UPGRADE_IDS)[number];

export interface UpgradeDef {
  readonly id: UpgradeId;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly minReputation: number;
}

export const UPGRADES: readonly UpgradeDef[] = [
  {
    id: "steady-peg",
    name: "Steady Bench Peg",
    description: "Holds the metal still: cutting is 15% more forgiving.",
    price: 140,
    minReputation: 6,
  },
  {
    id: "gentle-lamp",
    name: "Gentle Lamp",
    description: "A softer glow: the gold zone is 15% wider.",
    price: 150,
    minReputation: 12,
  },
  {
    id: "magnifier",
    name: "Magnifier Stand",
    description: "See every claw: setting stones is 15% more forgiving.",
    price: 160,
    minReputation: 18,
  },
  {
    id: "comfy-stool",
    name: "Comfy Bench Stool",
    description: "Work one more hour every day.",
    price: 220,
    minReputation: 26,
  },
];
