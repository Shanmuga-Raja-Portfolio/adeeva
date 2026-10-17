import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { profileIssues, type ProfileSettings } from "../../../engine/profile";
import { drawItem } from "../../../engine/rngDraw";
import { rollTrendState } from "../../../engine/trendMarket";
import { CAREER_IDS, type CareerId } from "../content/career";
import { JEWEL_TAGS } from "../content/jewelTag";
import type { LineNameId } from "../content/lineName";
import { THEME_IDS } from "../content/marketTheme";
import { careerById } from "./catalog";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { collectionFields, isLineNameId } from "./loftOffer";
import { FRESH_MARKET } from "./marketDay";
import { rollOffers } from "./offers";
import { emptyStock } from "./stock";
import { queueStoryTrigger } from "./storyQueue";

export interface NewGameSettings extends ProfileSettings {
  readonly career: CareerId;
  readonly lineNameId: LineNameId;
}

export function newGameIssues(settings: NewGameSettings): string[] {
  const issues = [...profileIssues(settings)];
  if (!CAREER_IDS.some((id) => id === settings.career)) issues.push("Choose a career.");
  if (!isLineNameId(settings.lineNameId)) issues.push("Pick a name for your line.");
  return issues;
}

function benchGame(settings: NewGameSettings): GameState {
  const [trends, afterTrends] = rollTrendState(settings.seed | 0, JEWEL_TAGS);
  const [marketTheme, rng] = drawItem(afterTrends, THEME_IDS);
  const career = careerById(settings.career);
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      name: settings.name.trim(),
      look: settings.look,
      trait: settings.trait,
      difficulty: settings.difficulty,
      startedAs: career.id,
    },
    career: "bench",
    calendar: { day: 1, hoursLeft: BASE_DAY_HOURS },
    coins: career.startCoins,
    reputation: career.startReputation,
    buzz: 0,
    stock: emptyStock(),
    upgrades: [],
    decor: [],
    guide: career.id === "bench",
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
    collection: null,
    launch: null,
    rng,
  };
}

export function createGame(settings: NewGameSettings): GameState {
  const base = benchGame(settings);
  if (settings.career === "bench") return rollOffers(queueStoryTrigger(base, "intro"));
  const loft = collectionFields(base, 1, settings.lineNameId);
  return rollOffers(queueStoryTrigger(queueStoryTrigger(loft, "intro-loft"), "launch-invite"));
}
