import type { ShopSignId } from "../content/shopSign";
import type { Action } from "./action";
import { hemSpot } from "./alterLayout";
import { UNLOCK_FAIR_SALES, UNLOCK_GIGS_DELIVERED, UNLOCK_REPUTATION } from "./boutiqueUnlock";
import type { GameState } from "./gameState";
import { runBoard } from "./layout";
import type { NewGameSettings } from "./newGame";
import type { RackPiece } from "./rackPiece";
import { reduce } from "./reduce";
import { HEM_PIECE } from "./runPieces";
import { currentBeat } from "./storyQueue";
import {
  cutActions,
  dispatchAll,
  newTestGame,
  scrubAll,
  seamActions,
  settleStories,
  unpickAll,
} from "./testPlaythrough";

export const TEST_SIGN: ShopSignId = "second-bloom";

export function settleWithChoice(
  state: GameState,
  choiceId: "open" | "later",
  signId = TEST_SIGN,
): GameState {
  let next = state;
  for (let guard = 0; guard < 30; guard += 1) {
    const beat = currentBeat(next);
    if (beat === null) return next;
    next =
      beat.choices.length > 0
        ? reduce(next, { type: "chooseStoryOption", beatId: beat.id, choiceId, signId })
        : reduce(next, { type: "markBeatSeen", beatId: beat.id });
  }
  return next;
}

export function endDays(state: GameState, days: number): GameState {
  let next = state;
  for (let day = 0; day < days; day += 1) next = settleStories(reduce(next, { type: "endDay" }));
  return next;
}

export function stallDayAtThreshold(overrides: Partial<NewGameSettings> = {}): GameState {
  const fresh = settleStories(newTestGame(overrides));
  const atStallDay = endDays(fresh, 6);
  return {
    ...atStallDay,
    reputation: UNLOCK_REPUTATION,
    gigsDelivered: UNLOCK_GIGS_DELIVERED,
    fairSales: UNLOCK_FAIR_SALES,
  };
}

export function offerQueued(overrides: Partial<NewGameSettings> = {}): GameState {
  return reduce(stallDayAtThreshold(overrides), { type: "endDay" });
}

export function openedBoutique(overrides: Partial<NewGameSettings> = {}): GameState {
  return settleWithChoice(offerQueued(overrides), "open");
}

export function boutiqueStart(overrides: Partial<NewGameSettings> = {}): GameState {
  return settleStories(newTestGame({ career: "boutique", ...overrides }));
}

export function rackPieceFixture(id: string, overrides: Partial<RackPiece> = {}): RackPiece {
  return {
    id,
    runId: "run-1",
    recipeId: "tote-bag",
    design: { recipeId: "tote-bag", parts: {} },
    cloth: { colour: "coral", print: "dot", material: "cotton" },
    quality: 84,
    leaves: 70,
    tags: ["casual", "playful"],
    finishes: [],
    madeDay: 1,
    findIds: ["coral-sundress"],
    seamAccuracy: 0.85,
    leavesParts: { reuse: 0.7, salvage: 0.7, secondhand: 0.7 },
    colours: ["coral"],
    showcaseSeason: null,
    ...overrides,
  };
}

export function withRack(state: GameState, pieces: readonly RackPiece[]): GameState {
  const top = pieces.reduce((max, piece) => Math.max(max, Number(piece.id.replace("piece-", "")) || 0), 0);
  return { ...state, rack: [...pieces], next: { ...state.next, piece: Math.max(state.next.piece, top + 1) } };
}

export function hemLayoutActions(state: GameState): Action[] {
  const run = state.activeRun;
  const spot = run === null ? null : hemSpot(runBoard(run));
  return spot === null ? [] : [{ type: "placePiece", pieceId: HEM_PIECE.id, ...spot }];
}

export function playTicketToReview(state: GameState, gigId: string, seamAccuracy = 0.88): GameState {
  const started = dispatchAll(state, [
    { type: "startFlip", gigId },
    { type: "goToStage", stage: "unpick" },
  ]);
  const run = started.activeRun;
  if (run === null) return started;
  const unpicked = unpickAll(started, 2);
  if (run.brief?.kind === "alter") {
    const atLayout = reduce(unpicked, { type: "goToStage", stage: "layout" });
    const laid = dispatchAll(atLayout, [...hemLayoutActions(atLayout), { type: "goToStage", stage: "cut" }]);
    const cut = dispatchAll(laid, [...cutActions(laid, "trace"), { type: "goToStage", stage: "sew" }]);
    return dispatchAll(cut, [...seamActions(cut, seamAccuracy), { type: "goToStage", stage: "review" }]);
  }
  const cleaned = reduce(scrubAll(reduce(unpicked, { type: "goToStage", stage: "clean" }), 0.05), {
    type: "goToStage",
    stage: "sew",
  });
  const sewn = dispatchAll(cleaned, [
    ...seamActions(cleaned, seamAccuracy),
    { type: "goToStage", stage: "finish" },
  ]);
  return dispatchAll(sewn, [
    { type: "addFinish", finish: { kind: "mark", markId: "mend-darn", colour: null }, x: 200, y: 200 },
    { type: "goToStage", stage: "review" },
  ]);
}
