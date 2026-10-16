import type { ColourId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";
import type { RunwayLightId } from "../../adeeva/content/runwayLight";
import type { MusicMoodId } from "../../../engine/musicMood";

export const SEASON_IDS = ["blossom-mend", "seaside-swap", "orchard-patch", "lantern-night"] as const;
export type SeasonId = (typeof SEASON_IDS)[number];

export const SEASON_LENGTH_DAYS = 28;
export const SWAP_SEASON_DAY = 11;
export const SHOWCASE_FIRST_DAY = 22;
export const SHOWCASE_LAST_DAY = 27;

export interface SeasonDef {
  readonly id: SeasonId;
  readonly name: string;
  readonly tags: readonly [StyleTag, StyleTag];
  readonly palette: readonly ColourId[];
  readonly bestMood: MusicMoodId;
  readonly bestLight: RunwayLightId;
  readonly banner: string;
}

export const SEASONS: readonly SeasonDef[] = [
  {
    id: "blossom-mend",
    name: "Blossom & Mend",
    tags: ["romantic", "playful"],
    palette: ["blush", "sage", "ivory", "lavender"],
    bestMood: "dreamy-strings",
    bestLight: "warm",
    banner: "Bloom Again",
  },
  {
    id: "seaside-swap",
    name: "Seaside Swap",
    tags: ["casual", "sporty"],
    palette: ["sky", "teal", "coral", "mustard"],
    bestMood: "beach-pop",
    bestLight: "cool",
    banner: "Washed Up, Made New",
  },
  {
    id: "orchard-patch",
    name: "Orchard Patchwork",
    tags: ["classic", "bold"],
    palette: ["mustard", "plum", "ruby", "emerald"],
    bestMood: "beach-pop",
    bestLight: "warm",
    banner: "Harvest of Scraps",
  },
  {
    id: "lantern-night",
    name: "Lantern Night",
    tags: ["elegant", "regal"],
    palette: ["navy", "gold", "plum", "charcoal"],
    bestMood: "classic-jazz",
    bestLight: "spotlight",
    banner: "Light the Long Night",
  },
];
