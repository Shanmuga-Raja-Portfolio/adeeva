import type { RngState } from "../../../engine/rng";
import { drawDistinct, drawInt } from "../../../engine/rngDraw";
import type { ClientDef } from "../content/client";
import type { ExtraNeed } from "../content/extra";
import type { ProductId } from "../content/product";
import type { ShadeId } from "../content/shade";
import type { WoodId } from "../content/wood";
import type { WoodTag } from "../content/woodTag";

export const FAVOURED_COLOURS_PER_BRIEF = 2;

export interface Brief {
  readonly clientId: string;
  readonly occasion: string;
  readonly products: readonly ProductId[];
  readonly deadlineDay: number;
  readonly budget: number;
  readonly fee: number;
  readonly requiredTags: readonly WoodTag[];
  readonly favouredColours: readonly ShadeId[];
  readonly avoidColours: readonly ShadeId[];
  readonly avoidWoods: readonly WoodId[];
  readonly requiredExtras: readonly ExtraNeed[];
  readonly minQuality: number;
}

export function rollClientBrief(
  client: ClientDef,
  day: number,
  minQualityBonus: number,
  rng: RngState,
): [Brief, RngState] {
  const template = client.brief;
  const [budget, afterBudget] = drawInt(rng, template.budget[0], template.budget[1]);
  const [fee, afterFee] = drawInt(afterBudget, template.fee[0], template.fee[1]);
  const [days, afterDays] = drawInt(afterFee, template.deadlineDays[0], template.deadlineDays[1]);
  const [favouredColours, afterColours] = drawDistinct(
    afterDays,
    template.favouredColours,
    FAVOURED_COLOURS_PER_BRIEF,
  );
  return [
    {
      clientId: client.id,
      occasion: template.occasion,
      products: template.products,
      deadlineDay: day + days,
      budget,
      fee,
      requiredTags: template.requiredTags,
      favouredColours,
      avoidColours: template.avoidColours,
      avoidWoods: template.avoidWoods,
      requiredExtras: template.requiredExtras,
      minQuality: template.minQuality + minQualityBonus,
    },
    afterColours,
  ];
}
