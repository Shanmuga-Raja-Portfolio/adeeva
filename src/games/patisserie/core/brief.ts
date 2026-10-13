import { COLOURS, type ColourId } from "../../../engine/palette";
import type { RngState } from "../../../engine/rng";
import { drawDistinct, drawInt } from "../../../engine/rngDraw";
import type { StyleTag } from "../../../engine/styleTag";
import type { ClientDef, ToppingRequirement } from "../content/client";
import type { MixId } from "../content/mix";
import type { ProductId } from "../content/product";

export const FAVOURED_COLOURS_PER_BRIEF = 2;

export interface Brief {
  readonly clientId: string;
  readonly occasion: string;
  readonly products: readonly ProductId[];
  readonly deadlineDay: number;
  readonly budget: number;
  readonly fee: number;
  readonly requiredTags: readonly StyleTag[];
  readonly requiredMixes: readonly MixId[];
  readonly avoidMixes: readonly MixId[];
  readonly favouredColours: readonly ColourId[];
  readonly avoidColours: readonly ColourId[];
  readonly requiredToppings: readonly ToppingRequirement[];
  readonly minQuality: number;
}

export interface BriefRoll {
  readonly day: number;
  readonly minQualityBonus: number;
  readonly hotTags: readonly StyleTag[];
}

const ALL_COLOURS: readonly ColourId[] = COLOURS.map((colour) => colour.id);

export function rollClientBrief(client: ClientDef, roll: BriefRoll, rng: RngState): [Brief, RngState] {
  const template = client.brief;
  const [budget, afterBudget] = drawInt(rng, template.budget[0], template.budget[1]);
  const [fee, afterFee] = drawInt(afterBudget, template.fee[0], template.fee[1]);
  const [deadlineDays, afterDeadline] = drawInt(afterFee, template.deadlineDays[0], template.deadlineDays[1]);
  const palette = template.favouredColours === "any" ? ALL_COLOURS : template.favouredColours;
  const [favouredColours, afterColours] = drawDistinct(afterDeadline, palette, FAVOURED_COLOURS_PER_BRIEF);
  const hotTag = roll.hotTags[0];
  const requiredTags = template.wantsHotTag && hotTag !== undefined ? [hotTag] : template.requiredTags;
  return [
    {
      clientId: client.id,
      occasion: template.occasion,
      products: template.products,
      deadlineDay: roll.day + deadlineDays,
      budget,
      fee,
      requiredTags,
      requiredMixes: template.requiredMixes,
      avoidMixes: template.avoidMixes,
      favouredColours,
      avoidColours: template.avoidColours,
      requiredToppings: template.requiredToppings,
      minQuality: template.minQuality + roll.minQualityBonus,
    },
    afterColours,
  ];
}
