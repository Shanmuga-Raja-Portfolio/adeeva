import { PATH_RULES } from "../content/career";
import type { StaffDef } from "../content/staff";
import { staffById } from "./catalog";
import type { GameState } from "./gameState";
import { restaurantOf, withPath, type RestaurantState, type ShiftRow } from "./path";
import { SERVICE_NIGHTS } from "./pathCalendar";
import { teamStaff } from "./staffing";

export function onShift(restaurant: Pick<RestaurantState, "team">, night: number): StaffDef[] {
  return restaurant.team.flatMap((row) => {
    const member = staffById(row.staffId);
    return member !== undefined && row.nights.includes(night) ? [member] : [];
  });
}

export function cooksOnShift(restaurant: Pick<RestaurantState, "team">, night: number): StaffDef[] {
  return onShift(restaurant, night).filter((member) => member.role === "cook");
}

export function nightsWithoutCook(restaurant: Pick<RestaurantState, "team">): number[] {
  return SERVICE_NIGHTS.filter((night) => cooksOnShift(restaurant, night).length === 0);
}

function busy(restaurant: RestaurantState): string | null {
  return restaurant.tonight === null ? null : "Finish tonight's service first.";
}

export function hireIssue(state: GameState, staffId: string): string | null {
  const restaurant = restaurantOf(state);
  if (restaurant === null) return "Only a restaurant hires a team.";
  if (!teamStaff().some((member) => member.id === staffId)) return "That person is not looking for work.";
  if (restaurant.team.some((row) => row.staffId === staffId)) return "They are already on your team.";
  if (restaurant.team.length >= PATH_RULES.maxTeam) return `A team of ${PATH_RULES.maxTeam} is plenty.`;
  return busy(restaurant);
}

export function hireStaff(state: GameState, staffId: string): GameState {
  const restaurant = restaurantOf(state);
  if (restaurant === null || hireIssue(state, staffId) !== null) return state;
  return withPath(state, { ...restaurant, team: [...restaurant.team, { staffId, nights: [] }] });
}

export function partWays(state: GameState, staffId: string): GameState {
  const restaurant = restaurantOf(state);
  if (restaurant === null || busy(restaurant) !== null) return state;
  if (!restaurant.team.some((row) => row.staffId === staffId)) return state;
  return withPath(state, { ...restaurant, team: restaurant.team.filter((row) => row.staffId !== staffId) });
}

export function shiftIssue(state: GameState, staffId: string, night: number): string | null {
  const restaurant = restaurantOf(state);
  if (restaurant === null) return "Only a restaurant has a schedule.";
  const row = restaurant.team.find((entry) => entry.staffId === staffId);
  if (row === undefined) return "Hire them first.";
  if (!SERVICE_NIGHTS.some((entry) => entry === night)) return "Pick a service night.";
  if (!row.nights.includes(night) && row.nights.length >= PATH_RULES.maxNights)
    return `Nobody works more than ${PATH_RULES.maxNights} nights a week.`;
  return busy(restaurant);
}

function toggled(row: ShiftRow, night: number): ShiftRow {
  const nights = row.nights.includes(night)
    ? row.nights.filter((entry) => entry !== night)
    : [...row.nights, night].sort((a, b) => a - b);
  return { ...row, nights };
}

export function toggleShift(state: GameState, staffId: string, night: number): GameState {
  const restaurant = restaurantOf(state);
  if (restaurant === null || shiftIssue(state, staffId, night) !== null) return state;
  const team = restaurant.team.map((row) => (row.staffId === staffId ? toggled(row, night) : row));
  return withPath(state, { ...restaurant, team });
}

export function teamPayFor(restaurant: Pick<RestaurantState, "team">, night: number): number {
  return onShift(restaurant, night).reduce((sum, member) => sum + member.wage, 0);
}
