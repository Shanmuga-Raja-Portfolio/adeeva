import { COACH_LINES } from "../../../content/hints";
import { assistCap, type GameState, type RunStage } from "../../../core";

export const STAGE_LABELS: Readonly<Record<RunStage, string>> = {
  brief: "Brief",
  plan: "Pick and place",
  shop: "Warehouse",
  paint: "Paint",
  floor: "Floor",
  light: "Light",
  style: "Style",
  reveal: "Reveal",
  done: "Done",
};

export const STAGE_TITLES: Readonly<Record<RunStage, string>> = {
  brief: "The client's letter",
  plan: "Pick and place",
  shop: "Marigold Warehouse",
  paint: "Paint the walls",
  floor: "Lay the floor",
  light: "Light it up",
  style: "Style the room",
  reveal: "The big reveal",
  done: "Revealed",
};

export const ADVANCE_LABELS: Readonly<Record<RunStage, string>> = {
  brief: "Start planning",
  plan: "To the warehouse",
  shop: "Start painting",
  paint: "Lay the floor",
  floor: "Light it up",
  light: "Style the room",
  style: "Get ready to reveal",
  reveal: "Reveal",
  done: "Done",
};

export const COACH: Readonly<Partial<Record<RunStage, string>>> = COACH_LINES;

export function assistHint(helper: string, state: Pick<GameState, "profile">): string {
  return `Stuck? Switch on ${helper} in Settings. It counts up to ${Math.round(100 * assistCap(state))}%.`;
}
