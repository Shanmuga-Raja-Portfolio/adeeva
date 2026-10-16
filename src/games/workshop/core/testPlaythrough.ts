import type { AvatarLook } from "../../../engine/avatar";
import { hasHours } from "../../../engine/dayHours";
import type { Point } from "../../../engine/geometry/point";
import type { ColourId } from "../../../engine/palette";
import type { CushionFabricId } from "../content/cushionFabric";
import type { ExtraId } from "../content/extra";
import type { FinishId } from "../content/finish";
import type { PartOptionId, PartSlot } from "../content/partOption";
import type { ProductId } from "../content/product";
import type { RunStage } from "../content/runStage";
import type { WoodId } from "../content/wood";
import type { Action } from "./action";
import { rollClientBrief } from "./brief";
import { clientById, difficultyById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import { CUSHION_SEAM_BOUNDS } from "./cushion";
import type { GameState } from "./gameState";
import { leaveHours } from "./hourCost";
import { jointTargetAngle, jointTaps } from "./joint";
import { createGame, type NewGameSettings } from "./newGame";
import { designJoints, designParts, designSurfaces, runCanonical, type RunShape } from "./pieceParts";
import { reduce } from "./reduce";
import { COMMISSION_PURPOSE } from "./runPurpose";
import { SAND_CANVAS, SAND_ROWS } from "./sanding";
import { partCuts } from "./sawRecord";
import type { SawCut } from "./sawPath";
import { currentBeat } from "./storyQueue";

export const TEST_LOOK: AvatarLook = {
  skinTone: "amber",
  hairStyle: "ponytail",
  hairColour: "auburn",
  outfit: "studio-apron",
};

export const TEST_SEAM_TICKS = 600;

export function newTestGame(overrides: Partial<NewGameSettings> = {}): GameState {
  return createGame({
    seed: 21,
    name: "Robin",
    look: TEST_LOOK,
    trait: "dreamer",
    difficulty: "standard",
    career: "garage",
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

export function productShape(productId: ProductId): RunShape {
  return { design: { productId, options: {}, woodId: null }, purpose: COMMISSION_PURPOSE };
}

export function runOf(state: GameState): CommissionRun {
  if (state.activeRun === null) throw new Error("Nothing on the workbench");
  return state.activeRun;
}

export function withActiveGig(state: GameState, clientId: string): GameState {
  const client = clientById(clientId);
  if (client === undefined) throw new Error(`Unknown client ${clientId}`);
  const bonus = difficultyById(state.profile.difficulty).minQualityBonus;
  const [brief, rng] = rollClientBrief(client, state.calendar.day, bonus, state.rng);
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

export function lastGigId(state: GameState): string {
  const gig = state.gigs.active[state.gigs.active.length - 1];
  if (gig === undefined) throw new Error("No gig on the go");
  return gig.id;
}

export interface PiecePlan {
  readonly productId: ProductId;
  readonly options: Readonly<Partial<Record<PartSlot, PartOptionId>>>;
  readonly woodId: WoodId;
  readonly layout: "canonical" | "show-me";
  readonly saw: "trace" | "assist";
  readonly joinOffsetShare: number;
  readonly sand: "along" | "across" | "assist";
  readonly finishId: FinishId;
  readonly paint: ColourId | null;
  readonly extras: readonly ExtraId[];
  readonly cushion: CushionFabricId | null;
  readonly seamShare: number;
}

export const BIRDHOUSE_PLAN: PiecePlan = {
  productId: "birdhouse",
  options: { edge: "square-edge", accent: "no-accent" },
  woodId: "pine",
  layout: "canonical",
  saw: "trace",
  joinOffsetShare: 0,
  sand: "along",
  finishId: "clear-oil",
  paint: null,
  extras: [],
  cushion: null,
  seamShare: 1,
};

export function designActions(plan: PiecePlan): Action[] {
  return [
    { type: "chooseProduct", productId: plan.productId },
    ...Object.entries(plan.options).flatMap(([slot, optionId]): Action[] =>
      optionId === undefined ? [] : [{ type: "chooseOption", slot: slot as PartSlot, optionId }],
    ),
    { type: "chooseWood", woodId: plan.woodId },
  ];
}

export function canonicalActions(state: GameState): Action[] {
  const run = runOf(state);
  const woodId = run.design.woodId;
  if (woodId === null) return [];
  const boards = state.boards.filter((board) => board.woodId === woodId);
  const seen = { short: 0, long: 0, panel: 0 };
  return runCanonical(run).flatMap((canonical) => {
    const board = boards.filter((entry) => entry.size === canonical.size)[seen[canonical.size]];
    seen[canonical.size] += 1;
    if (board === undefined) return [];
    return canonical.spots.map((spot): Action => ({
      type: "placePart",
      partId: spot.partId,
      boardId: board.id,
      x: spot.x,
      y: spot.y,
      rotation: 0,
    }));
  });
}

export function tracePoints(cut: SawCut): Point[] {
  const points = cut.closed ? [...cut.points, cut.points[0] ?? [0, 0]] : cut.points;
  return points.slice(1).flatMap((end, index) => {
    const start = points[index] ?? end;
    const steps = Math.max(2, Math.ceil(Math.hypot(end[0] - start[0], end[1] - start[1]) / 0.4));
    return Array.from({ length: steps }, (_, step): Point => [
      start[0] + ((end[0] - start[0]) * step) / steps,
      start[1] + ((end[1] - start[1]) * step) / steps,
    ]);
  });
}

export function sawActions(state: GameState, mode: "trace" | "assist"): Action[] {
  const run = runOf(state);
  return designParts(run).flatMap((part): Action[] =>
    mode === "assist"
      ? [{ type: "sawAssist", partId: part.id }]
      : partCuts(state, run, part).map((cut, index) => ({
          type: "sawCut",
          partId: part.id,
          cut: index,
          samples: tracePoints(cut),
        })),
  );
}

export function joinActions(
  state: GameState,
  offsetShare: number,
  toleranceMm: (kind: string) => number,
): Action[] {
  const run = runOf(state);
  return designJoints(run).map((joint) => ({
    type: "seatJoint",
    jointId: joint.id,
    pose: { x: toleranceMm(joint.kind) * offsetShare, y: 0, angle: jointTargetAngle(run.design, joint) },
    goodTaps: jointTaps(joint),
    assisted: false,
  }));
}

export function sandPath(direction: "along" | "across"): Point[] {
  const rows = Array.from({ length: SAND_ROWS }, (_, row) => ((row + 0.5) * SAND_CANVAS.height) / SAND_ROWS);
  if (direction === "along")
    return rows.flatMap((y) => [
      [4, y] as Point,
      [SAND_CANVAS.width - 4, y] as Point,
      [4, y] as Point,
      [SAND_CANVAS.width - 4, y] as Point,
    ]);
  const columns = Array.from({ length: 8 }, (_, column) => ((column + 0.5) * SAND_CANVAS.width) / 8);
  return columns.flatMap((x) => [
    [x, 4] as Point,
    [x, SAND_CANVAS.height - 4] as Point,
    [x, 4] as Point,
    [x, SAND_CANVAS.height - 4] as Point,
  ]);
}

export function sandActions(state: GameState, mode: "along" | "across" | "assist"): Action[] {
  const run = runOf(state);
  return designSurfaces(run).flatMap((part): Action[] =>
    [0, 1].map(() => ({
      type: "sandDrag",
      surfaceId: part.id,
      points: sandPath(mode === "across" ? "across" : "along"),
      assisted: mode === "assist",
    })),
  );
}

export function finishActions(plan: PiecePlan): Action[] {
  const seam: Action[] =
    plan.cushion === null
      ? []
      : [
          { type: "chooseCushion", fabricId: plan.cushion },
          {
            type: "recordSeam",
            progress: CUSHION_SEAM_BOUNDS.units,
            ticks: TEST_SEAM_TICKS,
            insideTicks: Math.round(TEST_SEAM_TICKS * plan.seamShare),
            assisted: false,
          },
        ];
  return [
    { type: "chooseFinish", finishId: plan.finishId, paint: plan.paint },
    ...plan.extras.map((extraId, index): Action => ({
      type: "addExtra",
      extraId,
      x: 120 + index * 30,
      y: 120,
      piece: 0,
    })),
    ...seam,
  ];
}

export const PLAY_STEPS: readonly RunStage[] = ["layout", "saw", "join", "sand", "finish", "review"];

export function stepWork(
  state: GameState,
  stage: RunStage,
  plan: PiecePlan,
  toleranceMm: (kind: string) => number,
): Action[] {
  switch (stage) {
    case "layout":
      return plan.layout === "canonical"
        ? canonicalActions(state)
        : designParts(runOf(state)).map((): Action => ({ type: "showMe", partId: null }));
    case "saw":
      return sawActions(state, plan.saw);
    case "join":
      return joinActions(state, plan.joinOffsetShare, toleranceMm);
    case "sand":
      return sandActions(state, plan.sand);
    case "finish":
      return finishActions(plan);
    default:
      return [];
  }
}

export function moveOn(state: GameState, stage: RunStage): GameState {
  const moved = reduce(state, { type: "goToStage", stage });
  if (moved !== state || hasHours(state.calendar, leaveHours(runOf(state)))) return moved;
  return reduce(reduce(state, { type: "endDay" }), { type: "goToStage", stage });
}

export function playSteps(
  state: GameState,
  plan: PiecePlan,
  stop: RunStage,
  toleranceMm: (kind: string) => number = () => 1,
): GameState {
  let current = state;
  for (const [index, stage] of PLAY_STEPS.entries()) {
    if (stage === stop) return current;
    const next = PLAY_STEPS[index + 1];
    const worked = dispatchAll(current, stepWork(current, stage, plan, toleranceMm));
    current = next === undefined ? worked : moveOn(worked, next);
  }
  return current;
}

export function playUntil(
  state: GameState,
  gigId: string,
  plan: PiecePlan,
  stop: RunStage,
  toleranceMm: (kind: string) => number = () => 1,
): GameState {
  const laidOut = dispatchAll(state, [
    { type: "startCommission", gigId },
    { type: "goToStage", stage: "design" },
    ...designActions(plan),
    { type: "goToStage", stage: "timber" },
    { type: "buyPlan" },
    { type: "goToStage", stage: "layout" },
  ]);
  return playSteps(laidOut, plan, stop, toleranceMm);
}

export function playToReview(
  state: GameState,
  gigId: string,
  plan: PiecePlan,
  toleranceMm: (kind: string) => number = () => 1,
): GameState {
  return playUntil(state, gigId, plan, "review", toleranceMm);
}
