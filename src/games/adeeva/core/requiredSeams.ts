import { PART_CATEGORIES, type PartCategory, type SeamDef } from "../content/garmentPart";
import { partById } from "./catalog";
import type { Design } from "./dressRun";

export interface RequiredSeam {
  readonly seam: SeamDef;
  readonly category: PartCategory;
  readonly partId: string;
  readonly fabricId: string | null;
}

export function requiredSeams(design: Design): RequiredSeam[] {
  return PART_CATEGORIES.flatMap((category) => {
    const partId = design.parts[category];
    const part = partId === null ? undefined : partById(partId);
    if (part === undefined) return [];
    return part.seams.map((seam) => ({
      seam,
      category,
      partId: part.id,
      fabricId: design.fabrics[category],
    }));
  });
}

export function requiredSeam(design: Design, seamId: string): RequiredSeam | undefined {
  return requiredSeams(design).find((entry) => entry.seam.id === seamId);
}
