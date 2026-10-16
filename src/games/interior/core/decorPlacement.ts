import { updateActiveRun } from "../../../engine/activeRunUpdate";
import { isOnCanvas, isValidPose, topLayer, type PlacedPose } from "../../../engine/placedPose";
import type { DecorId } from "../content/decor";
import { SOFT_COLOURS, type SoftColour } from "../content/softColour";
import { isDecorId } from "./catalog";
import type { GameState } from "./gameState";
import { roomStock } from "./homeShelf";
import type { MakeoverRun } from "./makeoverRun";

export const STYLE_CANVAS = { width: 640, height: 420 } as const;
export const DECOR_ROTATION_STEP = 15;
export const MAX_DECOR = 16;

export function placedCount(run: MakeoverRun, decorId: DecorId): number {
  return run.decor.filter((item) => item.decorId === decorId).length;
}

export function spareDecor(state: GameState, run: MakeoverRun, decorId: DecorId): number {
  return roomStock(state, run).decor[decorId] - placedCount(run, decorId);
}

export function addDecor(state: GameState, decorId: DecorId, x: number, y: number): GameState {
  return updateActiveRun(state, "style", (run) => {
    if (!isDecorId(decorId) || !isOnCanvas(STYLE_CANVAS, x, y)) return null;
    if (run.decor.length >= MAX_DECOR || spareDecor(state, run, decorId) <= 0) return null;
    const item = {
      id: `decor-${run.nextDecorNumber}`,
      decorId,
      x: Math.round(x),
      y: Math.round(y),
      rotation: 0,
      scale: 1,
      layer: topLayer(run.decor) + 1,
    };
    return { ...run, decor: [...run.decor, item], nextDecorNumber: run.nextDecorNumber + 1 };
  });
}

export function moveDecor(state: GameState, decorPieceId: string, pose: PlacedPose): GameState {
  return updateActiveRun(state, "style", (run) => {
    const item = run.decor.find((entry) => entry.id === decorPieceId);
    if (item === undefined || !isValidPose(STYLE_CANVAS, pose)) return null;
    if (pose.rotation % DECOR_ROTATION_STEP !== 0 || pose.rotation < 0 || pose.rotation >= 360) return null;
    return {
      ...run,
      decor: run.decor.map((entry) => (entry.id === decorPieceId ? { ...entry, ...pose } : entry)),
    };
  });
}

export function removeDecor(state: GameState, decorPieceId: string): GameState {
  return updateActiveRun(state, "style", (run) =>
    run.decor.some((entry) => entry.id === decorPieceId)
      ? { ...run, decor: run.decor.filter((entry) => entry.id !== decorPieceId) }
      : null,
  );
}

export function setSoftColour(state: GameState, colour: SoftColour): GameState {
  return updateActiveRun(state, "style", (run) =>
    SOFT_COLOURS.includes(colour) && run.softColour !== colour ? { ...run, softColour: colour } : null,
  );
}
