import { reduce, type GameState, type RunStage } from "../../src/games/patisserie/core";
import {
  GOOD_PLAN,
  lastGigId,
  newTestGame,
  playRunTo,
  settleStories,
  withOrder,
  type BakePlan,
} from "../../src/games/patisserie/core/testPlaythrough";

export const PIP_CUPCAKES: BakePlan = {
  ...GOOD_PLAN,
  productId: "cupcake-tray",
  mixIds: ["vanilla-sponge"],
  fillingId: null,
  colours: ["sky"],
};

export function pipOrderAt(stage: RunStage): GameState {
  const ordered = withOrder(settleStories(newTestGame()), "pip");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, PIP_CUPCAKES, stage);
}
