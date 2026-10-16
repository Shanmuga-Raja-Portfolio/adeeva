import type { ShadeId } from "../content/shade";
import { cushionFabricById, extraById, finishById, productById, woodById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import { runPieces } from "./pieceParts";

type ColouredRun = Pick<CommissionRun, "design" | "purpose" | "finish" | "extras" | "cushion">;

function finishShades(run: ColouredRun): ShadeId[] {
  const woodId = run.design.woodId;
  const tone: ShadeId[] = woodId === null ? [] : [woodById(woodId).tone];
  const { finishId, paint } = run.finish;
  if (finishId === null) return tone;
  const paintShade: ShadeId[] = paint === null ? [] : [paint];
  switch (finishById(finishId).look) {
    case "wood":
      return tone;
    case "whitewash":
    case "limed":
      return ["ivory", ...tone];
    case "stain":
      return ["dark-wood"];
    case "midnight":
      return ["charcoal"];
    case "paint":
    case "milk":
      return paintShade;
    case "two-tone":
    case "wash":
      return [...paintShade, ...tone];
  }
}

export function pieceColours(run: ColouredRun, piece: number | null = null): ShadeId[] {
  const woodId = run.design.woodId;
  const extras = piece === null ? run.extras : run.extras.filter((placed) => placed.piece === piece);
  const extraShades = extras.flatMap((placed): ShadeId[] => {
    const colour = extraById(placed.extraId).colour;
    if (colour === null) return [];
    if (colour === "wood") return woodId === null ? [] : [woodById(woodId).tone];
    return [colour];
  });
  const product =
    piece === null ? null : (runPieces(run).find((entry) => entry.index === piece)?.productId ?? null);
  const cushioned = run.cushion !== null && (product === null || productById(product).seat);
  const cushion: ShadeId[] =
    run.cushion === null || !cushioned ? [] : [cushionFabricById(run.cushion.fabricId).colour];
  return [...new Set([...finishShades(run), ...extraShades, ...cushion])];
}
