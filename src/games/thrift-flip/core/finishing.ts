import type { ColourId } from "../../../engine/palette";
import { isOnCanvas, isValidPose, samePose, topLayer } from "../../../engine/placedPose";
import type { TrimId } from "../../adeeva/content/trim";
import { MARK_IDS, PAINT_COLOURS, PATCH_IDS, type MarkId, type PatchId } from "../content/finish";
import { isTrimId, markById, trimById } from "./catalog";
import type { FinishItem, FinishPose, FlipRun, TrimSource } from "./flipRun";
import type { GameState } from "./gameState";
import { updateRun } from "./runUpdate";

export const FINISH_CANVAS = 400;
export const FINISH_ROTATION_STEP = 15;
const CANVAS = { width: FINISH_CANVAS, height: FINISH_CANVAS } as const;
export {
  MAX_PLACED_SCALE as MAX_FINISH_SCALE,
  MIN_PLACED_SCALE as MIN_FINISH_SCALE,
} from "../../../engine/placedPose";

export type FinishRequest =
  | { readonly kind: "trim"; readonly trimId: TrimId; readonly source: TrimSource }
  | { readonly kind: "patch"; readonly patchId: PatchId; readonly scrapId: string }
  | { readonly kind: "mark"; readonly markId: MarkId; readonly colour: ColourId | null };

export function finishPrice(item: FinishItem): number {
  if (item.kind === "trim") return item.source === "new" ? trimById(item.trimId).price : 0;
  if (item.kind === "mark") return markById(item.markId).price;
  return 0;
}

export function finishSpend(run: FlipRun): number {
  return run.finishes.reduce((sum, finish) => sum + finishPrice(finish.item), 0);
}

export function savedTrimsPlaced(run: FlipRun, trimId: TrimId): number {
  return run.finishes.filter(
    (finish) =>
      finish.item.kind === "trim" && finish.item.source === "saved" && finish.item.trimId === trimId,
  ).length;
}

export function patchScrapIds(run: FlipRun): Set<string> {
  return new Set(
    run.finishes.flatMap((finish) => (finish.item.kind === "patch" ? [finish.item.scrap.id] : [])),
  );
}

function benchRun(run: FlipRun | null): FlipRun | null {
  return run === null || run.stage === "done" ? null : run;
}

export function availableSavedTrims(state: GameState, trimId: TrimId): number {
  if (!isTrimId(trimId)) return 0;
  const run = benchRun(state.activeRun);
  return state.stock.savedTrims[trimId] - (run === null ? 0 : savedTrimsPlaced(run, trimId));
}

export function scrapInUse(run: FlipRun | null, scrapId: string): boolean {
  const bench = benchRun(run);
  return bench !== null && patchScrapIds(bench).has(scrapId);
}

function resolve(state: GameState, request: FinishRequest): FinishItem | null {
  if (request.kind === "trim") {
    if (!isTrimId(request.trimId)) return null;
    if (request.source === "saved" && availableSavedTrims(state, request.trimId) <= 0) return null;
    return { kind: "trim", trimId: request.trimId, source: request.source };
  }
  if (request.kind === "patch") {
    const scrap = state.stock.scraps.find((entry) => entry.id === request.scrapId);
    if (!PATCH_IDS.includes(request.patchId)) return null;
    if (scrap === undefined || scrapInUse(state.activeRun, scrap.id)) return null;
    return { kind: "patch", patchId: request.patchId, scrap };
  }
  if (!MARK_IDS.includes(request.markId)) return null;
  const needsColour = request.markId === "paint-dots";
  if (needsColour !== (request.colour !== null)) return null;
  if (request.colour !== null && !PAINT_COLOURS.includes(request.colour)) return null;
  return { kind: "mark", markId: request.markId, colour: request.colour };
}

export function addFinish(state: GameState, request: FinishRequest, x: number, y: number): GameState {
  if (!isOnCanvas(CANVAS, x, y)) return state;
  const item = resolve(state, request);
  if (item === null) return state;
  const price = finishPrice(item);
  if (price > state.coins) return state;
  const added = updateRun(state, "finish", (run) => ({
    ...run,
    finishes: [
      ...run.finishes,
      {
        id: `finish-${run.nextFinishNumber}`,
        item,
        x,
        y,
        rotation: 0,
        scale: 1,
        layer: topLayer(run.finishes) + 1,
      },
    ],
    nextFinishNumber: run.nextFinishNumber + 1,
  }));
  return added === state ? state : { ...added, coins: added.coins - price };
}

function validPose(pose: FinishPose): boolean {
  return (
    isValidPose(CANVAS, pose) &&
    Number.isInteger(pose.rotation) &&
    pose.rotation >= 0 &&
    pose.rotation < 360 &&
    pose.rotation % FINISH_ROTATION_STEP === 0
  );
}

export function moveFinish(state: GameState, finishId: string, pose: FinishPose): GameState {
  if (!validPose(pose)) return state;
  return updateRun(state, "finish", (run) => {
    const current = run.finishes.find((finish) => finish.id === finishId);
    if (current === undefined) return null;
    if (samePose(current, pose)) return null;
    return {
      ...run,
      finishes: run.finishes.map((finish) => (finish.id === finishId ? { ...finish, ...pose } : finish)),
    };
  });
}

export function removeFinish(state: GameState, finishId: string): GameState {
  const run = state.activeRun;
  const finish = run?.finishes.find((entry) => entry.id === finishId);
  if (finish === undefined) return state;
  const removed = updateRun(state, "finish", (current) => ({
    ...current,
    finishes: current.finishes.filter((entry) => entry.id !== finishId),
  }));
  return removed === state ? state : { ...removed, coins: removed.coins + finishPrice(finish.item) };
}
