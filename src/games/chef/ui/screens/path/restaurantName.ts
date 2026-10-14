import { nameCardById, type GameState } from "../../../core";

export function nameCardTitle(cardId: string, playerName: string): string {
  return nameCardById(cardId)?.title.replace("{name}", playerName) ?? "";
}

export function restaurantName(state: GameState): string {
  const path = state.path;
  return path === null || path.kind !== "restaurant" ? "" : nameCardTitle(path.nameCard, state.profile.name);
}
