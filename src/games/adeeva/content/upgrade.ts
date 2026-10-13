export const UPGRADE_IDS = ["pro-machine", "big-table", "fabric-shelf", "mood-board"] as const;
export type UpgradeId = (typeof UPGRADE_IDS)[number];

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  description: string;
  price: number;
  minReputation: number;
}

export const UPGRADES: readonly UpgradeDef[] = [
  {
    id: "pro-machine",
    name: "Pro Sewing Machine",
    description: "Smoother feed: the sewing guide band is 15% wider.",
    price: 180,
    minReputation: 5,
  },
  {
    id: "big-table",
    name: "Big Cutting Table",
    description: "Room to work: cutting tolerance is 15% wider.",
    price: 140,
    minReputation: 3,
  },
  {
    id: "fabric-shelf",
    name: "Fabric Shelf",
    description: "Buy in bulk: 10% off all fabric.",
    price: 160,
    minReputation: 8,
  },
  {
    id: "mood-board",
    name: "Mood Board Wall",
    description: "Inspiration on tap: one extra working hour every day.",
    price: 220,
    minReputation: 12,
  },
];
