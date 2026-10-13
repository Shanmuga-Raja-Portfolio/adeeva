import { describe, expect, it } from "vitest";
import { bakeQuality, flavourFit } from "./bakeQuality";
import type { BakeRun } from "./bakeRun";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { lastResult } from "./delivery";
import {
  GOOD_PLAN,
  lastGigId,
  newTestGame,
  playRunTo,
  playTray,
  settleStories,
  withOrder,
  type BakePlan,
} from "./testPlaythrough";

const PIP: BakePlan = {
  ...GOOD_PLAN,
  productId: "cupcake-tray",
  mixIds: ["vanilla-sponge"],
  fillingId: null,
  colours: ["sky"],
};

function reviewState(plan: BakePlan, upgrades: GameState["upgrades"] = []): GameState {
  const ordered = withOrder({ ...settleStories(newTestGame()), upgrades }, "grandpa-tomasz");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, plan, "review");
}

function reviewedRun(plan: BakePlan): { readonly run: BakeRun } {
  const review = reviewState(plan);
  if (review.activeRun === null) throw new Error("no run");
  return { run: review.activeRun };
}

function deliveredQuality(state: GameState): number {
  const runId = state.activeRun?.id ?? "";
  const delivered = reduce({ ...state, coins: state.coins + 500 }, { type: "deliver" });
  const result = lastResult(delivered, runId);
  if (result === null) throw new Error("not delivered");
  return result.evaluation.quality.quality;
}

describe("bake quality", () => {
  it("weights weighing, stirring, oven, piping and flavour fit", () => {
    const { run } = reviewedRun({
      ...PIP,
      productId: "layer-cake",
      mixIds: ["honey-sponge"],
      fillingId: "honey-cream",
    });
    const quality = bakeQuality(run);
    expect(quality.weigh).toBe(1);
    expect(quality.stir).toBe(0.95);
    expect(quality.bake).toBe(1);
    expect(quality.pipe).toBeCloseTo(1);
    expect(quality.flavourFit).toBe(1);
    expect(quality.quality).toBe(Math.round(100 * (0.25 + 0.15 * 0.95 + 0.25 + 0.3 * quality.pipe + 0.05)));
  });

  it("gives no flavour fit for an avoided mix", () => {
    const { run } = reviewedRun({
      ...PIP,
      productId: "layer-cake",
      mixIds: ["lemon-sponge"],
      fillingId: "honey-cream",
    });
    if (run.brief === null) throw new Error("no brief");
    expect(flavourFit(run, run.brief)).toBe(0);
  });

  it("counts an unfinished path as zero", () => {
    const ordered = withOrder(settleStories(newTestGame()), "pip");
    const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
    const piping = playRunTo(started, PIP, "pipe");
    if (piping.activeRun === null) throw new Error("no run");
    expect(bakeQuality(piping.activeRun).pipe).toBe(0);
  });

  it("scores counter trays on weighing, stirring and the oven only", () => {
    const stocked = playTray(settleStories(newTestGame()), { ...PIP, stirShare: 0.5 });
    const tray = stocked.counter.trays[0];
    expect(tray?.quality).toBe(Math.round(100 * (0.35 + 0.25 * 0.5 + 0.4)));
  });

  it("scores each weigh and bake with the tools on the bench at the time", () => {
    const shaky: BakePlan = {
      ...PIP,
      productId: "layer-cake",
      mixIds: ["honey-sponge"],
      fillingId: "honey-cream",
      weighError: 0.07,
      bakeShare: 1.09,
    };
    const plain = reviewState(shaky);
    const lateTools = { ...plain, upgrades: ["bright-scale", "oven-lamp"] as GameState["upgrades"] };
    expect(deliveredQuality(lateTools)).toBe(deliveredQuality(plain));
    const early = reviewState(shaky, ["bright-scale", "oven-lamp"]);
    expect(deliveredQuality(early)).toBeGreaterThan(deliveredQuality(plain));
  });
});
