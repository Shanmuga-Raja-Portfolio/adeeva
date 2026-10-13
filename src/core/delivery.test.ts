import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import { availableTrims } from "./decoration";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import {
  craftToReview,
  dispatchAll,
  layoutAndCut,
  newTestGame,
  sketchAndShop,
  withActiveGig,
} from "./testPlaythrough";

function reviewed(): GameState {
  const base = withActiveGig(newTestGame(), "mom");
  const gig = base.gigs.active[0];
  if (gig === undefined) throw new Error("expected a gig");
  return craftToReview(reduce(base, { type: "startRun", gigId: gig.id }));
}

describe("deliver", () => {
  it("rewards a run exactly once", () => {
    const delivered = reduce(reviewed(), { type: "deliver" });
    expect(reduce(delivered, { type: "deliver" })).toBe(delivered);
    const run = delivered.activeRun;
    if (run === null) throw new Error("expected the finished run");
    const replayed: GameState = { ...delivered, activeRun: { ...run, stage: "review" } };
    expect(reduce(replayed, { type: "deliver" })).toBe(replayed);
    expect(delivered.log).toHaveLength(1);
  });

  it("is deterministic for the same state", () => {
    const state = reviewed();
    expect(reduce(state, { type: "deliver" })).toEqual(reduce(state, { type: "deliver" }));
  });

  it("is only possible from review", () => {
    const base = withActiveGig(newTestGame(), "mom");
    const gig = base.gigs.active[0];
    if (gig === undefined) throw new Error("expected a gig");
    const cutting = sketchAndShop(reduce(base, { type: "startRun", gigId: gig.id }));
    expect(reduce(cutting, { type: "deliver" })).toBe(cutting);
  });

  it("keeps cut fabric consumed when a run is abandoned", () => {
    const base = withActiveGig(newTestGame(), "mom");
    const gig = base.gigs.active[0];
    if (gig === undefined) throw new Error("expected a gig");
    const cut = layoutAndCut(sketchAndShop(reduce(base, { type: "startRun", gigId: gig.id })));
    const abandoned = reduce(cut, { type: "abandonRun" });
    expect(abandoned.activeRun).toBeNull();
    expect(abandoned.inventory.fabricMetres["ivory-cotton"]).toBe(0.5);
    expect(abandoned.gigs.active).toHaveLength(1);
    expect(reduce(abandoned, { type: "abandonRun" })).toBe(abandoned);
    const restarted = reduce(abandoned, { type: "startRun", gigId: gig.id });
    expect(restarted.activeRun?.id).not.toBe(cut.activeRun?.id);
  });

  it("does not start a second run over an unfinished one", () => {
    const base = withActiveGig(withActiveGig(newTestGame(), "mom"), "priya");
    const [first, second] = base.gigs.active;
    if (first === undefined || second === undefined) throw new Error("expected two gigs");
    const started = reduce(base, { type: "startRun", gigId: first.id });
    expect(reduce(started, { type: "startRun", gigId: second.id })).toBe(started);
    const finished = reduce(craftToReview(started), { type: "deliver" });
    expect(dispatchAll(finished, [{ type: "startRun", gigId: second.id }]).activeRun?.purpose).toEqual({
      kind: "gig",
      gigId: second.id,
    });
  });
});

describe("decorations", () => {
  it("only places trims you own and returns them on removal", () => {
    const base = withActiveGig(newTestGame(), "mom");
    const gig = base.gigs.active[0];
    if (gig === undefined) throw new Error("expected a gig");
    const atDecorate = craftToReview(reduce(base, { type: "startRun", gigId: gig.id }));
    const run = atDecorate.activeRun;
    if (run === null) throw new Error("expected a run");
    const decorating: GameState = {
      ...atDecorate,
      activeRun: { ...run, stage: "decorate", decorations: [] },
    };
    expect(reduce(decorating, { type: "addDecoration", trimId: "pearl", x: 10, y: 10 })).toBe(decorating);
    const placed = reduce(decorating, { type: "addDecoration", trimId: "button", x: 200, y: 300 });
    const decoration = placed.activeRun?.decorations[0];
    if (decoration === undefined) throw new Error("expected a decoration");
    expect(decoration).toMatchObject({ trimId: "button", rotation: 0, scale: 1, layer: 1 });
    const moved = reduce(placed, {
      type: "moveDecoration",
      decorationId: decoration.id,
      x: 150,
      y: 250,
      rotation: -90,
      scale: 1.5,
      layer: 3,
    });
    expect(moved.activeRun?.decorations[0]).toMatchObject({
      x: 150,
      y: 250,
      rotation: 270,
      scale: 1.5,
      layer: 3,
    });
    const offDoll = {
      type: "moveDecoration" as const,
      decorationId: decoration.id,
      x: 900,
      y: 0,
      rotation: 0,
      scale: 1,
      layer: 1,
    };
    expect(reduce(moved, offDoll)).toBe(moved);
    const removed = reduce(moved, { type: "removeDecoration", decorationId: decoration.id });
    expect(removed.activeRun?.decorations).toEqual([]);
  });
});

describe("delivery and decoration regressions", () => {
  it("does not subtract delivered trims twice", () => {
    const delivered = reduce(reviewed(), { type: "deliver" });
    expect(delivered.inventory.trims.button).toBe(0);
    expect(availableTrims(delivered, "button")).toBe(0);
  });

  it("returns the same state for an unchanged decoration pose", () => {
    const review = reviewed();
    const run = review.activeRun;
    if (run === null) throw new Error("expected a run");
    const decorating: GameState = { ...review, activeRun: { ...run, stage: "decorate" } };
    const decoration = run.decorations[0];
    if (decoration === undefined) throw new Error("expected a decoration");
    const same = { ...decoration, type: "moveDecoration" as const, decorationId: decoration.id };
    expect(reduce(decorating, same)).toBe(decorating);
  });

  it("ignores unknown trim ids instead of throwing", () => {
    const review = reviewed();
    const run = review.activeRun;
    if (run === null) throw new Error("expected a run");
    const decorating: GameState = { ...review, activeRun: { ...run, stage: "decorate" } };
    const bogusTrim = { type: "addDecoration", trimId: "tiara", x: 10, y: 10 } as unknown as Action;
    expect(reduce(decorating, bogusTrim)).toBe(decorating);
    const shopping = reduce(review, { type: "openShop" });
    const bogusBuy = { type: "buyTrim", trimId: "tiara", count: 1 } as unknown as Action;
    expect(reduce(shopping, bogusBuy)).toBe(shopping);
  });

  it("ignores inherited object keys used as seam ids", () => {
    const review = reviewed();
    const run = review.activeRun;
    if (run === null) throw new Error("expected a run");
    const sewing: GameState = { ...review, activeRun: { ...run, stage: "sew" } };
    expect(reduce(sewing, { type: "resetSeam", seamId: "constructor" })).toBe(sewing);
    expect(reduce(sewing, { type: "resetSeam", seamId: "hem" }).activeRun?.seams.hem).toBeUndefined();
  });
});
