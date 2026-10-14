import { describe, expect, it } from "vitest";
import { AUTO_LAYOUT_GRAIN_CAP, autoLayoutIssue, runBoard, runLayoutIssues } from "./layout";
import { flipQuality } from "./flipQuality";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import {
  dispatchAll,
  flipAtUnpick,
  layoutActions,
  newTestGame,
  runOf,
  scrubAll,
  settleStories,
  unpickAll,
} from "./testPlaythrough";
import type { Design } from "./design";
import type { ConditionGrade } from "../content/condition";
import type { FindId } from "../content/find";

function atLayout(
  design: Design,
  finds: readonly { readonly findId: FindId; readonly grade: ConditionGrade }[],
  difficulty: "relaxed" | "standard" = "standard",
): GameState {
  const base = settleStories(newTestGame({ difficulty }));
  const unpicking = flipAtUnpick(
    base,
    design.recipeId === "cushion-cover" ? "nana-bea" : "juniper-wren",
    design,
    finds,
  );
  const cleaning = reduce(unpickAll(unpicking, 2), { type: "goToStage", stage: "clean" });
  return reduce(scrubAll(cleaning, 0), { type: "goToStage", stage: "layout" });
}

const CUSHION: Design = { recipeId: "cushion-cover", parts: {} };
const SCRUNCHIES: Design = { recipeId: "scrunchie-trio", parts: {} };

describe("layout on the find panels", () => {
  it("flags pieces off the fabric, on a worn spot and overlapping", () => {
    const state = atLayout(CUSHION, [{ findId: "linen-curtain", grade: "tired" }]);
    const board = runBoard(runOf(state));
    const spot = board.spots[0];
    if (spot === undefined) throw new Error("A tired find has a worn spot");
    const [sx] = spot.polygon[0] ?? [0, 0];
    const placed = dispatchAll(state, [
      { type: "placePiece", pieceId: "cushion-front", x: sx < 60 ? 0 : 75, y: 115, rotation: 0 },
      { type: "placePiece", pieceId: "cushion-back-1", x: 125, y: 0, rotation: 0 },
      { type: "placePiece", pieceId: "cushion-back-2", x: 125, y: 10, rotation: 0 },
    ]);
    const issues = runLayoutIssues(runOf(placed));
    expect(issues.find((issue) => issue.pieceId === "cushion-front")?.kind).toBe("worn-spot");
    expect(issues.find((issue) => issue.pieceId === "cushion-back-1")?.kind).toBe("off-fabric");
    expect(issues.some((issue) => issue.kind === "overlap")).toBe(true);
    const moved = reduce(placed, { type: "placePiece", pieceId: "cushion-front", x: 0, y: 0, rotation: 0 });
    expect(runLayoutIssues(runOf(moved)).some((issue) => issue.pieceId === "cushion-front")).toBe(false);
  });

  it("can use panels from two finds for one flip", () => {
    const state = atLayout(CUSHION, [
      { findId: "gingham-shirt", grade: "like-new" },
      { findId: "sailor-top", grade: "like-new" },
    ]);
    expect(runOf(state).finds).toHaveLength(2);
    const laid = dispatchAll(state, layoutActions(state));
    expect(runLayoutIssues(runOf(laid))).toEqual([]);
    expect(reduce(laid, { type: "goToStage", stage: "cut" }).activeRun?.stage).toBe("cut");
  });

  it("offers auto-layout only on Relaxed for scrunchies and cushions, capping fabric lines at 0.8", () => {
    const standard = atLayout(SCRUNCHIES, [{ findId: "linen-curtain", grade: "like-new" }]);
    expect(autoLayoutIssue(standard)).not.toBeNull();
    expect(reduce(standard, { type: "autoLayout" })).toBe(standard);
    const relaxed = atLayout(SCRUNCHIES, [{ findId: "linen-curtain", grade: "like-new" }], "relaxed");
    expect(autoLayoutIssue(relaxed)).toBeNull();
    const auto = reduce(relaxed, { type: "autoLayout" });
    expect(runLayoutIssues(runOf(auto))).toEqual([]);
    expect(runOf(auto).autoLaid).toBe(true);
    expect(flipQuality(auto, runOf(auto)).grain).toBe(AUTO_LAYOUT_GRAIN_CAP);
    expect(reduce(auto, { type: "autoLayout" })).toBe(auto);
  });

  it("refuses bad placements with the same state", () => {
    const state = atLayout(CUSHION, [{ findId: "linen-curtain", grade: "like-new" }]);
    expect(reduce(state, { type: "placePiece", pieceId: "nope", x: 1, y: 1, rotation: 0 })).toBe(state);
    expect(
      reduce(state, { type: "placePiece", pieceId: "cushion-front", x: Number.NaN, y: 1, rotation: 0 }),
    ).toBe(state);
    expect(
      reduce(state, { type: "placePiece", pieceId: "cushion-front", x: 1, y: 1, rotation: 30 as 0 }),
    ).toBe(state);
    expect(reduce(state, { type: "removePiece", pieceId: "cushion-front" })).toBe(state);
    expect(reduce(state, { type: "goToStage", stage: "cut" })).toBe(state);
  });

  it("scores fabric lines: straight 1, slanted 0.7, sideways 0.6", () => {
    const state = atLayout(CUSHION, [{ findId: "linen-curtain", grade: "like-new" }]);
    const place = (rotation: 0 | 45 | 90) =>
      dispatchAll(state, [
        { type: "placePiece", pieceId: "cushion-front", x: 0, y: 0, rotation },
        { type: "placePiece", pieceId: "cushion-back-1", x: 70, y: 0, rotation: 0 },
        { type: "placePiece", pieceId: "cushion-back-2", x: 70, y: 40, rotation: 0 },
      ]);
    expect(flipQuality(place(0), runOf(place(0))).grain).toBe(1);
    expect(flipQuality(place(45), runOf(place(45))).grain).toBeCloseTo((0.7 + 2) / 3, 3);
    expect(flipQuality(place(90), runOf(place(90))).grain).toBeCloseTo((0.6 + 2) / 3, 3);
  });
});
