import { qualityTipLine, type QualityTip } from "../../../engine/qualityTip";
import type { QualityBreakdown, QualityTerm } from "./flipQuality";

export interface ConstructionGap {
  readonly stitchLines: number;
  readonly pieces: number;
  readonly seams: number;
}

const TIPS: Readonly<Record<QualityTerm, string>> = {
  unpick: "short, gentle pulls on each stitch",
  clean: "steady circles that keep moving",
  cut: "slower, steadier cuts along the dashed line",
  seams: "an easy pace so the needle stays on the line",
  grain: "lining pieces up with the fabric lines",
  restored: "a find in better shape, or a gentler clean",
};

function counted(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function constructionFeedback(gap: ConstructionGap): string {
  const open: string[] = [];
  if (gap.stitchLines > 0) open.push(`${counted(gap.stitchLines, "stitch line", "stitch lines")} to snip`);
  if (gap.pieces > 0) open.push(`${counted(gap.pieces, "piece", "pieces")} to cut`);
  if (gap.seams > 0) open.push(`${counted(gap.seams, "seam", "seams")} to sew`);
  const list = open.length > 0 ? open.join(", ") : "a plan to choose";
  return `The flip was not quite finished: ${list}. Every finished step brings it back to life.`;
}

export function qualityFeedback(breakdown: QualityBreakdown, minimum: number): string {
  const terms = Object.keys(TIPS) as QualityTerm[];
  const tips = terms.map((term): QualityTip => [breakdown[term], TIPS[term]]);
  return qualityTipLine("The finish", breakdown.quality, minimum, tips);
}

export function styleFeedback(missingTags: readonly string[]): string {
  return `The client was dreaming of something more ${missingTags.join(" and ")}. A find, patch or trim with that feel would carry it.`;
}

export function avoidedMaterialFeedback(material: string): string {
  return `The client hoped for no ${material} this time. A different find would suit them better.`;
}

export const FINISHES_FEEDBACK = "So close! The brief asked for a few more finishing touches.";

export const SUSTAINABILITY_FEEDBACK = "Lovely piece! Next time, try using more of the old fabric.";
