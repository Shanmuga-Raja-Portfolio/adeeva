export const UPGRADE_IDS = ["long-reach-brush", "spacer-kit", "trade-card", "little-van"] as const;
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
    id: "long-reach-brush",
    name: "Long-Reach Brush",
    description: "Edging along the tape is 15% more forgiving.",
    price: 140,
    minReputation: 3,
  },
  {
    id: "spacer-kit",
    name: "Floor Spacer Kit",
    description: "Floor pieces line up 15% more easily.",
    price: 150,
    minReputation: 5,
  },
  {
    id: "trade-card",
    name: "Warehouse Trade Card",
    description: "Every item at Marigold Warehouse and the Decor Bin costs 1 coin less.",
    price: 160,
    minReputation: 8,
  },
  {
    id: "little-van",
    name: "Little Blue Van",
    description: "Work one more hour every day.",
    price: 220,
    minReputation: 12,
  },
];
