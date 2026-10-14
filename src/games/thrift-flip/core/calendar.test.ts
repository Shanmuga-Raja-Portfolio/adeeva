import { describe, expect, it } from "vitest";
import { CAREER } from "../content/career";
import { canWorkShift } from "./calendar";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
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
  withActiveGig,
} from "./testPlaythrough";

describe("the market calendar", () => {
  it("starts with 90 coins, Femi's scrap tin and a fresh rail", () => {
    const state = newTestGame();
    expect(state.coins).toBe(90);
    expect(state.stock.scraps.map((scrap) => scrap.name)).toEqual([
      "Sage Linen scrap",
      "Emerald Velvet scrap",
      "Ruby Velvet scrap",
      "Sky Gingham scrap",
    ]);
    expect(state.story.queue).toEqual(["tf-intro"]);
  });

  it("turns day 7 into Stall Day and pays rent when it ends", () => {
    const base = settleStories(newTestGame());
    const day7 = dispatchAll(
      base,
      Array.from({ length: 6 }, () => ({ type: "endDay" }) as const),
    );
    expect(day7.calendar.day).toBe(7);
    expect(day7.story.queue).toContain("tf-first-stall-day");
    expect(canWorkShift(day7).ok).toBe(false);
    expect(reduce(day7, { type: "startOwnFlip" })).toBe(day7);
    const day8 = reduce(day7, { type: "endDay" });
    expect(day8.coins).toBe(day7.coins - 80);
    expect(day8.story.queue).toContain("tf-first-week");
    expect(day8.trends.current).toEqual(day7.trends.next);
  });

  it("pays the swap-shop shift only for an untouched working day", () => {
    const base = settleStories(newTestGame());
    const shifted = reduce(base, { type: "workShift" });
    expect(shifted.coins).toBe(base.coins + CAREER.shiftPay);
    expect(shifted.calendar.day).toBe(2);
    const gig = withActiveGig(base, "nana-bea");
    const busy = dispatchAll(gig, [
      { type: "startFlip", gigId: gig.gigs.active[0]?.id ?? "" },
      { type: "goToStage", stage: "design" },
      { type: "chooseRecipe", recipeId: "cushion-cover" },
      { type: "goToStage", stage: "market" },
    ]);
    expect(busy.calendar.hoursLeft).toBe(9);
    expect(reduce(busy, { type: "workShift" })).toBe(busy);
  });

  it("queues the bankrupt beat only on Challenging", () => {
    const run = (difficulty: "standard" | "challenging") => {
      const base = { ...settleStories(newTestGame({ difficulty })), coins: 10 };
      return dispatchAll(
        base,
        Array.from({ length: 7 }, () => ({ type: "endDay" }) as const),
      );
    };
    expect(run("challenging").story.queue).toContain("tight-week");
    expect(run("standard").story.queue).not.toContain("tight-week");
  });

  it("buys upgrades once with enough reputation and coins", () => {
    const state = { ...newTestGame(), coins: 500, reputation: 4 };
    const bought = reduce(state, { type: "buyUpgrade", upgradeId: "sharp-ripper" });
    expect(bought.coins).toBe(440);
    expect(reduce(bought, { type: "buyUpgrade", upgradeId: "sharp-ripper" })).toBe(bought);
    expect(reduce(state, { type: "buyUpgrade", upgradeId: "wash-tub" })).toBe(state);
  });

  it("refunds bought finishes when an order lapses with the flip on the bench", () => {
    const unpicking = flipAtUnpick(
      settleStories(newTestGame()),
      "nana-bea",
      { recipeId: "cushion-cover", parts: {} },
      [{ findId: "linen-curtain", grade: "like-new" }],
    );
    const cleaning = reduce(unpickAll(unpicking, 2), { type: "goToStage", stage: "clean" });
    const laying = reduce(scrubAll(cleaning, 0), { type: "goToStage", stage: "layout" });
    const cutting = dispatchAll(laying, [...layoutActions(laying), { type: "goToStage", stage: "cut" }]);
    const sewing = dispatchAll(cutting, [
      ...cutActions(cutting, "assist"),
      { type: "goToStage", stage: "sew" },
    ]);
    const sewn = dispatchAll(sewing, seamActions(sewing, 0.9));
    const morning = { ...sewn, calendar: { ...sewn.calendar, day: sewn.calendar.day + 1, hoursLeft: 10 } };
    const finishing = dispatchAll(morning, [
      { type: "goToStage", stage: "finish" },
      { type: "addFinish", finish: { kind: "mark", markId: "mend-cross", colour: null }, x: 100, y: 100 },
      { type: "addFinish", finish: { kind: "trim", trimId: "button", source: "new" }, x: 120, y: 100 },
    ]);
    expect(runOf(finishing).finishes).toHaveLength(2);
    expect(finishing.coins).toBeLessThan(morning.coins);
    const bare = reduce(morning, { type: "goToStage", stage: "finish" });
    const untilLapsed = (state: GameState): GameState => {
      let current = state;
      for (let guard = 0; guard < 10 && current.activeRun !== null; guard += 1)
        current = reduce(current, { type: "endDay" });
      return current;
    };
    const lapsed = untilLapsed(finishing);
    const lapsedBare = untilLapsed(bare);
    expect(lapsed.activeRun).toBeNull();
    expect(lapsed.calendar.day).toBe(lapsedBare.calendar.day);
    expect(lapsed.coins).toBe(lapsedBare.coins);
  });
});
