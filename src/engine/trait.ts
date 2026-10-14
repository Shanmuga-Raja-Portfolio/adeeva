export const TRAIT_IDS = ["dreamer", "perfectionist", "trendsetter", "charmer"] as const;
export type TraitId = (typeof TRAIT_IDS)[number];

export interface TraitDef {
  id: TraitId;
  name: string;
  tagline: string;
  perk: string;
  voice: string;
}

export const TRAIT_STORY_TRIGGERS = {
  dreamer: "trait-dreamer",
  perfectionist: "trait-perfectionist",
  trendsetter: "trait-trendsetter",
  charmer: "trait-charmer",
} as const satisfies Readonly<Record<TraitId, `trait-${TraitId}`>>;
