import { sameFields } from "../../../engine/sameFields";
import { sameList } from "../../../engine/sameList";
import { PATH_RULES } from "../content/career";
import { CUISINE_IDS } from "../content/cuisine";
import type { DishId } from "../content/dish";
import { cueCardById, dishById, festivalById, staffById } from "./catalog";
import { dishAppeal } from "./dishDemand";
import { fairPrice } from "./dishCost";
import { festivalToday } from "./festivalBoard";
import type { GameState } from "./gameState";
import { unlockedDishes } from "./mastery";
import { withPath, type MenuDish, type RestaurantState, type ShiftRow, type TruckState } from "./path";
import { SERVICE_NIGHTS } from "./pathCalendar";
import { menuReady, setPathMenu } from "./pathMenu";
import { forecastNight } from "./restaurantNight";
import { hireableHelpers, teamStaff } from "./staffing";
import { forecastFestival } from "./truckDay";

export const HOLLIS_MENU_SIZE = 6;
export const HOLLIS_COOKS = 2;

export function hollisIssue(state: GameState, desk: string): string | null {
  const path = state.path;
  if (state.profile.difficulty !== "relaxed") return "Hollis helps on Relaxed.";
  if (path === null) return "Hollis helps once your path begins.";
  if (desk === "team") return path.kind === "restaurant" ? busyIssue(path) : "Only a restaurant has a team.";
  if (desk === "cues") return path.kind === "tv" && path.prep !== null ? null : "Prepare a segment first.";
  if (desk !== "menu" && desk !== "ready") return "Hollis doesn't know that desk.";
  if (path.kind === "tv") return "The studio has no menu.";
  return busyIssue(path);
}

function busyIssue(path: RestaurantState | TruckState): string | null {
  const open = path.kind === "restaurant" ? path.tonight : path.today;
  return open === null ? null : "Finish tonight's service first.";
}

function starterMenu(state: GameState, size: number, crowd: readonly string[]): DishId[] {
  const unlocked = unlockedDishes(state.mastery);
  const ranked = [...unlocked].sort(
    (a, b) =>
      b.tags.filter((tag) => crowd.includes(tag)).length - a.tags.filter((tag) => crowd.includes(tag)).length,
  );
  const picked: DishId[] = [];
  for (let round = 0; picked.length < size && round < unlocked.length; round += 1)
    for (const cuisine of CUISINE_IDS) {
      const next = ranked.find((dish) => dish.cuisine === cuisine && !picked.includes(dish.id));
      if (next !== undefined && picked.length < size) picked.push(next.id);
    }
  return picked;
}

function fairMenu(menu: readonly MenuDish[]): MenuDish[] {
  return menu.map((entry) => ({ ...entry, price: fairPrice(dishById(entry.dishId)) }));
}

function withMenu(state: GameState, path: RestaurantState | TruckState, menu: MenuDish[]): GameState {
  return sameList(path.menu, menu, sameFields) ? state : withPath(state, { ...path, menu });
}

function sameRow(a: ShiftRow, b: ShiftRow): boolean {
  return a.staffId === b.staffId && sameList(a.nights, b.nights);
}

function hollisMenu(state: GameState): GameState {
  const path = state.path;
  if (path === null || path.kind === "tv") return state;
  const crowd = path.kind === "truck" ? (festivalToday(path, state.calendar.day)?.festivalId ?? null) : null;
  const tags = crowd === null ? [] : festivalById(crowd).tags;
  const size = path.kind === "truck" ? PATH_RULES.truckMenu : HOLLIS_MENU_SIZE;
  const written = menuReady(state) === null ? state : setPathMenu(state, starterMenu(state, size, tags));
  const current = written.path;
  if (current === null || current.kind === "tv") return written;
  return withMenu(written, current, fairMenu(current.menu));
}

function truckSplit(state: GameState, truck: TruckState): MenuDish[] {
  const plan = forecastFestival(state, truck);
  const slot = festivalToday(truck, state.calendar.day);
  const tags = slot === null ? [] : festivalById(slot.festivalId).tags;
  const weights = truck.menu.map((entry, index) =>
    plan === null ? dishAppeal(state, entry.dishId, tags) : Math.max(1, plan.dishes[index]?.wanted ?? 0),
  );
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const counts = weights.map((weight) => Math.floor((PATH_RULES.fridge * weight) / total));
  return truck.menu.map((entry, index) => ({ ...entry, par: counts[index] ?? 0 }));
}

function hollisReady(state: GameState): GameState {
  const path = state.path;
  if (path === null || path.kind === "tv") return state;
  if (path.kind === "truck") return withMenu(state, path, truckSplit(state, path));
  const plan = forecastNight(state, path, state.calendar.day);
  const menu = path.menu.map((entry, index) => ({
    ...entry,
    par: Math.min(PATH_RULES.parMax, plan.dishes[index]?.wanted ?? 0),
  }));
  return withMenu(state, path, menu);
}

function hollisTeam(state: GameState): GameState {
  const path = state.path;
  if (path === null || path.kind !== "restaurant") return state;
  const cooks = path.team.filter((row) => hireableHelpers().some((member) => member.id === row.staffId));
  const extra = hireableHelpers()
    .filter((member) => !path.team.some((row) => row.staffId === member.id))
    .slice(0, Math.max(0, Math.min(HOLLIS_COOKS - cooks.length, PATH_RULES.maxTeam - path.team.length)))
    .map((member) => ({ staffId: member.id, nights: [] as number[] }));
  const hired = [...path.team, ...extra];
  const frontOfHouse = hired.some((row) => staffById(row.staffId)?.role !== "cook");
  const host = teamStaff().find(
    (member) => member.role === "host" && !hired.some((row) => row.staffId === member.id),
  );
  const team =
    frontOfHouse || host === undefined || hired.length >= PATH_RULES.maxTeam
      ? hired
      : [...hired, { staffId: host.id, nights: [] as number[] }];
  const cookIds = team.filter((row) => hireableHelpers().some((member) => member.id === row.staffId));
  const scheduled = team.map((row) => {
    const cookIndex = cookIds.findIndex((entry) => entry.staffId === row.staffId);
    if (cookIndex === -1) return { ...row, nights: SERVICE_NIGHTS.slice(0, PATH_RULES.maxNights) };
    const nights = SERVICE_NIGHTS.filter((_, index) => index % cookIds.length === cookIndex % cookIds.length);
    const fill = SERVICE_NIGHTS.filter((night) => !nights.includes(night));
    return { ...row, nights: [...nights, ...fill].slice(0, PATH_RULES.maxNights).sort((a, b) => a - b) };
  });
  return sameList(path.team, scheduled, sameRow) ? state : withPath(state, { ...path, team: scheduled });
}

function hollisCues(state: GameState): GameState {
  const path = state.path;
  if (path === null || path.kind !== "tv" || path.prep === null) return state;
  const prep = path.prep;
  const tips = prep.cues.map((cue) => cueCardById(cue).tips.findIndex((tip) => tip.kind));
  if (sameList(prep.order, prep.cues) && sameList(prep.tips, tips)) return state;
  return withPath(state, { ...path, prep: { ...prep, order: [...prep.cues], tips } });
}

export function askHollis(state: GameState, desk: string): GameState {
  if (hollisIssue(state, desk) !== null) return state;
  if (desk === "menu") return hollisMenu(state);
  if (desk === "ready") return hollisReady(state);
  return desk === "team" ? hollisTeam(state) : hollisCues(state);
}
