import type { AvatarLook } from "../../../engine/avatar";
import type { Point } from "../../../engine/geometry/point";
import type { ChainId, CharmId } from "../content/extra";
import type { FinishId } from "../content/finish";
import type { GlazeColour } from "../content/jewelColour";
import type { MetalId } from "../content/metal";
import type { OptionId, OptionSlot } from "../content/partOption";
import type { StallProductId } from "../content/product";
import type { StoneId } from "../content/stone";
import type { Action } from "./action";
import { rollClientBrief } from "./brief";
import { difficultyById, orderClientById, productById } from "./catalog";
import { runCutPaths } from "./cutRecord";
import { CHARM_ROTATION_STEP, coloredHolder, DISPLAY_CANVAS } from "./displayChoice";
import type { GameState } from "./gameState";
import { runJoints } from "./joinRecord";
import { createGame, type NewGameSettings } from "./newGame";
import type { CutPath } from "./partGeometry";
import { POLISH_GRID } from "./polish";
import { reduce } from "./reduce";
import { stageAfter, type RunStage } from "./runStage";
import { canAdvance } from "./stageReadiness";
import { runStages } from "./stageNavigation";
import { clawCount, runSeats } from "./stoneSetting";
import { currentBeat } from "./storyQueue";
import { hasShortfall, shortfall, type SupplyCart } from "./supplies";
import { seatCut } from "./partGeometry";

export const TEST_LOOK: AvatarLook = {
  skinTone: "amber",
  hairStyle: "braids",
  hairColour: "black",
  outfit: "studio-apron",
};

export const TEST_PX_PER_MM = 10;
const TRACE_SPACING_MM = 0.2;

export interface PiecePlan {
  readonly options: Readonly<Partial<Record<OptionSlot, OptionId>>>;
  readonly metalId: MetalId;
  readonly stoneId: StoneId | null;
  readonly cutOffset: number;
  readonly cutAssist: boolean;
  readonly overTicks: number;
  readonly joinAssist: boolean;
  readonly seatOffset: number;
  readonly clawTravel: number;
  readonly setAssist: boolean;
  readonly polishPasses: number;
  readonly polishAssist: boolean;
  readonly finish: FinishId;
  readonly glaze: GlazeColour | null;
  readonly chain: ChainId | null;
  readonly cordColour: GlazeColour | null;
  readonly charms: readonly CharmId[];
}

export const GOOD_PLAN: PiecePlan = {
  options: {},
  metalId: "brass",
  stoneId: "garnet",
  cutOffset: 0,
  cutAssist: false,
  overTicks: 0,
  joinAssist: false,
  seatOffset: 0,
  clawTravel: 0.8,
  setAssist: false,
  polishPasses: 2,
  polishAssist: false,
  finish: "high-shine",
  glaze: null,
  chain: "fine-chain",
  cordColour: null,
  charms: [],
};

