import { describe, expect, it } from "vitest";
import type { DifficultyId } from "../../../engine/difficulty";
import type { TraitId } from "../../../engine/trait";
import type { WoodId } from "../content/wood";
import type { GameState } from "./gameState";
import { evaluatePiece, type Evaluation } from "./pieceEvaluate";
import { pieceReward } from "./rewards";
import {
  BIRDHOUSE_PLAN,
  lastGigId,
  newTestGame,
  playToReview,
  runOf,
  settleStories,
  withActiveGig,
} from "./testPlaythrough";

function review(difficulty: DifficultyId, trait: TraitId = "dreamer", woodId: WoodId = "pine"): GameState {
  const base = settleStories(newTestGame({ difficulty, trait }));
  const state = withActiveGig({ ...base, reputation: 20, coins: 500 }, "grandpa-teodor");
  return playToReview(state, lastGigId(state), { ...BIRDHOUSE_PLAN, woodId });
}

function judge(state: GameState, change: Partial<Evaluation> = {}) {
  const run = runOf(state);
  const evaluation = { ...evaluatePiece(state, run, state.calendar.day), ...change };
  return { run, evaluation, reward: pieceReward(state, run, evaluation) };
}

describe("rewards on each difficulty", () => {
  it("pays a pass by score, with reputation and buzz", () => {
    const state = review("standard");
    const { run, evaluation, reward } = judge(state);
    expect(evaluation.passed).toBe(true);
    expect(reward.outcome).toBe("pass");
    const fee = run.brief.fee;
    expect(reward.lines[0]).toEqual({
      label: "Fee",
      amount: Math.round(fee * (0.8 + (0.4 * evaluation.score) / 100)),
    });
    expect(reward.reputation).toBe(1 + Math.round((2 * evaluation.score) / 100));
    expect(reward.buzz).toBeGreaterThanOrEqual(1 + evaluation.stars);
  });

  it("gives a Standard near miss part of the fee and a small reputation dip", () => {
    const state = review("standard");
    const { run, reward } = judge(state, { passed: false });
    expect(reward).toMatchObject({
      outcome: "soft-fail",
      coins: Math.round(run.brief.fee * 0.4),
      reputation: -1,
    });
  });

  it("counts every Relaxed run as a pass", () => {
    const { reward } = judge(review("relaxed"), { passed: false });
    expect(reward.outcome).toBe("pass");
    expect(reward.coins).toBeGreaterThan(0);
  });

  it("pays nothing for a Challenging miss and halves late work", () => {
    const state = review("challenging");
    expect(judge(state, { passed: false }).reward).toMatchObject({
      outcome: "fail",
      coins: 0,
      reputation: -3,
    });
    const late = { ...state, calendar: { ...state.calendar, day: runOf(state).brief.deadlineDay + 1 } };
    const { run, reward } = judge(late, { passed: true });
    expect(reward.lines).toContainEqual({ label: "Late delivery", amount: -Math.round(run.brief.fee * 0.5) });
  });

  it("adds a fine-wood bonus for tougher woods and reputation for the toughest", () => {
    const pine = judge(review("standard", "dreamer", "pine")).reward;
    expect(pine.lines.some((line) => line.label === "Fine wood bonus")).toBe(false);
    const birch = judge(review("standard", "dreamer", "birch"));
    expect(birch.reward.lines).toContainEqual({
      label: "Fine wood bonus",
      amount: Math.round(birch.run.brief.fee * 0.15),
    });
    const oak = judge(review("standard", "dreamer", "oak"));
    expect(oak.reward.lines).toContainEqual({
      label: "Fine wood bonus",
      amount: Math.round(oak.run.brief.fee * 0.3),
    });
    expect(oak.reward.reputation).toBe(2 + Math.round((2 * oak.evaluation.score) / 100));
    const oakMiss = judge(review("standard", "dreamer", "oak"), { passed: false }).reward;
    expect(oakMiss.lines.some((line) => line.label === "Fine wood bonus")).toBe(false);
    expect(oakMiss.reputation).toBe(-1);
  });
});
