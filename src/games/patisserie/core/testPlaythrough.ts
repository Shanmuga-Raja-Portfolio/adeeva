import type { AvatarLook } from "../../../engine/avatar";
import type { Point } from "../../../engine/geometry/point";
import type { ColourId } from "../../../engine/palette";
import type { FillingId } from "../content/filling";
import type { FlourishId } from "../content/flourish";
import type { PlaqueWord } from "../content/letterPath";
import type { MixId } from "../content/mix";
import type { PipePathDef } from "../content/pipePattern";
import type { ProductId } from "../content/product";
import type { Action } from "./action";
import { rollClientBrief } from "./brief";
import { clientById, difficultyById, ingredientById, productById } from "./catalog";
import type { GameState } from "./gameState";
import { createGame, type NewGameSettings } from "./newGame";
import { autoOutMinutes, bakesTogether, bakeTimeScale, doneTime, TOGETHER_BATCHES } from "./oven";
import { cartFor, hasShortfall, PANTRY_VISIT_HOURS, shortfall } from "./pantry";
import { checkpoints, MIN_SAMPLE_SPACING_CM, runPipePaths } from "./pipe";
import { reduce } from "./reduce";
import { canAdvance } from "./stageReadiness";
import { currentBeat } from "./storyQueue";
import { batchMix } from "./weigh";
import { minimumActions } from "./weighAccuracy";
import { RUN_STAGES, stageAfter, type RunStage } from "./runStage";
import { runKind } from "./bakeRun";

export const TEST_LOOK: AvatarLook = {
  skinTone: "amber",
  hairStyle: "braids",
  hairColour: "black",
  outfit: "studio-apron",
};

export const TEST_STIR_TICKS_PER_LAP = 120;

export interface BakePlan {
  readonly productId: ProductId;
  readonly mixIds: readonly MixId[];
  readonly fillingId: FillingId | null;
  readonly colours: readonly ColourId[];
  readonly weighError: number;
  readonly stirShare: number;
  readonly bakeShare: number;
  readonly pipeOffset: number;
  readonly toppings: boolean;
  readonly split?: number;
  readonly flourishes?: readonly FlourishId[];
  readonly word?: PlaqueWord;
}

export const GOOD_PLAN: Omit<BakePlan, "productId" | "mixIds" | "fillingId" | "colours"> = {
  weighError: 0,
  stirShare: 0.95,
  bakeShare: 1,
  pipeOffset: 0,
  toppings: true,
};

