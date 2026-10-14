import type { DifficultyId } from "../../../engine/difficulty";
import { FAIR_CLIENT_ID } from "../content/client";
import type { FairTentDef } from "../content/fairTent";
import type { FairThemeDef } from "../content/fairTheme";
import type { Brief } from "./brief";
import { difficultyById } from "./catalog";

export function fairBrief(
  theme: FairThemeDef,
  tent: FairTentDef,
  difficulty: DifficultyId,
  fairDay: number,
): Brief {
  return {
    clientId: FAIR_CLIENT_ID,
    occasion: `${theme.name} at the ${tent.name}`,
    products: tent.products,
    deadlineDay: fairDay,
    budget: tent.budget,
    fee: 0,
    requiredTags: theme.tags,
    requiredMixes: [],
    avoidMixes: [],
    favouredColours: theme.palette,
    avoidColours: [],
    requiredToppings: [{ topping: theme.topping, count: tent.themeToppings }],
    minColours: 0,
    minQuality: tent.readyMark + difficultyById(difficulty).minQualityBonus,
  };
}
