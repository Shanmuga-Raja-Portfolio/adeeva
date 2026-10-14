import type { AvatarLook } from "../../../engine/avatar";
import type { Point } from "../../../engine/geometry/point";
import type { ConditionGrade } from "../content/condition";
import type { FindId } from "../content/find";
import type { RecipeId } from "../content/recipe";
import type { Action } from "./action";
import { autoPlacements } from "./autoLayout";
import { rollClientBrief } from "./brief";
import { clientById, difficultyById, findById } from "./catalog";
import { cellThreshold } from "./clean";
import type { Design } from "./design";
import type { FinishRequest } from "./finishing";
import { runPieces, runSeams } from "./runPieces";
import type { FlipRun } from "./flipRun";
import type { GameState } from "./gameState";
import { runBoard } from "./layout";
import { createGame, type NewGameSettings } from "./newGame";
import { rollOwnedFind, type OwnedFind } from "./ownedFind";
import { piecePolygon } from "./placement";
import { reduce } from "./reduce";
import { currentBeat } from "./storyQueue";

export const TEST_LOOK: AvatarLook = {
  skinTone: "honey",
  hairStyle: "braids",
  hairColour: "black",
  outfit: "studio-apron",
};

export const TEST_SEAM_TICKS = 1000;

export function newTestGame(overrides: Partial<NewGameSettings> = {}): GameState {
  return createGame({
    seed: 7,
    name: "Ada",
    look: TEST_LOOK,
    trait: "dreamer",
    difficulty: "standard",
    career: "stall",
    ...overrides,
  });
}

export function dispatchAll(state: GameState, actions: readonly Action[]): GameState {
  return actions.reduce(reduce, state);
}

export function settleStories(state: GameState): GameState {
  let next = state;
  for (let guard = 0; guard < 20; guard += 1) {
    const beat = currentBeat(next);
    if (beat === null) return next;
    next = reduce(next, { type: "markBeatSeen", beatId: beat.id });
  }
  return next;
}

export function runOf(state: GameState): FlipRun {
  if (state.activeRun === null) throw new Error("No flip on the bench");
  return state.activeRun;
}

export function flipAtUnpick(
  base: GameState,
  clientId: string,
  design: Design,
  finds: readonly { readonly findId: FindId; readonly grade: ConditionGrade }[],
): GameState {
  const withGig = withActiveGig(base, clientId);
  const stocked = finds.reduce((state, entry) => withFind(state, entry.findId, entry.grade), withGig);
  const keys = stocked.stock.finds.slice(-finds.length).map((owned) => owned.id);
  return dispatchAll(stocked, [
    { type: "startFlip", gigId: stocked.gigs.active[stocked.gigs.active.length - 1]?.id ?? "" },
    { type: "goToStage", stage: "design" },
    ...designActions(design),
    { type: "goToStage", stage: "market" },
    { type: "chooseFinds", findIds: keys },
    { type: "goToStage", stage: "unpick" },
  ]);
}

export function withActiveGig(state: GameState, clientId: string): GameState {
  const client = clientById(clientId);
  if (client === undefined) throw new Error(`Unknown client ${clientId}`);
  const [brief, rng] = rollClientBrief(
    client,
    state.calendar.day,
    state.rng,
    difficultyById(state.profile.difficulty).minQualityBonus,
  );
  const id = `gig-${state.gigs.nextGigNumber}`;
  return {
    ...state,
    rng,
    gigs: {
      ...state.gigs,
      active: [...state.gigs.active, { id, clientId, brief, acceptedDay: state.calendar.day }],
      nextGigNumber: state.gigs.nextGigNumber + 1,
    },
  };
}

export function withFind(state: GameState, findId: FindId, grade: ConditionGrade = "like-new"): GameState {
  const [owned, rng] = rollOwnedFind(
    `find-${state.next.find}`,
    findId,
    grade,
    findById(findId).price,
    state.rng,
  );
  return {
    ...state,
    rng,
    stock: { ...state.stock, finds: [...state.stock.finds, owned] },
    next: { ...state.next, find: state.next.find + 1 },
  };
}

export function designActions(design: Design): Action[] {
  if (design.recipeId === null) return [];
  const recipeId: RecipeId = design.recipeId;
  return [
    { type: "chooseRecipe", recipeId },
    ...Object.entries(design.parts).map(([groupId, partId]): Action => ({
      type: "choosePart",
      groupId,
      partId,
    })),
  ];
}

export function unpickAll(state: GameState, distanceCm: number): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  const actions = run.finds.flatMap((owned) =>
    findById(owned.findId).lines.flatMap((line, lineIndex) =>
      Array.from({ length: line.stitches }, (_, stitch): Action => ({
        type: "pullStitch",
        findKey: owned.id,
        line: lineIndex,
        stitch,
        distanceCm,
        assisted: false,
      })),
    ),
  );
  return dispatchAll(state, actions);
}

export function scrubAll(state: GameState, harshShare: number): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  const actions = run.finds.flatMap((owned: OwnedFind) =>
    owned.stains.map((stain): Action => {
      const perCell = Math.ceil(cellThreshold(state, owned, stain));
      const moving = perCell * stain.cells;
      const harshTicks = Math.round(moving * harshShare);
      return {
        type: "scrubStain",
        findKey: owned.id,
        stainId: stain.id,
        cellTicks: Array.from({ length: stain.cells }, () => perCell),
        harshTicks,
        scrubTicks: moving + harshTicks,
      };
    }),
  );
  return dispatchAll(state, actions);
}