export function newTestGame(overrides: Partial<NewGameSettings> = {}): GameState {
  return createGame({
    seed: 7,
    name: "Ada",
    look: TEST_LOOK,
    trait: "dreamer",
    difficulty: "standard",
    career: "bench",
    lineNameId: "little-lantern",
    ...overrides,
  });
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

export function dispatchAll(state: GameState, actions: readonly Action[]): GameState {
  return actions.reduce(reduce, state);
}

export function withOrder(state: GameState, clientId: string): GameState {
  const client = orderClientById(clientId);
  if (client === undefined) throw new Error(`Unknown client ${clientId}`);
  const [brief, rng] = rollClientBrief(
    client,
    { day: state.calendar.day, minQualityBonus: difficultyById(state.profile.difficulty).minQualityBonus },
    state.rng,
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

export function lastGigId(state: GameState): string {
  const gig = state.gigs.active[state.gigs.active.length - 1];
  if (gig === undefined) throw new Error("No active order");
  return gig.id;
}

function isDot(path: CutPath, point: Point): boolean {
  return path.dots.some((dot) => dot[0] === point[0] && dot[1] === point[1]);
}

export function traceStrokes(path: CutPath, offset: number): Point[][] {
  const count = path.points.length;
  const firstDot = path.points.findIndex((point) => isDot(path, point));
  const start = firstDot === -1 ? 0 : firstDot;
  const strokes: Point[][] = [];
  let stroke: Point[] = [];
  for (let step = 0; step < count; step += 1) {
    const from = path.points[(start + step) % count];
    const to = path.points[(start + step + 1) % count];
    if (from === undefined || to === undefined) continue;
    const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const pieces = Math.max(1, Math.ceil(length / TRACE_SPACING_MM));
    for (let piece = 0; piece < pieces; piece += 1) {
      const t = piece / pieces;
      stroke.push([from[0] + (to[0] - from[0]) * t + offset, from[1] + (to[1] - from[1]) * t]);
    }
    if (isDot(path, to)) {
      stroke.push([to[0] + offset, to[1]]);
      strokes.push(stroke);
      stroke = [[to[0] + offset, to[1]]];
    }
  }
  const first = path.points[start];
  if (first !== undefined) stroke.push([first[0] + offset, first[1]]);
  if (stroke.length > 1) strokes.push(stroke);
  return strokes;
}

export function polishRows(width: number, height: number): Point[][] {
  return Array.from({ length: POLISH_GRID }, (_, row) => {
    const y = ((row + 0.5) * height) / POLISH_GRID;
    return Array.from({ length: 13 }, (_, index): Point => [(index / 12) * width, y]);
  });
}

function stepForward(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null) throw new Error("Nothing on the bench");
  const next = stageAfter(runStages(run), run.stage);
  if (next === null) throw new Error("No step after this one");
  const moved = reduce(state, { type: "goToStage", stage: next });
  if (moved !== state) return moved;
  const check = canAdvance(state);
  if (check.reasons.some((reason) => reason.includes("End the day")))
    return stepForward(settleStories(reduce(state, { type: "endDay" })));
  throw new Error(`Cannot leave ${run.stage}: ${check.reasons.join(" ")}`);
}

function designPiece(state: GameState, plan: PiecePlan): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  const actions: Action[] = Object.entries(plan.options).flatMap(([slot, optionId]) =>
    optionId === undefined ? [] : [{ type: "chooseOption", slot: slot as OptionSlot, optionId } as const],
  );
  actions.push({ type: "chooseMetal", metalId: plan.metalId });
  if (plan.stoneId !== null && productById(run.design.productId).seats.length > 0)
    actions.push({ type: "chooseStone", stoneId: plan.stoneId });
  return dispatchAll(state, actions);
}

function stockUp(state: GameState, plan: PiecePlan): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  const missing = shortfall(state, run);
  const holder = productById(run.design.productId).holder;
  const fallback = holder?.choices[0];
  const swapHolder =
    holder !== null &&
    plan.chain !== null &&
    holder.choices.includes(plan.chain) &&
    holder.count > state.stock.extras[plan.chain];
  const extras: Partial<Record<ChainId | CharmId, number>> = Object.fromEntries(
    Object.entries(missing.extras).filter(([id]) => !swapHolder || id !== fallback || id === plan.chain),
  );
  if (swapHolder && holder !== null && plan.chain !== null)
    extras[plan.chain] = Math.max(extras[plan.chain] ?? 0, holder.count - state.stock.extras[plan.chain]);
  for (const charm of plan.charms) {
    const wanted = plan.charms.filter((id) => id === charm).length;
    const have = state.stock.extras[charm];
    if (have < wanted) extras[charm] = Math.max(extras[charm] ?? 0, wanted - have);
  }
  const cart: SupplyCart = { ...missing, extras };
  if (!hasShortfall(cart)) return state;
  const bought = reduce(state, { type: "buySupplies", cart });
  if (bought === state) throw new Error("Could not buy supplies");
  return bought;
}

function planSheet(state: GameState): GameState {
  return reduce(state, { type: "showMePlan" });
}

function cutAll(state: GameState, plan: PiecePlan): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  return runCutPaths(run).reduce((next, path) => {
    const cut = reduce(next, {
      type: "cutPath",
      pathId: path.id,
      strokes: traceStrokes(path, plan.cutOffset),
      pxPerMm: TEST_PX_PER_MM,
      assisted: plan.cutAssist,
    });
    if (cut === next) throw new Error(`Could not cut ${path.id}`);
    return cut;
  }, state);
}

function joinAll(state: GameState, plan: PiecePlan): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  return runJoints(run).reduce(
    (next, joint) =>
      reduce(next, {
        type: "recordJoin",
        jointId: joint.id,
        ticks: joint.ticks + plan.overTicks + 30,
        insideTicks: joint.ticks,
        overTicks: plan.overTicks,
        assisted: plan.joinAssist,
      }),
    state,
  );
}

