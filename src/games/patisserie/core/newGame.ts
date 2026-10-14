import { zeroCounts } from "../../../engine/count";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { profileIssues, type ProfileSettings } from "../../../engine/profile";
import { STYLE_TAGS } from "../../../engine/styleTag";
import { rollTrendState } from "../../../engine/trendMarket";
import { STARTER_PACKS, type CareerId } from "../content/career";
import { FILLING_IDS } from "../content/filling";
import { INGREDIENT_IDS, type IngredientId } from "../content/ingredient";
import { TEA_IDS } from "../content/tea";
import { TOPPING_IDS } from "../content/topping";
import { careerById, ingredientById, isCareerId } from "./catalog";
import { EMPTY_COUNTER } from "./counter";
import { drawVisitors, initialFair, seasonOpened } from "./fairSeason";
import { SCHEMA_VERSION, type GameState, type Pantry } from "./gameState";
import { rollOffers } from "./offers";
import { withParlourBox } from "./openSalon";
import { EMPTY_SALON } from "./salonState";
import { queueStoryTrigger } from "./storyQueue";

export interface NewGameSettings extends ProfileSettings {
  readonly career?: CareerId;
}

export function newGameIssues(settings: NewGameSettings): string[] {
  const issues = profileIssues(settings);
  if (settings.career !== undefined && !isCareerId(settings.career)) issues.push("Choose a career.");
  return issues;
}

function starterPantry(multiplier: number): Pantry {
  return {
    ingredients: Object.fromEntries(
      INGREDIENT_IDS.map((id) => [id, (STARTER_PACKS[id] ?? 0) * multiplier * ingredientById(id).packAmount]),
    ) as Record<IngredientId, number>,
    gels: {},
    fillings: zeroCounts(FILLING_IDS),
    toppings: zeroCounts(TOPPING_IDS),
    teas: zeroCounts(TEA_IDS),
  };
}

function bakeryGame(settings: NewGameSettings, careerId: CareerId): GameState {
  const career = careerById(careerId);
  const [trends, rng] = rollTrendState(settings.seed | 0, STYLE_TAGS);
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: {
      name: settings.name.trim(),
      look: settings.look,
      trait: settings.trait,
      difficulty: settings.difficulty,
      startedAs: careerId,
    },
    career: careerId,
    calendar: { day: 1, hoursLeft: BASE_DAY_HOURS },
    coins: career.startCoins,
    reputation: career.startReputation,
    buzz: 0,
    pantry: starterPantry(career.starterMultiplier),
    upgrades: [],
    guide: careerId === "bakery" && settings.difficulty === "relaxed",
    trends,
    gigs: { offers: [], active: [], lapsed: [], nextGigNumber: 1 },
    story: { seen: [], flags: [], queue: [] },
    activeRun: null,
    counter: EMPTY_COUNTER,
    salon: null,
    fair: null,
    bakeBook: [],
    log: [],
    ordersDelivered: 0,
    nextRunNumber: 1,
    rng,
  };
}

function salonGame(base: GameState): GameState {
  const [visitors, rng] = drawVisitors(base, base.rng);
  const opened: GameState = {
    ...base,
    rng,
    pantry: withParlourBox(base.pantry),
    salon: EMPTY_SALON,
    fair: initialFair(1, visitors),
  };
  return seasonOpened(queueStoryTrigger(opened, "intro-salon"));
}

export function createGame(settings: NewGameSettings): GameState {
  const careerId = settings.career ?? "bakery";
  const base = bakeryGame(settings, careerId);
  const started = careerId === "salon" ? salonGame(base) : queueStoryTrigger(base, "intro");
  return rollOffers(started);
}
