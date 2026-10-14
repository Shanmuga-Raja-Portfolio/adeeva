import { average } from "../../../engine/average";
import { isWeekEnd } from "../../../engine/week";
import { CRITIC_IDS } from "../content/critic";
import { PATH_RULES } from "../content/career";
import { GOOD_SPOONS, rollCriticNights } from "./critics";
import { rollFestivalWeek } from "./festivalBoard";
import type { GameState } from "./gameState";
import { emptyLedger } from "./ledger";
import { grantPathAward } from "./pathAwards";
import { recordMoney, restaurantOf, truckOf, withPath, type Season } from "./path";
import { isWeekStart } from "./pathCalendar";
import { newSeason } from "./season";
import { queueStoryTrigger } from "./storyQueue";

export const WARM_SEASON = 85;
export const UNSERVED_SHARE = 0.1;

export function warmestSeason(season: Season): boolean {
  const praised = new Set(
    season.critics.filter((visit) => visit.spoons >= GOOD_SPOONS).map((visit) => visit.criticId),
  );
  return (
    season.scores.length > 0 &&
    average(season.scores) >= WARM_SEASON &&
    CRITIC_IDS.every((id) => praised.has(id))
  );
}

export function bestNewSeason(season: Season): boolean {
  return (
    season.ingredients > 0 &&
    season.moneyIn - season.moneyOut > 0 &&
    season.unserved < UNSERVED_SHARE * season.ingredients
  );
}

function judgeSeason(state: GameState): GameState {
  const restaurant = restaurantOf(state);
  if (restaurant === null || state.calendar.day < restaurant.season.startDay + PATH_RULES.seasonDays)
    return state;
  const { season } = restaurant;
  let judged = state;
  if (warmestSeason(season)) judged = grantPathAward(judged, "warmest-kitchen");
  if (bestNewSeason(season)) judged = grantPathAward(judged, "best-new-table");
  const current = restaurantOf(judged);
  if (current === null) return judged;
  const [criticNights, rng] = rollCriticNights(judged.calendar.day, judged.rng);
  return withPath({ ...judged, rng }, { ...current, season: newSeason(judged.calendar.day), criticNights });
}

function closeWeek(state: GameState, endedDay: number, bill: number): GameState {
  if (!isWeekEnd(endedDay)) return state;
  const charged = recordMoney(state, "rent", bill);
  const path = charged.path;
  if (path === null) return charged;
  const first = path.lastWeek === null;
  const closed = withPath(charged, { ...path, lastWeek: path.week, week: emptyLedger(charged.calendar.day) });
  return path.kind === "restaurant" && first ? queueStoryTrigger(closed, "first-restaurant-week") : closed;
}

function rollTruckWeek(state: GameState): GameState {
  const truck = truckOf(state);
  if (truck === null || !isWeekStart(state.calendar.day)) return state;
  const [rolled, rng] = rollFestivalWeek(truck, state.calendar.day, state.rng);
  return withPath({ ...state, rng }, rolled);
}

export function pathNewDay(state: GameState, endedDay: number, bill: number): GameState {
  if (state.path === null) return state;
  return rollTruckWeek(judgeSeason(closeWeek(state, endedDay, bill)));
}
