import type { RngState } from "../../../engine/rng";
import { weekNumber } from "../../../engine/weekday";
import { PATH_RULES } from "../content/career";
import type { DishId } from "../content/dish";
import type { PathId } from "../content/path";
import { dishById } from "./catalog";
import { rollCriticNights } from "./critics";
import { fairPrice } from "./dishCost";
import { rollFestivalCycle, rollFestivalWeek } from "./festivalBoard";
import type { GameState } from "./gameState";
import { emptyLedger } from "./ledger";
import type { MenuDish, PathCommon, PathState, TruckState } from "./path";
import { STRONG_STARS } from "./rewards";
import { newSeason } from "./season";

function common(day: number): PathCommon {
  return {
    startDay: day,
    awards: [],
    community: 0,
    cleanStreak: 0,
    finished: false,
    week: emptyLedger(day),
    lastWeek: null,
  };
}

export function menuDish(dishId: DishId, par: number): MenuDish {
  return { dishId, price: fairPrice(dishById(dishId)), par };
}

function testedDishes(state: GameState): DishId[] {
  return state.platingCards.filter((card) => card.stars >= STRONG_STARS).map((card) => card.dishId);
}

export function createPath(
  state: GameState,
  path: PathId,
  nameCard: string,
  rng: RngState,
): [PathState, RngState] {
  const day = state.calendar.day;
  if (path === "restaurant") {
    const [criticNights, next] = rollCriticNights(day, rng);
    const menu = state.menu.map((dishId) => menuDish(dishId, PATH_RULES.defaultPar));
    return [
      {
        ...common(day),
        kind: "restaurant",
        nameCard,
        menu,
        team: [],
        carried: menu.map((entry) => ({ dishId: entry.dishId, count: entry.par })),
        criticNights,
        season: newSeason(day),
        reviews: [],
        notes: [],
        tonight: null,
        lastNight: null,
      },
      next,
    ];
  }
  if (path === "truck") {
    const [cycle, afterCycle] = rollFestivalCycle(rng);
    const truck: TruckState = {
      ...common(day),
      kind: "truck",
      menu: [],
      cycle,
      cycleIndex: 0,
      board: [],
      visited: [],
      ribbons: [],
      today: null,
      lastFestival: null,
    };
    return rollFestivalWeek(truck, day, afterCycle);
  }
  return [
    {
      ...common(day),
      kind: "tv",
      prep: null,
      segmentWeek: weekNumber(day),
      segmentsThisWeek: 0,
      strongSegments: 0,
      letters: [],
      tested: testedDishes(state),
      book: null,
      lastSegment: null,
    },
    rng,
  ];
}
