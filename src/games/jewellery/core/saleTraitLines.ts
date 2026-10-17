import type { RewardLine } from "../../../engine/reward";
import { trendMatches } from "../../../engine/trendMarket";
import type { TraitId } from "../../../engine/trait";
import type { JewelColour } from "../content/jewelColour";
import type { JewelTag } from "../content/jewelTag";

const DREAMER_SHARE = 0.15;
const TRENDSETTER_SHARE = 0.1;
const CHARMER_SHARE = 0.1;
const DREAMER_COLOURS = 3;

export function saleTraitLines(
  trait: TraitId,
  total: number,
  colours: readonly JewelColour[],
  tags: readonly JewelTag[],
  hotTags: readonly JewelTag[],
): RewardLine[] {
  if (total === 0) return [];
  const lines: RewardLine[] = [];
  if (trait === "dreamer" && colours.length >= DREAMER_COLOURS)
    lines.push({ label: "Starry ideas", amount: Math.round(total * DREAMER_SHARE) });
  const matches = trendMatches(tags, hotTags).length;
  if (trait === "trendsetter" && matches > 0)
    lines.push({ label: "Trendsetter eye", amount: Math.round(total * TRENDSETTER_SHARE * matches) });
  if (trait === "charmer") lines.push({ label: "Charmer tip", amount: Math.round(total * CHARMER_SHARE) });
  return lines;
}
