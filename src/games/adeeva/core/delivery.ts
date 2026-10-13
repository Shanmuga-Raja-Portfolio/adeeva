import { TRIM_IDS, type TrimId } from "../content/trim";
import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { trimById } from "./catalog";
import type { DressRun } from "./dressRun";
import { snapshotRun, type DressSnapshot } from "./dressSnapshot";
import { evaluate, type Evaluation } from "./evaluate";
import type { GameState, Inventory, LogEntry } from "./gameState";
import { canLaunchLabel } from "./labelLaunch";
import { rewards } from "./rewards";
import { applyStanding } from "../../../engine/standing";
import { queueStoryTrigger } from "./storyQueue";

function placedTrimCount(run: DressRun, trimId: TrimId): number {
  return run.decorations.filter((decoration) => decoration.trimId === trimId).length;
}

function consumeTrims(inventory: Inventory, run: DressRun): Inventory {
  const trims = Object.fromEntries(
    TRIM_IDS.map((trimId) => [trimId, inventory.trims[trimId] - placedTrimCount(run, trimId)]),
  ) as Record<TrimId, number>;
  return { ...inventory, trims };
}

export function canDeliver(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null || run.stage !== "review") return actionCheck(["Finish the dress before delivering it."]);
  if (state.deliveredRunIds.includes(run.id)) return actionCheck(["This dress was already delivered."]);
  const reasons = TRIM_IDS.filter(
    (trimId) => placedTrimCount(run, trimId) > state.inventory.trims[trimId],
  ).map((trimId) => `Not enough ${trimById(trimId).name} in stock.`);
  const { purpose } = run;
  if (purpose.kind === "gig" && !state.gigs.active.some((gig) => gig.id === purpose.gigId))
    reasons.push("This gig is no longer open.");
  if (purpose.kind === "look" && (state.season === null || state.season.looks[purpose.lookIndex] !== null))
    reasons.push("This look slot is no longer open.");
  return actionCheck(reasons);
}

function deliverGig(
  state: GameState,
  run: DressRun,
  gigId: string,
  snapshot: DressSnapshot,
  evaluation: Evaluation,
): GameState {
  const reward = rewards(evaluation, run.brief, snapshot, {
    difficulty: state.profile.difficulty,
    trait: state.profile.trait,
    hotTags: state.trends.current,
  });
  const entry: LogEntry = {
    runId: run.id,
    purpose: run.purpose,
    clientId: run.brief.clientId,
    day: state.calendar.day,
    evaluation,
    reward,
  };
  const rewarded = applyStanding(
    {
      ...state,
      gigs: { ...state.gigs, active: state.gigs.active.filter((gig) => gig.id !== gigId) },
      gigsDelivered: state.gigsDelivered + 1,
      log: [...state.log, entry],
    },
    reward,
  );
  const celebrated = queueStoryTrigger(rewarded, "first-delivery");
  return canLaunchLabel(celebrated).ok ? queueStoryTrigger(celebrated, "showcase-offer") : celebrated;
}

function deliverLook(
  state: GameState,
  run: DressRun,
  lookIndex: number,
  snapshot: DressSnapshot,
  evaluation: Evaluation,
): GameState {
  const season = state.season;
  if (season === null) return state;
  const looks = season.looks.map((look, index) =>
    index === lookIndex ? { runId: run.id, snapshot, evaluation } : look,
  );
  const entry: LogEntry = {
    runId: run.id,
    purpose: run.purpose,
    clientId: null,
    day: state.calendar.day,
    evaluation,
    reward: null,
  };
  return { ...state, season: { ...season, looks }, log: [...state.log, entry] };
}

export function deliver(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || !canDeliver(state).ok) return state;
  const snapshot = snapshotRun(run);
  const evaluation = evaluate(snapshot, run.brief, { deliveredDay: state.calendar.day });
  const committed: GameState = {
    ...state,
    inventory: consumeTrims(state.inventory, run),
    activeRun: { ...run, stage: "done" },
    deliveredRunIds: [...state.deliveredRunIds, run.id],
  };
  const { purpose } = run;
  return purpose.kind === "gig"
    ? deliverGig(committed, run, purpose.gigId, snapshot, evaluation)
    : deliverLook(committed, run, purpose.lookIndex, snapshot, evaluation);
}

export function lastResult(state: GameState): LogEntry | null {
  return state.log[state.log.length - 1] ?? null;
}
