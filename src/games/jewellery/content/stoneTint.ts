export const STONE_TINTS = ["pale", "true", "deep"] as const;
export type StoneTint = (typeof STONE_TINTS)[number];

export interface StoneTintDef {
  readonly id: StoneTint;
  readonly word: string;
  readonly pattern: string;
  readonly mix: number;
  readonly towards: string;
}

export const STONE_TINT_DEFS: readonly StoneTintDef[] = [
  { id: "pale", word: "Pale", pattern: "○", mix: 0.45, towards: "#ffffff" },
  { id: "true", word: "True", pattern: "◐", mix: 0, towards: "#ffffff" },
  { id: "deep", word: "Deep", pattern: "●", mix: 0.35, towards: "#1a1020" },
];

export const SHIMMER_LEVELS = [1, 2, 3] as const;
export type Shimmer = (typeof SHIMMER_LEVELS)[number];
