import type { ColourId } from "../../../engine/palette";
import { PAINT_COLOURS } from "../content/finish";
import { decorById, isDecorId } from "./catalog";
import type { GameState } from "./gameState";

export function decorIssues(state: GameState, decorId: string, paint: ColourId | null): string[] {
  if (!isDecorId(decorId)) return ["That decoration does not exist."];
  const decor = decorById(decorId);
  const issues: string[] = [];
  if (decor.showroomOnly && state.career !== "showroom") issues.push(`${decor.name} is for the showroom.`);
  if (state.decor.some((owned) => owned.id === decorId)) issues.push(`${decor.name} is already up.`);
  if (decor.takesPaint !== (paint !== null))
    issues.push(decor.takesPaint ? "Pick a paint colour." : "No paint needed.");
  if (paint !== null && !PAINT_COLOURS.includes(paint)) issues.push("That paint is not on the shelf.");
  if (state.coins < decor.price) issues.push(`${decor.name} costs ${decor.price} coins.`);
  return issues;
}

export function buyDecor(state: GameState, decorId: string, paint: ColourId | null): GameState {
  if (!isDecorId(decorId) || decorIssues(state, decorId, paint).length > 0) return state;
  return {
    ...state,
    coins: state.coins - decorById(decorId).price,
    decor: [...state.decor, { id: decorId, paint }],
  };
}
