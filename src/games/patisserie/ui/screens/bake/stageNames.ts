import type { RunStage } from "../../../core";

export const STAGE_LABELS: Readonly<Record<RunStage, string>> = {
  brief: "Order",
  design: "Design",
  pantry: "Pantry",
  weigh: "Weigh",
  mix: "Stir",
  bake: "Oven",
  stack: "Stack",
  pipe: "Pipe",
  decorate: "Toppings",
  review: "Box it",
  done: "Done",
};

export const STAGE_TITLES: Readonly<Record<RunStage, string>> = {
  brief: "The order card",
  design: "Design the bake",
  pantry: "The pantry",
  weigh: "Scoop & Weigh",
  mix: "Stir the bowl",
  bake: "The oven",
  stack: "Stack and fill",
  pipe: "Pipe the icing",
  decorate: "Toppings",
  review: "Ready to box",
  done: "Delivered",
};

export const ADVANCE_LABELS: Readonly<Record<RunStage, string>> = {
  brief: "Start designing",
  design: "To the pantry",
  pantry: "To the scale",
  weigh: "Start stirring",
  mix: "To the oven",
  bake: "Cool and stack",
  stack: "Fill the piping bag",
  pipe: "Add toppings",
  decorate: "Box it up",
  review: "Deliver",
  done: "Done",
};

export const STAGE_HINTS: Readonly<Partial<Record<RunStage, string>>> = {
  brief: "Read the order. The checklist stays with you.",
  design: "Pick a bake, a mix, colours and a pattern.",
  pantry: "Buy what's missing. One trip costs one hour.",
  weigh: "Hold to pour. Let go early: the scale keeps going!",
  mix: "Stir round the bowl. Not too fast, not too slow!",
  bake: "Set the heat dots, turn the tray, take out at golden.",
  stack: "Drag each layer onto the stand. Tap Fill for the filling.",
  pipe: "Press and trace the dots. Scrape to try again.",
  decorate: "Drag toppings on. Tap one to put it back.",
  review: "Check the order card, then box it up!",
};

export function assistHint(helper: string): string {
  return `Stuck? Try the ${helper.toLowerCase()}. Switch it off again before your next try.`;
}
export const SAFETY_LINE = "Real ovens, mixers and knives: ask an adult first.";
export const HELPER_NOTE = "With help, the best score is 80.";
