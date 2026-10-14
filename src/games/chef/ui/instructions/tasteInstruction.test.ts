import { describe, expect, it } from "vitest";
import type { TasteDef } from "../../content/dish";
import type { TasteState } from "../../core";
import { onTarget, tasteInstruction, TASTE_LINES, type TasteMoment } from "./tasteInstruction";

const def: TasteDef = { start: [-2, -1], target: [1, -1], savoury: 1 };
const start: TasteState = { point: [-2, -1], savoury: 0 };
const there: TasteState = { point: [1, -1], savoury: 1 };

const moment = (change: Partial<TasteMoment> = {}): TasteMoment => ({
  def,
  radius: 1,
  current: start,
  revealed: null,
  tastes: 0,
  seeing: false,
  suggested: null,
  served: false,
  ...change,
});

describe("Taste instruction", () => {
  it("needs the right spot and the right savoury dots to be on target", () => {
    expect(onTarget(there, def, 1)).toBe(true);
    expect(onTarget({ point: [1, -1], savoury: 0 }, def, 1)).toBe(false);
    expect(onTarget({ point: [-1, -1], savoury: 1 }, def, 1)).toBe(false);
  });

  it("asks for a first taste, then a pinch, then a fresh taste after each pinch", () => {
    expect(tasteInstruction(moment())).toBe(TASTE_LINES.first);
    expect(tasteInstruction(moment({ revealed: start, tastes: 1 }))).toBe(TASTE_LINES.move);
    expect(
      tasteInstruction(moment({ revealed: start, tastes: 1, current: { point: [0, -1], savoury: 0 } })),
    ).toBe(TASTE_LINES.again);
  });

  it("asks for Tastes right only once a taste shows the target", () => {
    expect(tasteInstruction(moment({ current: there, revealed: there, tastes: 2 }))).toBe(TASTE_LINES.spotOn);
    expect(tasteInstruction(moment({ current: there, revealed: start, tastes: 1 }))).toBe(TASTE_LINES.again);
  });

  it("guides a Taste helper player to the arrowed jar, then to taste and finish", () => {
    expect(tasteInstruction(moment({ seeing: true, suggested: "lemon-squeeze" }))).toBe(
      TASTE_LINES.followArrow,
    );
    expect(tasteInstruction(moment({ seeing: true, current: there }))).toBe(TASTE_LINES.spotOnTaste);
    expect(tasteInstruction(moment({ seeing: true, current: there, tastes: 1 }))).toBe(TASTE_LINES.spotOn);
  });

  it("cheers once served", () => {
    expect(tasteInstruction(moment({ served: true }))).toBe(TASTE_LINES.served);
  });
});
