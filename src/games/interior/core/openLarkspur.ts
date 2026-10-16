import type { RngState } from "../../../engine/rng";
import { EMPTY_CREW } from "./crewSkill";
import type { GameState } from "./gameState";
import { EMPTY_KEY_WALL } from "./keyWall";
import type { Larkspur } from "./larkspur";
import { canOpenLarkspur } from "./larkspurOffer";
import { drawStoryOffer } from "./project";
import { queueStoryTrigger } from "./storyQueue";

export function freshLarkspur(rng: RngState, day: number): [Larkspur, RngState] {
  const [storyOffer, next] = drawStoryOffer(rng, null);
  return [
    {
      plot: 1,
      phase: 1,
      sisterNext: false,
      choicePending: false,
      storyOffer,
      nextStartDay: day,
      project: null,
      crew: EMPTY_CREW,
      keyWall: EMPTY_KEY_WALL,
      history: [],
    },
    next,
  ];
}

export function openLarkspur(state: GameState): GameState {
  if (!canOpenLarkspur(state).ok) return state;
  const [larkspur, rng] = freshLarkspur(state.rng, state.calendar.day);
  return queueStoryTrigger({ ...state, rng, career: "development", larkspur }, "larkspur-opened");
}
