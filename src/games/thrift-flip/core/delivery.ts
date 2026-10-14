import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { applyStanding } from "../../../engine/standing";
import { TRIM_IDS, type TrimId } from "../../adeeva/content/trim";
import { findById } from "./catalog";
import { evaluateFlip, type FlipEvaluation } from "./flipEvaluate";
import { patchScrapIds, savedTrimsPlaced } from "./finishing";
import type { FlipRun } from "./flipRun";
import { mainFind } from "./flipTags";
import type { GameState, LogEntry, Stock } from "./gameState";
import { rackSize, type RackPiece } from "./rackPiece";
import { flipRewards } from "./rewards";
import { stallDayIssue } from "./stallCalendar";
import { queueStoryTrigger } from "./storyQueue";

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
  const stall = stallDayIssue(state.calendar.day);
  if (stall !== null) reasons.push(stall);
  if (TRIM_IDS.some((id) => savedTrimsPlaced(run, id) > state.stock.savedTrims[id]))
    reasons.push("Some saved buttons & bows are missing.");
  const scrapIds = new Set(state.stock.scraps.map((scrap) => scrap.id));
  if ([...patchScrapIds(run)].some((id) => !scrapIds.has(id))) reasons.push("A patch scrap is missing.");
  const { purpose } = run;
  if (purpose.kind === "gig" && !state.gigs.active.some((gig) => gig.id === purpose.gigId))
    reasons.push("This order is no longer open.");
  if (purpose.kind === "own" && state.rack.length >= rackSize(state.upgrades))
    reasons.push("The stall rack is full. Sell some pieces on Stall Day.");
  return actionCheck(reasons);
}

function rackPieceFor(state: GameState, run: FlipRun, evaluation: FlipEvaluation): RackPiece | null {
  const main = mainFind(run);
  if (main === null || run.design.recipeId === null) return null;
  const find = findById(main.findId);
  return {
    id: `piece-${state.next.piece}`,
    runId: run.id,
    recipeId: run.design.recipeId,
    design: run.design,
    cloth: { colour: find.colour, print: find.print, material: find.material },
    quality: evaluation.quality.quality,
    leaves: evaluation.leaves.leaves,
    tags: evaluation.tags,
    finishes: run.finishes,
    madeDay: state.calendar.day,
  };
}

function celebrate(state: GameState): GameState {
  const finished = { ...state, flipsFinished: state.flipsFinished + 1 };
  return finished.flipsFinished >= FLIPS_FOR_ROSETTE ? queueStoryTrigger(finished, "ten-flips") : finished;
}

export function deliver(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || !canDeliver(state).ok) return state;
  const day = state.calendar.day;
  const evaluation = evaluateFlip(state, run, day);
  const committed: GameState = {
    ...state,
    stock: consumeFinishes(state.stock, run),
    activeRun: { ...run, stage: "done", reachedStage: "done" },
  };
  const { purpose, brief } = run;
  if (purpose.kind === "own" || brief === null) {
    const piece = rackPieceFor(state, run, evaluation);
    if (piece === null) return state;
    const entry: LogEntry = { runId: run.id, kind: "own", clientId: null, day, evaluation, reward: null };
    return celebrate({
      ...committed,
      rack: [...state.rack, piece],
      log: [...state.log, entry],
      next: { ...state.next, piece: state.next.piece + 1 },
    });
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
  return celebrate(queueStoryTrigger(rewarded, "first-delivery"));
}

export function lastResult(state: GameState): LogEntry | null {
  return state.log[state.log.length - 1] ?? null;
}
