import { updateActiveRun } from "../../../engine/activeRunUpdate";
import type { ColourId } from "../../../engine/palette";
import { isOnCanvas, isValidPose, samePose, topLayer, type PlacedPose } from "../../../engine/placedPose";
import { EXTRA_IDS, type ExtraId } from "../content/extra";
import { FINISH_IDS, PAINT_COLOURS, type FinishId } from "../content/finish";
import { extraById, finishById } from "./catalog";
import type { CommissionRun, FinishChoice } from "./commissionRun";
import type { GameState } from "./gameState";

export const FINISH_CANVAS = { width: 400, height: 300 } as const;
export const EXTRA_ROTATION_STEP = 15;
const MAX_EXTRAS = 12;

export function extraNumber(placedId: string): number {
  const match = /^extra-(\d+)$/.exec(placedId);
  return match?.[1] === undefined ? 0 : Number(match[1]);
}

export function finishPrice(choice: FinishChoice): number {
  return choice.finishId === null ? 0 : finishById(choice.finishId).price;
}

export function extrasPrice(run: CommissionRun): number {
  return run.extras.reduce((sum, placed) => sum + extraById(placed.extraId).price, 0);
}

export function isFinishComplete(choice: FinishChoice): boolean {
  if (choice.finishId === null) return false;
  return !finishById(choice.finishId).needsPaint || choice.paint !== null;
}

export function chooseFinish(state: GameState, finishId: FinishId, paint: ColourId | null): GameState {
  if (!FINISH_IDS.includes(finishId)) return state;
  const needsPaint = finishById(finishId).needsPaint;
  if (needsPaint !== (paint !== null)) return state;
  if (paint !== null && !PAINT_COLOURS.includes(paint)) return state;
  const run = state.activeRun;
  if (run === null || run.stage !== "finish") return state;
  if (run.finish.finishId === finishId && run.finish.paint === paint) return state;
  const next: FinishChoice = { finishId, paint };
  const change = finishPrice(next) - finishPrice(run.finish);
  if (change > state.coins) return state;
  return { ...state, coins: state.coins - change, activeRun: { ...run, finish: next } };
}

export function addExtra(state: GameState, extraId: ExtraId, x: number, y: number): GameState {
  if (!EXTRA_IDS.includes(extraId) || !isOnCanvas(FINISH_CANVAS, x, y)) return state;
  const price = extraById(extraId).price;
  if (price > state.coins) return state;
  const added = updateActiveRun(state, "finish", (run) => {
    if (run.extras.length >= MAX_EXTRAS) return null;
    return {
      ...run,
      extras: [
        ...run.extras,
        {
          id: `extra-${run.nextExtraNumber}`,
          extraId,
          x,
          y,
          rotation: 0,
          scale: 1,
          layer: topLayer(run.extras) + 1,
        },
      ],
      nextExtraNumber: run.nextExtraNumber + 1,
    };
  });
  return added === state ? state : { ...added, coins: added.coins - price };
}

function validPose(pose: PlacedPose): boolean {
  return (
    isValidPose(FINISH_CANVAS, pose) &&
    Number.isInteger(pose.rotation) &&
    pose.rotation >= 0 &&
    pose.rotation < 360 &&
    pose.rotation % EXTRA_ROTATION_STEP === 0
  );
}

export function moveExtra(state: GameState, placedId: string, pose: PlacedPose): GameState {
  if (!validPose(pose)) return state;
  return updateActiveRun(state, "finish", (run) => {
    const current = run.extras.find((placed) => placed.id === placedId);
    if (current === undefined || samePose(current, pose)) return null;
    return {
      ...run,
      extras: run.extras.map((placed) => (placed.id === placedId ? { ...placed, ...pose } : placed)),
    };
  });
}

export function removeExtra(state: GameState, placedId: string): GameState {
  const placed = state.activeRun?.extras.find((entry) => entry.id === placedId);
  if (placed === undefined) return state;
  const removed = updateActiveRun(state, "finish", (run) => ({
    ...run,
    extras: run.extras.filter((entry) => entry.id !== placedId),
  }));
  return removed === state ? state : { ...removed, coins: removed.coins + extraById(placed.extraId).price };
}
