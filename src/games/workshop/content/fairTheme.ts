import type { BoothBackdropId } from "./boothBackdrop";
import type { FairMusicId } from "./fairMusic";
import type { SeasonId } from "./season";
import type { ShadeId } from "./shade";
import type { WoodTag } from "./woodTag";

export const FAIR_THEME_IDS = [
  "orchard-picnic",
  "kite-festival",
  "seaside-cabin",
  "little-loft",
  "harvest-barn",
  "quiet-library",
  "snowy-lodge",
  "lantern-evening",
] as const;
export type FairThemeId = (typeof FAIR_THEME_IDS)[number];

export interface FairThemeDef {
  readonly id: FairThemeId;
  readonly season: SeasonId;
  readonly name: string;
  readonly tags: readonly [WoodTag, WoodTag];
  readonly palette: readonly ShadeId[];
  readonly moods: readonly [string, string];
  readonly bestBackdrop: BoothBackdropId;
  readonly bestMusic: FairMusicId;
}

export const FAIR_THEMES: readonly FairThemeDef[] = [
  {
    id: "orchard-picnic",
    season: "spring",
    name: "Orchard Picnic",
    tags: ["rustic", "natural"],
    palette: ["honey-wood", "sage", "mustard", "ivory"],
    moods: ["cheerful", "lively"],
    bestBackdrop: "bunting",
    bestMusic: "fiddle-folk",
  },
  {
    id: "kite-festival",
    season: "spring",
    name: "Kite Festival",
    tags: ["playful", "modern"],
    palette: ["sky", "coral", "mustard", "pale-wood"],
    moods: ["cheerful", "bright"],
    bestBackdrop: "bunting",
    bestMusic: "brass-band",
  },
  {
    id: "seaside-cabin",
    season: "summer",
    name: "Seaside Cabin",
    tags: ["natural", "cosy"],
    palette: ["pale-wood", "sky", "teal", "ivory"],
    moods: ["calm", "gentle"],
    bestBackdrop: "linen-drape",
    bestMusic: "wind-chimes",
  },
  {
    id: "little-loft",
    season: "summer",
    name: "Little Loft",
    tags: ["modern", "classic"],
    palette: ["pale-wood", "charcoal", "teal", "ivory"],
    moods: ["calm", "bright"],
    bestBackdrop: "linen-drape",
    bestMusic: "brass-band",
  },
  {
    id: "harvest-barn",
    season: "autumn",
    name: "Harvest Barn",
    tags: ["rustic", "sturdy"],
    palette: ["honey-wood", "red-wood", "mustard", "coral"],
    moods: ["cosy", "lively"],
    bestBackdrop: "lantern-string",
    bestMusic: "fiddle-folk",
  },
  {
    id: "quiet-library",
    season: "autumn",
    name: "Quiet Library",
    tags: ["classic", "elegant"],
    palette: ["red-wood", "navy", "ivory", "gold"],
    moods: ["calm", "warm"],
    bestBackdrop: "linen-drape",
    bestMusic: "acoustic-guitar",
  },
  {
    id: "snowy-lodge",
    season: "winter",
    name: "Snowy Lodge",
    tags: ["cosy", "sturdy"],
    palette: ["dark-wood", "ivory", "navy", "sage"],
    moods: ["cosy", "gentle"],
    bestBackdrop: "lantern-string",
    bestMusic: "wind-chimes",
  },
  {
    id: "lantern-evening",
    season: "winter",
    name: "Lantern Evening",
    tags: ["elegant", "cosy"],
    palette: ["dark-wood", "lavender", "gold", "blush"],
    moods: ["cosy", "warm"],
    bestBackdrop: "lantern-string",
    bestMusic: "acoustic-guitar",
  },
];
