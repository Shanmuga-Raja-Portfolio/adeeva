import { updateActiveRun } from "../../../engine/activeRunUpdate";
import { recordFollow, type FollowProgress } from "../../../engine/followRecord";
import type { CookStepKind } from "../content/dish";
import { INGREDIENT_IDS } from "../content/ingredient";
import type { JarId } from "../content/seasoning";
import { dishById } from "./catalog";
import { isValidChopRecord, scoreChop, type ChopRecord } from "./chop";
import { currentCookStep, type DishRun } from "./dishRun";
import type { GameState } from "./gameState";
import { plateIssues, scorePlate, type PlateRecord } from "./plate";
import { scoreSimmer, simmerBounds } from "./simmer";
import { scoreSizzle, type SizzleRecord } from "./sizzle";
import { queueStoryTrigger, queueTraitBeat } from "./storyQueue";
import { cuisineJars, dishTasteStart, isValidTasteRecord, scoreTaste } from "./taste";
import { toleranceFor } from "./tolerance";

function onStep(run: DishRun, kind: CookStepKind): boolean {
  return currentCookStep(run, dishById(run.dishId)) === kind;
}

export function placeIngredient(state: GameState, ingredientId: string): GameState {
  return updateActiveRun(state, "mise", (run) => {
    const dish = dishById(run.dishId);
    const known = INGREDIENT_IDS.find((id) => id === ingredientId);
    if (known === undefined || !dish.ingredients.includes(known) || run.mise.includes(known)) return null;
    return { ...run, mise: [...run.mise, known] };
  });
}

export function chopItem(state: GameState, itemIndex: number, record: ChopRecord): GameState {
  const run = state.activeRun;
  if (run === null || run.stage !== "cook" || !onStep(run, "chop") || itemIndex !== run.chop.length)
    return state;
  const item = dishById(run.dishId).chop[itemIndex];
  if (item === undefined || !isValidChopRecord(item, record)) return state;
  const result = scoreChop(item, record, toleranceFor(state, "chop"), state.profile.difficulty);
  const next: GameState = { ...state, activeRun: { ...run, chop: [...run.chop, result] } };
  return result.perfect ? queueTraitBeat(next, "perfectionist") : next;
}

export function cookSizzle(state: GameState, record: SizzleRecord): GameState {
  return updateActiveRun(state, "cook", (run) => {
    const sizzle = dishById(run.dishId).sizzle;
    if (sizzle === null || !onStep(run, "sizzle")) return null;
    const result = scoreSizzle(sizzle, record, toleranceFor(state, "sizzle"));
    return result === null ? null : { ...run, sizzle: result };
  });
}

export function stirSimmer(state: GameState, sample: FollowProgress): GameState {
  return updateActiveRun(state, "cook", (run) => {
    const simmer = dishById(run.dishId).simmer;
    if (simmer === null || !onStep(run, "simmer")) return null;
    const follow = recordFollow(run.simmer?.follow, sample, simmerBounds(simmer.laps));
    return follow === null ? null : { ...run, simmer: { follow, result: null } };
  });
}

export function stopSimmer(state: GameState): GameState {
  return updateActiveRun(state, "cook", (run) => {
    const simmer = dishById(run.dishId).simmer;
    const progress = run.simmer;
    if (simmer === null || progress === null || !onStep(run, "simmer")) return null;
    return { ...run, simmer: { ...progress, result: scoreSimmer(simmer, simmer.laps, progress.follow) } };
  });
}

export function tasteDish(
  state: GameState,
  pinches: readonly JarId[],
  tastes: number,
  assisted: boolean,
): GameState {
  const run = state.activeRun;
  if (run === null || run.stage !== "cook" || !onStep(run, "taste")) return state;
  const dish = dishById(run.dishId);
  const taste = dish.taste;
  const jars = cuisineJars(dish.cuisine);
  const record = { pinches, tastes, assisted };
  if (taste === null || !isValidTasteRecord(record, jars)) return state;
  const result = scoreTaste(
    taste,
    jars,
    dishTasteStart(taste),
    record,
    toleranceFor(state, "taste"),
    state.profile.difficulty === "relaxed",
  );
  const next: GameState = { ...state, activeRun: { ...run, taste: result } };
  return result.solved && !result.assisted ? queueStoryTrigger(next, "first-taste-solved") : next;
}

export function plateDish(state: GameState, record: PlateRecord): GameState {
  return updateActiveRun(state, "plate", (run) => {
    const dish = dishById(run.dishId);
    if (plateIssues(dish, record).length > 0) return null;
    const result = scorePlate(dish, record, toleranceFor(state, "plate"));
    return {
      ...run,
      plated: { result, components: record.components, plateColour: record.plateColour },
    };
  });
}
