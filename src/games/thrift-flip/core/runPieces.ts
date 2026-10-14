import { rectangle } from "../../../engine/geometry/rectangle";
import { SEAM_PROFILES } from "../../adeeva/content/garmentPart";
import type { RecipePiece, RecipeSeam } from "../content/recipe";
import { HEM_BAND } from "../content/ticket";
import { flipPieces, flipSeams } from "./flipPieces";
import type { FlipRun } from "./flipRun";
import { runKind } from "./runKind";

export const HEM_PIECE: RecipePiece = {
  id: "hem-band",
  name: "Hem band",
  shape: rectangle(HEM_BAND.width, HEM_BAND.height),
  grain: "straight",
};

export const MEND_SEAM: RecipeSeam = {
  id: "close-split",
  name: "Close the split",
  profile: SEAM_PROFILES.gentle,
};
export const HEM_SEAM: RecipeSeam = { id: "hem-seam", name: "Hem seam", profile: SEAM_PROFILES.wavy };

type RunPlan = Pick<FlipRun, "brief" | "design">;

export function runPieces(run: RunPlan): RecipePiece[] {
  const kind = runKind(run);
  if (kind === "mend") return [];
  if (kind === "alter") return [HEM_PIECE];
  return flipPieces(run.design);
}

export function runSeams(run: RunPlan): RecipeSeam[] {
  const kind = runKind(run);
  if (kind === "mend") return [MEND_SEAM];
  if (kind === "alter") return [HEM_SEAM];
  return flipSeams(run.design);
}

export function runPiece(run: RunPlan, pieceId: string): RecipePiece | undefined {
  return runPieces(run).find((piece) => piece.id === pieceId);
}
