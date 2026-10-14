import { describe, expect, it } from "vitest";
import type { TraitId } from "../../../engine/trait";
import type { DifficultyId } from "../../../engine/difficulty";
import type { StyleTag } from "../../../engine/styleTag";
import type { Brief } from "./brief";
import { weeklyBill } from "./calendar";
import { evaluateFlip, type FlipEvaluation } from "./flipEvaluate";
import { flipRewards } from "./rewards";
import { newTestGame, playFlipToReview, runOf, settleStories, withActiveGig } from "./testPlaythrough";

function sample(): { evaluation: FlipEvaluation; brief: Brief } {
  const state = withActiveGig(settleStories(newTestGame()), "nana-bea");
  const review = playFlipToReview(state, state.gigs.active[0]?.id ?? "", {
    design: { recipeId: "cushion-cover", parts: {} },
    findId: "linen-curtain",
    grade: "like-new",
    pullCm: 2,
    harshShare: 0,
    cut: "trace",
    seamAccuracy: 0.9,
  });
  const run = runOf(review);
  if (run.brief === null) throw new Error("No brief");
  return { evaluation: evaluateFlip(review, run, review.calendar.day), brief: { ...run.brief, fee: 50 } };
}

const BASE = sample();

function reward(
  overrides: Partial<FlipEvaluation>,
  difficulty: DifficultyId = "standard",
  trait: TraitId = "perfectionist",
  hotTags: readonly StyleTag[] = [],
) {
  return flipRewards({ ...BASE.evaluation, ...overrides }, BASE.brief, { difficulty, trait, hotTags });
}

describe("rewards per difficulty", () => {
  it("pays a pass by score with reputation and buzz", () => {
    const paid = reward({ passed: true, score: 80, stars: 4, colours: ["sage"], tags: ["classic"] });
    expect(paid.outcome).toBe("pass");
    expect(paid.coins).toBe(Math.round(50 * (0.8 + 0.4 * 0.8)));
    expect(paid.reputation).toBe(1 + Math.round(2 * 0.8));
    expect(paid.buzz).toBe(1 + 4 + (BASE.evaluation.leaves.leaves >= 75 ? 1 : 0));
  });

  it("adds the Leaf Pick buzz at 75 leaves or more", () => {
    const leafy = reward({
      passed: true,
      score: 80,
      stars: 4,
      leaves: { ...BASE.evaluation.leaves, leaves: 80 },
    });
    const plain = reward({
      passed: true,
      score: 80,
      stars: 4,
      leaves: { ...BASE.evaluation.leaves, leaves: 60 },
    });
    expect(leafy.leafPick).toBe(true);
    expect(leafy.buzz).toBe(plain.buzz + 1);
  });

  it("softly fails on Standard, never fails on Relaxed and fails firmly on Challenging", () => {
    const soft = reward({ passed: false, score: 40, stars: 2 });
    expect(soft.outcome).toBe("soft-fail");
    expect(soft.coins).toBe(20);
    expect(soft.reputation).toBe(-1);
    expect(reward({ passed: false, score: 40, stars: 2 }, "standard", "charmer").reputation).toBe(0);
    const relaxed = reward({ passed: false, score: 40, stars: 2 }, "relaxed");
    expect(relaxed.outcome).toBe("pass");
    const hard = reward({ passed: false, score: 40, stars: 2 }, "challenging");
    expect(hard.outcome).toBe("fail");
    expect(hard.coins).toBe(0);
    expect(hard.reputation).toBe(-3);
  });

  it("halves the fee for late work only on Challenging", () => {
    const late = BASE.evaluation.criteria.map((criterion) =>
      criterion.id === "deadline" ? { ...criterion, passed: false } : criterion,
    );
    const standard = reward({ passed: true, score: 80, stars: 4, criteria: late });
    const challenging = reward({ passed: true, score: 80, stars: 4, criteria: late }, "challenging");
    expect(challenging.coins).toBe(standard.coins - 25);
  });

  it("charges rent by difficulty", () => {
    expect(weeklyBill(newTestGame({ difficulty: "relaxed" }))).toBe(0);
    expect(weeklyBill(newTestGame({ difficulty: "standard" }))).toBe(80);
    expect(weeklyBill(newTestGame({ difficulty: "challenging" }))).toBe(120);
  });
});

describe("trait perks", () => {
  it("gives the Dreamer +15% for three colours or a dreamy or bold feel", () => {
    const base = reward(
      { passed: true, score: 80, stars: 4, colours: ["sage"], tags: ["classic"] },
      "standard",
      "dreamer",
    );
    const colourful = reward(
      { passed: true, score: 80, stars: 4, colours: ["sage", "ruby", "sky"], tags: ["classic"] },
      "standard",
      "dreamer",
    );
    const bold = reward(
      { passed: true, score: 80, stars: 4, colours: ["sage"], tags: ["bold"] },
      "standard",
      "dreamer",
    );
    expect(colourful.coins - base.coins).toBe(Math.round(50 * 0.15));
    expect(bold.coins - base.coins).toBe(Math.round(50 * 0.15));
  });

  it("gives the Trendsetter +10% per crowd match on top of the crowd bonus", () => {
    const hot: StyleTag[] = ["classic", "casual"];
    const plain = reward(
      { passed: true, score: 80, stars: 4, tags: ["classic", "casual"] },
      "standard",
      "dreamer",
      hot,
    );
    const trendy = reward(
      { passed: true, score: 80, stars: 4, tags: ["classic", "casual"] },
      "standard",
      "trendsetter",
      hot,
    );
    expect(trendy.coins - plain.coins).toBe(Math.round(50 * 0.1 * 2));
    expect(trendy.trendMatches).toEqual(hot);
    expect(trendy.buzz).toBe(plain.buzz);
  });

  it("gives the Charmer a 10% tip", () => {
    const plain = reward({ passed: true, score: 80, stars: 4, tags: ["classic"], colours: ["sage"] });
    const charmed = reward(
      { passed: true, score: 80, stars: 4, tags: ["classic"], colours: ["sage"] },
      "standard",
      "charmer",
    );
    expect(charmed.coins - plain.coins).toBe(5);
  });
});
