import type { FairThemeDef } from "../content/fairTheme";
import type { FairPlan } from "./fairState";
import { isFairMusicId, isTableClothId } from "./catalog";
import type { GameState } from "./gameState";
import { SIDE_PLATES, sidePlateOptions } from "./sidePlates";

export function suggestedOrder(qualities: readonly number[]): number[] {
  const ranked = qualities
    .map((quality, index) => ({ quality, index }))
    .sort((a, b) => b.quality - a.quality);
  const [best, ...rest] = ranked;
  if (best === undefined) return [];
  return [...rest.map((entry) => entry.index), best.index];
}

export function suggestedPlan(
  theme: FairThemeDef,
  sidePlates: readonly string[],
  qualities: readonly number[],
): FairPlan {
  return { sidePlates, order: suggestedOrder(qualities), cloth: theme.bestCloth, music: theme.bestMusic };
}

export function planIssue(state: GameState, plan: FairPlan): string | null {
  const options = sidePlateOptions(state).map((entry) => entry.runId);
  if (plan.sidePlates.length > SIDE_PLATES) return `Bring up to ${SIDE_PLATES} side plates.`;
  if (new Set(plan.sidePlates).size !== plan.sidePlates.length)
    return "Each plate can only go on the table once.";
  if (!plan.sidePlates.every((runId) => options.includes(runId)))
    return "That plate is not in your Bake Book.";
  const slots = plan.sidePlates.length + 1;
  const order = [...plan.order].sort((a, b) => a - b);
  if (order.length !== slots || order.some((slot, index) => slot !== index))
    return "Choose the unveil order.";
  if (!isTableClothId(plan.cloth)) return "Choose a table cloth.";
  if (!isFairMusicId(plan.music)) return "Choose the music.";
  return null;
}
