import { describe, expect, it } from "vitest";
import type { CutKind } from "../../content/dish";
import { chopBoardLabel, chopInstruction, CHOP_LINES, type ChopMoment } from "./chopInstruction";
import { PAUSED_LINE } from "./pausedLine";

const moment = (cut: CutKind, change: Partial<ChopMoment> = {}): ChopMoment => ({
  cut,
  stage: "running",
  assisted: false,
  paused: false,
  turned: false,
  pressing: false,
  ...change,
});

describe("Chop instruction", () => {
  it("asks for taps on a slice and on a dice before the board turns", () => {
    expect(chopInstruction(moment("slice"))).toBe(CHOP_LINES.slice);
    expect(chopInstruction(moment("dice"))).toBe(CHOP_LINES.slice);
    expect(chopInstruction(moment("slice", { turned: true }))).toBe(CHOP_LINES.slice);
  });

  it("switches a dice to the turned-board line once the board turns", () => {
    expect(chopInstruction(moment("dice", { turned: true }))).toBe(CHOP_LINES.dice);
  });

  it("asks for a hold on a mince, then for letting go while held", () => {
    expect(chopInstruction(moment("mince"))).toBe(CHOP_LINES.minceWait);
    expect(chopInstruction(moment("mince", { pressing: true }))).toBe(CHOP_LINES.minceHolding);
    expect(chopInstruction(moment("mince", { turned: true }))).toBe(CHOP_LINES.minceWait);
  });

  it("never tells a mince player to tap the board, or a slice player to hold", () => {
    for (const pressing of [false, true]) {
      expect(chopInstruction(moment("mince", { pressing }))).not.toMatch(/tap/i);
      expect(chopInstruction(moment("slice", { pressing }))).not.toMatch(/hold/i);
      expect(chopInstruction(moment("dice", { pressing, turned: true }))).not.toMatch(/hold/i);
    }
  });

  it("names the Start chopping button before the board starts, for the cut in front of you", () => {
    expect(chopInstruction(moment("slice", { stage: "ready" }))).toBe(CHOP_LINES.readyTap);
    expect(chopInstruction(moment("dice", { stage: "ready" }))).toBe(CHOP_LINES.readyTap);
    expect(chopInstruction(moment("mince", { stage: "ready" }))).toBe(CHOP_LINES.readyHold);
    expect(chopInstruction(moment("slice", { stage: "ready", assisted: true }))).toBe(CHOP_LINES.readyAssist);
    expect(chopInstruction(moment("mince", { stage: "ready", assisted: true }))).toBe(
      CHOP_LINES.readyAssistMince,
    );
  });

  it("asks an Auto-rhythm player to hold the board, and to keep holding once pressed", () => {
    expect(chopInstruction(moment("slice", { assisted: true }))).toBe(CHOP_LINES.assistHold);
    expect(chopInstruction(moment("dice", { assisted: true, turned: true, pressing: true }))).toBe(
      CHOP_LINES.assistHolding,
    );
    expect(chopInstruction(moment("mince", { assisted: true, pressing: true }))).toBe(CHOP_LINES.minceAssist);
  });

  it("shows the pause line while paused and a cheer when done", () => {
    expect(chopInstruction(moment("dice", { paused: true, turned: true }))).toBe(PAUSED_LINE);
    expect(chopInstruction(moment("slice", { stage: "done" }))).toBe(CHOP_LINES.chopped);
    expect(chopInstruction(moment("mince", { stage: "done", pressing: true }))).toBe(CHOP_LINES.minced);
  });

  it("gives the keyboard and screen-reader label the same input as the instruction", () => {
    expect(chopBoardLabel("mince", false, "garlic")).toMatch(/Hold the board or Space for the green stretch/);
    expect(chopBoardLabel("slice", false, "onion")).toMatch(/Tap the board or press Space/);
    expect(chopBoardLabel("dice", true, "onion")).toMatch(/Hold the board or Space/);
    expect(chopBoardLabel("mince", true, "garlic")).toMatch(/helper holds/);
  });
});
