import { qualityTipLine, type QualityTip } from "../../../engine/qualityTip";
import type { ConstructionCount } from "./construction";
import type { QualityBreakdown } from "./pieceQuality";

export interface ExtraShortfall {
  readonly name: string;
  readonly needed: number;
  readonly placed: number;
}

export function constructionFeedback(count: ConstructionCount): string {
  const open: string[] = [];
  if (count.cut < count.paths) open.push("a shape to cut out");
  if (count.joined < count.joints) open.push("a seam to join");
  if (count.set < count.stones) open.push("a stone to set");
  if (count.polished < count.parts)
    open.push(
      `${count.parts - count.polished} dull ${count.parts - count.polished === 1 ? "piece" : "pieces"} to polish`,
    );
  return `The piece was not quite finished: ${open.join(", ")}. Every step makes it sparkle.`;
}

export function qualityFeedback(breakdown: QualityBreakdown, minimum: number): string {
  const tips: QualityTip[] = [
    [breakdown.cut, "cutting slowly and turning at each dot"],
    [breakdown.join, "letting go of the lamp before the glow turns orange"],
    [breakdown.polish, "rubbing every dull corner until it shines"],
  ];
  if (breakdown.hasStones) tips.push([breakdown.set, "nudging the stone right into its seat"]);
  return qualityTipLine("The finish", breakdown.quality, minimum, tips);
}

export function styleFeedback(missingTags: readonly string[]): string {
  return `They were dreaming of something more ${missingTags.join(" and ")}. A shape, metal, stone or finish with that feel would carry it.`;
}

export function extrasFeedback(shortfalls: readonly ExtraShortfall[]): string {
  const list = shortfalls.map((entry) => `${entry.needed - entry.placed} more ${entry.name}`).join(", ");
  return `So close! The order asked for a few more charms or extras. Still to add: ${list}.`;
}
