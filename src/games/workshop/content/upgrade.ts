export const UPGRADE_IDS = [
  "sturdy-sawhorses",
  "clamp-rack",
  "timber-rack",
  "skylight",
  "matching-jigs",
  "hand-cart",
  "ren-bench",
  "booth-awning",
] as const;
export type UpgradeId = (typeof UPGRADE_IDS)[number];

export interface UpgradeDef {
  readonly id: UpgradeId;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly minReputation: number;
  readonly opens: ShowroomGate | null;
}

export type ShowroomGate =
  { readonly kind: "booth"; readonly booth: number } | { readonly kind: "ren"; readonly level: number };

export const UPGRADES: readonly UpgradeDef[] = [
  {
    id: "sturdy-sawhorses",
    name: "Sturdy Sawhorses",
    description: "Steadier boards: sawing is 15% more forgiving.",
    price: 140,
    minReputation: 3,
    opens: null,
  },
  {
    id: "clamp-rack",
    name: "Clamp Rack",
    description: "Parts hold still: joints are 15% more forgiving.",
    price: 160,
    minReputation: 5,
    opens: null,
  },
  {
    id: "timber-rack",
    name: "Timber Rack",
    description: "Pell's yard gives you 10% off every board.",
    price: 150,
    minReputation: 8,
    opens: null,
  },
  {
    id: "skylight",
    name: "Garage Skylight",
    description: "More daylight: one extra working hour every day.",
    price: 220,
    minReputation: 12,
    opens: null,
  },
  {
    id: "matching-jigs",
    name: "Matching Jigs",
    description: "Twins come out alike: twin sawing 15% and twin joints 10% more forgiving.",
    price: 160,
    minReputation: 0,
    opens: { kind: "booth", booth: 1 },
  },
  {
    id: "hand-cart",
    name: "Showroom Hand Cart",
    description: "Room for one more set on the showroom floor.",
    price: 180,
    minReputation: 0,
    opens: { kind: "booth", booth: 2 },
  },
  {
    id: "ren-bench",
    name: "Ren's Own Bench",
    description: "Ren takes 3 jobs a day and can fit slot joints too.",
    price: 200,
    minReputation: 0,
    opens: { kind: "ren", level: 2 },
  },
  {
    id: "booth-awning",
    name: "Striped Booth Awning",
    description: "A cheerful awning: the Story Wall panel gets +5.",
    price: 150,
    minReputation: 0,
    opens: { kind: "booth", booth: 3 },
  },
];
