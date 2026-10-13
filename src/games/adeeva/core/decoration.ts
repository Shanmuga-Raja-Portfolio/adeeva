import type { TrimId } from "../content/trim";
import { updateActiveRun } from "./activeRunUpdate";
import { isTrimId } from "./catalog";
import type { Decoration } from "./dressRun";
import type { GameState } from "./gameState";
import {
  isOnCanvas,
  isValidPose,
  normalisedRotation,
  samePose,
  topLayer,
  type PlacedPose,
} from "../../../engine/placedPose";

export {
  MAX_PLACED_SCALE as MAX_DECORATION_SCALE,
  MIN_PLACED_SCALE as MIN_DECORATION_SCALE,
} from "../../../engine/placedPose";

export const DOLL_WIDTH = 400;
export const DOLL_HEIGHT = 800;
const DOLL = { width: DOLL_WIDTH, height: DOLL_HEIGHT } as const;

export function availableTrims(state: GameState, trimId: TrimId): number {
  if (!isTrimId(trimId)) return 0;
  const run = state.activeRun;
  const placed =
    run === null || run.stage === "done"
      ? 0
      : run.decorations.filter((decoration) => decoration.trimId === trimId).length;
  return state.inventory.trims[trimId] - placed;
}

export function addDecoration(state: GameState, trimId: TrimId, x: number, y: number): GameState {
  if (!isOnCanvas(DOLL, x, y) || availableTrims(state, trimId) <= 0) return state;
  return updateActiveRun(state, "decorate", (run) => {
    const decoration: Decoration = {
      id: `decoration-${run.nextDecorationNumber}`,
      trimId,
      x,
      y,
      rotation: 0,
      scale: 1,
      layer: topLayer(run.decorations) + 1,
    };
    return {
      ...run,
      decorations: [...run.decorations, decoration],
      nextDecorationNumber: run.nextDecorationNumber + 1,
    };
  });
}

export type DecorationPose = PlacedPose;

export function moveDecoration(state: GameState, decorationId: string, pose: DecorationPose): GameState {
  if (!isValidPose(DOLL, pose)) return state;
  return updateActiveRun(state, "decorate", (run) => {
    const current = run.decorations.find((decoration) => decoration.id === decorationId);
    if (current === undefined) return null;
    const rotation = normalisedRotation(pose.rotation);
    if (samePose(current, { ...pose, rotation })) return null;
    return {
      ...run,
      decorations: run.decorations.map((decoration) =>
        decoration.id === decorationId
          ? { ...decoration, x: pose.x, y: pose.y, rotation, scale: pose.scale, layer: pose.layer }
          : decoration,
      ),
    };
  });
}

export function removeDecoration(state: GameState, decorationId: string): GameState {
  return updateActiveRun(state, "decorate", (run) => {
    if (!run.decorations.some((decoration) => decoration.id === decorationId)) return null;
    return { ...run, decorations: run.decorations.filter((decoration) => decoration.id !== decorationId) };
  });
}
