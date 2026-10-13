export const UPGRADE_IDS = ["bright-scale", "display-counter", "oven-lamp", "piping-set"] as const;
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
    id: "bright-scale",
    name: "Bright Scale",
    description: "A clearer needle: the green weighing zone is 20% wider.",
    price: 60,
    minReputation: 3,
  },
  {
    id: "display-counter",
    name: "Display Counter",
    description: "Room for 4 trays and 8 order cards on Counter Day.",
    price: 100,
    minReputation: 5,
  },
  {
    id: "oven-lamp",
    name: "Oven Lamp",
    description: "See the colour better: the golden moment lasts 20% longer.",
    price: 90,
    minReputation: 7,
  },
  {
    id: "piping-set",
    name: "Pro Piping Set",
    description: "Smoother nozzles: piping lines are 15% more forgiving.",
    price: 120,
    minReputation: 11,
  },
];
