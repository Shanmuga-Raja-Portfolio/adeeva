export const TRAIT_IDS = ["dreamer", "perfectionist", "trendsetter", "charmer"] as const;
export type TraitId = (typeof TRAIT_IDS)[number];

export interface TraitDef {
  id: TraitId;
  name: string;
  tagline: string;
  perk: string;
  voice: string;
}
