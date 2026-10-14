import type { ColourId, MaterialId } from "../../../engine/palette";
import type { RngState } from "../../../engine/rng";
import { drawDistinct, drawInt } from "../../../engine/rngDraw";
import type { StyleTag } from "../../../engine/styleTag";
import type { ClientDef, FinishRequirement } from "../content/client";
import type { RecipeId } from "../content/recipe";
import { recipeById } from "./catalog";
import { recipeFitKeys, type Design } from "./design";

export const FAVOURED_COLOURS_PER_BRIEF = 2;

export interface Brief {
  readonly clientId: string;
  readonly occasion: string;
  readonly deadlineDay: number;
  readonly budget: number;
  readonly fee: number;
  readonly recipes: readonly RecipeId[];
  readonly partIds: readonly string[] | null;
  readonly requiredTags: readonly StyleTag[];
  readonly favouredColours: readonly ColourId[];
  readonly avoidColours: readonly ColourId[];
  readonly avoidMaterials: readonly MaterialId[];
  readonly requiredFinishes: readonly FinishRequirement[];
  readonly minQuality: number;
  readonly minLeaves: number;
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
      occasion: template.occasion,
      deadlineDay: day + deadlineDays,
      budget,
      fee,
      recipes: template.recipes,
      partIds: template.partIds,
      requiredTags: template.requiredTags,
      favouredColours,
      avoidColours: template.avoidColours,
      avoidMaterials: template.avoidMaterials,
      requiredFinishes: template.requiredFinishes,
      minQuality: template.minQuality + minQualityBonus,
      minLeaves: template.minLeaves,
    },
    afterColours,
  ];
}

function partsAllowed(brief: Brief, key: string): boolean {
  const { partIds } = brief;
  if (partIds === null) return true;
  const parts = key.split(":")[1]?.split("+") ?? [];
  return parts.every((partId) => partIds.includes(partId));
}

export function briefFitKeys(brief: Brief): string[] {
  return brief.recipes.flatMap((recipeId) =>
    recipeFitKeys(recipeById(recipeId)).filter((key) => partsAllowed(brief, key)),
  );
}

export function designBriefIssue(brief: Brief | null, design: Design): string | null {
  if (brief === null || design.recipeId === null) return null;
  if (!brief.recipes.includes(design.recipeId)) return "This client asked for something else.";
  const { partIds } = brief;
  if (partIds === null) return null;
  const outside = Object.values(design.parts).some((partId) => !partIds.includes(partId));
  return outside ? "This client asked for a different shape." : null;
}
