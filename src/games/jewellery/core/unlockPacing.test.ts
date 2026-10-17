import { describe, expect, it } from "vitest";
import { botDay, DECENT_SKILL, type BotSkill } from "./benchBot";
import type { GameState } from "./gameState";
import type { NewGameSettings } from "./newGame";
import { newTestGame, settleStories } from "./testPlaythrough";

interface Run {
  readonly offerDay: number | null;
  readonly passRate: number;
  readonly qualities: readonly number[];
}

function simulate(settings: Partial<NewGameSettings>, skill: BotSkill, days = 40): Run {
  let state: GameState = settleStories(newTestGame(settings));
  let offerDay: number | null = null;
  for (let day = 0; day < days && offerDay === null; day += 1) {
    state = botDay(state, skill);
    if ([...state.story.queue, ...state.story.seen].includes("jb-loft-offer")) offerDay = state.calendar.day;
  }
  const passed = state.log.filter((entry) => entry.evaluation.passed).length;
  return {
    offerDay,
    passRate: state.log.length === 0 ? 0 : passed / state.log.length,
    qualities: state.log.map((entry) => entry.evaluation.quality.quality),
  };
}

describe("unlock pacing", () => {
  it("brings a decent Standard bench player the loft offer between day 15 and 28 on five seeds", () => {
    const runs = [3, 11, 21, 37, 58].map((seed) => simulate({ seed }, DECENT_SKILL));
    for (const run of runs) {
      expect(run.offerDay).not.toBeNull();
      expect(run.offerDay ?? 0).toBeGreaterThanOrEqual(15);
      expect(run.offerDay ?? 99).toBeLessThanOrEqual(28);
    }
    const rate = runs.reduce((sum, run) => sum + run.passRate, 0) / runs.length;
    expect(rate).toBeGreaterThanOrEqual(0.75);
    expect(rate).toBeLessThanOrEqual(0.9);
    const qualities = runs.flatMap((run) => run.qualities);
    const mean = qualities.reduce((sum, quality) => sum + quality, 0) / qualities.length;
    const spread = Math.sqrt(
      qualities.reduce((sum, quality) => sum + (quality - mean) ** 2, 0) / qualities.length,
    );
    expect(mean).toBeGreaterThan(85);
    expect(mean).toBeLessThan(91);
    expect(spread).toBeGreaterThan(3);
  });

  it("is quicker on Relaxed and slower on Challenging, and replays identically", () => {
    const standard = simulate({ seed: 21 }, DECENT_SKILL);
    const relaxed = simulate({ seed: 21, difficulty: "relaxed" }, DECENT_SKILL);
    const challenging = simulate({ seed: 21, difficulty: "challenging" }, DECENT_SKILL, 50);
    expect(relaxed.offerDay ?? 99).toBeLessThanOrEqual(standard.offerDay ?? 0);
    expect(challenging.offerDay ?? 99).toBeGreaterThanOrEqual(standard.offerDay ?? 0);
    expect(simulate({ seed: 21 }, DECENT_SKILL)).toEqual(standard);
  });
});
