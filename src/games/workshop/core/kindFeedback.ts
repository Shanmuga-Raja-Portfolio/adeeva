import type { ConstructionCount, QualityBreakdown } from "./pieceQuality";

export function constructionFeedback(count: ConstructionCount): string {
  const open: string[] = [];
  if (count.sawn < count.parts) open.push(`${count.parts - count.sawn} parts to saw`);
  if (count.seated < count.joints) open.push(`${count.joints - count.seated} joints to tap home`);
  if (count.sanded < count.surfaces) open.push(`${count.surfaces - count.sanded} surfaces to sand`);
  const list = open.length > 0 ? open.join(", ") : "a plan to finish";
  return `The piece was not quite finished: ${list}. Every step makes it sturdy and smooth.`;
}

export function qualityFeedback(breakdown: QualityBreakdown, minimum: number): string {
  const tips: [number, string][] = [
    [breakdown.saw, "sawing slowly right on the pencil line"],
    [breakdown.join, "nudging each part onto its shadow before the mallet"],
    [breakdown.sand, "sanding along the wood lines until the dust is gone"],
    [breakdown.grain, "turning long parts so the wood lines run along them"],
    [breakdown.woodFit, "picking a wood that suits the note"],
  ];
  const weakest = tips.reduce((lowest, tip) => (tip[0] < lowest[0] ? tip : lowest));
  return `The finish reached ${breakdown.quality}, a little under the ${minimum} hoped for. Try ${weakest[1]}.`;
}

export function styleFeedback(missing: readonly string[]): string {
  return `They were hoping for something more ${missing.join(" and ")}. A part, wood, finish or extra with that feel would carry it.`;
}

export function extrasFeedback(): string {
  return "So close! The brief asked for a few more knobs or extras.";
}
