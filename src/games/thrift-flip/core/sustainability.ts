import { roundShare } from "../../../engine/roundShare";
import { placedAreaByFind } from "./cutCommit";
import type { FlipRun } from "./flipRun";
import { runBoard } from "./layout";
import { panelArea } from "./panelBoard";
import { savedNotions, notionsOnFinds } from "./unpick";
import { flipPieces } from "./flipPieces";
import { panelUnder, piecePolygon } from "./placement";

export const LEAF_WEIGHTS = { reuse: 0.45, salvage: 0.25, secondhand: 0.3 } as const;
export const REUSE_TARGET_SHARE = 0.5;
export const LEAF_PICK_THRESHOLD = 75;

export interface LeavesBreakdown {
  readonly reuse: number;
  readonly salvage: number;
  readonly secondhand: number;
  readonly leaves: number;
}

function usedPanelArea(run: FlipRun): number {
  const board = runBoard(run);
  const used = new Set(
    flipPieces(run.design).flatMap((piece) => {
      const placement = run.placements[piece.id];
      const panel = placement === undefined ? null : panelUnder(board, piecePolygon(piece, placement));
      return panel === null ? [] : [`${panel.findKey}#${panel.panel}`];
    }),
  );
  return board.panels
    .filter((panel) => used.has(`${panel.findKey}#${panel.panel}`))
    .reduce((sum, panel) => sum + panelArea(panel), 0);
}

export function leavesOf(run: FlipRun, sharpRipper: boolean): LeavesBreakdown {
  const placed = Object.values(placedAreaByFind(run)).reduce((sum, area) => sum + area, 0);
  const target = REUSE_TARGET_SHARE * usedPanelArea(run);
  const reuse = target === 0 ? 0 : Math.min(1, placed / target);
  const onFinds = notionsOnFinds(run);
  const salvage = onFinds === 0 ? 1 : savedNotions(run, sharpRipper).length / onFinds;
  const secondhandCount = run.finishes.filter(
    (finish) =>
      finish.item.kind === "patch" || (finish.item.kind === "trim" && finish.item.source === "saved"),
  ).length;
  const secondhand = run.finishes.length === 0 ? 1 : secondhandCount / run.finishes.length;
  const leaves = Math.round(
    100 *
      (LEAF_WEIGHTS.reuse * reuse + LEAF_WEIGHTS.salvage * salvage + LEAF_WEIGHTS.secondhand * secondhand),
  );
  return {
    reuse: roundShare(reuse),
    salvage: roundShare(salvage),
    secondhand: roundShare(secondhand),
    leaves,
  };
}
