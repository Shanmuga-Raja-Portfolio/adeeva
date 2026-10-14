import type { ShadeId } from "../content/shade";
import { cushionFabricById, extraById, finishById, woodById } from "./catalog";
import type { CommissionRun } from "./commissionRun";

function finishShades(run: CommissionRun): ShadeId[] {
  const woodId = run.design.woodId;
  const tone: ShadeId[] = woodId === null ? [] : [woodById(woodId).tone];
  const { finishId, paint } = run.finish;
  if (finishId === null) return tone;
  const paintShade: ShadeId[] = paint === null ? [] : [paint];
  switch (finishById(finishId).look) {
    case "wood":
      return tone;
    case "whitewash":
      return ["ivory", ...tone];
    case "stain":
      return ["dark-wood"];
    case "paint":
      return paintShade;
    case "two-tone":
      return [...paintShade, ...tone];
  }
}

export function pieceColours(run: CommissionRun): ShadeId[] {
  const woodId = run.design.woodId;
  const extraShades = run.extras.flatMap((placed): ShadeId[] => {
    const colour = extraById(placed.extraId).colour;
    if (colour === null) return [];
    if (colour === "wood") return woodId === null ? [] : [woodById(woodId).tone];
    return [colour];
  });
  const cushion: ShadeId[] = run.cushion === null ? [] : [cushionFabricById(run.cushion.fabricId).colour];
  return [...new Set([...finishShades(run), ...extraShades, ...cushion])];
}
