export const UPGRADE_IDS = [
  "sharp-ripper",
  "wash-tub",
  "cutting-mat",
  "stall-awning",
  "swap-shelf",
  "mending-basket",
  "window-plinths",
  "rail-extension",
  "thread-library",
  "rolling-rails",
] as const;
export type UpgradeId = (typeof UPGRADE_IDS)[number];

export interface UpgradeDef {
  readonly id: UpgradeId;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly minReputation: number;
  readonly boutiqueOnly: boolean;
}

export const UPGRADES: readonly UpgradeDef[] = [
  {
    id: "sharp-ripper",
    name: "Sharp Seam Ripper",
    description: "Longer safe pulls. A saved button or bow survives one snag.",
    price: 60,
    minReputation: 4,
    boutiqueOnly: false,
  },
  {
    id: "wash-tub",
    name: "Big Wash Tub",
    description: "Stains lift faster, and gentle scrubbing can go quicker.",
    price: 90,
    minReputation: 9,
    boutiqueOnly: false,
  },
  {
    id: "cutting-mat",
    name: "Cutting Mat",
    description: "Your scissors can wander a little more.",
    price: 110,
    minReputation: 13,
    boutiqueOnly: false,
  },
  {
    id: "stall-awning",
    name: "Striped Stall Awning",
    description: "More buzz every Stall Day, and the rack holds 6 pieces.",
    price: 140,
    minReputation: 18,
    boutiqueOnly: false,
  },
  {
    id: "swap-shelf",
    name: "Swap Shelf",
    description: "Swap & Mend: two more swaps and one more table.",
    price: 80,
    minReputation: 40,
    boutiqueOnly: true,
  },
  {
    id: "mending-basket",
    name: "Mending Basket",
    description: "Mend and hem tickets take one hour less.",
    price: 110,
    minReputation: 42,
    boutiqueOnly: true,
  },
  {
    id: "window-plinths",
    name: "Window Plinths",
    description: "The window holds 4 pieces and 5 props.",
    price: 130,
    minReputation: 46,
    boutiqueOnly: true,
  },
  {
    id: "rail-extension",
    name: "Rail Extension",
    description: "The seasonal rack holds 10 pieces.",
    price: 160,
    minReputation: 50,
    boutiqueOnly: true,
  },
  {
    id: "thread-library",
    name: "Thread Library",
    description: "Every seam is a little more forgiving.",
    price: 180,
    minReputation: 54,
    boutiqueOnly: true,
  },
  {
    id: "rolling-rails",
    name: "Rolling Rails",
    description: "Show pieces glide past on a wheeled rail. A smoother show.",
    price: 220,
    minReputation: 60,
    boutiqueOnly: true,
  },
];
