import type { ColourId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";
import type { FairMusicId } from "./fairMusic";
import type { SeasonId } from "./season";
import type { TableClothId } from "./tableCloth";
import type { ToppingId } from "./topping";

export const FAIR_THEME_IDS = [
  "blossom-lane",
  "kite-day",
  "seaside-postcard",
  "midsummer-lanterns",
  "harvest-moon",
  "library-nook",
  "snow-globe",
  "comet-night",
] as const;
export type FairThemeId = (typeof FAIR_THEME_IDS)[number];

export interface FairThemeDef {
  readonly id: FairThemeId;
  readonly season: SeasonId;
  readonly name: string;
  readonly blurb: string;
  readonly tags: readonly StyleTag[];
  readonly palette: readonly ColourId[];
  readonly topping: ToppingId;
  readonly moods: readonly [string, string];
  readonly bestCloth: TableClothId;
  readonly bestMusic: FairMusicId;
}

export const FAIR_THEMES: readonly FairThemeDef[] = [
  {
    id: "blossom-lane",
    season: "spring",
    name: "Blossom Lane",
    blurb: "Pink petals drifting down a quiet lane.",
    tags: ["romantic", "dreamy"],
    palette: ["blush", "lavender", "ivory", "sage"],
    topping: "sugar-daisy",
    moods: ["soft", "graceful"],
    bestCloth: "linen",
    bestMusic: "string-trio",
  },
  {
    id: "kite-day",
    season: "spring",
    name: "Kite Day",
    blurb: "Bright kites dancing over the green.",
    tags: ["playful", "casual"],
    palette: ["sky", "mustard", "coral", "ivory"],
    topping: "candied-orange",
    moods: ["sunny", "lively"],
    bestCloth: "gingham",
    bestMusic: "brass-band",
  },
  {
    id: "seaside-postcard",
    season: "summer",
    name: "Seaside Postcard",
    blurb: "Stripy deckchairs and a breeze off the waves.",
    tags: ["casual", "playful"],
    palette: ["teal", "sky", "coral", "ivory"],
    topping: "wafer-fan",
    moods: ["sunny", "breezy"],
    bestCloth: "gingham",
    bestMusic: "garden-birdsong",
  },
  {
    id: "midsummer-lanterns",
    season: "summer",
    name: "Midsummer Lanterns",
    blurb: "Paper lanterns glowing softly at dusk.",
    tags: ["dreamy", "regal"],
    palette: ["navy", "gold", "lavender", "plum"],
    topping: "sugar-shimmer",
    moods: ["rich", "twinkly"],
    bestCloth: "velvet",
    bestMusic: "music-box",
  },
  {
    id: "harvest-moon",
    season: "autumn",
    name: "Harvest Moon",
    blurb: "A big golden moon over the apple barns.",
    tags: ["classic", "bold"],
    palette: ["mustard", "plum", "gold", "ruby"],
    topping: "toffee-shard",
    moods: ["soft", "lively"],
    bestCloth: "linen",
    bestMusic: "brass-band",
  },
  {
    id: "library-nook",
    season: "autumn",
    name: "Library Nook",
    blurb: "Leather chairs, tall shelves and a good book.",
    tags: ["classic", "elegant"],
    palette: ["emerald", "navy", "ivory", "gold"],
    topping: "wafer-fan",
    moods: ["rich", "graceful"],
    bestCloth: "velvet",
    bestMusic: "string-trio",
  },
  {
    id: "snow-globe",
    season: "winter",
    name: "Snow Globe",
    blurb: "A tiny town under a swirl of snow.",
    tags: ["elegant", "dreamy"],
    palette: ["ivory", "sky", "lavender", "teal"],
    topping: "sugar-snowflake",
    moods: ["soft", "twinkly"],
    bestCloth: "linen",
    bestMusic: "music-box",
  },
  {
    id: "comet-night",
    season: "winter",
    name: "Comet Night",
    blurb: "A bright comet streaking over Larkspur Street.",
    tags: ["regal", "bold"],
    palette: ["navy", "gold", "charcoal", "plum"],
    topping: "gold-star",
    moods: ["rich", "graceful"],
    bestCloth: "velvet",
    bestMusic: "string-trio",
  },
];
