import { describe, expect, it } from "vitest";
import type { DifficultyId } from "../../../engine/difficulty";
import type { TraitId } from "../../../engine/trait";
import { lastResult } from "./delivery";
import type { GameState, LogEntry } from "./gameState";
import { metalFit, pieceQuality, STONE_WEIGHTS } from "./pieceQuality";
import { reduce } from "./reduce";
import {
  GOOD_PLAN,
  lastGigId,
  newTestGame,
  playOrder,
  playRunTo,
  settleStories,
  withOrder,
  type PiecePlan,
} from "./testPlaythrough";

function deliverFor(
  clientId: string,
  plan: Partial<PiecePlan>,
  difficulty: DifficultyId = "standard",
  trait: TraitId = "charmer",
  tweak: (state: GameState) => GameState = (state) => state,
): { readonly before: GameState; readonly after: GameState; readonly entry: LogEntry } {
  const before = tweak(withOrder(settleStories(newTestGame({ difficulty, trait })), clientId));
  const after = playOrder(before, lastGigId(before), { ...GOOD_PLAN, ...plan });
  const run = after.activeRun;
  const entry = run === null ? null : lastResult(after, run.id);
  if (entry === null) throw new Error("no result");
  return { before, after, entry };
}

const ROUGH: Partial<PiecePlan> = {
  cutOffset: 1.2,
  overTicks: 300,
  seatOffset: 0.79,
  clawTravel: 0.3,
  polishAssist: true,
};

describe("piece quality", () => {
  it("weights cut, join, set, polish and metal fit, and splits the set share when there is no stone", () => {
    const { entry } = deliverFor("gran-mina", {});
    expect(entry.evaluation.quality.hasStones).toBe(true);
    const ring = deliverFor("dev", { stoneId: null });
    const quality = ring.entry.evaluation.quality;
    expect(quality.hasStones).toBe(false);
    const expected =
      (100 *
        (STONE_WEIGHTS.cut * quality.cut +
          STONE_WEIGHTS.join * quality.join +
          STONE_WEIGHTS.polish * quality.polish +
          STONE_WEIGHTS.metalFit * quality.metalFit)) /
      0.75;
    expect(quality.quality).toBe(Math.round(expected));
    expect(STONE_WEIGHTS.cut / 0.75).toBeCloseTo(0.4);
    expect(STONE_WEIGHTS.polish / 0.75).toBeCloseTo(0.133, 3);
  });

  it("counts metal fit for classic or wanted metals and zero for avoided ones", () => {
    const state = withOrder(settleStories(newTestGame()), "aunt-lucia");
    const started = reduce(state, { type: "startOrder", gigId: lastGigId(state) });
    const run = playRunTo(started, { ...GOOD_PLAN, metalId: "copper", stoneId: null }, "supplies").activeRun;
    if (run === null) throw new Error("no run");
    expect(metalFit(run, ["nature"], [])).toBe(1);
    expect(metalFit({ ...run, design: { ...run.design, metalId: "silver" } }, ["nature"], [])).toBe(1);
    expect(metalFit({ ...run, design: { ...run.design, metalId: "silver" } }, ["nature"], ["silver"])).toBe(
      0,
    );
    expect(metalFit({ ...run, design: { ...run.design, metalId: "copper" } }, ["bold"], [])).toBe(0);
    expect(pieceQuality(state, run).metalFit).toBe(1);
  });

  it("drops quality for rough work", () => {
    const good = deliverFor("gran-mina", {}).entry.evaluation.quality.quality;
    const rough = deliverFor("gran-mina", ROUGH).entry.evaluation.quality.quality;
    expect(good).toBeGreaterThan(90);
    expect(rough).toBeLessThan(good - 20);
  });
});

describe("evaluation criteria", () => {
  it("fails style when a required tag is missing and fails the pass gate", () => {
    const { entry } = deliverFor(
      "juniper",
      { stoneId: "garnet", options: { shape: "circle" }, charms: ["star-charm", "star-charm"] },
      "standard",
      "dreamer",
      (state) => ({ ...state, reputation: 14 }),
    );
    const style = entry.evaluation.criteria.find((criterion) => criterion.id === "style");
    expect(style?.passed).toBe(false);
    expect(entry.evaluation.passed).toBe(false);
    expect(entry.evaluation.feedback.some((line) => line.includes("dreamy"))).toBe(true);
  });

  it("checks extras, avoided colours, budget and colour bonus", () => {
    const missing = deliverFor("kiko", { metalId: "copper", stoneId: null, charms: [] }).entry.evaluation;
    expect(missing.criteria.find((criterion) => criterion.id === "extras")?.passed).toBe(false);
    expect(
      missing.feedback.some((line) =>
        line.startsWith("So close! The order asked for a few more charms or extras."),
      ),
    ).toBe(true);
    const happy = deliverFor("kiko", { metalId: "copper", stoneId: null, charms: ["star-charm"] }).entry
      .evaluation;
    expect(happy.criteria.find((criterion) => criterion.id === "extras")?.passed).toBe(true);
    const avoided = deliverFor("gran-mina", { finish: "antique" }).entry.evaluation;
    expect(avoided.criteria.find((criterion) => criterion.id === "colours")?.passed).toBe(true);
    const black = deliverFor("dev", { stoneId: null, finish: "glaze", glaze: "blush" }).entry.evaluation;
    expect(black.criteria.find((criterion) => criterion.id === "colours")?.passed).toBe(false);
    const pricey = deliverFor(
      "dev",
      { metalId: "silver", stoneId: null, finish: "glaze", glaze: "navy" },
      "standard",
      "charmer",
      (state) => ({ ...state, coins: 500 }),
    ).entry.evaluation;
    expect(pricey.spend).toBe(8 + 4);
  });

  it("scores 0.3 of the pass mix plus 0.7 of quality plus 2 per favoured colour up to 4", () => {
    const { entry } = deliverFor("gran-mina", {});
    const evaluation = entry.evaluation;
    const total = evaluation.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
    const passed = evaluation.criteria.reduce(
      (sum, criterion) => sum + (criterion.passed ? criterion.weight : 0),
      0,
    );
    const expected = Math.min(
      100,
      Math.round(
        0.3 * ((100 * passed) / total) +
          0.7 * evaluation.quality.quality +
          Math.min(4, 2 * evaluation.favouredColoursUsed),
      ),
    );
    expect(evaluation.score).toBe(expected);
  });
});

