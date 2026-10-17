import { sameList } from "../../../engine/sameList";
import type { RngState } from "../../../engine/rng";
import { drawDistinct, drawInt } from "../../../engine/rngDraw";
import type { ClientDef, ExtraRequirement } from "../content/client";
import type { JewelColour } from "../content/jewelColour";
import type { JewelTag } from "../content/jewelTag";
import type { MetalId } from "../content/metal";
import type { StoneId } from "../content/stone";
import type { ProductId } from "../content/product";
import type { DesignOptions } from "./pieceLook";

export const FAVOURED_COLOURS_PER_BRIEF = 2;

export interface DesignPreset {
  readonly options: DesignOptions;
  readonly metalId: MetalId;
  readonly stoneId: StoneId | null;
}

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
  readonly preset: DesignPreset | null;
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
      preset: null,
    },
    afterColours,
  ];
}

function samePreset(a: DesignPreset | null, b: DesignPreset | null): boolean {
  if (a === null || b === null) return a === b;
  return (
    a.metalId === b.metalId &&
    a.stoneId === b.stoneId &&
    a.options.shape === b.options.shape &&
    a.options.band === b.options.band &&
    a.options.accent === b.options.accent
  );
}

export function sameBrief(a: Brief, b: Brief): boolean {
  return (
    a.clientId === b.clientId &&
    a.occasion === b.occasion &&
    a.productId === b.productId &&
    a.deadlineDay === b.deadlineDay &&
    a.budget === b.budget &&
    a.fee === b.fee &&
    a.minQuality === b.minQuality &&
    samePreset(a.preset, b.preset) &&
    sameList(a.requiredTags, b.requiredTags) &&
    sameList(a.favouredColours, b.favouredColours) &&
    sameList(a.avoidColours, b.avoidColours) &&
    sameList(a.avoidMetals, b.avoidMetals) &&
    sameList(a.requiredExtras, b.requiredExtras, (x, y) => x.extraId === y.extraId && x.count === y.count)
  );
}
