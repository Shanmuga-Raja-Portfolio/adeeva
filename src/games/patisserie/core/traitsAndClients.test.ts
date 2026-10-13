import { describe, expect, it } from "vitest";
import { CLIENTS } from "../content/client";
import { rollClientBrief } from "./brief";
import { lastResult } from "./delivery";
import type { GameState } from "./gameState";
import { clientIsEligible } from "./offers";
import { reduce } from "./reduce";
import {
  GOOD_PLAN,
  lastGigId,
  newTestGame,
  playOrder,
  settleStories,
  withOrder,
  type BakePlan,
} from "./testPlaythrough";

function client(id: string) {
  const found = CLIENTS.find((entry) => entry.id === id);
  if (found === undefined) throw new Error(`missing ${id}`);
  return found;
}

function laterDay(state: GameState, reputation: number): GameState {
  return { ...state, calendar: { day: 3, hoursLeft: 10 }, reputation };
}

const PIP_PLAN: BakePlan = {
  ...GOOD_PLAN,
  productId: "cupcake-tray",
  mixIds: ["vanilla-sponge"],
  fillingId: null,
  colours: ["sky", "blush"],
};

function pipResult(state: GameState, plan: BakePlan = PIP_PLAN) {
  const ordered = withOrder(settleStories(state), "pip");
  const done = playOrder(ordered, lastGigId(ordered), plan);
  const run = done.activeRun;
  if (run === null) throw new Error("no run");
  const result = lastResult(done, run.id);
  if (result === null) throw new Error("no result");
  return { before: ordered, after: done, result };
}

describe("clients", () => {
  it("offers only Pip or Coach Dani on day 1, and always Pip with the guide on", () => {
    const relaxed = newTestGame({ difficulty: "relaxed" });
    expect(relaxed.guide).toBe(true);
    expect(relaxed.gigs.offers.map((offer) => offer.clientId)).toEqual(["pip"]);
    const standard = newTestGame();
    expect(standard.guide).toBe(false);
    for (const offer of standard.gigs.offers) expect(["pip", "coach-dani"]).toContain(offer.clientId);
  });

  it("opens clients by reputation", () => {
    const state = laterDay(newTestGame(), 4);
    expect(clientIsEligible(client("mrs-adeyemi"), state)).toBe(true);
    expect(clientIsEligible(client("ms-farrow"), state)).toBe(false);
    expect(clientIsEligible(client("rosa-mateo"), laterDay(state, 12))).toBe(true);
  });

  it("keeps Saffi for Trendsetters and Mr. Bramwell for Charmers", () => {
    const trend = laterDay(newTestGame({ trait: "trendsetter" }), 10);
    const charm = laterDay(newTestGame({ trait: "charmer" }), 10);
    expect(clientIsEligible(client("saffi"), trend)).toBe(true);
    expect(clientIsEligible(client("saffi"), charm)).toBe(false);
    expect(clientIsEligible(client("mr-bramwell"), charm)).toBe(true);
    expect(clientIsEligible(client("mr-bramwell"), trend)).toBe(false);
    expect(clientIsEligible(client("saffi"), laterDay(newTestGame({ trait: "trendsetter" }), 5))).toBe(false);
  });

  it("asks Saffi for this week's first hot tag and any two colours", () => {
    const [brief] = rollClientBrief(
      client("saffi"),
      { day: 4, minQualityBonus: 0, hotTags: ["regal", "sporty"] },
      5,
    );
    expect(brief.requiredTags).toEqual(["regal"]);
    expect(brief.favouredColours).toHaveLength(2);
    expect(brief.products).toEqual(["cupcake-tray", "iced-biscuits"]);
  });

  it("asks Mr. Bramwell for honey cake and fails the style without it", () => {
    const state = withOrder(settleStories(newTestGame({ trait: "charmer" })), "mr-bramwell");
    const plan: BakePlan = {
      ...GOOD_PLAN,
      productId: "layer-cake",
      mixIds: ["vanilla-sponge"],
      fillingId: "honey-cream",
      colours: ["sage"],
    };
    const done = playOrder(state, lastGigId(state), plan);
    const run = done.activeRun;
    const style =
      run === null
        ? undefined
        : lastResult(done, run.id)?.evaluation.criteria.find((entry) => entry.id === "style");
    expect(style?.passed).toBe(false);
    const honey = playOrder(state, lastGigId(state), { ...plan, mixIds: ["honey-sponge"] });
    const honeyRun = honey.activeRun;
    const honeyStyle =
      honeyRun === null
        ? undefined
        : lastResult(honey, honeyRun.id)?.evaluation.criteria.find((entry) => entry.id === "style");
    expect(honeyStyle?.passed).toBe(true);
  });
});

