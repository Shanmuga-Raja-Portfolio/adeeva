import type { CutKind } from "../../content/dish";
import { PAUSED_LINE } from "./pausedLine";

export type ChopStage = "ready" | "running" | "done";

export interface ChopMoment {
  readonly cut: CutKind;
  readonly stage: ChopStage;
  readonly assisted: boolean;
  readonly paused: boolean;
  readonly turned: boolean;
  readonly pressing: boolean;
}

export const CHOP_LINES = {
  readyTap: "Tap Start chopping, then tap as marks meet the knife line.",
  readyHold: "Tap Start chopping, then hold the board for the green stretch.",
  readyAssist: "Tap Start chopping, then hold the board. The knife keeps the beat.",
  readyAssistMince: "Tap Start chopping. The helper holds the green stretch for you.",
  slice: "Tap the board as each mark meets the knife line.",
  dice: "The board turns. Keep tapping on the beat!",
  assistHold: "Hold the board down and the knife keeps the beat.",
  assistHolding: "Keep holding! The knife chops on the beat.",
  minceWait: "When green reaches the knife, press and hold the board.",
  minceHolding: "Keep holding, then let go when the green ends!",
  minceAssist: "Watch: the helper holds the green stretch for you.",
  chopped: "Lovely work. All chopped!",
  minced: "Lovely work. All minced!",
} as const;

function readyLine(cut: CutKind, assisted: boolean): string {
  if (cut === "mince") return assisted ? CHOP_LINES.readyAssistMince : CHOP_LINES.readyHold;
  return assisted ? CHOP_LINES.readyAssist : CHOP_LINES.readyTap;
}

function runningLine({ cut, assisted, turned, pressing }: ChopMoment): string {
  if (cut === "mince") {
    if (assisted) return CHOP_LINES.minceAssist;
    return pressing ? CHOP_LINES.minceHolding : CHOP_LINES.minceWait;
  }
  if (assisted) return pressing ? CHOP_LINES.assistHolding : CHOP_LINES.assistHold;
  return cut === "dice" && turned ? CHOP_LINES.dice : CHOP_LINES.slice;
}

export function chopInstruction(moment: ChopMoment): string {
  if (moment.stage === "done") return moment.cut === "mince" ? CHOP_LINES.minced : CHOP_LINES.chopped;
  if (moment.stage === "ready") return readyLine(moment.cut, moment.assisted);
  if (moment.paused) return PAUSED_LINE;
  return runningLine(moment);
}

export function chopBoardLabel(cut: CutKind, assisted: boolean, ingredient: string): string {
  if (cut === "mince")
    return assisted
      ? `Mince the ${ingredient}. The helper holds the green stretch.`
      : `Mince the ${ingredient}. Hold the board or Space for the green stretch.`;
  return assisted
    ? `Chop the ${ingredient}. Hold the board or Space and the knife keeps the beat.`
    : `Chop the ${ingredient}. Tap the board or press Space as each mark meets the line.`;
}
