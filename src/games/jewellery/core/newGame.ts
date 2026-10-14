import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { profileIssues, type ProfileSettings } from "../../../engine/profile";
import { drawItem } from "../../../engine/rngDraw";
import { rollTrendState } from "../../../engine/trendMarket";
import { CAREER } from "../content/career";
import { JEWEL_TAGS } from "../content/jewelTag";
import { THEME_IDS } from "../content/marketTheme";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { FRESH_MARKET } from "./marketDay";
import { rollOffers } from "./offers";
import { emptyStock } from "./stock";
import { queueStoryTrigger } from "./storyQueue";

export type NewGameSettings = ProfileSettings;

export function newGameIssues(settings: NewGameSettings): string[] {
  return profileIssues(settings);
}

export function createGame(settings: NewGameSettings): GameState {
  const [trends, afterTrends] = rollTrendState(settings.seed | 0, JEWEL_TAGS);
  const [marketTheme, rng] = drawItem(afterTrends, THEME_IDS);
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
    stock: emptyStock(),
    upgrades: [],
    decor: [],
    guide: true,
    trends,
    marketTheme,
    gigs: { offers: [], active: [], lapsed: [], nextGigNumber: 1 },
    story: { seen: [], flags: [], queue: [] },
    activeRun: null,
    stallBox: [],
    market: FRESH_MARKET,
    keepsakes: [],
    log: [],
    ordersDelivered: 0,
    nextRunNumber: 1,
    rng,
  };
  return rollOffers(queueStoryTrigger(base, "intro"));
}
