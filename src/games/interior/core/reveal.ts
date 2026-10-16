import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { latestEntryFor } from "../../../engine/runLog";
import { applyStanding } from "../../../engine/standing";
import { DECOR_IDS } from "../content/decor";
import { decorById } from "./catalog";
import { placedCount } from "./decorPlacement";
import type { GameState, LogEntry } from "./gameState";
import type { MakeoverRun } from "./makeoverRun";
import { openHouse } from "./openHouse";
import { roomReward, willPass } from "./rewards";
import { evaluateRoom } from "./roomEvaluate";
import { changeStock, EMPTY_CART, type Cart } from "./stock";
import { checkLarkspurOffer } from "./larkspurOffer";
import { queueStoryTrigger } from "./storyQueue";

function placedDecorCart(run: MakeoverRun): Cart {
  const decor = Object.fromEntries(
    DECOR_IDS.flatMap((id) => {
      const count = placedCount(run, id);
      return count > 0 ? [[id, count]] : [];
    }),
  );
  return { ...EMPTY_CART, decor };
}

export function canReveal(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null || run.stage !== "reveal") return actionCheck(["Finish styling the room first."]);
  if (run.purpose.kind === "home-room")
    return actionCheck(["Home rooms open their doors at the Open House."]);
  const reasons = DECOR_IDS.filter((id) => placedCount(run, id) > state.stock.decor[id]).map(
    (id) => `You need another ${decorById(id).name}.`,
  );
  if (!state.gigs.active.some((gig) => gig.id === run.gigId))
    reasons.push("This makeover is no longer booked.");
  return actionCheck(reasons);
}

export function reveal(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || !canReveal(state).ok) return state;
  const day = state.calendar.day;
  const evaluation = evaluateRoom(state, run, day);
  const visit =
    run.brief.showHome && willPass(state, evaluation) ? openHouse(run, evaluation.quality.flow) : null;
  const reward = roomReward(state, run, evaluation, visit);
  const entry: LogEntry = {
    runId: run.id,
    clientId: run.brief.clientId,
    day,
    evaluation,
    reward,
    openHouse: visit,
  };
  const revealed: GameState = {
    ...state,
    stock: changeStock(state.stock, placedDecorCart(run), -1),
    activeRun: { ...run, stage: "done", reached: "done" },
    gigs: { ...state.gigs, active: state.gigs.active.filter((gig) => gig.id !== run.gigId) },
    ordersDelivered: state.ordersDelivered + 1,
    log: [...state.log, entry],
  };
  return checkLarkspurOffer(queueStoryTrigger(applyStanding(revealed, reward), "first-delivery"));
}

export function lastResult(state: GameState, runId: string): LogEntry | null {
  return latestEntryFor(state.log, runId);
}