describe("trait perks", () => {
  it("Dreamer earns sugar clouds for three colours", () => {
    const { result } = pipResult(newTestGame({ trait: "dreamer" }), {
      ...PIP_PLAN,
      colours: ["sky", "blush", "mustard"],
    });
    expect(result.reward.lines.map((line) => line.label)).toContain("Dreamer flair");
    const plain = pipResult(newTestGame({ trait: "charmer" }), {
      ...PIP_PLAN,
      colours: ["sky", "blush", "mustard"],
    });
    expect(plain.result.reward.lines.map((line) => line.label)).not.toContain("Dreamer flair");
  });

  it("Trendsetter earns a fee per trend match and sees next week early", () => {
    const base = newTestGame({ trait: "trendsetter" });
    const hot = {
      ...base,
      trends: { current: ["playful" as const, "regal" as const], next: base.trends.next },
    };
    const { result } = pipResult(hot);
    expect(result.reward.lines.map((line) => line.label)).toEqual(
      expect.arrayContaining(["Trend bonus", "Trendsetter eye"]),
    );
  });

  it("Charmer tips on happy orders and loses no reputation on a near miss", () => {
    const tipped = pipResult(newTestGame({ trait: "charmer" }));
    expect(tipped.result.reward.lines.map((line) => line.label)).toContain("Charmer tip");
    const sloppy: BakePlan = { ...PIP_PLAN, weighError: 0.4, stirShare: 0.2, bakeShare: 1.8, pipeOffset: 2 };
    const miss = pipResult(newTestGame({ trait: "charmer" }), sloppy);
    expect(miss.result.reward.outcome).toBe("soft-fail");
    expect(miss.after.reputation).toBe(miss.before.reputation);
  });

  it("Perfectionist hears Otti after landing a weigh exactly", () => {
    const { after } = pipResult(newTestGame({ trait: "perfectionist" }));
    expect([...after.story.seen, ...after.story.queue]).toContain("pa-trait-perfectionist");
    const other = pipResult(newTestGame({ trait: "dreamer" }));
    expect([...other.after.story.seen, ...other.after.story.queue]).not.toContain("pa-trait-perfectionist");
  });
});

describe("rewards per difficulty", () => {
  const sloppy: BakePlan = { ...PIP_PLAN, weighError: 0.4, stirShare: 0.2, bakeShare: 1.8, pipeOffset: 2 };

  it("Relaxed treats every order as a pass", () => {
    const { result } = pipResult(newTestGame({ difficulty: "relaxed" }), sloppy);
    expect(result.evaluation.passed).toBe(false);
    expect(result.reward.outcome).toBe("pass");
    expect(result.reward.reputation).toBeGreaterThan(0);
  });

  it("Standard pays 40% of the fee with a kind note on a near miss", () => {
    const { result, before } = pipResult(newTestGame({ difficulty: "standard" }), sloppy);
    const fee = before.gigs.active[0]?.brief.fee ?? 0;
    expect(result.reward.outcome).toBe("soft-fail");
    expect(result.reward.coins).toBe(Math.round(fee * 0.4));
    expect(result.reward.reputation).toBe(-1);
    expect(result.evaluation.feedback.length).toBeGreaterThan(0);
  });

  it("Challenging pays nothing on a miss, raises the bar and halves late fees", () => {
    const miss = pipResult(newTestGame({ difficulty: "challenging" }), sloppy);
    expect(miss.result.reward.outcome).toBe("fail");
    expect(miss.result.reward.coins).toBe(0);
    expect(miss.result.reward.reputation).toBe(-3);
    expect(miss.before.gigs.active[0]?.brief.minQuality).toBe(68);
    const ordered = withOrder(settleStories(newTestGame({ difficulty: "challenging" })), "pip");
    const gig = ordered.gigs.active[0];
    if (gig === undefined) throw new Error("no gig");
    const late = {
      ...ordered,
      gigs: { ...ordered.gigs, active: [{ ...gig, brief: { ...gig.brief, deadlineDay: 0 } }] },
    };
    const done = playOrder(late, gig.id, PIP_PLAN);
    const run = done.activeRun;
    const reward = run === null ? undefined : lastResult(done, run.id)?.reward;
    expect(reward?.lines.find((line) => line.label === "Late delivery")?.amount).toBe(
      -Math.round(gig.brief.fee * 0.5),
    );
  });

  it("is deterministic for the same seed and choices", () => {
    expect(pipResult(newTestGame()).after).toEqual(pipResult(newTestGame()).after);
    expect(newTestGame({ seed: 8 }).rng).not.toBe(newTestGame({ seed: 9 }).rng);
    expect(reduce(newTestGame(), { type: "endDay" })).toEqual(reduce(newTestGame(), { type: "endDay" }));
  });
});
