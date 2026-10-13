import type { ColourId } from "./colour";
import type { RunwayLightId } from "./runwayLight";
import type { RunwayMoodId } from "./runwayMood";
import type { StyleTag } from "./styleTag";

export interface ShowThemeDef {
  id: string;
  name: string;
  venue: string;
  pitch: string;
  requiredTags: readonly StyleTag[];
  palette: readonly ColourId[];
  bestMood: RunwayMoodId;
  bestLight: RunwayLightId;
  budget: number;
  minQuality: number;
}

export const SHOW_THEMES: readonly ShowThemeDef[] = [
  {
    id: "midnight-garden",
    name: "Midnight Garden",
    venue: "The Glasshouse",
    pitch: "Moonlit petals, deep jewel tones and soft movement.",
    requiredTags: ["romantic", "dreamy"],
    palette: ["plum", "emerald", "navy", "lavender", "black", "rose"],
    bestMood: "dreamy-strings",
    bestLight: "cool",
    budget: 170,
    minQuality: 68,
  },
  {
    id: "coastal-breeze",
    name: "Coastal Breeze",
    venue: "Harbour Pier Pavilion",
    pitch: "Sunlit, easy and playful, like a day by the sea.",
    requiredTags: ["casual", "playful"],
    palette: ["sky", "ivory", "coral", "sage", "teal", "mustard"],
    bestMood: "beach-pop",
    bestLight: "warm",
    budget: 130,
    minQuality: 68,
  },
  {
    id: "neon-future",
    name: "Neon Future",
    venue: "The Old Power Station",
    pitch: "Sharp lines, sequin sparkle and fearless colour.",
    requiredTags: ["edgy", "bold"],
    palette: ["black", "gold", "teal", "rose", "charcoal", "ruby"],
    bestMood: "synth-pulse",
    bestLight: "spotlight",
    budget: 200,
    minQuality: 72,
  },
];
