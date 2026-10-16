import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { profileIssues, type ProfileSettings } from "../../../engine/profile";
import { rollTrendState } from "../../../engine/trendMarket";
import type { BoardSizeId } from "../content/boardSize";
import type { CareerId } from "../content/career";
import type { WoodId } from "../content/wood";
import { WOOD_TAGS } from "../content/woodTag";
import { careerById, isCareerId } from "./catalog";
import { seasonOpened } from "./fairSeason";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { rollOffers } from "./offers";
import { showroomFields, SPARE_BOARD_PILE, withBoardPile } from "./showroomOffer";
import { queueStoryTrigger } from "./storyQueue";

export type NewGameSettings = ProfileSettings & { readonly career: CareerId };

export const SHOWROOM_START_PILE: readonly (readonly [WoodId, BoardSizeId])[] = [
  ...SPARE_BOARD_PILE,
  ["pine", "long"],
  ["pine", "long"],
];

export function newGameIssues(settings: NewGameSettings): string[] {
  const issues = profileIssues(settings);
  return isCareerId(settings.career) ? issues : [...issues, "Choose a career."];
}

function showroomStart(state: GameState): GameState {
  const opened = showroomFields(withBoardPile(state, SHOWROOM_START_PILE), 1);
  return seasonOpened(queueStoryTrigger(opened, "intro-showroom"));
}

export function createGame(settings: NewGameSettings): GameState {
  const [trends, rng] = rollTrendState(settings.seed | 0, WOOD_TAGS);
  const career = careerById(settings.career);
  const base: GameState = {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      name: settings.name.trim(),
      look: settings.look,
      trait: settings.trait,
      difficulty: settings.difficulty,
      startedAs: career.id,
    },
    career: "garage",
    calendar: { day: 1, hoursLeft: BASE_DAY_HOURS },
    coins: career.startCoins,
    reputation: career.startReputation,
    buzz: 0,
    trends,
    gigs: { offers: [], active: [], lapsed: [], nextGigNumber: 1 },
    story: { seen: [], flags: [], queue: [] },
    boards: [],
    upgrades: [],
    decor: [],
    activeRun: null,
    log: [],
    delivered: 0,
    nextRunNumber: 1,
    nextBoardNumber: 1,
    showroom: null,
    fair: null,
    apprentice: null,
    rng,
  };
  const started = career.id === "showroom" ? showroomStart(base) : queueStoryTrigger(base, "intro");
  return rollOffers(started);
}
