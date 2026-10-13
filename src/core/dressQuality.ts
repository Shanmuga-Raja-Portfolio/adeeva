import type { StyleTag } from "../content/styleTag";
import { average } from "./average";
import type { Brief } from "./brief";
import { fabricById, materialById } from "./catalog";
import { fabricsNeedingCut } from "./designFabrics";
import type { Design } from "./dressRun";
import type { DressSnapshot } from "./dressSnapshot";

export const NEUTRAL_MATERIAL_TAG: StyleTag = "classic";
export const QUALITY_WEIGHTS = { cut: 0.35, seams: 0.45, grain: 0.1, materialFit: 0.1 } as const;

export interface QualityBreakdown {
  readonly cut: number;
  readonly seams: number;
  readonly grain: number;
  readonly materialFit: number;
  readonly quality: number;
}

function roundShare(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function materialFits(materialTags: readonly StyleTag[], brief: Brief, avoided: boolean): boolean {
  if (avoided) return false;
  return materialTags.some((tag) => tag === NEUTRAL_MATERIAL_TAG || brief.requiredTags.includes(tag));
}

export function materialFit(design: Design, brief: Brief): number {
  const fits = fabricsNeedingCut(design).map((fabricId) => {
    const fabric = fabricById(fabricId);
    if (fabric === undefined) return 0;
    const material = materialById(fabric.material);
    return materialFits(material.tags, brief, brief.avoidMaterials.includes(material.id)) ? 1 : 0;
  });
  return average(fits);
}

export function dressQuality(snapshot: DressSnapshot, brief: Brief): QualityBreakdown {
  const cut = roundShare(average(snapshot.pieces.map((piece) => piece.cutAccuracy)));
  const seams = roundShare(average(snapshot.seams.map((seam) => (seam.progress >= 1 ? seam.accuracy : 0))));
  const grain = roundShare(average(snapshot.pieces.map((piece) => piece.grainScore)));
  const fit = roundShare(materialFit(snapshot.design, brief));
  const weighted =
    QUALITY_WEIGHTS.cut * cut +
    QUALITY_WEIGHTS.seams * seams +
    QUALITY_WEIGHTS.grain * grain +
    QUALITY_WEIGHTS.materialFit * fit;
  return { cut, seams, grain, materialFit: fit, quality: Math.round(100 * weighted) };
}
