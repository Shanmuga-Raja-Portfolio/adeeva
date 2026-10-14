import { updateActiveRun } from "../../../engine/activeRunUpdate";
import {
  isOnCanvas,
  isValidPose,
  normalisedRotation,
  samePose,
  topLayer,
  type PlacedPose,
} from "../../../engine/placedPose";
import type { ToppingId } from "../content/topping";
import type { PlacedTopping } from "./bakeRun";
import { isToppingId } from "./catalog";
import type { GameState } from "./gameState";

export const CAKE_CANVAS = { width: 400, height: 400 } as const;
export const ROTATION_STEP = 15;

export function availableToppings(state: GameState, toppingId: ToppingId): number {
  if (!isToppingId(toppingId)) return 0;
  const run = state.activeRun;
  const placed =
    run === null || run.stage === "done"
      ? 0
      : run.toppings.filter((entry) => entry.toppingId === toppingId).length;
  return state.pantry.toppings[toppingId] - placed;
}

export function addTopping(state: GameState, toppingId: ToppingId, x: number, y: number): GameState {
  if (!isOnCanvas(CAKE_CANVAS, x, y) || availableToppings(state, toppingId) <= 0) return state;
  return updateActiveRun(state, "decorate", (run) => {
    const topping: PlacedTopping = {
      id: `topping-${run.nextToppingNumber}`,
      toppingId,
      x,
      y,
      rotation: 0,
      scale: 1,
      layer: topLayer(run.toppings) + 1,
    };
    return { ...run, toppings: [...run.toppings, topping], nextToppingNumber: run.nextToppingNumber + 1 };
  });
}

export function moveTopping(state: GameState, toppingId: string, pose: PlacedPose): GameState {
  if (!isValidPose(CAKE_CANVAS, pose)) return state;
  const rotation = normalisedRotation(pose.rotation);
  if (rotation % ROTATION_STEP !== 0) return state;
  return updateActiveRun(state, "decorate", (run) => {
    const current = run.toppings.find((entry) => entry.id === toppingId);
    if (current === undefined || samePose(current, { ...pose, rotation })) return null;
    return {
      ...run,
      toppings: run.toppings.map((entry) =>
        entry.id === toppingId
          ? { ...entry, x: pose.x, y: pose.y, rotation, scale: pose.scale, layer: pose.layer }
          : entry,
      ),
    };
  });
}

export function removeTopping(state: GameState, toppingId: string): GameState {
  return updateActiveRun(state, "decorate", (run) => {
    if (!run.toppings.some((entry) => entry.id === toppingId)) return null;
    return { ...run, toppings: run.toppings.filter((entry) => entry.id !== toppingId) };
  });
}
