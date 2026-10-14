import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { applyStanding } from "../../../engine/standing";
import { TRIM_IDS, type TrimId } from "../../adeeva/content/trim";
import { findById } from "./catalog";
import { evaluateFlip, type FlipEvaluation } from "./flipEvaluate";
import { patchScrapIds, savedTrimsPlaced } from "./finishing";
import type { FlipRun } from "./flipRun";
import { mainFind } from "./flipTags";
import type { GameState, LogEntry, Stock } from "./gameState";
import { hallClosedIssue } from "./hallDay";
import { addKept } from "./keptInUse";
import type { RackPiece } from "./rackPiece";
import { rackIsFull } from "./rackRoom";
import { flipRewards } from "./rewards";
import { runKind } from "./runKind";
import { stallDayIssue } from "./stallCalendar";
import { queueStoryTrigger } from "./storyQueue";
import { ticketRewards } from "./ticketRewards";

export const FLIPS_FOR_ROSETTE = 10;

function consumeFinishes(stock: Stock, run: FlipRun): Stock {
  const used = patchScrapIds(run);
  const savedTrims = Object.fromEntries(
    TRIM_IDS.map((id) => [id, stock.savedTrims[id] - savedTrimsPlaced(run, id)]),
  ) as Record<TrimId, number>;
  return { ...stock, savedTrims, scraps: stock.scraps.filter((scrap) => !used.has(scrap.id)) };
}

export function canDeliver(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null || run.stage !== "review") return actionCheck(["Finish the flip first."]);
  const reasons: string[] = [];
  const closed = stallDayIssue(state.calendar.day) ?? hallClosedIssue(state);
  if (closed !== null) reasons.push(closed);
  if (TRIM_IDS.some((id) => savedTrimsPlaced(run, id) > state.stock.savedTrims[id]))
    reasons.push("Some saved buttons & bows are missing.");
  const scrapIds = new Set(state.stock.scraps.map((scrap) => scrap.id));
  if ([...patchScrapIds(run)].some((id) => !scrapIds.has(id))) reasons.push("A patch scrap is missing.");
  const { purpose } = run;
  if (purpose.kind === "gig" && !state.gigs.active.some((gig) => gig.id === purpose.gigId))
    reasons.push("This order is no longer open.");
  if (purpose.kind === "own" && rackIsFull(state))
    reasons.push(
      state.profile.career === "boutique"
        ? "The seasonal rack is full. Sell some pieces on Till Day."
        : "The stall rack is full. Sell some pieces on Stall Day.",
    );
  return actionCheck(reasons);
}

function rackPieceFor(state: GameState, run: FlipRun, evaluation: FlipEvaluation): RackPiece | null {
  const main = mainFind(run);
  if (main === null || run.design.recipeId === null) return null;
  const find = findById(main.findId);
  const { reuse, salvage, secondhand, leaves } = evaluation.leaves;
  return {
    id: `piece-${state.next.piece}`,
    runId: run.id,
    recipeId: run.design.recipeId,
    design: run.design,
    cloth: { colour: find.colour, print: find.print, material: find.material },
    quality: evaluation.quality.quality,
    leaves,
    tags: evaluation.tags,
    finishes: run.finishes,
    madeDay: state.calendar.day,
    findIds: run.finds.map((owned) => owned.findId),
    seamAccuracy: evaluation.quality.seams,
    leavesParts: { reuse, salvage, secondhand },
    colours: evaluation.colours,
    showcaseSeason: null,
  };
}

function celebrate(state: GameState, run: FlipRun): GameState {
  const finished = addKept({ ...state, flipsFinished: state.flipsFinished + 1 }, run.finds.length);
  return finished.flipsFinished >= FLIPS_FOR_ROSETTE ? queueStoryTrigger(finished, "ten-flips") : finished;
}

function deliverTicket(state: GameState, run: FlipRun, committed: GameState, gigId: string): GameState {
  const brief = run.brief;
  if (brief === null) return state;
  const day = state.calendar.day;
  const evaluation = evaluateFlip(state, run, day);
  const reward = ticketRewards(evaluation, brief, state.profile);
  const entry: LogEntry = {
    runId: run.id,
    kind: "ticket",
    clientId: brief.clientId,
    day,
    evaluation,
    reward,
  };
  const rewarded = applyStanding(
    {
      ...committed,
      gigs: { ...state.gigs, active: state.gigs.active.filter((gig) => gig.id !== gigId) },
      gigsDelivered: state.gigsDelivered + 1,
      log: [...state.log, entry],
    },
    reward,
  );
  const kept = addKept(rewarded, 1);
  return brief.kind === "mend" ? queueStoryTrigger(kept, "first-mend") : kept;
}

export function deliver(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || !canDeliver(state).ok) return state;
  const day = state.calendar.day;
  const committed: GameState = {
    ...state,
    stock: consumeFinishes(state.stock, run),
    activeRun: { ...run, stage: "done", reachedStage: "done" },
  };
  const { purpose, brief } = run;
  if (purpose.kind === "gig" && runKind(run) !== "flip")
    return deliverTicket(state, run, committed, purpose.gigId);
  const evaluation = evaluateFlip(state, run, day);
  if (purpose.kind === "own" || brief === null) {
    const piece = rackPieceFor(state, run, evaluation);
    if (piece === null) return state;
    const entry: LogEntry = { runId: run.id, kind: "own", clientId: null, day, evaluation, reward: null };
    return celebrate(
      {
        ...committed,
        rack: [...state.rack, piece],
        log: [...state.log, entry],
        next: { ...state.next, piece: state.next.piece + 1 },
      },
      run,
    );
  }
  const reward = flipRewards(evaluation, brief, {
    difficulty: state.profile.difficulty,
    trait: state.profile.trait,
    hotTags: state.trends.current,
  });
  const entry: LogEntry = { runId: run.id, kind: "gig", clientId: brief.clientId, day, evaluation, reward };
  const rewarded = applyStanding(
    {
      ...committed,
      gigs: { ...state.gigs, active: state.gigs.active.filter((gig) => gig.id !== purpose.gigId) },
      gigsDelivered: state.gigsDelivered + 1,
      log: [...state.log, entry],
    },
    reward,
  );
  return celebrate(queueStoryTrigger(rewarded, "first-delivery"), run);
}

export function lastResult(state: GameState): LogEntry | null {
  return state.log[state.log.length - 1] ?? null;
}
