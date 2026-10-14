import type { TasteTag } from "./tasteTag";

export const FESTIVAL_IDS = [
  "kite-day",
  "harvest-fair",
  "night-market",
  "music-weekend",
  "book-fair",
  "blossom-market",
  "sports-final",
  "winter-lights",
] as const;
export type FestivalId = (typeof FESTIVAL_IDS)[number];

export interface FestivalDef {
  readonly id: FestivalId;
  readonly name: string;
  readonly crowd: number;
  readonly tags: readonly [TasteTag, TasteTag];
  readonly pitchFee: number;
  readonly sky: string;
  readonly flag: string;
  readonly scene: string;
}

export const FESTIVALS: readonly FestivalDef[] = [
  {
    id: "kite-day",
    name: "Larkspur Kite Day",
    crowd: 30,
    tags: ["delicate", "fresh"],
    pitchFee: 30,
    sky: "#9fd3e8",
    flag: "#d9472b",
    scene: "Kites over the green hill.",
  },
  {
    id: "harvest-fair",
    name: "Harvest Fair",
    crowd: 45,
    tags: ["hearty", "comforting"],
    pitchFee: 50,
    sky: "#f4c98a",
    flag: "#a3651f",
    scene: "Hay bales, pumpkins and a brass band.",
  },
  {
    id: "night-market",
    name: "Riverside Night Market",
    crowd: 55,
    tags: ["bold", "smoky"],
    pitchFee: 70,
    sky: "#2d3a5c",
    flag: "#f2a93b",
    scene: "Lanterns along the river path.",
  },
  {
    id: "music-weekend",
    name: "Seaside Music Weekend",
    crowd: 60,
    tags: ["crunchy", "zesty"],
    pitchFee: 90,
    sky: "#7cc6d6",
    flag: "#3d6fb4",
    scene: "A bandstand by the sea wall.",
  },
  {
    id: "book-fair",
    name: "Children's Book Fair",
    crowd: 35,
    tags: ["comforting", "colourful"],
    pitchFee: 40,
    sky: "#c9e3b0",
    flag: "#8a5ab8",
    scene: "Story tents on the library lawn.",
  },
  {
    id: "blossom-market",
    name: "Spring Blossom Market",
    crowd: 40,
    tags: ["fresh", "colourful"],
    pitchFee: 45,
    sky: "#f7d5df",
    flag: "#e0708f",
    scene: "Cherry trees in the market square.",
  },
  {
    id: "sports-final",
    name: "Under-12s Cup Final Picnic",
    crowd: 50,
    tags: ["hearty", "crunchy"],
    pitchFee: 55,
    sky: "#aedb8f",
    flag: "#4f8a3c",
    scene: "Picnic rugs beside the pitch.",
  },
  {
    id: "winter-lights",
    name: "Winter Lights Walk",
    crowd: 45,
    tags: ["warming", "comforting"],
    pitchFee: 60,
    sky: "#24324d",
    flag: "#9fc4f0",
    scene: "Paper lanterns and warm scarves.",
  },
];
