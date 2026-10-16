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

export const SET_HINTS = {
  matchFaces: "Fit matching faces on one board for a set.",
  followFirst: "Follow your first cut to make a matching twin.",
  setJoint: "Pick one joint for every piece you can see.",
  evenShine: "Sand each piece the same for an even shine.",
  rug: "Put each set on its own rug.",
  ren: "Hand a simple job to Ren. Two a day.",
  fairPick: "Pick a new set that has not been to the Fair yet.",
  planner: "Choose a backdrop, some music, and who comes last.",
} as const;

export const REN_SAFETY_LINE = "Ren's jobs are game jobs. Real tools need a grown-up.";

export const SAFETY_LINE = "Real saws are sharp. Ask an adult before using tools.";
