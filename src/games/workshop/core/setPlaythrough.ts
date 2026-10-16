import type { JointKindId } from "../content/jointKind";
import type { PartSlot } from "../content/partOption";
import type { RunStage } from "../content/runStage";
import type { SetTemplateId } from "../content/setTemplate";
import type { Action } from "./action";
import type { GameState } from "./gameState";
import type { NewGameSettings } from "./newGame";
import {
  BIRDHOUSE_PLAN,
  dispatchAll,
  newTestGame,
  playSteps,
  settleStories,
  type PiecePlan,
} from "./testPlaythrough";

export interface SetPlan extends PiecePlan {
  readonly templateId: SetTemplateId;
  readonly setJoint: JointKindId;
}

export const NOOK_PLAN: SetPlan = {
  ...BIRDHOUSE_PLAN,
  templateId: "breakfast-nook",
  setJoint: "slot",
  options: { edge: "rounded-edge", legs: "straight-legs", accent: "heart-cutout" },
  woodId: "pine",
  finishId: "beeswax",
};

export const READING_PLAN: SetPlan = {
  ...BIRDHOUSE_PLAN,
  templateId: "reading-corner",
  setJoint: "peg",
  options: { edge: "square-edge", legs: "straight-legs", accent: "no-accent" },
  woodId: "pine",
  finishId: "clear-oil",
};

export function showroomTestGame(overrides: Partial<NewGameSettings> = {}): GameState {
  return settleStories(newTestGame({ career: "showroom", ...overrides }));
}

export function setDesignActions(plan: SetPlan): Action[] {
  return [
    ...Object.entries(plan.options).flatMap(([slot, optionId]): Action[] =>
      optionId === undefined ? [] : [{ type: "chooseOption", slot: slot as PartSlot, optionId }],
    ),
    { type: "chooseWood", woodId: plan.woodId },
    { type: "chooseSetJoint", kind: plan.setJoint },
  ];
}

export function playSetUntil(state: GameState, plan: SetPlan, stop: RunStage): GameState {
  const laidOut = dispatchAll(state, [
    { type: "startSet", templateId: plan.templateId },
    { type: "goToStage", stage: "design" },
    ...setDesignActions(plan),
    { type: "goToStage", stage: "timber" },
    { type: "buyPlan" },
    { type: "goToStage", stage: "layout" },
  ]);
  return playSteps(laidOut, plan, stop);
}

export function playSetToFloor(state: GameState, plan: SetPlan): GameState {
  return settleStories(dispatchAll(playSetUntil(state, plan, "review"), [{ type: "finishSet" }]));
}
