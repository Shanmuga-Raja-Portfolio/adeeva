import type { DecorId } from "./decor";
import type { RoomColour } from "./roomColour";
import type { RoomTag } from "./roomTag";
import type { TourMusicId } from "./tourMusic";
import type { TourTimeId } from "./tourTime";

export const HOME_STORY_IDS = [
  "seaside-days",
  "garden-growers",
  "music-makers",
  "book-lovers",
  "young-explorers",
  "star-gazers",
  "quiet-makers",
  "get-togethers",
] as const;
export type HomeStoryId = (typeof HOME_STORY_IDS)[number];

export interface StoryPiece {
  readonly decorId: DecorId;
  readonly line: string;
}

export interface HomeStoryDef {
  readonly id: HomeStoryId;
  readonly name: string;
  readonly blurb: string;
  readonly tags: readonly [RoomTag, RoomTag];
  readonly palette: readonly RoomColour[];
  readonly pieces: readonly [StoryPiece, StoryPiece];
  readonly bestMusic: TourMusicId;
  readonly bestTime: TourTimeId;
}

export const HOME_STORIES: readonly HomeStoryDef[] = [
  {
    id: "seaside-days",
    name: "A family who loves the seaside",
    blurb: "Buckets, spades and sand in every pocket. They feel sunny and fresh.",
    tags: ["calm", "natural"],
    palette: ["sky", "teal", "ivory", "coral"],
    pieces: [
      { decorId: "shell-jar", line: "A shell jar! Someone loves the sea." },
      { decorId: "boat-print", line: "Look, a little sailing boat!" },
    ],
    bestMusic: "beach-pop",
    bestTime: "morning",
  },
  {
    id: "garden-growers",
    name: "Neighbours who grow everything",
    blurb: "Seedlings on every sill. They feel mellow and fresh.",
    tags: ["natural", "bright"],
    palette: ["sage", "emerald", "mustard", "ivory"],
    pieces: [
      { decorId: "herb-pots", line: "Fresh herbs! I can smell the mint." },
      { decorId: "potted-fern", line: "What a happy fern!" },
    ],
    bestMusic: "classic-jazz",
    bestTime: "morning",
  },
  {
    id: "music-makers",
    name: "A home full of music",
    blurb: "Drums, a fiddle and a lot of singing. They feel lively and cosy.",
    tags: ["classic", "bold"],
    palette: ["navy", "gold", "ruby", "ivory"],
    pieces: [
      { decorId: "record-frame", line: "Framed records! I know that song." },
      { decorId: "wall-clock", line: "That clock ticks right in time." },
    ],
    bestMusic: "synth-pulse",
    bestTime: "evening",
  },
  {
    id: "book-lovers",
    name: "Readers in every room",
    blurb: "Stories stacked on the stairs. They feel dreamy and cosy.",
    tags: ["cosy", "classic"],
    palette: ["ruby", "sage", "ivory", "honey-wood"],
    pieces: [
      { decorId: "book-stack", line: "A stack of books! I'd curl up here." },
      { decorId: "framed-print", line: "That picture tells a story." },
    ],
    bestMusic: "dreamy-strings",
    bestTime: "evening",
  },
  {
    id: "young-explorers",
    name: "Explorers big and small",
    blurb: "Maps, flags and muddy boots. They feel sunny and golden.",
    tags: ["playful", "bold"],
    palette: ["mustard", "coral", "teal", "navy"],
    pieces: [
      { decorId: "map-poster", line: "A treasure map! Where's the X?" },
      { decorId: "paper-bunting", line: "Bunting! It feels like a party." },
    ],
    bestMusic: "beach-pop",
    bestTime: "afternoon",
  },
  {
    id: "star-gazers",
    name: "Star gazers",
    blurb: "A telescope by the window. They feel dreamy and cosy.",
    tags: ["cosy", "bold"],
    palette: ["navy", "lavender", "gold", "charcoal"],
    pieces: [
      { decorId: "planet-mobile", line: "The planets are spinning!" },
      { decorId: "star-garland", line: "Stars indoors! How lovely." },
    ],
    bestMusic: "dreamy-strings",
    bestTime: "evening",
  },
  {
    id: "quiet-makers",
    name: "Makers who love calm",
    blurb: "Clay, wool and quiet hands. They feel mellow and fresh.",
    tags: ["calm", "modern"],
    palette: ["charcoal", "sage", "ivory", "coral"],
    pieces: [
      { decorId: "clay-vase", line: "Did someone make that vase? Beautiful." },
      { decorId: "woven-basket", line: "A woven basket, just like Gran's." },
    ],
    bestMusic: "classic-jazz",
    bestTime: "morning",
  },
  {
    id: "get-togethers",
    name: "A family who loves get-togethers",
    blurb: "Cousins, games and big dinners. They feel lively and golden.",
    tags: ["playful", "bright"],
    palette: ["coral", "mustard", "sky", "blush"],
    pieces: [
      { decorId: "cushion-pile", line: "So many cushions! Room for everyone." },
      { decorId: "round-rug", line: "A round rug for games on the floor." },
    ],
    bestMusic: "synth-pulse",
    bestTime: "afternoon",
  },
];
