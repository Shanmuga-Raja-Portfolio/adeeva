export const AWARD_IDS = [
  "lantern-ribbon",
  "ribbon-of-merit",
  "silver-lantern",
  "gold-lantern",
  "moonlit-lantern",
] as const;
export type AwardId = (typeof AWARD_IDS)[number];

export interface AwardDef {
  readonly id: AwardId;
  readonly name: string;
  readonly from: number;
  readonly colour: string;
  readonly line: string;
}

export const AWARDS: readonly AwardDef[] = [
  {
    id: "lantern-ribbon",
    name: "Lantern Ribbon",
    from: 0,
    colour: "#f3e6c4",
    line: "The arcade cheered every piece!",
  },
  {
    id: "ribbon-of-merit",
    name: "Ribbon of Merit",
    from: 55,
    colour: "#e8789c",
    line: "A warm round of applause under the lanterns.",
  },
  {
    id: "silver-lantern",
    name: "Silver Lantern",
    from: 70,
    colour: "#c9ced6",
    line: "The whole arcade was delighted.",
  },
  {
    id: "gold-lantern",
    name: "Gold Lantern",
    from: 85,
    colour: "#f2c230",
    line: "Cheers rang all the way up to the glass roof!",
  },
  {
    id: "moonlit-lantern",
    name: "Moonlit Lantern",
    from: 95,
    colour: "#fffbe9",
    line: "Thimble Lane will talk about this line for years.",
  },
];
