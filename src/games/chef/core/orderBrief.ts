import { drawInt } from "../../../engine/rngDraw";
import type { RngState } from "../../../engine/rng";
import type { ClientDef } from "../content/client";
import type { DishId } from "../content/dish";
import type { IngredientId } from "../content/ingredient";
import type { TasteTag } from "../content/tasteTag";

export interface OrderBrief {
  readonly clientId: string;
  readonly occasion: string;
  readonly dishCount: number;
  readonly cuisines: number;
  readonly requiredTags: readonly TasteTag[];
  readonly dishId: DishId | null;
  readonly avoid: readonly IngredientId[];
  readonly budget: number;
  readonly fee: number;
  readonly deadlineDay: number;
  readonly minQuality: number;
}

export interface OrderDish {
  readonly gigId: string;
  readonly runId: string;
  readonly dishId: DishId;
  readonly quality: number;
  readonly stars: number;
  readonly garnishMet: boolean;
  readonly colourCount: number;
}

export interface OrderRollContext {
  readonly day: number;
  readonly minQualityBonus: number;
  readonly hotTags: readonly TasteTag[];
}

export function rollOrderBrief(
  client: ClientDef,
  context: OrderRollContext,
  rng: RngState,
): [OrderBrief, RngState] {
  const template = client.order;
  const [budget, afterBudget] = drawInt(rng, template.budget[0], template.budget[1]);
  const [fee, afterFee] = drawInt(afterBudget, template.fee[0], template.fee[1]);
  const [days, afterDays] = drawInt(afterFee, template.deadlineDays[0], template.deadlineDays[1]);
  const hot = context.hotTags[0];
  const requiredTags = template.hotTag && hot !== undefined ? [hot] : template.requiredTags;
  return [
    {
      clientId: client.id,
      occasion: template.occasion,
      dishCount: template.dishCount,
      cuisines: template.cuisines,
      requiredTags,
      dishId: template.dishId,
      avoid: template.avoid,
      budget,
      fee,
      deadlineDay: context.day + days,
      minQuality: template.minQuality + context.minQualityBonus,
    },
    afterDays,
  ];
}
