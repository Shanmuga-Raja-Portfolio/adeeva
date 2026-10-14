import { colourById } from "../../../engine/palette";
import type { IngredientId } from "../content/ingredient";
import { decorationIngredients, gelColours, runIcingColours } from "./bakeNeeds";
import { isIcedBake, type BakeRun } from "./bakeRun";
import { GEL_USE_VALUE, ingredientValue } from "./bakeSpend";
import { ingredientById } from "./catalog";
import type { GameState } from "./gameState";

function icingEntries(run: BakeRun): [IngredientId, number][] {
  return Object.entries(decorationIngredients(run)) as [IngredientId, number][];
}

export function icingIssues(state: GameState, run: BakeRun): string[] {
  if (run.iced || !isIcedBake(run)) return [];
  const missing = icingEntries(run)
    .filter(([id, amount]) => state.pantry.ingredients[id] < amount)
    .map(
      ([id, amount]) =>
        `The decorating needs ${amount - state.pantry.ingredients[id]} g more ${ingredientById(id).name}.`,
    );
  const gels = gelColours(runIcingColours(run))
    .filter((colour) => (state.pantry.gels[colour] ?? 0) < 1)
    .map((colour) => `Buy a pot of ${colourById(colour).name} icing gel.`);
  return [...missing, ...gels];
}

export function applyIcing(state: GameState, run: BakeRun): GameState | null {
  if (run.iced || !isIcedBake(run)) return state;
  if (icingIssues(state, run).length > 0) return null;
  const ingredients = { ...state.pantry.ingredients };
  let value = 0;
  for (const [id, amount] of icingEntries(run)) {
    ingredients[id] -= amount;
    value += ingredientValue(id, amount);
  }
  const gels = { ...state.pantry.gels };
  for (const colour of gelColours(runIcingColours(run))) {
    gels[colour] = (gels[colour] ?? 0) - 1;
    value += GEL_USE_VALUE;
  }
  return {
    ...state,
    pantry: { ...state.pantry, ingredients, gels },
    activeRun: { ...run, iced: true, ingredientValue: run.ingredientValue + value },
  };
}
