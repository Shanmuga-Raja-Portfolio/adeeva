import { updateActiveRun } from "../../../engine/activeRunUpdate";
import {
  isOnCanvas,
  isValidPose,
  normalisedRotation,
  samePose,
  topLayer,
  type PlacedPose,
} from "../../../engine/placedPose";
import { isChainId, isCharmId, type ChainId, type CharmId } from "../content/extra";
import type { FinishId } from "../content/finish";
import { HINTS } from "../content/hints";
import { isGlazeColour, type GlazeColour } from "../content/jewelColour";
import { extraById, finishById, isFinishId, productById } from "./catalog";
import type { GameState } from "./gameState";
import type { PlacedCharm } from "./pieceLook";
import type { PieceRun } from "./pieceRun";

export const DISPLAY_CANVAS = { width: 240, height: 240 } as const;
export const CHARM_ROTATION_STEP = 15;
export const MAX_CHARM_SCALE = 1.5;
const MAX_CHARMS = 6;

export function chooseFinish(state: GameState, finish: FinishId, glaze: GlazeColour | null): GameState {
  if (!isFinishId(finish)) return state;
  if (finish === "glaze" ? glaze === null || !isGlazeColour(glaze) : glaze !== null) return state;
  return updateActiveRun(state, "display", (run) => {
    if (run.display.finish === finish && run.display.glaze === glaze) return null;
    return { ...run, display: { ...run.display, finish, glaze } };
  });
}

export function chooseChain(
  state: GameState,
  chain: ChainId | null,
  cordColour: GlazeColour | null,
): GameState {
  if (chain !== null && !isChainId(chain)) return state;
  const wantsColour = chain === "silk-cord";
  if (wantsColour ? cordColour === null || !isGlazeColour(cordColour) : cordColour !== null) return state;
  if (chain !== null && state.stock.extras[chain] < 1) return state;
  return updateActiveRun(state, "display", (run) => {
    if (!productById(run.design.productId).needsChain) return null;
    if (run.display.chain === chain && run.display.cordColour === cordColour) return null;
    return { ...run, display: { ...run.display, chain, cordColour } };
  });
}

export function placedCharms(run: PieceRun, charmId: CharmId): number {
  return run.display.charms.filter((charm) => charm.charmId === charmId).length;
}

export function availableCharms(state: GameState, charmId: CharmId): number {
  const run = state.activeRun;
  if (!isCharmId(charmId)) return 0;
  const placed = run === null || run.stage === "done" ? 0 : placedCharms(run, charmId);
  return state.stock.extras[charmId] - placed;
}

export function addCharm(state: GameState, charmId: CharmId, x: number, y: number): GameState {
  if (!isOnCanvas(DISPLAY_CANVAS, x, y) || availableCharms(state, charmId) <= 0) return state;
  return updateActiveRun(state, "display", (run) => {
    if (run.display.charms.length >= MAX_CHARMS) return null;
    const charm: PlacedCharm = {
      id: `charm-${run.display.nextCharmNumber}`,
      charmId,
      x,
      y,
      rotation: 0,
      scale: 1,
      layer: topLayer(run.display.charms) + 1,
    };
    return {
      ...run,
      display: {
        ...run.display,
        charms: [...run.display.charms, charm],
        nextCharmNumber: run.display.nextCharmNumber + 1,
      },
    };
  });
}

export function moveCharm(state: GameState, charmPieceId: string, pose: PlacedPose): GameState {
  if (!isValidPose(DISPLAY_CANVAS, pose) || pose.scale > MAX_CHARM_SCALE) return state;
  const rotation = normalisedRotation(pose.rotation);
  if (rotation % CHARM_ROTATION_STEP !== 0) return state;
  return updateActiveRun(state, "display", (run) => {
    const current = run.display.charms.find((charm) => charm.id === charmPieceId);
    if (current === undefined || samePose(current, { ...pose, rotation })) return null;
    return {
      ...run,
      display: {
        ...run.display,
        charms: run.display.charms.map((charm) =>
          charm.id === charmPieceId
            ? { ...charm, x: pose.x, y: pose.y, rotation, scale: pose.scale, layer: pose.layer }
            : charm,
        ),
      },
    };
  });
}

export function removeCharm(state: GameState, charmPieceId: string): GameState {
  return updateActiveRun(state, "display", (run) => {
    if (!run.display.charms.some((charm) => charm.id === charmPieceId)) return null;
    return {
      ...run,
      display: { ...run.display, charms: run.display.charms.filter((charm) => charm.id !== charmPieceId) },
    };
  });
}

export function finishCostIssues(state: GameState, run: PieceRun): string[] {
  const finish = finishById(run.display.finish);
  return finish.price > 0 && finish.price > state.coins
    ? [`You need ${finish.price} coins for the ${finish.name} finish.`]
    : [];
}

export function displayIssues(state: GameState, run: PieceRun): string[] {
  const issues = finishCostIssues(state, run);
  const chain = run.display.chain;
  if (productById(run.design.productId).needsChain && chain === null) issues.push(HINTS.chainFirst);
  if (chain !== null && state.stock.extras[chain] < 1) issues.push(`You need a ${extraById(chain).name}.`);
  return issues;
}
