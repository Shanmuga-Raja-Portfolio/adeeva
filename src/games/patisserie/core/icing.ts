import { colourById } from "../../../engine/palette";
import type { IngredientId } from "../content/ingredient";
import { gelColours, icingIngredients } from "./bakeNeeds";
import type { BakeRun } from "./bakeRun";
import { GEL_USE_VALUE, ingredientValue } from "./bakeSpend";
import { ingredientById } from "./catalog";
import type { GameState } from "./gameState";

function icingEntries(run: BakeRun): [IngredientId, number][] {
  return Object.entries(icingIngredients(run.design)) as [IngredientId, number][];
}

export function icingIssues(state: GameState, run: BakeRun): string[] {
  if (run.iced || run.purpose.kind === "tray") return [];
  const missing = icingEntries(run)
    .filter(([id, amount]) => state.pantry.ingredients[id] < amount)
    .map(
      ([id, amount]) =>
        `The icing needs ${amount - state.pantry.ingredients[id]} g more ${ingredientById(id).name}.`,
    );
  const gels = gelColours(run.design.colours)
    .filter((colour) => (state.pantry.gels[colour] ?? 0) < 1)
    .map((colour) => `Buy a pot of ${colourById(colour).name} icing gel.`);
  return [...missing, ...gels];
}

export function applyIcing(state: GameState, run: BakeRun): GameState | null {
  if (run.iced || run.purpose.kind === "tray") return state;
  if (icingIssues(state, run).length > 0) return null;
  const ingredients = { ...state.pantry.ingredients };
  let value = 0;
  for (const [id, amount] of icingEntries(run)) {
    ingredients[id] -= amount;
    value += ingredientValue(id, amount);
  }
  const gels = { ...state.pantry.gels };
  for (const colour of gelColours(run.design.colours)) {
    gels[colour] = (gels[colour] ?? 0) - 1;
    value += GEL_USE_VALUE;
  }
  return {
    ...state,
    pantry: { ...state.pantry, ingredients, gels },
    activeRun: { ...run, iced: true, ingredientValue: run.ingredientValue + value },
  };
}
