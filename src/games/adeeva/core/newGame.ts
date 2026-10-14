import { zeroCounts } from "../../../engine/count";
import { profileIssues, type ProfileSettings } from "../../../engine/profile";
import { CAREER_IDS, type CareerId } from "../content/career";
import { TRIM_IDS } from "../content/trim";
import { careerById } from "./catalog";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { rollOffers } from "./offers";
import { beginSeason } from "./seasonFlow";
import { queueStoryTrigger } from "./storyQueue";
import { STYLE_TAGS } from "../../../engine/styleTag";
import { rollTrendState } from "../../../engine/trendMarket";

export interface NewGameSettings extends ProfileSettings {
  readonly career: CareerId;
}

export function newGameIssues(settings: NewGameSettings): string[] {
  const issues = profileIssues(settings);
  if (!CAREER_IDS.includes(settings.career)) issues.push("Choose a career.");
  return issues;
}

export function createGame(settings: NewGameSettings): GameState {
  const career = careerById(settings.career);
  const [trends, rng] = rollTrendState(settings.seed | 0, STYLE_TAGS);
  const base: GameState = {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      name: settings.name.trim(),
      look: settings.look,
      trait: settings.trait,
      difficulty: settings.difficulty,
      career: settings.career,
    },
    calendar: { day: 1, hoursLeft: BASE_DAY_HOURS, shopOpen: false },
    coins: career.startCoins,
    reputation: career.startReputation,
    buzz: 0,
    inventory: {
      fabricMetres: {},
      trims: zeroCounts(TRIM_IDS),
    },
    studio: { upgrades: [], assistantHired: false, assistantPaidThroughDay: 0 },
    trends,
    gigs: { offers: [], active: [], lapsed: [], nextGigNumber: 1 },
    story: { seen: [], flags: [], queue: [] },
    activeRun: null,
    season: null,
    log: [],
    deliveredRunIds: [],
    gigsDelivered: 0,
    nextRunNumber: 1,
    rng,
  };
  const introduced = queueStoryTrigger(base, settings.career === "student" ? "intro-student" : "intro-label");
  const withOffers = rollOffers(introduced);
  return settings.career === "label" ? (beginSeason(withOffers, null) ?? withOffers) : withOffers;
}
