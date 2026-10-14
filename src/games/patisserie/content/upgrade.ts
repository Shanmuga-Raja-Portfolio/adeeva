import type { CareerId } from "./career";

export const UPGRADE_IDS = [
  "bright-scale",
  "display-counter",
  "oven-lamp",
  "piping-set",
  "gooseneck-teapot",
  "showpiece-trolley",
  "tea-trolley",
  "silver-stands",
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
    id: "bright-scale",
    name: "Bright Scale",
    description: "A clearer needle: the green weighing zone is 20% wider.",
    price: 60,
    minReputation: 3,
    career: null,
  },
  {
    id: "display-counter",
    name: "Display Counter",
    description: "Room for 4 trays and 8 order cards on Counter Day.",
    price: 100,
    minReputation: 5,
    career: null,
  },
  {
    id: "oven-lamp",
    name: "Oven Lamp",
    description: "See the colour better: the golden moment lasts 20% longer.",
    price: 90,
    minReputation: 7,
    career: null,
  },
  {
    id: "piping-set",
    name: "Pro Piping Set",
    description: "Smoother nozzles: piping lines are 15% more forgiving.",
    price: 120,
    minReputation: 11,
    career: null,
  },
  {
    id: "gooseneck-teapot",
    name: "Gooseneck Teapot",
    description: "A slow, steady spout: the tea line is 20% easier to hit.",
    price: 80,
    minReputation: 30,
    career: "salon",
  },
  {
    id: "showpiece-trolley",
    name: "Showpiece Trolley",
    description: "Wheels for big bakes: a Fair showpiece takes 2 hours less.",
    price: 130,
    minReputation: 32,
    career: "salon",
  },
  {
    id: "tea-trolley",
    name: "Tea Trolley",
    description: "One more table in the Comet Room on Salon Day.",
    price: 140,
    minReputation: 34,
    career: "salon",
  },
  {
    id: "silver-stands",
    name: "Silver Cake Stands",
    description: "Sparkling stands: every table pays 10% more.",
    price: 160,
    minReputation: 38,
    career: "salon",
  },
];
