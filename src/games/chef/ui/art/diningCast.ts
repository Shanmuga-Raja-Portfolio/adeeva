import type { AvatarLook, HairColourId } from "../../../../engine/avatar";
import { CLIENTS } from "../../content/client";
import type { DishId } from "../../content/dish";
import { dishById, staffById, type GameState, type RestaurantState } from "../../core";

export interface DiningCast {
  readonly menu: readonly string[];
  readonly dishes: readonly DishId[];
  readonly chef: AvatarLook;
  readonly staff: readonly AvatarLook[];
  readonly guests: readonly AvatarLook[];
  readonly note: string | null;
}

const DINER_HAIR: readonly HairColourId[] = ["auburn", "black", "brown", "blonde", "dark-brown"];

function varied(look: AvatarLook, index: number): AvatarLook {
  if (look.hairColour !== "platinum" || index % 3 === 0) return look;
  return { ...look, hairColour: DINER_HAIR[index % DINER_HAIR.length] ?? "brown" };
}

export function diningCast(state: GameState, restaurant: RestaurantState): DiningCast {
  const looks = CLIENTS.map((client) => client.look);
  const start = state.calendar.day % Math.max(1, looks.length);
  return {
    menu: restaurant.menu.map((entry) => dishById(entry.dishId).name),
    dishes: restaurant.menu.map((entry) => entry.dishId),
    chef: state.profile.look,
    staff: restaurant.team.flatMap((row) => {
      const member = staffById(row.staffId);
      return member === undefined ? [] : [member.look];
    }),
    guests: [...looks.slice(start), ...looks.slice(0, start)].map(varied),
    note: restaurant.notes[restaurant.notes.length - 1] ?? null,
  };
}
