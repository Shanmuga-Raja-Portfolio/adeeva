import type { CookStepKind, StepKind } from "./dish";

export const UPGRADE_IDS = ["knife-roll", "heavy-pan", "long-ladle", "spice-tin", "plating-spoons"] as const;
export type UpgradeId = (typeof UPGRADE_IDS)[number];

export interface UpgradeDef {
  readonly id: UpgradeId;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly minReputation: number;
  readonly step: CookStepKind | Extract<StepKind, "plate">;
  readonly multiplier: number;
}

export const UPGRADES: readonly UpgradeDef[] = [
  {
    id: "knife-roll",
    name: "Knife Roll",
    description: "Chopping on the beat is 15% more forgiving.",
    price: 60,
    minReputation: 5,
    step: "chop",
    multiplier: 1.15,
  },
  {
    id: "heavy-pan",
    name: "Heavy Pan",
    description: "Pans cook evenly: the golden zone is 20% wider.",
    price: 80,
    minReputation: 12,
    step: "sizzle",
    multiplier: 1.2,
  },
  {
    id: "long-ladle",
    name: "Long Ladle",
    description: "The guide spoon's glow is 15% wider.",
    price: 70,
    minReputation: 20,
    step: "simmer",
    multiplier: 1.15,
  },
  {
    id: "spice-tin",
    name: "Spice Tin",
    description: "The taste target circle is 20% bigger.",
    price: 70,
    minReputation: 28,
    step: "taste",
    multiplier: 1.2,
  },
  {
    id: "plating-spoons",
    name: "Plating Spoons",
    description: "The hero piece looks great 20% further from the centre.",
    price: 90,
    minReputation: 40,
    step: "plate",
    multiplier: 1.2,
  },
];
