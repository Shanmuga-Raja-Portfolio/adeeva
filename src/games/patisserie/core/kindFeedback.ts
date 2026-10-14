import { qualityTipLine, type QualityTip } from "../../../engine/qualityTip";
import type { ConstructionCount } from "./construction";
import type { QualityBreakdown } from "./bakeQuality";

export interface ToppingShortfall {
  readonly name: string;
  readonly needed: number;
  readonly placed: number;
}

export function constructionFeedback(count: ConstructionCount): string {
  const open: string[] = [];
  if (count.weighed < count.batches) open.push("a mix to weigh");
  if (count.stirred < count.batches) open.push("a bowl to stir");
  if (count.baked < count.batches) open.push("a bake for the oven");
  if (!count.stacked) open.push("layers to stack");
  if (!count.filled) open.push("a filling to add");
  if (count.piped < count.paths) open.push(`${count.paths - count.piped} icing lines to pipe`);
  const list = open.length > 0 ? open.join(", ") : "a bake to choose";
  return `The bake was not quite finished: ${list}. Every step makes the whole treat come together.`;
}

export function qualityFeedback(breakdown: QualityBreakdown, minimum: number): string {
  const tips: QualityTip[] = [
    [breakdown.weigh, "letting go of the scoop a little early so the scale settles in the green"],
    [breakdown.stir, "stirring at an easy, steady speed"],
    [breakdown.bake, "taking the bake out right when it turns golden"],
    [breakdown.pipe, "piping slowly along the dotted line"],
  ];
  return qualityTipLine("The finish", breakdown.quality, minimum, tips);
}

export function styleFeedback(missingTags: readonly string[], flavourMissed: boolean): string {
  const parts: string[] = [];
  if (missingTags.length > 0)
    parts.push(
      `They were dreaming of something more ${missingTags.join(" and ")}. A mix, filling or topping with that feel would carry it.`,
    );
  if (flavourMissed) parts.push("This one hoped for a different flavour.");
  return parts.join(" ");
}

export function minColoursFeedback(minimum: number): string {
  return `They hoped for at least ${minimum} icing colours. A few more shades would make it sing!`;
}

export function toppingsFeedback(shortfalls: readonly ToppingShortfall[]): string {
  const list = shortfalls.map((entry) => `${entry.needed - entry.placed} more ${entry.name}`).join(", ");
  return `So close! A few more toppings were on the order: ${list}.`;
}
