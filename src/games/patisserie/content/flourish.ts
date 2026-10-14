export const FLOURISH_IDS = ["blind-scale", "ribbon-stir", "bake-together", "plaque-lettering"] as const;
export type FlourishId = (typeof FLOURISH_IDS)[number];

export interface FlourishDef {
  readonly id: FlourishId;
  readonly name: string;
  readonly reuses: string;
  readonly rule: string;
  readonly hours: number;
}

export const FLOURISHES: readonly FlourishDef[] = [
  {
    id: "blind-scale",
    name: "Covered scale",
    reuses: "Weigh",
    rule: "The green zone hides until the scale settles. Trust your eyes!",
    hours: 0,
  },
  {
    id: "ribbon-stir",
    name: "Fold, then whisk",
    reuses: "Stir",
    rule: "Ribbon Chiffon only: slow folding laps, then quick whisking laps.",
    hours: 0,
  },
  {
    id: "bake-together",
    name: "Bake them together",
    reuses: "Oven",
    rule: "Two tiers share one oven and one heat dial, each with its own Take out.",
    hours: -1,
  },
  {
    id: "plaque-lettering",
    name: "Piped words",
    reuses: "Pipe",
    rule: "Pipe a word on a chocolate plaque, one letter at a time.",
    hours: 1,
  },
];

export const MAX_FLOURISHES = 2;
