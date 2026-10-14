import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import type { RackPiece } from "./rackPiece";
import { reduce } from "./reduce";
import { fairBand, fairValue, saleOutcome, stallIssues } from "./stallDay";
import {
  cutActions,
  dispatchAll,
  flipAtUnpick,
  layoutActions,
  newTestGame,
  runOf,
  scrubAll,
  seamActions,
  settleStories,
  unpickAll,
} from "./testPlaythrough";

function piece(
  id: string,
  quality: number,
  leaves: number,
  tags: RackPiece["tags"] = ["classic"],
): RackPiece {
  return {
    id,
    runId: "run-1",
    recipeId: "remade-top",
    design: { recipeId: "remade-top", parts: { bodice: "fitted-bodice", sleeves: "sleeveless" } },
    cloth: { colour: "sage", print: "solid", material: "linen" },
    quality,
    leaves,
    tags,
    finishes: [],
    madeDay: 2,
    findIds: [],
    seamAccuracy: quality / 100,
    leavesParts: { reuse: leaves / 100, salvage: leaves / 100, secondhand: leaves / 100 },
    colours: ["sage"],
    showcaseSeason: null,
  };
}

function stallDay(trait: GameState["profile"]["trait"] = "dreamer", rack: RackPiece[] = []): GameState {
  const base = settleStories(newTestGame({ trait }));
  const day7 = dispatchAll(
    base,
    Array.from({ length: 6 }, () => ({ type: "endDay" }) as const),
  );
  return {
    ...settleStories(day7),
    rack,
    trends: { current: ["bold", "dreamy"], next: day7.trends.next },
    next: { ...day7.next, piece: 10 },
  };
}

describe("Stall Day prices", () => {
  it("values a remade top as the design doc's example", () => {
    expect(fairValue(piece("piece-1", 80, 70), [], 1)).toBe(71);
    expect(fairBand(piece("piece-1", 80, 70), [], 1)).toEqual({ value: 71, low: 64, high: 78 });
    expect(fairValue(piece("piece-1", 80, 70, ["classic", "bold"]), ["bold", "dreamy"], 1)).toBe(
      Math.round(70 * 0.92 * 1.1 + 7),
    );
  });

  it("sells bargains and fair prices and keeps overpriced pieces", () => {
    const band = fairBand(piece("piece-1", 80, 70), [], 1);
    expect(saleOutcome(49, band)).toBe("bargain");
    expect(saleOutcome(60, band)).toBe("sold");
    expect(saleOutcome(64, band)).toBe("fair");
    expect(saleOutcome(78, band)).toBe("fair");
    expect(saleOutcome(79, band)).toBe("stayed");
  });

  it("pays sold pieces, adds capped fair reputation and keeps stayed ones on the rack", () => {
    const rack = [
      piece("piece-1", 80, 70),
      piece("piece-2", 80, 70),
      piece("piece-3", 80, 70),
      piece("piece-4", 80, 70),
    ];
    const state = stallDay("dreamer", rack);
    expect(state.calendar.day).toBe(7);
    const prices = { "piece-1": 78, "piece-2": 70, "piece-3": 70, "piece-4": 120 };
    const value = fairValue(rack[0] as RackPiece, state.trends.current, 1);
    const held = reduce(state, { type: "holdStall", prices });
    expect(held.coins).toBe(state.coins + 78 + 70 + 70);
    expect(held.reputation).toBe(state.reputation + 2);
    expect(held.rack.map((entry) => entry.id)).toEqual(["piece-4"]);
    expect(held.stall?.sales.map((sale) => sale.outcome)).toEqual(["fair", "fair", "fair", "stayed"]);
    expect(value).toBe(71);
    expect(reduce(held, { type: "holdStall", prices: { "piece-4": 70 } })).toBe(held);
  });

  it("lets Charmers earn up to 3 reputation and extra buzz from fair sales", () => {
    const rack = [
      piece("piece-1", 80, 70),
      piece("piece-2", 80, 70),
      piece("piece-3", 80, 70),
      piece("piece-4", 80, 70),
    ];
    const state = stallDay("charmer", rack);
    const held = reduce(state, {
      type: "holdStall",
      prices: { "piece-1": 70, "piece-2": 70, "piece-3": 70, "piece-4": 70 },
    });
    expect(held.reputation).toBe(state.reputation + 3);
    expect(held.buzz).toBe(state.buzz + 4);
    expect(held.story.queue).toContain("tf-trait-charmer");
  });

  it("adds awning buzz and needs a tag on every piece, only on Stall Day", () => {
    const state = { ...stallDay("dreamer", [piece("piece-1", 80, 70)]), upgrades: ["stall-awning" as const] };
    expect(stallIssues(state, {})).toHaveLength(1);
    expect(reduce(state, { type: "holdStall", prices: { "piece-1": 0 } })).toBe(state);
    const held = reduce(state, { type: "holdStall", prices: { "piece-1": 200 } });
    expect(held.buzz).toBe(state.buzz + 2);
    const weekday = { ...state, calendar: { ...state.calendar, day: 3 } };
    expect(reduce(weekday, { type: "holdStall", prices: { "piece-1": 70 } })).toBe(weekday);
  });
});

describe("Stall Day keeps the workbench closed", () => {
  it("refuses every kind of flip work until tomorrow", () => {
    const unpicking = flipAtUnpick(
      settleStories(newTestGame()),
      "nana-bea",
      { recipeId: "cushion-cover", parts: {} },
      [{ findId: "linen-curtain", grade: "like-new" }],
    );
    const onStallDay = (state: GameState): GameState => ({
      ...state,
      calendar: { ...state.calendar, day: 7, hoursLeft: 10 },
    });
    const pulling = onStallDay(unpicking);
    expect(unpickAll(pulling, 2)).toBe(pulling);
    const cleaning = reduce(unpickAll(unpicking, 2), { type: "goToStage", stage: "clean" });
    const scrubbing = onStallDay(cleaning);
    expect(scrubAll(scrubbing, 0)).toBe(scrubbing);
    const laying = onStallDay(reduce(scrubAll(cleaning, 0), { type: "goToStage", stage: "layout" }));
    expect(dispatchAll(laying, layoutActions(laying))).toBe(laying);
    const laid = reduce(scrubAll(cleaning, 0), { type: "goToStage", stage: "layout" });
    const cutting = dispatchAll(laid, [...layoutActions(laid), { type: "goToStage", stage: "cut" }]);
    const stallCut = onStallDay(cutting);
    expect(dispatchAll(stallCut, cutActions(stallCut, "trace"))).toBe(stallCut);
    expect(dispatchAll(stallCut, cutActions(stallCut, "assist"))).toBe(stallCut);
    const sewing = dispatchAll(cutting, [
      ...cutActions(cutting, "assist"),
      { type: "goToStage", stage: "sew" },
    ]);
    expect(runOf(sewing).stage).toBe("sew");
    const stallSew = onStallDay(sewing);
    expect(dispatchAll(stallSew, seamActions(stallSew, 0.9))).toBe(stallSew);
  });
});
