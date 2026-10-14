import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { latestEntryFor } from "../../../engine/runLog";
import { applyStanding } from "../../../engine/standing";
import { CHARM_IDS } from "../content/extra";
import { clientById, extraById, finishById, productById } from "./catalog";
import { finishCostIssues, placedCharms } from "./displayChoice";
import type { GameState, LogEntry } from "./gameState";
import { addKeepsakes } from "./keepsakeCase";
import { evaluatePiece } from "./pieceEvaluate";
import { pieceColours } from "./pieceColours";
import { pieceQuality } from "./pieceQuality";
import type { PieceRun } from "./pieceRun";
import { runLook, runSource } from "./pieceSource";
import { pieceTags } from "./pieceTags";
import { pieceReward } from "./rewards";
import { stallBoxFull, type StallPiece } from "./stallBox";
import { stageCompletionIssues } from "./stageReadiness";
import { withExtra, type Stock } from "./stock";
import { queueStoryTrigger } from "./storyQueue";

function materialIssues(state: GameState, run: PieceRun): string[] {
  const reasons = CHARM_IDS.filter((id) => placedCharms(run, id) > state.stock.extras[id]).map(
    (id) => `Not enough ${extraById(id).name} in your drawers.`,
  );
  const chain = run.display.chain;
  if (chain !== null && state.stock.extras[chain] < 1) reasons.push(`You need a ${extraById(chain).name}.`);
  if (state.stock.clips < productById(run.design.productId).clipSets) reasons.push("You need clips & rings.");
  return reasons;
}

function usedUp(stock: Stock, run: PieceRun): Stock {
  let next = stock;
  for (const id of CHARM_IDS) next = withExtra(next, id, -placedCharms(run, id));
  if (run.display.chain !== null) next = withExtra(next, run.display.chain, -1);
  return { ...next, clips: next.clips - productById(run.design.productId).clipSets };
}

export function canDeliver(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null || run.stage !== "review" || run.purpose.kind !== "order")
    return actionCheck(["Finish the piece first."]);
  const { gigId } = run.purpose;
  const reasons = [...finishCostIssues(state, run), ...materialIssues(state, run)];
  if (!state.gigs.active.some((gig) => gig.id === gigId)) reasons.push("This order is no longer open.");
  return actionCheck(reasons);
}

export function deliver(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || run.purpose.kind !== "order" || run.brief === null || !canDeliver(state).ok)
    return state;
  const look = runLook(run);
  if (look === null) return state;
  const { brief } = run;
  const { gigId } = run.purpose;
  const day = state.calendar.day;
  const evaluation = evaluatePiece(state, run, brief, day);
  const reward = pieceReward(state, run, brief, evaluation);
  const happy = reward.outcome === "pass";
  const client = clientById(brief.clientId);
  const entry: LogEntry = { runId: run.id, clientId: brief.clientId, day, evaluation, reward };
  const delivered: GameState = {
    ...state,
    coins: state.coins - finishById(run.display.finish).price,
    stock: usedUp(state.stock, run),
    activeRun: { ...run, stage: "done", reached: "done" },
    gigs: { ...state.gigs, active: state.gigs.active.filter((gig) => gig.id !== gigId) },
    ordersDelivered: state.ordersDelivered + 1,
    log: [...state.log, entry],
    keepsakes: addKeepsakes(state.keepsakes, [
      {
        id: run.id,
        day,
        source: { kind: "order", clientId: brief.clientId, happy },
        look,
        stars: evaluation.stars,
        line: client === undefined ? "" : happy ? client.lines.delighted : client.lines.nearMiss,
      },
    ]),
  };
  return queueStoryTrigger(applyStanding(delivered, reward), "first-delivery");
}

export function canFinishStall(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null || run.stage !== "display" || run.purpose.kind !== "stall")
    return actionCheck(["Finish the piece first."]);
  if (stallBoxFull(state.stallBox)) return actionCheck(["The stall box is full."]);
  return actionCheck([...stageCompletionIssues(state, run), ...materialIssues(state, run)]);
}

export function finishStall(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || !canFinishStall(state).ok) return state;
  const look = runLook(run);
  if (look === null) return state;
  const source = runSource(run);
  const piece: StallPiece = {
    id: `piece-${run.id}`,
    look,
    quality: pieceQuality(state, run).quality,
    tags: pieceTags(source),
    colours: pieceColours(source),
    madeDay: state.calendar.day,
  };
  return {
    ...state,
    coins: state.coins - finishById(run.display.finish).price,
    stock: usedUp(state.stock, run),
    activeRun: { ...run, stage: "done", reached: "done" },
    stallBox: [...state.stallBox, piece],
  };
}

export function lastResult(state: GameState, runId: string): LogEntry | null {
  return latestEntryFor(state.log, runId);
}