function potPicked(state: GameState): GameState {
  const run = state.activeRun;
  const pot = state.collection?.stonePot ?? [];
  if (run === null || run.purpose.kind !== "collection" || run.stonesTaken) return state;
  const indices = pot.flatMap((stone, index) =>
    !stone.used && stone.stoneId === run.design.stoneId ? [index] : [],
  );
  return reduce(state, { type: "choosePotStones", indices: indices.slice(0, runSeats(run).length) });
}

function setAll(state: GameState, plan: PiecePlan): GameState {
  const picked = potPicked(state);
  const run = picked.activeRun;
  if (run === null) return picked;
  const claws = clawCount(seatCut(run.design));
  return runSeats(run).reduce(
    (next, seatKey) =>
      reduce(next, {
        type: "setStone",
        seatKey,
        x: plan.seatOffset,
        y: 0,
        rotation: 0,
        claws: Array.from({ length: claws }, () => plan.clawTravel),
        assisted: plan.setAssist,
      }),
    picked,
  );
}

function polishAll(state: GameState, plan: PiecePlan): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  let next = state;
  for (const part of productById(run.design.productId).parts) {
    if (plan.polishAssist) {
      next = reduce(next, { type: "buffPart", partKey: part.key });
      continue;
    }
    for (let pass = 0; pass < plan.polishPasses; pass += 1)
      for (const samples of polishRows(part.width, part.height))
        next = reduce(next, { type: "polishStroke", partKey: part.key, samples, pxPerMm: 20 });
  }
  return next;
}

function dressUp(state: GameState, plan: PiecePlan): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  const actions: Action[] = [{ type: "chooseFinish", finish: plan.finish, glaze: plan.glaze }];
  const holder = productById(run.design.productId).holder;
  const chain =
    holder === null || plan.chain === null
      ? null
      : holder.choices.includes(plan.chain)
        ? plan.chain
        : holder.choices[0];
  if (chain !== null && chain !== undefined)
    actions.push({
      type: "chooseChain",
      chain,
      cordColour: coloredHolder(chain) ? (plan.cordColour ?? "sky") : null,
    });
  plan.charms.forEach((charmId, index) =>
    actions.push({
      type: "addCharm",
      charmId,
      x: DISPLAY_CANVAS.width / 2 + (index - 1) * CHARM_ROTATION_STEP * 2,
      y: DISPLAY_CANVAS.height * 0.7,
    }),
  );
  return dispatchAll(state, actions);
}

const WORK: Partial<Record<RunStage, (state: GameState, plan: PiecePlan) => GameState>> = {
  design: designPiece,
  supplies: stockUp,
  plan: planSheet,
  cut: cutAll,
  join: joinAll,
  set: setAll,
  polish: polishAll,
  display: dressUp,
};

export function workStage(state: GameState, plan: PiecePlan): GameState {
  const run = state.activeRun;
  if (run === null) throw new Error("Nothing on the bench");
  const work = WORK[run.stage];
  return work === undefined ? state : work(state, plan);
}

export function playRunTo(state: GameState, plan: PiecePlan, until: RunStage): GameState {
  let next = state;
  for (let guard = 0; guard < 30; guard += 1) {
    const run = next.activeRun;
    if (run === null) throw new Error("Nothing on the bench");
    if (run.stage === until) return next;
    next = stepForward(workStage(next, plan));
  }
  throw new Error(`Never reached ${until}`);
}

export function playOrder(state: GameState, gigId: string, plan: PiecePlan): GameState {
  const started = reduce(state, { type: "startOrder", gigId });
  if (started === state) throw new Error(`Could not start ${gigId}`);
  return reduce(playRunTo(started, plan, "review"), { type: "deliver" });
}

export function playStall(state: GameState, productId: StallProductId, plan: PiecePlan): GameState {
  const started = reduce(state, { type: "startStall", productId });
  if (started === state) throw new Error("Could not start a stall piece");
  const finished = reduce(workStage(playRunTo(started, plan, "display"), plan), { type: "finishStall" });
  if (finished.activeRun?.stage !== "done") throw new Error("Could not finish the stall piece");
  return finished;
}
