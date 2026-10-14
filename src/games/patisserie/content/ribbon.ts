export const RIBBON_IDS = ["bakers", "merit", "silver", "gold", "rosette"] as const;
export type RibbonId = (typeof RIBBON_IDS)[number];

export interface RibbonDef {
  readonly id: RibbonId;
  readonly name: string;
  readonly from: number;
  readonly line: string;
  readonly colour: string;
}

export const RIBBONS: readonly RibbonDef[] = [
  {
    id: "bakers",
    name: "Baker's Ribbon",
    from: 0,
    line: "Thank you for bringing your bake!",
    colour: "#6f9fd8",
  },
  { id: "merit", name: "Ribbon of Merit", from: 55, line: "A bake to be proud of.", colour: "#3fa37a" },
  { id: "silver", name: "Silver Ribbon", from: 70, line: "Lovely work, all round.", colour: "#b7bfcc" },
  { id: "gold", name: "Gold Ribbon", from: 85, line: "Steady hands and a happy cake.", colour: "#d9a42b" },
  {
    id: "rosette",
    name: "Comet Rosette",
    from: 95,
    line: "The whole glasshouse gasped!",
    colour: "#c2304f",
  },
];
