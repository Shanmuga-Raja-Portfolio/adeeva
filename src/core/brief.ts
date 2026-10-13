import type { ClientDef, TrimRequirement } from "../content/client";
import type { ColourId } from "../content/colour";
import type { MaterialId } from "../content/material";
import type { ShowThemeDef } from "../content/showTheme";
import type { StyleTag } from "../content/styleTag";
import type { RngState } from "./rng";
import { drawDistinct, drawInt } from "./rngDraw";

export const FAVOURED_COLOURS_PER_BRIEF = 2;

export interface Brief {
  readonly clientId: string | null;
  readonly themeId: string | null;
  readonly occasion: string;
  readonly deadlineDay: number;
  readonly budget: number;
  readonly fee: number;
  readonly requiredTags: readonly StyleTag[];
  readonly favouredColours: readonly ColourId[];
  readonly avoidColours: readonly ColourId[];
  readonly avoidMaterials: readonly MaterialId[];
  readonly requiredTrims: readonly TrimRequirement[];
  readonly minQuality: number;
}

export function rollClientBrief(
  client: ClientDef,
  day: number,
  rng: RngState,
  minQualityBonus: number,
): [Brief, RngState] {
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
      themeId: null,
      occasion: template.occasion,
      deadlineDay: day + deadlineDays,
      budget,
      fee,
      requiredTags: template.requiredTags,
      favouredColours,
      avoidColours: template.avoidColours,
      avoidMaterials: template.avoidMaterials,
      requiredTrims: template.requiredTrims,
      minQuality: template.minQuality + minQualityBonus,
    },
    afterColours,
  ];
}

export function themeBrief(theme: ShowThemeDef, deadlineDay: number, minQuality: number): Brief {
  return {
    clientId: null,
    themeId: theme.id,
    occasion: `${theme.name} collection look`,
    deadlineDay,
    budget: theme.budget,
    fee: 0,
    requiredTags: theme.requiredTags,
    favouredColours: theme.palette,
    avoidColours: [],
    avoidMaterials: [],
    requiredTrims: [],
    minQuality,
  };
}
