import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { applyStanding } from "../../../engine/standing";
import type { GameState, LogEntry } from "./gameState";
import { evaluatePiece } from "./pieceEvaluate";
import { pieceReward } from "./rewards";
import { queueStoryTrigger, queueTraitBeat } from "./storyQueue";

export function canDeliver(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null || run.stage !== "review") return actionCheck(["Finish the piece first."]);
  if (!state.gigs.active.some((gig) => gig.id === run.gigId))
    return actionCheck(["This commission is no longer open."]);
  return actionCheck([]);
}

export function deliver(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || !canDeliver(state).ok) return state;
  const { productId, woodId } = run.design;
  if (productId === null || woodId === null) return state;
  const day = state.calendar.day;
  const evaluation = evaluatePiece(state, run, day);
  const reward = pieceReward(state, run, evaluation);
  const entry: LogEntry = {
    runId: run.id,
    clientId: run.brief.clientId,
    day,
    productId,
    woodId,
    evaluation,
    reward,
  };
  const delivered: GameState = {
    ...state,
    activeRun: { ...run, stage: "done", reached: "done" },
    gigs: { ...state.gigs, active: state.gigs.active.filter((gig) => gig.id !== run.gigId) },
    delivered: state.delivered + 1,
    log: [...state.log, entry],
  };
  const rewarded = applyStanding(delivered, reward);
  return queueTraitBeat(queueStoryTrigger(rewarded, "first-delivery"), "charmer");
}

export function lastResult(state: GameState, runId: string): LogEntry | null {
  return [...state.log].reverse().find((entry) => entry.runId === runId) ?? null;
}
