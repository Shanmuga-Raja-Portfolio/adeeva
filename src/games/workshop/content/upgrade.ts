export const UPGRADE_IDS = ["sturdy-sawhorses", "clamp-rack", "timber-rack", "skylight"] as const;
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
    id: "sturdy-sawhorses",
    name: "Sturdy Sawhorses",
    description: "Steadier boards: sawing is 15% more forgiving.",
    price: 140,
    minReputation: 3,
  },
  {
    id: "clamp-rack",
    name: "Clamp Rack",
    description: "Parts hold still: joints are 15% more forgiving.",
    price: 160,
    minReputation: 5,
  },
  {
    id: "timber-rack",
    name: "Timber Rack",
    description: "Pell's yard gives you 10% off every board.",
    price: 150,
    minReputation: 8,
  },
  {
    id: "skylight",
    name: "Garage Skylight",
    description: "More daylight: one extra working hour every day.",
    price: 220,
    minReputation: 12,
  },
];