export function layoutActions(state: GameState): Action[] {
  const run = state.activeRun;
  if (run === null) return [];
  const placements = autoPlacements(runBoard(run), runPieces(run), {});
  if (placements === null) throw new Error("These finds cannot hold the pieces");
  return Object.entries(placements).map(([pieceId, placement]) => ({
    type: "placePiece",
    pieceId,
    ...placement,
  }));
}

export function outlineTrace(state: GameState, pieceId: string): Point[] {
  const run = state.activeRun;
  const piece = run === null ? undefined : runPieces(run).find((entry) => entry.id === pieceId);
  const placement = run?.placements[pieceId];
  if (piece === undefined || placement === undefined) return [];
  const outline = piecePolygon(piece, placement);
  return outline.flatMap((start, index) => {
    const end = outline[(index + 1) % outline.length] ?? start;
    const steps = Math.max(2, Math.ceil(Math.hypot(end[0] - start[0], end[1] - start[1]) / 0.5));
    return Array.from({ length: steps }, (_, step): Point => [
      start[0] + ((end[0] - start[0]) * step) / steps,
      start[1] + ((end[1] - start[1]) * step) / steps,
    ]);
  });
}

export function traceActions(state: GameState): Action[] {
  const run = state.activeRun;
  const pieces = run === null ? [] : runPieces(run);
  return pieces.map((piece) => ({
    type: "traceCut",
    pieceId: piece.id,
    samples: outlineTrace(state, piece.id),
  }));
}

export function cutActions(state: GameState, mode: "trace" | "assist"): Action[] {
  if (mode === "assist") return [{ type: "commitCut", assisted: true }];
  return [...traceActions(state), { type: "commitCut", assisted: false }];
}

export function seamActions(state: GameState, accuracy: number): Action[] {
  const run = state.activeRun;
  if (run === null) return [];
  return runSeams(run).map((seam) => ({
    type: "recordSeam",
    seamId: seam.id,
    progress: 1,
    ticks: TEST_SEAM_TICKS,
    insideTicks: Math.round(accuracy * TEST_SEAM_TICKS),
    assisted: false,
  }));
}

export function finishActions(state: GameState): Action[] {
  const run = state.activeRun;
  const brief = run?.brief ?? null;
  if (brief === null) return [];
  let scrapIndex = 0;
  return brief.requiredFinishes.flatMap((requirement) =>
    Array.from({ length: requirement.count }, (_, index): Action => {
      let finish: FinishRequest;
      if (requirement.kind === "trim") {
        const saved = state.stock.savedTrims[requirement.trim] > index;
        finish = { kind: "trim", trimId: requirement.trim, source: saved ? "saved" : "new" };
      } else if (requirement.kind !== "patch") {
        finish = { kind: "mark", markId: "mend-darn", colour: null };
      } else {
        const scrap = state.stock.scraps[scrapIndex];
        scrapIndex += 1;
        finish = {
          kind: "patch",
          patchId: requirement.patch === "any" ? "patch-heart" : requirement.patch,
          scrapId: scrap?.id ?? "",
        };
      }
      return { type: "addFinish", finish, x: 120 + index * 40, y: 160 + scrapIndex * 20 };
    }),
  );
}

export interface FlipPlan {
  readonly design: Design;
  readonly findId: FindId;
  readonly grade: ConditionGrade;
  readonly pullCm: number;
  readonly harshShare: number;
  readonly cut: "trace" | "assist";
  readonly seamAccuracy: number;
}

export function playFlipToReview(state: GameState, gigId: string | null, plan: FlipPlan): GameState {
  const prepared = withFind(state, plan.findId, plan.grade);
  const findKey = `find-${state.next.find}`;
  const start: Action[] =
    gigId === null
      ? [{ type: "startOwnFlip" }]
      : [
          { type: "startFlip", gigId },
          { type: "goToStage", stage: "design" },
        ];
  const planned = dispatchAll(prepared, [
    ...start,
    ...designActions(plan.design),
    { type: "goToStage", stage: "market" },
    { type: "chooseFinds", findIds: [findKey] },
    { type: "goToStage", stage: "unpick" },
  ]);
  const unpicked = reduce(unpickAll(planned, plan.pullCm), { type: "goToStage", stage: "clean" });
  const cleaned = reduce(scrubAll(unpicked, plan.harshShare), { type: "goToStage", stage: "layout" });
  const laid = dispatchAll(cleaned, [...layoutActions(cleaned), { type: "goToStage", stage: "cut" }]);
  const cut = dispatchAll(laid, [...cutActions(laid, plan.cut), { type: "goToStage", stage: "sew" }]);
  const sewn = dispatchAll(cut, [
    ...seamActions(cut, plan.seamAccuracy),
    { type: "goToStage", stage: "finish" },
  ]);
  return dispatchAll(sewn, [...finishActions(sewn), { type: "goToStage", stage: "review" }]);
}
