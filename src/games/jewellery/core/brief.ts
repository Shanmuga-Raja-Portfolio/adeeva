import type { RngState } from "../../../engine/rng";
import { drawDistinct, drawInt } from "../../../engine/rngDraw";
import type { ClientDef, ExtraRequirement } from "../content/client";
import type { JewelColour } from "../content/jewelColour";
import type { JewelTag } from "../content/jewelTag";
import type { MetalId } from "../content/metal";
import type { ProductId } from "../content/product";

export const FAVOURED_COLOURS_PER_BRIEF = 2;

export interface Brief {
  readonly clientId: string;
  readonly occasion: string;
  readonly productId: ProductId;
  readonly deadlineDay: number;
  readonly budget: number;
  readonly fee: number;
  readonly requiredTags: readonly JewelTag[];
  readonly favouredColours: readonly JewelColour[];
  readonly avoidColours: readonly JewelColour[];
  readonly avoidMetals: readonly MetalId[];
  readonly requiredExtras: readonly ExtraRequirement[];
  readonly minQuality: number;
}

export interface BriefRoll {
  readonly day: number;
  readonly minQualityBonus: number;
}

export function rollClientBrief(client: ClientDef, roll: BriefRoll, rng: RngState): [Brief, RngState] {
  const template = client.brief;
  const [budget, afterBudget] = drawInt(rng, template.budget[0], template.budget[1]);
  const [fee, afterFee] = drawInt(afterBudget, template.fee[0], template.fee[1]);
  const [deadlineDays, afterDeadline] = drawInt(afterFee, template.deadlineDays[0], template.deadlineDays[1]);
  const [favouredColours, afterColours] = drawDistinct(
    afterDeadline,
    template.favouredColours,
    FAVOURED_COLOURS_PER_BRIEF,
  );
  return [
    {
      clientId: client.id,
      occasion: template.occasion,
      productId: template.productId,
      deadlineDay: roll.day + deadlineDays,
      budget,
      fee,
      requiredTags: template.requiredTags,
      favouredColours,
      avoidColours: template.avoidColours,
      avoidMetals: template.avoidMetals,
      requiredExtras: template.requiredExtras,
      minQuality: template.minQuality + roll.minQualityBonus,
    },
    afterColours,
  ];
}

function sameList<T>(a: readonly T[], b: readonly T[], same: (x: T, y: T) => boolean): boolean {
  return (
    a.length === b.length &&
    a.every((entry, index) => {
      const other = b[index];
      return other !== undefined && same(entry, other);
    })
  );
}

const identical = <T>(x: T, y: T): boolean => x === y;

export function sameBrief(a: Brief, b: Brief): boolean {
  return (
    a.clientId === b.clientId &&
    a.occasion === b.occasion &&
    a.productId === b.productId &&
    a.deadlineDay === b.deadlineDay &&
    a.budget === b.budget &&
    a.fee === b.fee &&
    a.minQuality === b.minQuality &&
    sameList(a.requiredTags, b.requiredTags, identical) &&
    sameList(a.favouredColours, b.favouredColours, identical) &&
    sameList(a.avoidColours, b.avoidColours, identical) &&
    sameList(a.avoidMetals, b.avoidMetals, identical) &&
    sameList(a.requiredExtras, b.requiredExtras, (x, y) => x.extraId === y.extraId && x.count === y.count)
  );
}
