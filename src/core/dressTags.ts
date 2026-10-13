import { COLOURS, type ColourId } from "../content/colour";
import { MATERIAL_IDS, type MaterialId } from "../content/material";
import { STYLE_TAGS, type StyleTag } from "../content/styleTag";
import { fabricById, partById, trimById } from "./catalog";
import { fabricsNeedingCut } from "./designFabrics";
import type { Decoration, Design, PiecePlacement } from "./dressRun";
import { earnsBiasBonus } from "./grainScore";
import { requiredPieces } from "./requiredPieces";

export const BIAS_DRAPE_TAG: StyleTag = "dreamy";

export function hasBiasDrape(design: Design, placements: Readonly<Record<string, PiecePlacement>>): boolean {
  return requiredPieces(design).some((entry) => {
    const placement = placements[entry.piece.id];
    return placement !== undefined && earnsBiasBonus(entry.piece, placement.rotation);
  });
}

function usedFabrics(design: Design) {
  return fabricsNeedingCut(design).flatMap((id) => {
    const fabric = fabricById(id);
    return fabric === undefined ? [] : [fabric];
  });
}

function orderedTags(tags: readonly StyleTag[]): StyleTag[] {
  const present = new Set<StyleTag>(tags);
  return STYLE_TAGS.filter((tag) => present.has(tag));
}

export function garmentTags(design: Design): StyleTag[] {
  const partTags = Object.values(design.parts).flatMap((partId) =>
    partId === null ? [] : (partById(partId)?.tags ?? []),
  );
  const fabricTags = usedFabrics(design).flatMap((fabric) => fabric.tags);
  return orderedTags([...partTags, ...fabricTags]);
}

export function dressTags(
  design: Design,
  placements: Readonly<Record<string, PiecePlacement>>,
  decorations: readonly Decoration[],
): StyleTag[] {
  const trimTags = decorations.flatMap((decoration) => trimById(decoration.trimId).tags);
  const drapeTags = hasBiasDrape(design, placements) ? [BIAS_DRAPE_TAG] : [];
  return orderedTags([...garmentTags(design), ...trimTags, ...drapeTags]);
}

export function dressColours(design: Design): ColourId[] {
  const present = new Set(usedFabrics(design).map((fabric) => fabric.colour));
  return COLOURS.map((colour) => colour.id).filter((id) => present.has(id));
}

export function dressMaterials(design: Design): MaterialId[] {
  const present = new Set(usedFabrics(design).map((fabric) => fabric.material));
  return MATERIAL_IDS.filter((id) => present.has(id));
}
