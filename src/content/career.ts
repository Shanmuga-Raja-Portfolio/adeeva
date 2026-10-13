export const CAREER_IDS = ["student", "label"] as const;
export type CareerId = (typeof CAREER_IDS)[number];

export interface CareerDef {
  id: CareerId;
  name: string;
  pitch: string;
  studioName: string;
  startCoins: number;
  startReputation: number;
  weeklyRent: number;
  shiftName: string;
  shiftPay: number;
}

export const CAREERS: readonly CareerDef[] = [
  {
    id: "student",
    name: "Student Designer",
    pitch: "Sew for friends and family from your bedroom studio and build a name, one stitch at a time.",
    studioName: "Bedroom Studio",
    startCoins: 120,
    startReputation: 0,
    weeklyRent: 80,
    shiftName: "Café shift",
    shiftPay: 35,
  },
  {
    id: "label",
    name: "Label Designer",
    pitch: "Run your own small atelier, design a themed collection and take it down the runway.",
    studioName: "The Atelier",
    startCoins: 600,
    startReputation: 20,
    weeklyRent: 250,
    shiftName: "Freelance pattern drafting",
    shiftPay: 70,
  },
];
