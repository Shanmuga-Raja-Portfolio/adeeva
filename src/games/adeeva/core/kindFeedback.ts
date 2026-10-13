import type { ConstructionCount } from "./dressSnapshot";
import type { QualityBreakdown } from "./dressQuality";

export interface TrimShortfall {
  readonly name: string;
  readonly needed: number;
  readonly placed: number;
}

export function constructionFeedback(count: ConstructionCount): string {
  const open: string[] = [];
  if (count.piecesCut < count.piecesTotal) open.push(`${count.piecesTotal - count.piecesCut} pieces to cut`);
  if (count.piecesAssembled < count.piecesTotal)
    open.push(`${count.piecesTotal - count.piecesAssembled} pieces to place on the form`);
  if (count.seamsSewn < count.seamsTotal) open.push(`${count.seamsTotal - count.seamsSewn} seams to sew`);
  const list = open.length > 0 ? open.join(", ") : "a design to choose";
  return `The dress was not quite finished: ${list}. Every finished step makes the whole piece come together.`;
}

export function qualityFeedback(breakdown: QualityBreakdown, minimum: number): string {
  const tips: [number, string][] = [
    [breakdown.cut, "slower, steadier cuts along the outline"],
    [breakdown.seams, "taking each seam at an easy pace so the needle stays on the line"],
    [breakdown.grain, "lining pieces up with the grain arrow so the fabric hangs beautifully"],
    [breakdown.materialFit, "choosing a material that suits the feel of the brief"],
  ];
  const weakest = tips.reduce((lowest, tip) => (tip[0] < lowest[0] ? tip : lowest));
  return `The finish reached ${breakdown.quality}, a little under the ${minimum} hoped for. Try ${weakest[1]}.`;
}

export function styleFeedback(missingTags: readonly string[]): string {
  return `The client was dreaming of something more ${missingTags.join(" and ")}. A part, fabric or trim with that feel would carry it.`;
}

export function trimsFeedback(shortfalls: readonly TrimShortfall[]): string {
  const list = shortfalls.map((entry) => `${entry.needed - entry.placed} more ${entry.name}`).join(", ");
  return `The finishing touches were missing: ${list}. Small details make a client feel listened to.`;
}