describe("rewards by difficulty", () => {
  const failing: Partial<PiecePlan> = { options: { shape: "circle" }, stoneId: "garnet", charms: [] };

  it("pays a pass with fee share, reputation and buzz", () => {
    const { before, after, entry } = deliverFor("gran-mina", {}, "standard", "dreamer");
    expect(entry.reward.outcome).toBe("pass");
    expect(entry.reward.reputation).toBeGreaterThanOrEqual(2);
    expect(after.reputation).toBe(before.reputation + entry.reward.reputation);
    expect(entry.reward.buzz).toBe(1 + entry.evaluation.stars + 3 * entry.reward.trendMatches.length);
  });

  it("turns every Relaxed run into a pass", () => {
    const relaxed = deliverFor("kiko", { metalId: "copper", stoneId: null, charms: [] }, "relaxed").entry;
    expect(relaxed.evaluation.passed).toBe(false);
    expect(relaxed.reward.outcome).toBe("pass");
  });

  it("gives a Standard soft fail 40% of the fee and -1 reputation, but nothing lost for a Charmer", () => {
    const soft = deliverFor("kiko", { metalId: "copper", stoneId: null, charms: [] }, "standard", "dreamer");
    expect(soft.entry.reward.outcome).toBe("soft-fail");
    expect(soft.entry.reward.coins).toBe(Math.round((soft.before.gigs.active[0]?.brief.fee ?? 0) * 0.4));
    expect(soft.entry.reward.reputation).toBe(-1);
    expect(
      deliverFor("kiko", { metalId: "copper", stoneId: null, charms: [] }, "standard", "charmer").entry.reward
        .reputation,
    ).toBe(0);
  });

  it("pays nothing for a Challenging fail and charges half the fee for lateness", () => {
    const fail = deliverFor("juniper", failing, "challenging", "dreamer", (state) => ({
      ...state,
      reputation: 14,
    })).entry;
    expect(fail.reward).toMatchObject({ outcome: "fail", coins: 0, reputation: -3 });
    const late = deliverFor("gran-mina", {}, "challenging", "dreamer", (state) => ({
      ...state,
      gigs: {
        ...state.gigs,
        active: state.gigs.active.map((gig) => ({ ...gig, brief: { ...gig.brief, deadlineDay: 0 } })),
      },
    })).entry;
    expect(late.reward.lines.find((line) => line.label === "Late delivery")?.amount).toBeLessThan(0);
  });

  it("adds a fine metal bonus: +15% for silver, +30% and +1 reputation for gold", () => {
    const silver = deliverFor("gran-mina", { metalId: "silver" }, "standard", "dreamer", (state) => ({
      ...state,
      coins: 500,
    })).entry;
    const fee = silver.reward.lines.find((line) => line.label === "Fine metal")?.amount ?? 0;
    expect(fee).toBeGreaterThan(0);
    const gold = deliverFor("gran-mina", { metalId: "gold" }, "standard", "dreamer", (state) => ({
      ...state,
      coins: 500,
      reputation: 30,
    })).entry;
    const goldBonus = gold.reward.lines.find((line) => line.label === "Fine metal")?.amount ?? 0;
    expect(goldBonus).toBeGreaterThan(fee);
    const brass = deliverFor("gran-mina", {}, "standard", "dreamer").entry;
    expect(gold.reward.reputation).toBe(brass.reward.reputation + 1);
    expect(brass.reward.lines.some((line) => line.label === "Fine metal")).toBe(false);
  });
});

describe("trait perks on orders", () => {
  it("gives a Dreamer +15% for a dreamy or bold piece and a Charmer a 10% tip", () => {
    const dreamer = deliverFor("gran-mina", {}, "standard", "dreamer").entry;
    expect(dreamer.reward.lines.some((line) => line.label === "Starry ideas")).toBe(true);
    const charmer = deliverFor("gran-mina", {}, "standard", "charmer").entry;
    expect(charmer.reward.lines.some((line) => line.label === "Charmer tip")).toBe(true);
  });

  it("gives a Trendsetter +10% of the fee per trend match", () => {
    const { before, entry } = deliverFor("gran-mina", {}, "standard", "trendsetter", (state) => ({
      ...state,
      trends: { ...state.trends, current: ["classic", "elegant"] },
    }));
    expect(entry.reward.trendMatches).toEqual(["classic", "elegant"]);
    const fee = before.gigs.active[0]?.brief.fee ?? 0;
    expect(entry.reward.lines.find((line) => line.label === "Trendsetter eye")?.amount).toBe(
      Math.round(fee * 0.2),
    );
    expect(entry.reward.lines.find((line) => line.label === "Arcade favourite")?.amount).toBe(
      Math.round(fee * 0.1),
    );
  });
});
