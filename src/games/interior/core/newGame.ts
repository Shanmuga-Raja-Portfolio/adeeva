import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { profileIssues, type ProfileSettings } from "../../../engine/profile";
import { rollTrendState } from "../../../engine/trendMarket";
import { CAREER_IDS, SHOW_HOME_START, type CareerId } from "../content/career";
import { ROOM_TAGS } from "../content/roomTag";
import { careerById } from "./catalog";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { rollOffers } from "./offers";
import { freshLarkspur } from "./openLarkspur";
import { changeStock, EMPTY_CART, emptyStock } from "./stock";
import { queueStoryTrigger } from "./storyQueue";

export interface NewGameSettings extends ProfileSettings {
  readonly career: CareerId;
}

export function newGameIssues(settings: NewGameSettings): string[] {
  const issues = profileIssues(settings);
  return CAREER_IDS.includes(settings.career) ? issues : [...issues, "Choose where to start."];
}

const HOUSEWARMING_SHELF = {
  ...EMPTY_CART,
  paints: Object.fromEntries(SHOW_HOME_START.paints.map((id) => [id, 1])),
  lights: Object.fromEntries(SHOW_HOME_START.lights.map((id) => [id, 1])),
};

function showHomeStart(state: GameState): GameState {
  const [larkspur, rng] = freshLarkspur(state.rng, state.calendar.day);
  return {
    ...state,
    rng,
    larkspur,
    upgrades: [...SHOW_HOME_START.upgrades],
    stock: changeStock(state.stock, HOUSEWARMING_SHELF, 1),
  };
}

export function createGame(settings: NewGameSettings): GameState {
  const [trends, rng] = rollTrendState(settings.seed | 0, ROOM_TAGS);
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
    career: career.id,
    calendar: { day: 1, hoursLeft: BASE_DAY_HOURS },
    coins: career.startCoins,
    reputation: career.startReputation,
    buzz: 0,
    stock: emptyStock(),
    upgrades: [],
    loftDecor: [],
    guide: true,
    trends,
    showHomeWeek: 0,
    gigs: { offers: [], active: [], lapsed: [], nextGigNumber: 1 },
    story: { seen: [], flags: [], queue: [] },
    activeRun: null,
    larkspur: null,
    log: [],
    ordersDelivered: 0,
    nextRunNumber: 1,
    rng,
  };
  if (career.id === "loft") return rollOffers(queueStoryTrigger(base, "intro"));
  return rollOffers(queueStoryTrigger(showHomeStart(base), "intro-development"));
}
