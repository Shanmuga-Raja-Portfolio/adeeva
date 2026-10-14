export const ROSETTE_IDS = ["gold-thread", "silver-thread", "copper-thread", "thank-you-ribbon"] as const;
export type RosetteId = (typeof ROSETTE_IDS)[number];

export interface RosetteDef {
  readonly id: RosetteId;
  readonly name: string;
  readonly minOverall: number;
  readonly line: string;
}

export const ROSETTES: readonly RosetteDef[] = [
  { id: "gold-thread", name: "Gold Thread", minOverall: 85, line: "The whole hall rose to its feet!" },
  { id: "silver-thread", name: "Silver Thread", minOverall: 70, line: "A shining show. The hall loved it." },
  { id: "copper-thread", name: "Copper Thread", minOverall: 55, line: "A warm show with lots to love." },
  {
    id: "thank-you-ribbon",
    name: "Thank-you Ribbon",
    minOverall: 0,
    line: "The hall clapped for every piece. Here's what we loved…",
  },
];
