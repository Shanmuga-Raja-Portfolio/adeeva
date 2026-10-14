import { clamp } from "../../../engine/clamp";
import type { RoomTag } from "../content/roomTag";
import { decorById, roomById } from "./catalog";
import { litSpots, moodMatch } from "./lighting";
import { placedLights } from "./lightPlacement";
import type { MakeoverRun } from "./makeoverRun";
import { roomSource } from "./roomSource";
import { roomTags } from "./roomTags";

export interface PanelScore {
  readonly id: "comfort" | "flow" | "wow";
  readonly label: string;
  readonly score: number;
}

export interface OpenHouse {
  readonly panels: readonly PanelScore[];
  readonly score: number;
  readonly enquiries: number;
  readonly coins: number;
  readonly buzz: number;
  readonly quote: string;
}

export const ENQUIRY_COINS = 12;
export const VISITORS = 6;
const COMFORT_TAGS: readonly RoomTag[] = ["cosy", "calm"];
const FEATURE_WALL_WOW = 30;
const DECOR_WOW = 15;
const MAX_DECOR_WOW = 45;
const MOOD_WOW = 25;
const ENQUIRY_FLOOR = 60;
const ENQUIRY_STEP = 5;
const MAX_ENQUIRIES = 5;

const QUOTES: readonly (readonly [number, string])[] = [
  [90, "I could move in tomorrow. Every corner feels lovely!"],
  [75, "So bright and easy to walk around. We're booking a visit."],
  [60, "What a cheerful room. The lamps are just right."],
  [0, "A sweet room. We'll keep looking around the street."],
];

export function openHouseQuote(score: number): string {
  return QUOTES.find(([floor]) => score >= floor)?.[1] ?? "";
}

export function openHouse(run: MakeoverRun, flow: number): OpenHouse {
  const room = roomById(run.brief.roomId);
  const lights = placedLights(run);
  const { lit, total } = litSpots(room, run.plan.pieces, lights);
  const source = roomSource(run);
  const tags = roomTags(source);
  const comfortTags = COMFORT_TAGS.filter((tag) => tags.includes(tag)).length;
  const comfort = 100 * (0.6 * (total === 0 ? 1 : lit / total) + 0.4 * Math.min(1, comfortTags / 2));
  const briefDecor = new Set(
    source.decor.filter((id) => decorById(id).tags.some((tag) => run.brief.requiredTags.includes(tag))),
  );
  const wow =
    (run.plan.featurePaint === null ? 0 : FEATURE_WALL_WOW) +
    Math.min(MAX_DECOR_WOW, DECOR_WOW * briefDecor.size) +
    MOOD_WOW * moodMatch(run.brief.mood, lights);
  const panels: PanelScore[] = [
    { id: "comfort", label: "Comfort", score: Math.round(comfort) },
    { id: "flow", label: "Walk-through", score: Math.round(100 * flow) },
    { id: "wow", label: "Wow", score: Math.round(wow) },
  ];
  const score = Math.round(panels.reduce((sum, panel) => sum + panel.score, 0) / panels.length);
  const enquiries = clamp(Math.floor((score - ENQUIRY_FLOOR) / ENQUIRY_STEP), 0, MAX_ENQUIRIES);
  return {
    panels,
    score,
    enquiries,
    coins: enquiries * ENQUIRY_COINS,
    buzz: Math.round(score / 10),
    quote: openHouseQuote(score),
  };
}
