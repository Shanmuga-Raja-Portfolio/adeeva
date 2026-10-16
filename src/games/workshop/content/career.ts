export const CAREER_IDS = ["garage", "showroom"] as const;
export type CareerId = (typeof CAREER_IDS)[number];

export interface CareerDef {
  readonly id: CareerId;
  readonly name: string;
  readonly pitch: string;
  readonly badge: string;
  readonly placeName: string;
  readonly workshopName: string;
  readonly street: string;
  readonly startCoins: number;
  readonly startReputation: number;
  readonly weeklyRent: number;
  readonly rentLabel: string;
  readonly landlord: string;
  readonly shiftName: string;
  readonly shiftButton: string;
  readonly shiftLine: string;
  readonly shiftPay: number;
}

export const CAREERS: readonly CareerDef[] = [
  {
    id: "garage",
    name: "Garage Workshop Maker",
    pitch: "Neighbours pin notes to the garage door and you build each piece, one at a time.",
    badge: "Start here if you're new",
    placeName: "Garage Workshop",
    workshopName: "the Garage on Larkspur Road",
    street: "Larkspur Road",
    startCoins: 100,
    startReputation: 0,
    weeklyRent: 100,
    rentLabel: "Garage rent",
    landlord: "Uncle Bram",
    shiftName: "Sweeping at Pell's Timber Yard",
    shiftButton: "Sweep at Pell's",
    shiftLine: "You swept Pell's Timber Yard",
    shiftPay: 30,
  },
  {
    id: "showroom",
    name: "Showroom Maker",
    pitch: "For makers who know the bench: matched sets, an apprentice and the Larkspur Craft Fair.",
    badge: "Suggested 12+",
    placeName: "Furniture Showroom",
    workshopName: "the Larkspur Road Showroom",
    street: "Larkspur Road",
    startCoins: 360,
    startReputation: 30,
    weeklyRent: 160,
    rentLabel: "Garage and shop rent",
    landlord: "Uncle Bram",
    shiftName: "Stacking boards at Pell's Timber Yard",
    shiftButton: "Stack boards at Pell's",
    shiftLine: "You stacked boards at Pell's Timber Yard",
    shiftPay: 45,
  },
];
