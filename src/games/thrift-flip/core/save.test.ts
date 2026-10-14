import { describe, expect, it } from "vitest";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import {
  dispatchAll,
  newTestGame,
  playFlipToReview,
  settleStories,
  withActiveGig,
  withFind,
} from "./testPlaythrough";

function midFlip() {
  const state = withActiveGig(settleStories(newTestGame()), "nana-bea");
  const review = playFlipToReview(state, state.gigs.active[0]?.id ?? "", {
    design: { recipeId: "cushion-cover", parts: {} },
    findId: "check-coat",
    grade: "tired",
    pullCm: 2,
    harshShare: 0.2,
    cut: "trace",
    seamAccuracy: 0.85,
  });
  return review;
}

describe("saving and loading", () => {
  it("round-trips a fresh game, a flip in progress and a delivered flip", () => {
    const fresh = newTestGame();
    const review = midFlip();
    const delivered = reduce(review, { type: "deliver" });
    for (const state of [fresh, review, delivered]) {
      const parsed = parseSave(serialize(state));
      expect(parsed.ok).toBe(true);
      if (parsed.ok) expect(parsed.state).toEqual(state);
    }
  });

  it("refuses damaged or unknown saves with a reason", () => {
    expect(parseSave("{not json").ok).toBe(false);
    expect(parseSave("[]").ok).toBe(false);
    expect(parseSave(JSON.stringify({ schemaVersion: 99 })).ok).toBe(false);
    const raw = JSON.parse(serialize(midFlip())) as Record<string, unknown>;
    const broken = parseSave(JSON.stringify({ ...raw, coins: "lots" }));
    expect(broken.ok).toBe(false);
    if (!broken.ok) expect(broken.error).toContain("save.coins");
    const badRun = parseSave(
      JSON.stringify({
        ...raw,
        activeRun: {
          ...(raw.activeRun as object),
          placements: { "not-a-piece": { x: 1, y: 1, rotation: 0 } },
        },
      }),
    );
    expect(badRun.ok).toBe(false);
    const badCounter = parseSave(JSON.stringify({ ...raw, next: { run: 1, find: 1, scrap: 1, piece: 1 } }));
    expect(badCounter.ok).toBe(false);
  });

  it("refuses forged saves whose parts disagree with each other", () => {
    const base = withFind(withActiveGig(settleStories(newTestGame()), "nana-bea"), "linen-curtain");
    const key = base.stock.finds[0]?.id ?? "";
    const atMarket = dispatchAll(base, [
      { type: "startFlip", gigId: base.gigs.active[0]?.id ?? "" },
      { type: "goToStage", stage: "design" },
      { type: "chooseRecipe", recipeId: "cushion-cover" },
      { type: "goToStage", stage: "market" },
      { type: "chooseFinds", findIds: [key] },
    ]);
    const raw = JSON.parse(serialize(atMarket)) as {
      stock: { finds: unknown[]; scraps: unknown[] };
      activeRun: Record<string, unknown>;
      rail: { price: number }[];
      stall: unknown;
    };
    expect(parseSave(JSON.stringify(raw)).ok).toBe(true);
    const run = raw.activeRun;
    const forged = [
      { ...raw, stock: { ...raw.stock, finds: [] } },
      { ...raw, stock: { ...raw.stock, finds: [raw.stock.finds[0], raw.stock.finds[0]] } },
      { ...raw, stock: { ...raw.stock, scraps: [raw.stock.scraps[0], raw.stock.scraps[0]] } },
      { ...raw, activeRun: { ...run, stage: "review", reachedStage: "review" } },
      { ...raw, activeRun: { ...run, stage: "sew", reachedStage: "sew", cutDone: true } },
      { ...raw, activeRun: { ...run, cutDone: true } },
      {
        ...raw,
        activeRun: {
          ...run,
          unpick: { [`${key}#0`]: { popped: [90, 91], snagsAt: [], attempts: 2, assisted: false } },
        },
      },
      { ...raw, stall: { day: 99, sales: [], coins: 0, reputation: 0, buzz: 0 } },
      {
        ...raw,
        rail: raw.rail.map((slot, index) => (index === 0 ? { ...slot, price: slot.price + 1 } : slot)),
      },
    ];
    for (const save of forged) expect(parseSave(JSON.stringify(save)).ok).toBe(false);
    const own = playFlipToReview(settleStories(newTestGame()), null, {
      design: { recipeId: "cushion-cover", parts: {} },
      findId: "linen-curtain",
      grade: "like-new",
      pullCm: 2,
      harshShare: 0,
      cut: "trace",
      seamAccuracy: 0.9,
    });
    const delivered = reduce(own, { type: "deliver" });
    expect(delivered.rack).toHaveLength(1);
    const rackRaw = JSON.parse(serialize({ ...delivered, activeRun: null })) as { rack: unknown[] };
    expect(parseSave(JSON.stringify(rackRaw)).ok).toBe(true);
    expect(parseSave(JSON.stringify({ ...rackRaw, rack: [rackRaw.rack[0], rackRaw.rack[0]] })).ok).toBe(
      false,
    );
  });
});
