import { describe, expect, it } from "vitest";
import type { TraitId } from "../../../engine/trait";
import { TRAITS } from "../content/trait";
import type { GameState } from "./gameState";
import { evaluatePiece } from "./pieceEvaluate";
import { pieceReward } from "./rewards";
import {
  BIRDHOUSE_PLAN,
  lastGigId,
  newTestGame,
  playToReview,
  runOf,
  settleStories,
  withActiveGig,
  type PiecePlan,
} from "./testPlaythrough";
import { jointTolerance, sandAngleLimit, sawTolerance } from "./tolerance";

function rewardFor(
  trait: TraitId,
  plan: PiecePlan = BIRDHOUSE_PLAN,
  passed = true,
  hot?: GameState["trends"],
) {
  const base = settleStories(newTestGame({ trait }));
  const state = withActiveGig({ ...base, coins: 500, trends: hot ?? base.trends }, "grandpa-teodor");
  const review = playToReview(state, lastGigId(state), plan);
  const run = runOf(review);
  const evaluation = { ...evaluatePiece(review, run, review.calendar.day), passed };
  return { run, reward: pieceReward(review, run, evaluation) };
}

const COLOURFUL: PiecePlan = {
  ...BIRDHOUSE_PLAN,
  finishId: "two-tone",
  paint: "sky",
  extras: ["brass-knob"],
};
const NATURAL_WEEK: GameState["trends"] = { current: ["natural", "rustic"], next: ["playful", "modern"] };
const QUIET_WEEK: GameState["trends"] = { current: ["elegant", "playful"], next: ["modern", "cosy"] };

describe("trait perks", () => {
  it("tells each perk in workshop words", () => {
    expect(TRAITS.map((trait) => trait.id)).toEqual(["dreamer", "perfectionist", "trendsetter", "charmer"]);
    expect(TRAITS.find((trait) => trait.id === "perfectionist")?.perk).toContain("20% more forgiving");
  });

  it("makes sawing, joining and sanding 20% more forgiving for perfectionists", () => {
    const plain = newTestGame({ trait: "dreamer" });
    const careful = newTestGame({ trait: "perfectionist" });
    expect(sawTolerance(careful, "pine") / sawTolerance(plain, "pine")).toBeCloseTo(1.2);
    expect(
      jointTolerance(careful, "oak", "comb").offsetMm / jointTolerance(plain, "oak", "comb").offsetMm,
    ).toBeCloseTo(1.2);
    expect(sandAngleLimit(careful) / sandAngleLimit(plain)).toBeCloseTo(1.2);
  });

  it("gives dreamers 15% for a piece with 3 or more colours", () => {
    const { run, reward } = rewardFor("dreamer", COLOURFUL, true, QUIET_WEEK);
    expect(reward.lines).toContainEqual({ label: "Big ideas", amount: Math.round(run.brief.fee * 0.15) });
    expect(
      rewardFor("dreamer", BIRDHOUSE_PLAN, true, QUIET_WEEK).reward.lines.map((line) => line.label),
    ).not.toContain("Big ideas");
    expect(
      rewardFor("charmer", COLOURFUL, true, QUIET_WEEK).reward.lines.map((line) => line.label),
    ).not.toContain("Big ideas");
  });

  it("gives trendsetters 10% per trend match on top of the trend bonus", () => {
    const { run, reward } = rewardFor("trendsetter", BIRDHOUSE_PLAN, true, NATURAL_WEEK);
    expect(reward.trendMatches).toEqual(["natural", "rustic"]);
    expect(reward.lines).toContainEqual({
      label: "Trendsetter eye",
      amount: Math.round(run.brief.fee * 0.2),
    });
    expect(reward.lines).toContainEqual({
      label: "Neighbourhood favourite",
      amount: Math.round(run.brief.fee * 0.1),
    });
    expect(
      rewardFor("dreamer", BIRDHOUSE_PLAN, true, NATURAL_WEEK).reward.lines.map((line) => line.label),
    ).not.toContain("Trendsetter eye");
  });

  it("gives charmers a tip and spares them reputation on a near miss", () => {
    const { run, reward } = rewardFor("charmer", BIRDHOUSE_PLAN, true, QUIET_WEEK);
    expect(reward.lines).toContainEqual({ label: "Charmer tip", amount: Math.round(run.brief.fee * 0.1) });
    expect(rewardFor("charmer", BIRDHOUSE_PLAN, false, QUIET_WEEK).reward.reputation).toBe(0);
    expect(rewardFor("dreamer", BIRDHOUSE_PLAN, false, QUIET_WEEK).reward.reputation).toBe(-1);
  });
});
