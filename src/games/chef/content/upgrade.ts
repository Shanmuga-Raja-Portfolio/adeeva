import type { CookStepKind, StepKind } from "./dish";
import type { PathId } from "./path";

export const UPGRADE_IDS = [
  "knife-roll",
  "heavy-pan",
  "long-ladle",
  "spice-tin",
  "plating-spoons",
  "second-ring",
  "warming-pass",
  "prep-fridge",
  "walk-in-fridge",
  "garden-tables",
  "bigger-room",
] as const;
export type UpgradeId = (typeof UPGRADE_IDS)[number];

export interface UpgradeDef {
  readonly id: UpgradeId;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly minReputation: number;
  readonly step: CookStepKind | Extract<StepKind, "plate"> | null;
  readonly multiplier: number;
  readonly path: PathId | null;
}

function tool(
  id: UpgradeId,
  name: string,
  description: string,
  price: number,
  minReputation: number,
  step: CookStepKind | Extract<StepKind, "plate">,
  multiplier: number,
): UpgradeDef {
  return { id, name, description, price, minReputation, step, multiplier, path: null };
}

function kitchen(
  id: UpgradeId,
  name: string,
  description: string,
  price: number,
  minReputation: number,
): UpgradeDef {
  return { id, name, description, price, minReputation, step: null, multiplier: 1, path: "restaurant" };
}

export const UPGRADES: readonly UpgradeDef[] = [
  tool("knife-roll", "Knife Roll", "Chopping on the beat is 15% more forgiving.", 60, 5, "chop", 1.15),
  tool("heavy-pan", "Heavy Pan", "Pans cook evenly: the golden zone is 20% wider.", 80, 12, "sizzle", 1.2),
  tool("long-ladle", "Long Ladle", "The guide spoon's glow is 15% wider.", 70, 20, "simmer", 1.15),
  tool("spice-tin", "Spice Tin", "The taste target circle is 20% bigger.", 70, 28, "taste", 1.2),
  tool(
    "plating-spoons",
    "Plating Spoons",
    "The hero piece looks great 20% further from the centre.",
    90,
    40,
    "plate",
    1.2,
  ),
  kitchen("second-ring", "Second Hob Ring", "Two pans on the hob at once during service.", 150, 0),
  kitchen(
    "warming-pass",
    "Warming Pass",
    "Finished plates stay perfect under the lamp for 30 seconds.",
    120,
    0,
  ),
  kitchen("prep-fridge", "Prep Fridge", "Chopping is ready for your two busiest dishes each night.", 140, 0),
  kitchen(
    "walk-in-fridge",
    "Walk-in Fridge",
    "Half of the unserved portions keep for the next night.",
    200,
    0,
  ),
  kitchen("garden-tables", "Garden Tables", "Six more guests can sit outside.", 180, 0),
  kitchen("bigger-room", "Bigger Dining Room", "Eight more seats. Rent goes up by 40.", 320, 110),
];
