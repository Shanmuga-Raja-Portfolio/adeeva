import type { CareerId } from "./career";

export const UPGRADE_IDS = [
  "long-reach-brush",
  "spacer-kit",
  "trade-card",
  "little-van",
  "sample-board",
  "crew-radio",
  "tool-trailer",
  "supply-account",
] as const;
export type UpgradeId = (typeof UPGRADE_IDS)[number];

export interface UpgradeDef {
  readonly id: UpgradeId;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly minReputation: number;
  readonly career: CareerId | null;
}

export const UPGRADES: readonly UpgradeDef[] = [
  {
    id: "long-reach-brush",
    name: "Long-Reach Brush",
    description: "Edging along the tape is 15% more forgiving.",
    price: 140,
    minReputation: 3,
    career: null,
  },
  {
    id: "spacer-kit",
    name: "Floor Spacer Kit",
    description: "Floor pieces line up 15% more easily.",
    price: 150,
    minReputation: 5,
    career: null,
  },
  {
    id: "trade-card",
    name: "Warehouse Trade Card",
    description: "Every item at Marigold Warehouse and the Decor Bin costs 1 coin less.",
    price: 160,
    minReputation: 8,
    career: null,
  },
  {
    id: "little-van",
    name: "Little Blue Van",
    description: "Work one more hour every day.",
    price: 220,
    minReputation: 12,
    career: null,
  },
  {
    id: "sample-board",
    name: "Sample Board",
    description: "Showing the crew how takes no hours.",
    price: 120,
    minReputation: 34,
    career: "development",
  },
  {
    id: "crew-radio",
    name: "Crew Walkie-Talkies",
    description: "Work with a third crew member.",
    price: 160,
    minReputation: 36,
    career: "development",
  },
  {
    id: "tool-trailer",
    name: "Tool Trailer",
    description: "Every crew member works a little more neatly.",
    price: 180,
    minReputation: 40,
    career: "development",
  },
  {
    id: "supply-account",
    name: "Larkspur Supply Account",
    description: "Crew wages cost 2 coins less per job.",
    price: 200,
    minReputation: 44,
    career: "development",
  },
];
