import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { profileIssues, type ProfileSettings } from "../../../engine/profile";
import { rollTrendState } from "../../../engine/trendMarket";
import { CAREER } from "../content/career";
import { WOOD_TAGS } from "../content/woodTag";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { rollOffers } from "./offers";
import { queueStoryTrigger } from "./storyQueue";

export type NewGameSettings = ProfileSettings;

export function newGameIssues(settings: NewGameSettings): string[] {
  return profileIssues(settings);
}

export function createGame(settings: NewGameSettings): GameState {
  const [trends, rng] = rollTrendState(settings.seed | 0, WOOD_TAGS);
  const base: GameState = {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      name: settings.name.trim(),
      look: settings.look,
      trait: settings.trait,
      difficulty: settings.difficulty,
    },
    calendar: { day: 1, hoursLeft: BASE_DAY_HOURS },
    coins: CAREER.startCoins,
    reputation: CAREER.startReputation,
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
    rng,
  };
  return rollOffers(queueStoryTrigger(base, "intro"));
}
