export const UPGRADE_IDS = ["sharp-ripper", "wash-tub", "cutting-mat", "stall-awning"] as const;
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
    id: "sharp-ripper",
    name: "Sharp Seam Ripper",
    description: "Longer safe pulls. A saved button or bow survives one snag.",
    price: 60,
    minReputation: 4,
  },
  {
    id: "wash-tub",
    name: "Big Wash Tub",
    description: "Stains lift faster, and gentle scrubbing can go quicker.",
    price: 90,
    minReputation: 9,
  },
  {
    id: "cutting-mat",
    name: "Cutting Mat",
    description: "Your scissors can wander a little more.",
    price: 110,
    minReputation: 13,
  },
  {
    id: "stall-awning",
    name: "Striped Stall Awning",
    description: "More buzz every Stall Day, and the rack holds 6 pieces.",
    price: 140,
    minReputation: 18,
  },
];
