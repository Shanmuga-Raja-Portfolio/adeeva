import type { ColourId } from "../../../engine/palette";
import type { FillingId } from "../content/filling";
import type { IngredientId } from "../content/ingredient";
import type { MixDef } from "../content/mix";
import type { ToppingId } from "../content/topping";
import type { BakeDesign, BakeRun } from "./bakeRun";
import { mixById, productById } from "./catalog";

export const BUTTERCREAM_BUTTER = 125;
export const BUTTERCREAM_ICING_SUGAR = 250;
export const FREE_ICING_COLOUR: ColourId = "ivory";

export interface RunNeeds {
  readonly ingredients: Readonly<Partial<Record<IngredientId, number>>>;
  readonly gels: readonly ColourId[];
  readonly fillings: Readonly<Partial<Record<FillingId, number>>>;
  readonly toppings: Readonly<Partial<Record<ToppingId, number>>>;
}

export function designMixes(design: BakeDesign): MixDef[] {
  return design.mixIds.flatMap((id) => (id === null ? [] : [mixById(id)]));
}

export function designFilling(design: BakeDesign): FillingId | null {
  if (design.productId === null) return null;
  const rule = productById(design.productId).filling;
  return rule.kind === "fixed" ? rule.filling : design.fillingId;
}

export function gelColours(colours: readonly ColourId[]): ColourId[] {
  return colours.filter((colour) => colour !== FREE_ICING_COLOUR);
}

export function icingIngredients(design: BakeDesign): Partial<Record<IngredientId, number>> {
  if (design.productId === null) return {};
  const product = productById(design.productId);
  if (product.frostedUnits === 0) return {};
  const icingSugar = BUTTERCREAM_ICING_SUGAR * product.frostedUnits;
  return product.icingOnly
    ? { "icing-sugar": icingSugar }
    : { butter: BUTTERCREAM_BUTTER * product.frostedUnits, "icing-sugar": icingSugar };
}

function add(
  totals: Partial<Record<IngredientId, number>>,
  ingredient: IngredientId,
  amount: number,
): Partial<Record<IngredientId, number>> {
  return amount <= 0 ? totals : { ...totals, [ingredient]: (totals[ingredient] ?? 0) + amount };
}

export function runNeeds(run: BakeRun): RunNeeds {
  const order = run.purpose.kind === "order";
  let ingredients: Partial<Record<IngredientId, number>> = {};
  run.design.mixIds.forEach((mixId, index) => {
    if (mixId === null || run.batches[index]?.committed === true) return;
    const mix = mixById(mixId);
    for (const amount of mix.weighed) ingredients = add(ingredients, amount.ingredient, amount.grams);
    ingredients = add(ingredients, "eggs", mix.eggs);
  });
  if (order && !run.iced)
    for (const [ingredient, amount] of Object.entries(icingIngredients(run.design)) as [
      IngredientId,
      number,
    ][])
      ingredients = add(ingredients, ingredient, amount);
  const filling = designFilling(run.design);
  const jars = run.design.productId === null ? 0 : productById(run.design.productId).fillingJars;
  const fillings: Partial<Record<FillingId, number>> =
    order && filling !== null && !run.filled ? { [filling]: jars } : {};
  const toppings: Partial<Record<ToppingId, number>> = {};
  if (order && run.brief !== null)
    for (const requirement of run.brief.requiredToppings)
      toppings[requirement.topping] = (toppings[requirement.topping] ?? 0) + requirement.count;
  return {
    ingredients,
    gels: order && !run.iced ? gelColours(run.design.colours) : [],
    fillings,
    toppings,
  };
}
