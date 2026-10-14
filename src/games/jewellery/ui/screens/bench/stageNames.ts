import { COACH_LINES } from "../../../content/hints";
import type { RunStage } from "../../../core";

export const STAGE_LABELS: Readonly<Record<RunStage, string>> = {
  brief: "Order",
  design: "Design",
  supplies: "Supplies",
  plan: "Plan",
  cut: "Cut out",
  join: "Join",
  set: "Set",
  polish: "Polish",
  display: "Display",
  review: "Gift box",
  done: "Done",
};

export const STAGE_TITLES: Readonly<Record<RunStage, string>> = {
  brief: "The order tag",
  design: "Design the piece",
  supplies: "The Supply Cabinet",
  plan: "Plan your sheet",
  cut: "Cut out",
  join: "The Joining Lamp",
  set: "Set the stones",
  polish: "Polish",
  display: "Display",
  review: "Ready to wrap",
  done: "Delivered",
};

export const ADVANCE_LABELS: Readonly<Record<RunStage, string>> = {
  brief: "Start designing",
  design: "To the Supply Cabinet",
  supplies: "Plan the sheet",
  plan: "Start cutting",
  cut: "To the Joining Lamp",
  join: "Set the stones",
  set: "Polish it",
  polish: "Dress it up",
  display: "Wrap it up",
  review: "Deliver",
  done: "Done",
};

export const COACH: Readonly<Partial<Record<RunStage, string>>> = COACH_LINES;

export function assistHint(helper: string): string {
  return `Stuck? Switch on ${helper}. It counts up to 80%.`;
}
