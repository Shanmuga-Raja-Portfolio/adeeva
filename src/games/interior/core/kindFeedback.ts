import { qualityTipLine, type QualityTip } from "../../../engine/qualityTip";
import type { ConstructionCount } from "./construction";
import type { MustHaveCount } from "./mustHaves";
import type { QualityBreakdown } from "./roomQuality";

export function constructionFeedback(count: ConstructionCount): string {
  const open: string[] = [];
  if (count.wallsDone < count.walls) open.push("a wall to edge and roll");
  if (count.floorLaid < count.floorPieces) open.push("floor pieces to lay");
  if (count.lights === 0) open.push("a light to hang");
  return `The room was not quite finished: ${open.join(", ")}. Every step makes it feel like home.`;
}

export function qualityFeedback(breakdown: QualityBreakdown, minimum: number): string {
  const tips: QualityTip[] = [
    [breakdown.flow, "leaving walk-through space to every spot people use"],
    [breakdown.paint, "brushing slowly along the tape and rolling two coats"],
    [breakdown.floor, "lining each floor piece up with its shadow"],
    [breakdown.light, "lighting every cosy spot with a lamp nearby"],
  ];
  return qualityTipLine("The room", breakdown.quality, minimum, tips);
}

export function styleFeedback(missingTags: readonly string[]): string {
  return `They were dreaming of something more ${missingTags.join(" and ")}. A paint, floor, light or decor with that feel would carry it.`;
}

export function mustHaveFeedback(shortfalls: readonly MustHaveCount[]): string {
  const list = shortfalls.map((entry) => `${entry.need.count - entry.placed} more ${entry.name}`).join(", ");
  return `So close! The brief asked for one more must-have. Still to add: ${list}.`;
}
