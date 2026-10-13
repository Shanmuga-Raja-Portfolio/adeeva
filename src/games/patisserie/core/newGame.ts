import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { profileIssues, type ProfileSettings } from "../../../engine/profile";
import { rollTrendState } from "../../../engine/trendMarket";
import { CAREER } from "../content/career";
import { FILLING_IDS, type FillingId } from "../content/filling";
import { INGREDIENT_IDS, type IngredientId } from "../content/ingredient";
import { TOPPING_IDS, type ToppingId } from "../content/topping";
import { ingredientById } from "./catalog";
import { EMPTY_COUNTER } from "./counter";
import { SCHEMA_VERSION, type GameState, type Pantry } from "./gameState";
import { rollOffers } from "./offers";
import { queueStoryTrigger } from "./storyQueue";

export type NewGameSettings = ProfileSettings;

export function newGameIssues(settings: NewGameSettings): string[] {
  return profileIssues(settings);
}

function starterPantry(): Pantry {
  return {
    ingredients: Object.fromEntries(
      INGREDIENT_IDS.map((id) => [id, (CAREER.starterPacks[id] ?? 0) * ingredientById(id).packAmount]),
    ) as Record<IngredientId, number>,
    gels: {},
    fillings: Object.fromEntries(FILLING_IDS.map((id) => [id, 0])) as Record<FillingId, number>,
    toppings: Object.fromEntries(TOPPING_IDS.map((id) => [id, 0])) as Record<ToppingId, number>,
  };
}

export function createGame(settings: NewGameSettings): GameState {
  const [trends, rng] = rollTrendState(settings.seed | 0);
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
    pantry: starterPantry(),
    upgrades: [],
    guide: settings.difficulty === "relaxed",
    trends,
    gigs: { offers: [], active: [], lapsed: [], nextGigNumber: 1 },
    story: { seen: [], flags: [], queue: [] },
    activeRun: null,
    counter: EMPTY_COUNTER,
    bakeBook: [],
    log: [],
    ordersDelivered: 0,
    nextRunNumber: 1,
    rng,
  };
  return rollOffers(queueStoryTrigger(base, "intro"));
}