export function newTestGame(overrides: Partial<NewGameSettings> = {}): GameState {
  return createGame({
    seed: 7,
    name: "Ada",
    look: TEST_LOOK,
    trait: "dreamer",
    difficulty: "standard",
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
  const client = clientById(clientId);
  if (client === undefined) throw new Error(`Unknown client ${clientId}`);
  const [brief, rng] = rollClientBrief(
    client,
    {
      day: state.calendar.day,
      minQualityBonus: difficultyById(state.profile.difficulty).minQualityBonus,
      hotTags: state.trends.current,
    },
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

export function traceSamples(path: PipePathDef, offset: number): Point[] {
  const marks = checkpoints(path);
  const dense: Point[] = [];
  marks.forEach((mark, index) => {
    const next = marks[index + 1];
    dense.push(mark);
    if (next !== undefined) dense.push([(mark[0] + next[0]) / 2, (mark[1] + next[1]) / 2]);
  });
  return dense
    .map(([x, y]): Point => [x + offset, y])
    .reduce<Point[]>((kept, point) => {
      const last = kept[kept.length - 1];
      if (last === undefined || Math.hypot(point[0] - last[0], point[1] - last[1]) >= MIN_SAMPLE_SPACING_CM)
        kept.push(point);
      return kept;
    }, []);
}

function stepForward(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null) throw new Error("No bake on the bench");
  const next = stageAfter(runKind(run), run.stage);
  if (next === null) throw new Error("No step after this one");
  const moved = reduce(state, { type: "goToStage", stage: next });
  if (moved !== state) return moved;
  const check = canAdvance(state);
  if (check.reasons.some((reason) => reason.includes("End the day") || reason.includes("Counter Day")))
    return stepForward(settleStories(reduce(state, { type: "endDay" })));
  throw new Error(`Cannot leave ${run.stage}: ${check.reasons.join(" ")}`);
}

function designBake(state: GameState, plan: BakePlan): GameState {
  if (state.activeRun?.purpose.kind === "salon-tray")
    return reduce(state, { type: "chooseSplit", split: plan.split ?? 3 });
  const actions: Action[] = [{ type: "chooseProduct", productId: plan.productId }];
  plan.mixIds.forEach((mixId, batch) => actions.push({ type: "chooseMix", batch, mixId }));
  if (plan.fillingId !== null) actions.push({ type: "chooseFilling", fillingId: plan.fillingId });
  for (const colour of plan.colours) actions.push({ type: "toggleColour", colour });
  for (const flourish of plan.flourishes ?? []) actions.push({ type: "toggleFlourish", flourish });
  if (plan.word !== undefined) actions.push({ type: "chooseWord", word: plan.word });
  return dispatchAll(state, actions);
}

function stockPantry(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  const missing = shortfall(state, run);
  if (!hasShortfall(missing)) return state;
  const bought = reduce(state, { type: "buyPantry", cart: cartFor(missing) });
  if (bought !== state || state.calendar.hoursLeft >= PANTRY_VISIT_HOURS) return bought;
  return stockPantry(settleStories(reduce(state, { type: "endDay" })));
}

function weighAll(state: GameState, plan: BakePlan): GameState {
  let next = state;
  const run = state.activeRun;
  if (run === null) return state;
  run.batches.forEach((_, batch) => {
    const mix = batchMix(run, batch);
    if (mix === null) return;
    for (const amount of mix.weighed) {
      const ingredient = ingredientById(amount.ingredient);
      const raw = Math.round(amount.grams * (1 + plan.weighError));
      const grams =
        ingredient.mode === "piece" ? Math.round(raw / ingredient.pieceGrams) * ingredient.pieceGrams : raw;
      next = reduce(next, {
        type: "recordWeigh",
        batch,
        ingredientId: amount.ingredient,
        grams,
        actions: minimumActions(ingredient, amount.grams),
        assisted: false,
      });
    }
    for (let egg = 0; egg < mix.eggs; egg += 1) next = reduce(next, { type: "crackEgg", batch });
    next = reduce(next, { type: "commitBatch", batch });
  });
  return next;
}

function stirAll(state: GameState, plan: BakePlan): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  let next = state;
  run.batches.forEach((_, batch) => {
    const mix = batchMix(run, batch);
    if (mix === null) return;
    const ticks = mix.laps * TEST_STIR_TICKS_PER_LAP;
    next = reduce(next, {
      type: "recordStir",
      batch,
      progress: mix.laps,
      ticks,
      insideTicks: Math.round(ticks * plan.stirShare),
      assisted: false,
    });
  });
  return next;
}

function takenFor(run: NonNullable<GameState["activeRun"]>, batch: number, plan: BakePlan): number {
  const mix = batchMix(run, batch);
  if (mix === null) return 1;
  const scale = bakeTimeScale(run, batch);
  const done = doneTime(mix, mix.idealHeat, scale);
  return Math.min(autoOutMinutes(mix, mix.idealHeat, scale), Math.max(2, Math.round(done * plan.bakeShare)));
}

function bakeTogetherFirst(state: GameState, plan: BakePlan): GameState {
  const run = state.activeRun;
  const mix = run === null ? null : batchMix(run, 0);
  if (run === null || mix === null || !bakesTogether(run)) return state;
  const taken = TOGETHER_BATCHES.map((batch) => takenFor(run, batch, plan));
  return reduce(state, {
    type: "bakeTogether",
    heat: mix.idealHeat,
    turnedMinutes: Math.min(
      ...taken.map((minutes) => minutes - 1),
      Math.round(doneTime(mix, mix.idealHeat, 0.75) / 2),
    ),
    takenMinutes: taken,
    assisted: false,
  });
}

function bakeAll(state: GameState, plan: BakePlan): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  let next = bakeTogetherFirst(state, plan);
  run.batches.forEach((_, batch) => {
    const mix = batchMix(run, batch);
    if (mix === null) return;
    const done = doneTime(mix, mix.idealHeat);
    const taken = takenFor(run, batch, plan);
    next = reduce(next, {
      type: "bakeBatch",
      batch,
      heat: mix.idealHeat,
      turnedMinutes: Math.min(taken - 1, Math.round(done / 2)),
      takenMinutes: taken,
      assisted: false,
    });
  });
  return next;
}

function stackAll(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || run.design.productId === null) return state;
  let next = state;
  for (const piece of productById(run.design.productId).stackPieces)
    next = reduce(next, { type: "assignStack", slot: piece.slot, pieceId: piece.id });
  return reduce(next, { type: "fill" });
}

function pipeAll(state: GameState, plan: BakePlan): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  return runPipePaths(run).reduce(
    (next, path) =>
      reduce(next, {
        type: "pipePath",
        pathId: path.id,
        samples: traceSamples(path, plan.pipeOffset),
        assisted: false,
      }),
    state,
  );
}

function decorateAll(state: GameState, plan: BakePlan): GameState {
  const run = state.activeRun;
  if (run === null || run.brief === null || !plan.toppings) return state;
  let next = state;
  let spot = 0;
  for (const requirement of run.brief.requiredToppings)
    for (let count = 0; count < requirement.count; count += 1) {
      next = reduce(next, {
        type: "addTopping",
        toppingId: requirement.topping,
        x: 168 + (spot % 6) * 32,
        y: 194 + Math.floor(spot / 6) * 30,
      });
      spot += 1;
    }
  return next;
}

const WORK: Partial<Record<RunStage, (state: GameState, plan: BakePlan) => GameState>> = {
  design: designBake,
  pantry: stockPantry,
  weigh: weighAll,
  mix: stirAll,
  bake: bakeAll,
  stack: stackAll,
  pipe: pipeAll,
  decorate: decorateAll,
};

export function playRunTo(state: GameState, plan: BakePlan, until: RunStage): GameState {
  let next = state;
  for (let guard = 0; guard < RUN_STAGES.length * 2; guard += 1) {
    const run = next.activeRun;
    if (run === null) throw new Error("No bake on the bench");
    if (run.stage === until) return next;
    const work = WORK[run.stage];
    next = stepForward(work === undefined ? next : work(next, plan));
  }
  throw new Error(`Never reached ${until}`);
}

export function playOrder(state: GameState, gigId: string, plan: BakePlan): GameState {
  const started = reduce(state, { type: "startOrder", gigId });
  if (started === state) throw new Error(`Could not start ${gigId}`);
  return reduce(playRunTo(started, plan, "review"), { type: "deliver" });
}

export function playTray(state: GameState, plan: BakePlan): GameState {
  const productId = plan.productId === "iced-biscuits" ? "iced-biscuits" : "cupcake-tray";
  const started = reduce(state, { type: "startTray", productId });
  if (started === state) throw new Error("Could not start a tray");
  return reduce(playRunTo(started, plan, "review"), { type: "deliver" });
}
