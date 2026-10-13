import { describe, expect, it } from "vitest";
import type { Brief } from "./brief";
import { snapshotRun, type DressSnapshot } from "./dressSnapshot";
import { evaluate, type Evaluation } from "./evaluate";
import { reduce } from "./reduce";
import { rewards, type RewardContext } from "./rewards";
import { craftToReview, DEFAULT_CRAFT, newTestGame, withActiveGig } from "./testPlaythrough";

interface Judged {
  readonly brief: Brief;
  readonly snapshot: DressSnapshot;
  readonly evaluation: Evaluation;
}

function judgedGig(addRequiredTrims: boolean, lateBy = 0): Judged {
  const base = withActiveGig(newTestGame(), "mom");
  const gig = base.gigs.active[0];
  if (gig === undefined) throw new Error("expected a gig");
  const state = craftToReview(reduce(base, { type: "startRun", gigId: gig.id }), {
    ...DEFAULT_CRAFT,
    addRequiredTrims,
  });
  const run = state.activeRun;
  if (run === null) throw new Error("expected a run");
  const snapshot = snapshotRun(run);
  const evaluation = evaluate(snapshot, run.brief, { deliveredDay: run.brief.deadlineDay + lateBy });
  return { brief: run.brief, snapshot, evaluation };
}

const neutral: RewardContext = { difficulty: "standard", trait: "perfectionist", hotTags: ["regal", "edgy"] };

describe("rewards by difficulty", () => {
  it("pays fee scaled by score on a pass", () => {
    const { brief, snapshot, evaluation } = judgedGig(true);
    const reward = rewards(evaluation, brief, snapshot, neutral);
    expect(reward.outcome).toBe("pass");
    expect(reward.coins).toBe(Math.round(brief.fee * (0.8 + (0.4 * evaluation.score) / 100)));
    expect(reward.reputation).toBe(1 + Math.round((2 * evaluation.score) / 100));
    expect(reward.reputation).toBeGreaterThanOrEqual(1);
    expect(reward.reputation).toBeLessThanOrEqual(3);
    expect(reward.buzz).toBe(1 + evaluation.stars);
  });

  it("treats every dress as a pass on Relaxed", () => {
    const { brief, snapshot, evaluation } = judgedGig(false);
    expect(evaluation.passed).toBe(false);
    const reward = rewards(evaluation, brief, snapshot, { ...neutral, difficulty: "relaxed" });
    expect(reward.outcome).toBe("pass");
    expect(reward.coins).toBeGreaterThan(0);
  });

  it("pays 40% with a small reputation dip on a Standard near miss", () => {
    const { brief, snapshot, evaluation } = judgedGig(false);
    const reward = rewards(evaluation, brief, snapshot, neutral);
    expect(reward).toMatchObject({
      outcome: "soft-fail",
      coins: Math.round(brief.fee * 0.4),
      reputation: -1,
    });
  });

  it("pays nothing and costs reputation on a Challenging fail", () => {
    const { brief, snapshot, evaluation } = judgedGig(false);
    const reward = rewards(evaluation, brief, snapshot, { ...neutral, difficulty: "challenging" });
    expect(reward).toMatchObject({ outcome: "fail", coins: 0, reputation: -3 });
  });

  it("costs half the fee for late work on Challenging only", () => {
    const onTime = judgedGig(true);
    const late = judgedGig(true, 1);
    const challengingOnTime = rewards(onTime.evaluation, onTime.brief, onTime.snapshot, {
      ...neutral,
      difficulty: "challenging",
    });
    const challengingLate = rewards(late.evaluation, late.brief, late.snapshot, {
      ...neutral,
      difficulty: "challenging",
    });
    expect(challengingLate.lines).toContainEqual({
      label: "Late delivery",
      amount: -Math.round(late.brief.fee * 0.5),
    });
    expect(challengingLate.coins).toBeLessThan(challengingOnTime.coins);
    const standardLate = rewards(late.evaluation, late.brief, late.snapshot, neutral);
    expect(standardLate.lines.some((line) => line.label === "Late delivery")).toBe(false);
    expect(standardLate.coins).toBe(Math.round(late.brief.fee * (0.8 + (0.4 * late.evaluation.score) / 100)));
    const relaxedLate = rewards(late.evaluation, late.brief, late.snapshot, {
      ...neutral,
      difficulty: "relaxed",
    });
    expect(relaxedLate.lines.some((line) => line.label === "Late delivery")).toBe(false);
  });
});

describe("rewards by trait", () => {
  it("gives the Dreamer +15% for bold or dreamy dresses only", () => {
    const { brief, snapshot, evaluation } = judgedGig(true);
    const plain = rewards(evaluation, brief, snapshot, { ...neutral, trait: "dreamer" });
    expect(plain.lines.some((line) => line.label === "Dreamer flair")).toBe(false);
    const bold: DressSnapshot = { ...snapshot, tags: [...snapshot.tags, "bold"] };
    const flair = rewards(evaluation, brief, bold, { ...neutral, trait: "dreamer" });
    expect(flair.lines).toContainEqual({ label: "Dreamer flair", amount: Math.round(brief.fee * 0.15) });
    const colourful: DressSnapshot = { ...snapshot, colours: ["ivory", "rose", "teal"] };
    expect(rewards(evaluation, brief, colourful, { ...neutral, trait: "dreamer" }).coins).toBe(flair.coins);
  });

  it("gives the Charmer a 10% tip and no reputation loss on a near miss", () => {
    const pass = judgedGig(true);
    const tipped = rewards(pass.evaluation, pass.brief, pass.snapshot, { ...neutral, trait: "charmer" });
    expect(tipped.lines).toContainEqual({ label: "Charmer tip", amount: Math.round(pass.brief.fee * 0.1) });
    const miss = judgedGig(false);
    expect(
      rewards(miss.evaluation, miss.brief, miss.snapshot, { ...neutral, trait: "charmer" }).reputation,
    ).toBe(0);
  });

  it("adds the trend fee bonus for everyone and +10% fee per match for the Trendsetter", () => {
    const { brief, snapshot, evaluation } = judgedGig(true);
    const hot: RewardContext = { ...neutral, hotTags: ["classic", "regal"] };
    const regular = rewards(evaluation, brief, snapshot, hot);
    expect(regular.trendMatches).toEqual(["classic"]);
    expect(regular.lines).toContainEqual({ label: "Trend bonus", amount: Math.round(brief.fee * 0.1) });
    expect(regular.buzz).toBe(1 + evaluation.stars + 3);
    const trendsetter = rewards(evaluation, brief, snapshot, { ...hot, trait: "trendsetter" });
    expect(trendsetter.buzz).toBe(regular.buzz);
    expect(trendsetter.lines).toContainEqual({
      label: "Trendsetter eye",
      amount: Math.round(brief.fee * 0.1),
    });
    expect(trendsetter.coins).toBe(regular.coins + Math.round(brief.fee * 0.1));
    const twoTrends: DressSnapshot = { ...snapshot, tags: [...snapshot.tags, "regal"] };
    const doubleMatch = rewards(evaluation, brief, twoTrends, { ...hot, trait: "trendsetter" });
    expect(doubleMatch.trendMatches).toEqual(["classic", "regal"]);
    expect(doubleMatch.lines).toContainEqual({
      label: "Trendsetter eye",
      amount: Math.round(brief.fee * 0.2),
    });
    const cold = rewards(evaluation, brief, snapshot, { ...neutral, trait: "trendsetter" });
    expect(cold.lines.some((line) => line.label === "Trendsetter eye")).toBe(false);
  });
});
