import type { DifficultyId } from "../../../engine/difficulty";
import { FAIR_MUSIC_IDS } from "../content/fairMusic";
import type { FairThemeDef } from "../content/fairTheme";
import { isBoothBackdropId, isFairMusicId, isMakersNoteId } from "./catalog";
import type { FairPlan } from "./fairState";
import type { GameState } from "./gameState";
import type { FloorSet } from "./showroomState";

export function bestLastOrder(qualities: readonly number[]): number[] {
  const ranked = qualities
    .map((quality, index) => ({ quality, index }))
    .sort((a, b) => b.quality - a.quality);
  const [best, ...rest] = ranked;
  if (best === undefined) return [];
  return [...rest.map((entry) => entry.index).sort((a, b) => a - b), best.index];
}

export function hattieSuggests(theme: FairThemeDef, set: FloorSet, difficulty: DifficultyId): FairPlan {
  const qualities = set.pieces.map((piece) => piece.quality);
  if (difficulty === "relaxed")
    return {
      setId: set.setId,
      order: bestLastOrder(qualities),
      backdrop: theme.bestBackdrop,
      music: theme.bestMusic,
      note: "larkspur-homes",
    };
  return {
    setId: set.setId,
    order: qualities.map((_, index) => index),
    backdrop: theme.bestBackdrop,
    music: FAIR_MUSIC_IDS[0],
    note: "one-board",
  };
}

export function planIssue(state: GameState, plan: FairPlan): string | null {
  const fair = state.fair;
  const set = state.showroom?.floor.find((entry) => entry.setId === plan.setId);
  if (fair === null || set === undefined || fair.pickSetId !== plan.setId)
    return "Pick a set on the Fair Board first.";
  const order = [...plan.order].sort((a, b) => a - b);
  if (order.length !== set.pieces.length || order.some((slot, index) => slot !== index))
    return "Choose the reveal order.";
  if (!isBoothBackdropId(plan.backdrop)) return "Choose a backdrop.";
  if (!isFairMusicId(plan.music)) return "Choose the music.";
  if (!isMakersNoteId(plan.note)) return "Choose a maker's note.";
  return null;
}
