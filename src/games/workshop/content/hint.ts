import type { RunStage } from "./runStage";

export const COACH_HINTS: Readonly<Partial<Record<RunStage, string>>> = {
  design: "Pick one choice for each part, then pick a wood.",
  timber: "Buy the boards marked 'Fits your plan'.",
  layout: "Drag each part onto a board. Keep off the knots.",
  saw: "Press on the pencil line and follow it.",
  join: "Slide the part onto its shadow, then tap the mallet.",
  sand: "Rub along the wood lines until the dust is gone.",
  finish: "Pick a finish, then add the extras on the note.",
};

export const HINTS = {
  turnAcross: "Turn it so the wood lines run long.",
  onKnot: "That spot has a knot. Try somewhere else.",
  keepSawing: "Keep sawing to the end.",
  sawAgain: "Hmm, that cut slipped. Try that line again.",
  nudgeCloser: "Nudge it a little closer.",
  sandAlong: "Sand along the wood lines for a smooth finish.",
  addExtras: "Add the extras on the note.",
  avoidedWood: "This wood is on the 'please avoid' list.",
} as const;

export const SAFETY_LINE = "Real saws are sharp. Ask an adult before using tools.";
