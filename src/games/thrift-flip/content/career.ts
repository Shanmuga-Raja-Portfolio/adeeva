export const CAREER_IDS = ["stall", "boutique"] as const;
export type CareerId = (typeof CAREER_IDS)[number];

export interface CareerDef {
  readonly id: CareerId;
  readonly name: string;
  readonly placeName: string;
  readonly pitch: string;
  readonly badge: string;
  readonly startCoins: number;
  readonly startReputation: number;
  readonly weeklyRent: number;
  readonly shiftName: string;
  readonly shiftPay: number;
  readonly shiftLine: string;
  readonly rentName: string;
  readonly sellDayName: string;
}

export const SCRAP_TIN = ["sage-linen", "emerald-velvet", "ruby-velvet", "sky-gingham"] as const;

export const CAREERS: readonly CareerDef[] = [
  {
    id: "stall",
    name: "Market Stall Remaker",
    placeName: "Saltmarsh Lane Market",
    pitch: "Turn loved and tired finds into new treasures at your own striped stall.",
    badge: "Start here if you're new",
    startCoins: 90,
    startReputation: 0,
    weeklyRent: 80,
    shiftName: "Sorting at the swap shop",
    shiftPay: 30,
    shiftLine: "You sorted the swap shop",
    rentName: "Stall rent",
    sellDayName: "Stall Day",
  },
  {
    id: "boutique",
    name: "Boutique Owner",
    placeName: "Larkspur Row",
    pitch: "Run Mrs. Pell's old sewing shop: mend for neighbours, dress the window and stage a show.",
    badge: "For stall pros, or a bigger shop · suggested 12+",
    startCoins: 320,
    startReputation: 40,
    weeklyRent: 160,
    shiftName: "Mending help at the swap shop",
    shiftPay: 40,
    shiftLine: "You helped with mending at the swap shop",
    rentName: "Shop rent",
    sellDayName: "Till Day",
  },
];

export const BOUTIQUE_START_FINDS = [
  { findId: "linen-curtain", grade: "loved" },
  { findId: "gingham-shirt", grade: "like-new" },
] as const;
