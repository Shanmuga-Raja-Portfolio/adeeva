import { isRotation, type Rotation } from "../../../engine/geometry/rotation";
import { ownEntry } from "../../../engine/ownEntry";
import { recordWithout } from "../../../engine/recordWithout";
import type { RecipeId } from "../content/recipe";
import { autoPlacements } from "./autoLayout";
import { flipPiece, flipPieces } from "./flipPieces";
import type { FlipRun } from "./flipRun";
import type { GameState } from "./gameState";
import { panelBoard, type PanelBoard } from "./panelBoard";
import { layoutIssues, type PlacementIssue } from "./placement";
import { withPlacements } from "./runPlacements";
import { updateRun } from "./runUpdate";

export const AUTO_LAYOUT_RECIPES: readonly RecipeId[] = ["scrunchie-trio", "cushion-cover"];
export const AUTO_LAYOUT_GRAIN_CAP = 0.8;
const BOARD_MARGIN_CM = 60;

export function runBoard(run: FlipRun): PanelBoard {
  return panelBoard(run.finds);
}

export function runLayoutIssues(run: FlipRun): PlacementIssue[] {
  return layoutIssues(runBoard(run), flipPieces(run.design), run.placements);
}

function onTable(run: FlipRun, x: number, y: number): boolean {
  const board = runBoard(run);
  return (
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    x >= -BOARD_MARGIN_CM &&
    y >= -BOARD_MARGIN_CM &&
    x <= board.width + BOARD_MARGIN_CM &&
    y <= board.height + BOARD_MARGIN_CM
  );
}

export function placePiece(
  state: GameState,
  pieceId: string,
  x: number,
  y: number,
  rotation: Rotation,
): GameState {
  if (!isRotation(rotation)) return state;
  return updateRun(state, "layout", (run) => {
    if (flipPiece(run.design, pieceId) === undefined || !onTable(run, x, y)) return null;
    const existing = ownEntry(run.placements, pieceId);
    if (existing !== undefined && existing.x === x && existing.y === y && existing.rotation === rotation)
      return null;
    return withPlacements(run, { ...run.placements, [pieceId]: { x, y, rotation } });
  });
}

export function removePiece(state: GameState, pieceId: string): GameState {
  return updateRun(state, "layout", (run) => {
    if (ownEntry(run.placements, pieceId) === undefined) return null;
    return withPlacements(run, recordWithout(run.placements, pieceId));
  });
}

export function autoLayoutIssue(state: GameState): string | null {
  const run = state.activeRun;
  if (run === null || run.stage !== "layout") return "Auto-layout works on the layout table.";
  if (state.profile.difficulty !== "relaxed") return "Auto-layout is a Relaxed helper.";
  if (run.design.recipeId === null || !AUTO_LAYOUT_RECIPES.includes(run.design.recipeId))
    return "Auto-layout helps with scrunchies and cushions.";
  return null;
}

export function autoLayout(state: GameState): GameState {
  if (autoLayoutIssue(state) !== null) return state;
  return updateRun(state, "layout", (run) => {
    const placements = autoPlacements(runBoard(run), flipPieces(run.design), run.placements);
    if (placements === null) return null;
    if (run.autoLaid && JSON.stringify(placements) === JSON.stringify(run.placements)) return null;
    return { ...withPlacements(run, placements), autoLaid: true };
  });
}
