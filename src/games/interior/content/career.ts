export const CAREER_IDS = ["loft", "development"] as const;
export type CareerId = (typeof CAREER_IDS)[number];

export interface CareerDef {
  readonly id: CareerId;
  readonly name: string;
  readonly studioName: string;
  readonly placeName: string;
  readonly pitch: string;
  readonly badge: string;
  readonly streetName: string;
  readonly startCoins: number;
  readonly startReputation: number;
  readonly weeklyRent: number;
  readonly projectRent: number;
  readonly landlord: string;
  readonly shiftName: string;
  readonly shiftLabel: string;
  readonly shiftLine: string;
  readonly shiftPay: number;
  readonly warehouseName: string;
}

const LOFT: CareerDef = {
  id: "loft",
  name: "Junior Room Designer",
  studioName: "The Loft on Marigold Row",
  placeName: "The Loft on Marigold Row",
  pitch: "Start small: one room, one neighbour at a time. Great for first-timers.",
  badge: "Start here if you're new",
  streetName: "Marigold Row",
  startCoins: 110,
  startReputation: 0,
  weeklyRent: 90,
  projectRent: 90,
  landlord: "Ms. Vale",
  shiftName: "Stacking shelves at Hollin's Hardware",
  shiftLabel: "Stack shelves",
  shiftLine: "You stacked shelves at Hollin's Hardware",
  shiftPay: 30,
  warehouseName: "Marigold Warehouse",
};

const DEVELOPMENT: CareerDef = {
  id: "development",
  name: "Show-Home Designer",
  studioName: "The Site Cabin, Larkspur Close",
  placeName: "The loft and the Site Cabin",
  pitch: "For designers who know the loft: whole homes, a crew and Open Houses. Suggested 12+.",
  badge: "For loft pros · suggested 12+",
  streetName: "Larkspur Close",
  startCoins: 380,
  startReputation: 34,
  weeklyRent: 90,
  projectRent: 140,
  landlord: "Ms. Vale",
  shiftName: "Sweeping up at the site cabin",
  shiftLabel: "Sweep the cabin",
  shiftLine: "You swept up at the site cabin",
  shiftPay: 45,
  warehouseName: "Marigold Warehouse",
};

export const CAREERS: readonly CareerDef[] = [LOFT, DEVELOPMENT];

export const CAREER: CareerDef = LOFT;

export const SHOW_HOME_START = {
  upgrades: ["long-reach-brush", "spacer-kit"],
  paints: ["chalk-white", "sea-glass", "morning-sky"],
  lights: ["paper-pendant"],
} as const;

export const SUPPLY_YARD_NAME = "Larkspur Supply Yard";
