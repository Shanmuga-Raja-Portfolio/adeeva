export const CAREER_IDS = ["bench", "collection"] as const;
export type CareerId = (typeof CAREER_IDS)[number];

export const ARCADE_NAME = "Thimble Lane Arcade";
export const LANDLORD = "Mr. Osei";

export interface CareerDef {
  readonly id: CareerId;
  readonly name: string;
  readonly cardName: string;
  readonly pitch: string;
  readonly badge: string;
  readonly placeName: string;
  readonly startCoins: number;
  readonly startReputation: number;
  readonly weeklyRent: number;
  readonly rentLabel: string;
  readonly shiftName: string;
  readonly shiftButton: string;
  readonly shiftLine: string;
  readonly shiftPay: number;
}

export const CAREERS: readonly CareerDef[] = [
  {
    id: "bench",
    name: "Arcade Bench Jeweller",
    cardName: "Lantern Bench",
    pitch: "Neighbours pin order tags to your bench and you make each piece, one at a time.",
    badge: "Start here if you're new",
    placeName: "the Lantern Bench, Thimble Lane Arcade",
    startCoins: 100,
    startReputation: 0,
    weeklyRent: 90,
    rentLabel: "Bench rent",
    shiftName: "Sorting beads at the Bead Barn",
    shiftButton: "Sort beads",
    shiftLine: "You sorted beads at the Bead Barn",
    shiftPay: 30,
  },
  {
    id: "collection",
    name: "Collection Designer",
    cardName: "Your Own Collection",
    pitch:
      "For jewellers who know the bench: design a whole line, light it for a Lookbook and reveal it on Lantern Night.",
    badge: "Suggested 12+",
    placeName: "the Lantern Loft, above the arcade",
    startCoins: 380,
    startReputation: 30,
    weeklyRent: 130,
    rentLabel: "Bench and loft rent",
    shiftName: "Threading lanterns for the arcade",
    shiftButton: "Thread lanterns",
    shiftLine: "You threaded lanterns for the arcade",
    shiftPay: 45,
  },
];
