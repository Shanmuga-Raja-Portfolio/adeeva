import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { profileIssues, type ProfileSettings } from "../../../engine/profile";
import { rollTrendState } from "../../../engine/trendMarket";
import { CAREER, START_IDS, type StartId } from "../content/career";
import { CUISINE_IDS } from "../content/cuisine";
import { TASTE_TAGS } from "../content/tasteTag";
import { EMPTY_BOARD } from "./dayBoard";
import { rollDayBoard } from "./dayBoardRoll";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { emptyMastery } from "./mastery";
import { rollOffers } from "./offers";
import { queueStoryTrigger } from "./storyQueue";

export interface NewGameSettings extends ProfileSettings {
  readonly start: StartId;
}

export function newGameIssues(settings: NewGameSettings): string[] {
  const issues = profileIssues(settings);
  return START_IDS.includes(settings.start) ? issues : [...issues, "Choose where to start."];
}

export function createGame(settings: NewGameSettings): GameState {
  const [trends, rng] = rollTrendState(settings.seed | 0, TASTE_TAGS);
  const head = settings.start === "head";
  const base: GameState = {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      name: settings.name.trim(),
      look: settings.look,
      trait: settings.trait,
      difficulty: settings.difficulty,
      start: settings.start,
    },
    calendar: { day: 1, hoursLeft: BASE_DAY_HOURS },
    coins: head ? CAREER.headStart.coins : CAREER.startCoins,
    reputation: CAREER.startReputation[settings.start],
    buzz: 0,
    rung: head ? "head" : "student",
    mastery: emptyMastery(head ? CAREER.headStart.mastery : 0),
    mentorsMet: head ? [...CUISINE_IDS] : [],
    passes: { line: 0, sous: 0, head: 0 },
    upgrades: [],
    trends,
    board: EMPTY_BOARD,
    gigs: { offers: [], active: [], lapsed: [], nextGigNumber: 1 },
    orderDishes: [],
    menu: [],
    story: { seen: [], flags: [], queue: [] },
    activeRun: null,
    testDay: null,
    service: null,
    platingCards: [],
    tasteMemory: [],
    diary: [],
    log: [],
    awards: [],
    cleanStreak: 0,
    lastShiftDay: 0,
    guide: true,
    nextRunNumber: 1,
    path: null,
    peeked: [],
    rng,
  };
  return rollOffers(rollDayBoard(queueStoryTrigger(base, head ? "head-chef-start" : "intro")));
}
