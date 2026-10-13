import type { TrimId } from "../content/trim";
import { updateActiveRun } from "./activeRunUpdate";
import { isTrimId } from "./catalog";
import type { Decoration } from "./dressRun";
import type { GameState } from "./gameState";

export const DOLL_WIDTH = 400;
export const DOLL_HEIGHT = 800;
export const MIN_DECORATION_SCALE = 0.5;
export const MAX_DECORATION_SCALE = 2;

export function availableTrims(state: GameState, trimId: TrimId): number {
  if (!isTrimId(trimId)) return 0;
  const run = state.activeRun;
  const placed =
    run === null || run.stage === "done"
      ? 0
      : run.decorations.filter((decoration) => decoration.trimId === trimId).length;
  return state.inventory.trims[trimId] - placed;
}

function isOnDoll(x: number, y: number): boolean {
  return Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= DOLL_WIDTH && y >= 0 && y <= DOLL_HEIGHT;
}

function normalisedRotation(rotation: number): number {
  return ((rotation % 360) + 360) % 360;
}

function topLayer(decorations: readonly Decoration[]): number {
  return decorations.reduce((highest, decoration) => Math.max(highest, decoration.layer), 0);
}

export function addDecoration(state: GameState, trimId: TrimId, x: number, y: number): GameState {
  if (!isOnDoll(x, y) || availableTrims(state, trimId) <= 0) return state;
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

export interface DecorationPose {
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly scale: number;
  readonly layer: number;
}

export function moveDecoration(state: GameState, decorationId: string, pose: DecorationPose): GameState {
  const validScale = pose.scale >= MIN_DECORATION_SCALE && pose.scale <= MAX_DECORATION_SCALE;
  if (
    !isOnDoll(pose.x, pose.y) ||
    !validScale ||
    !Number.isFinite(pose.rotation) ||
    !Number.isInteger(pose.layer) ||
    pose.layer < 0
  )
    return state;
  return updateActiveRun(state, "decorate", (run) => {
    const current = run.decorations.find((decoration) => decoration.id === decorationId);
    if (current === undefined) return null;
    const rotation = normalisedRotation(pose.rotation);
    const unchanged =
      current.x === pose.x &&
      current.y === pose.y &&
      current.rotation === rotation &&
      current.scale === pose.scale &&
      current.layer === pose.layer;
    if (unchanged) return null;
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
