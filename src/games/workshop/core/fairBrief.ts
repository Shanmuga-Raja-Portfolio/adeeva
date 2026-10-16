import type { DifficultyId } from "../../../engine/difficulty";
import { FAIR_CLIENT_ID } from "../content/client";
import type { FairBoothDef } from "../content/fairBooth";
import type { FairThemeDef } from "../content/fairTheme";
import type { SetTemplateDef } from "../content/setTemplate";
import type { Brief } from "./brief";
import { difficultyById } from "./catalog";

export function fairBrief(
  template: SetTemplateDef,
  theme: FairThemeDef | null,
  booth: FairBoothDef,
  difficulty: DifficultyId,
  fairDay: number,
): Brief {
  return {
    clientId: FAIR_CLIENT_ID,
    occasion:
      theme === null
        ? `${template.name} for the showroom floor`
        : `${template.name}: ${theme.name} at the ${booth.name}`,
    products: [...new Set(template.pieces)],
    deadlineDay: fairDay,
    budget: 0,
    fee: 0,
    requiredTags: theme === null ? [] : theme.tags,
    favouredColours: theme === null ? [] : theme.palette,
    avoidColours: [],
    avoidWoods: [],
    requiredExtras: [],
    minQuality: booth.readyMark + difficultyById(difficulty).minQualityBonus,
  };
}
