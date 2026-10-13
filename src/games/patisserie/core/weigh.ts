import type { IngredientId } from "../content/ingredient";
import type { MixDef } from "../content/mix";
import { updateActiveRun } from "./activeRunUpdate";
import type { BakeRun, BatchState, WeighAttempt, WeighRecord } from "./bakeRun";
import { ingredientValue } from "./bakeSpend";
import { ingredientById, isIngredientId, mixById } from "./catalog";
import type { GameState, Pantry } from "./gameState";
import { queueTraitBeat } from "./storyQueue";
import { isWeighRecordValid, weighAccuracy, weighBand } from "./weighAccuracy";

export function batchMix(run: BakeRun, batch: number): MixDef | null {
  if (!Number.isInteger(batch)) return null;
  const mixId = run.design.mixIds[batch];
  return mixId === undefined || mixId === null ? null : mixById(mixId);
}

export function weighTarget(mix: MixDef, ingredientId: IngredientId): number | null {
  return mix.weighed.find((amount) => amount.ingredient === ingredientId)?.grams ?? null;
}

function updateBatch(
  state: GameState,
  batch: number,
  update: (entry: BatchState, mix: MixDef, run: BakeRun) => BatchState | null,
): GameState {
  return updateActiveRun(state, "weigh", (run) => {
    const mix = batchMix(run, batch);
    const entry = run.batches[batch];
    if (mix === null || entry === undefined || entry.committed) return null;
    const next = update(entry, mix, run);
    if (next === null) return null;
    return { ...run, batches: run.batches.map((current, index) => (index === batch ? next : current)) };
  });
}

export function recordWeigh(
  state: GameState,
  batch: number,
  ingredientId: IngredientId,
  record: WeighAttempt,
): GameState {
  if (!isIngredientId(ingredientId)) return state;
  return updateBatch(state, batch, (entry, mix) => {
    const target = weighTarget(mix, ingredientId);
    const stock = state.pantry.ingredients[ingredientId];
    if (target === null || !isWeighRecordValid(record, ingredientById(ingredientId), target, stock))
      return null;
    const existing = entry.weighs[ingredientId];
    const untouched =
      existing !== undefined && existing.grams === record.grams && existing.actions === record.actions;
    const stored: WeighRecord = {
      grams: record.grams,
      actions: record.actions,
      assisted: record.assisted || (untouched && existing.assisted),
      band: weighBand(state),
    };
    return { ...entry, weighs: { ...entry.weighs, [ingredientId]: stored } };
  });
}

export function crackEgg(state: GameState, batch: number): GameState {
  return updateBatch(state, batch, (entry, mix) => {
    if (entry.eggs >= mix.eggs || state.pantry.ingredients.eggs < entry.eggs + 1) return null;
    return { ...entry, eggs: entry.eggs + 1 };
  });
}

export function batchReady(entry: BatchState, mix: MixDef, pantry: Pantry): boolean {
  return (
    entry.eggs === mix.eggs &&
    pantry.ingredients.eggs >= mix.eggs &&
    mix.weighed.every((amount) => {
      const record = entry.weighs[amount.ingredient];
      return record !== undefined && pantry.ingredients[amount.ingredient] >= record.grams;
    })
  );
}

function hitTheGram(entry: BatchState, mix: MixDef): boolean {
  return mix.weighed.some((amount) => {
    const record = entry.weighs[amount.ingredient];
    return (
      record !== undefined &&
      !record.assisted &&
      record.grams === amount.grams &&
      weighAccuracy(record, ingredientById(amount.ingredient), amount.grams, record.band) === 1
    );
  });
}

export function commitBatch(state: GameState, batch: number): GameState {
  const run = state.activeRun;
  const mix = run === null ? null : batchMix(run, batch);
  const entry = run?.batches[batch];
  if (run === null || mix === null || entry === undefined || run.stage !== "weigh") return state;
  if (entry.committed || !batchReady(entry, mix, state.pantry)) return state;
  const ingredients = { ...state.pantry.ingredients, eggs: state.pantry.ingredients.eggs - mix.eggs };
  let value = ingredientValue("eggs", mix.eggs);
  for (const amount of mix.weighed) {
    const grams = entry.weighs[amount.ingredient]?.grams ?? 0;
    ingredients[amount.ingredient] -= grams;
    value += ingredientValue(amount.ingredient, grams);
  }
  const committed: GameState = {
    ...state,
    pantry: { ...state.pantry, ingredients },
    activeRun: {
      ...run,
      ingredientValue: run.ingredientValue + value,
      batches: run.batches.map((current, index) =>
        index === batch ? { ...current, committed: true } : current,
      ),
    },
  };
  return hitTheGram(entry, mix) ? queueTraitBeat(committed, "perfectionist") : committed;
}
