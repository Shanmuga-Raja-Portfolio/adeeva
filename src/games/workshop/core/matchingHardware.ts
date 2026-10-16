import type { ExtraId } from "../content/extra";
import type { CommissionRun } from "./commissionRun";
import { runPieces } from "./pieceParts";
import { productNeedIds } from "./requiredExtras";

export const SIMPLE_AND_CALM = 70;

type HardwareRun = Pick<CommissionRun, "design" | "purpose" | "brief" | "extras">;

export function matchingHardware(run: HardwareRun): number {
  const pieces = runPieces(run).map((piece) => piece.index);
  const chosen = run.extras.filter((placed) => !productNeedIds(run, placed.piece).includes(placed.extraId));
  const kinds = [...new Set(chosen.map((placed) => placed.extraId))];
  if (kinds.length === 0) return SIMPLE_AND_CALM;
  const onEvery = (kind: ExtraId) =>
    pieces.every((piece) => chosen.some((placed) => placed.piece === piece && placed.extraId === kind));
  return Math.round((100 * kinds.filter(onEvery).length) / kinds.length);
}
