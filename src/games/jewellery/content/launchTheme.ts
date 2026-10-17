import type { MusicMoodId } from "../../../engine/musicMood";
import type { JewelColour } from "./jewelColour";
import type { JewelTag } from "./jewelTag";
import type { LanternColourId } from "./lanternColour";
import type { LoftSeasonId } from "./loftSeason";
import type { BackdropId } from "./lookbookBackdrop";

export const LAUNCH_THEME_IDS = [
  "first-blossom",
  "kite-meadow",
  "rock-pools",
  "midsummer-stars",
  "apple-harvest",
  "clocktower",
  "first-frost",
  "winter-lanterns",
] as const;
export type LaunchThemeId = (typeof LAUNCH_THEME_IDS)[number];

export interface LaunchThemeDef {
  readonly id: LaunchThemeId;
  readonly season: LoftSeasonId;
  readonly name: string;
  readonly tags: readonly [JewelTag, JewelTag];
  readonly palette: readonly JewelColour[];
  readonly music: MusicMoodId;
  readonly lantern: LanternColourId;
  readonly backdrop: BackdropId;
  readonly cards: readonly [string, string, string];
  readonly bestCard: 0 | 1 | 2;
  readonly blurb: string;
}

export const LAUNCH_THEMES: readonly LaunchThemeDef[] = [
  {
    id: "first-blossom",
    season: "spring",
    name: "First Blossom",
    tags: ["nature", "dainty"],
    palette: ["blush", "sage", "ivory", "rose-gold"],
    music: "beach-pop",
    lantern: "rose",
    backdrop: "linen",
    cards: ["Made for the first warm morning.", "Bold as a brass band.", "Cosy as a winter scarf."],
    bestCard: 0,
    blurb: "Pink buds on every branch. Tiny, fresh pieces that feel like spring.",
  },
  {
    id: "kite-meadow",
    season: "spring",
    name: "Kite Meadow",
    tags: ["playful", "bold"],
    palette: ["sky", "coral", "mustard", "copper"],
    music: "synth-pulse",
    lantern: "amber",
    backdrop: "linen",
    cards: ["Quiet as falling snow.", "Bright as a kite on a windy day.", "Old as the clocktower."],
    bestCard: 1,
    blurb: "Kites tug at their strings. Bright, bold pieces that want to fly.",
  },
  {
    id: "rock-pools",
    season: "summer",
    name: "Rock Pools",
    tags: ["nature", "playful"],
    palette: ["teal", "sky", "sage", "silver"],
    music: "beach-pop",
    lantern: "teal",
    backdrop: "slate",
    cards: ["Found in a sunny rock pool.", "Spun from moonlight.", "Warm as apple pie."],
    bestCard: 0,
    blurb: "Shells, splashes and little crabs. Sunny pieces from the seaside.",
  },
  {
    id: "midsummer-stars",
    season: "summer",
    name: "Midsummer Stars",
    tags: ["sparkly", "dreamy"],
    palette: ["navy", "gold", "lavender", "ivory"],
    music: "dreamy-strings",
    lantern: "moon-white",
    backdrop: "moon-paper",
    cards: ["Loud as a brass band.", "Sharp as a winter wind.", "A wish for the longest night of stars."],
    bestCard: 2,
    blurb: "The sky is full of stars. Twinkly, dreamy pieces for a summer night.",
  },
  {
    id: "apple-harvest",
    season: "autumn",
    name: "Apple Harvest",
    tags: ["classic", "nature"],
    palette: ["ruby", "mustard", "bronze", "sage"],
    music: "classic-jazz",
    lantern: "amber",
    backdrop: "linen",
    cards: ["Cosy as the orchard at harvest time.", "Cool as a rock pool.", "Bright as a disco ball."],
    bestCard: 0,
    blurb: "Baskets of red apples. Warm, classic pieces with a country feel.",
  },
  {
    id: "clocktower",
    season: "autumn",
    name: "Clocktower",
    tags: ["classic", "bold"],
    palette: ["charcoal", "gold", "navy", "bronze"],
    music: "synth-pulse",
    lantern: "moon-white",
    backdrop: "slate",
    cards: ["Soft as a spring petal.", "Strong and bright, like the tower's chime.", "Made for a picnic."],
    bestCard: 1,
    blurb: "Tomasz winds the old arcade clock. Strong, classic pieces that tick.",
  },
  {
    id: "first-frost",
    season: "winter",
    name: "First Frost",
    tags: ["elegant", "dainty"],
    palette: ["ivory", "sky", "silver", "lavender"],
    music: "dreamy-strings",
    lantern: "teal",
    backdrop: "teal-velvet",
    cards: ["Loud as a summer fair.", "Hot as a sunny beach.", "Delicate as frost on a window."],
    bestCard: 2,
    blurb: "Frost lace on every window. Fine, elegant pieces that shimmer cold.",
  },
  {
    id: "winter-lanterns",
    season: "winter",
    name: "Winter Lanterns",
    tags: ["sparkly", "elegant"],
    palette: ["plum", "gold", "navy", "ruby"],
    music: "classic-jazz",
    lantern: "rose",
    backdrop: "teal-velvet",
    cards: ["Glowing like lanterns on a cosy winter night.", "Wild as a kite meadow.", "Salty as the sea."],
    bestCard: 0,
    blurb: "The longest nights, the brightest lanterns. Rich, sparkly pieces.",
  },
];
