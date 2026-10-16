import type { DifficultyId } from "../../../engine/difficulty";
import { describe, expect, it } from "vitest";
import { botStart, runBot, runBotFrom, STRUGGLING, type BotRun } from "./decentBot";
import { atLeast } from "./keyWall";
import { newShowHomeGame } from "./larkspurPlaythrough";
import { reduce } from "./reduce";

const SEEDS = [1, 2, 3, 4, 5] as const;

interface Makeovers {
  readonly rate: number;
  readonly qualityMisses: number;
}

function makeovers(difficulty: DifficultyId): Makeovers {
  const runs = SEEDS.map((seed) => runBot(seed, 26, difficulty));
  const passed = runs.reduce((sum, run) => sum + run.passed, 0);
  const revealed = runs.reduce((sum, run) => sum + run.revealed, 0);
  const qualityMisses = runs
    .flatMap((run) => run.state.log)
    .filter((entry) =>
      entry.evaluation.criteria.some((criterion) => criterion.id === "quality" && !criterion.passed),
    ).length;
  return { rate: passed / revealed, qualityMisses };
}

interface Fortnight {
  readonly loft: number;
  readonly home: number;
  readonly keys: boolean;
  readonly run: BotRun;
}

function fortnight(seed: number, difficulty: DifficultyId): Fortnight {
  const offer = runBot(seed, 26, difficulty).offerDay ?? 20;
  const atOffer = runBot(seed, offer + 1, difficulty);
  const day = atOffer.state.calendar.day;
  const loft = runBotFrom(atOffer, day + 14);
  const keys = { ...atOffer, state: reduce(atOffer.state, { type: "openLarkspur" }) };
  const home = runBotFrom(keys, day + 14);
  return {
    loft: loft.state.coins - atOffer.state.coins,
    home: home.state.coins - atOffer.state.coins,
    keys: keys.state.career === "development",
    run: home,
  };
}

describe("the depth economy, simulated", { timeout: 120_000 }, () => {
  it("brings the decent Room Designer the offer on days 15 to 24 and passes 75 to 90% of makeovers", () => {
    let passed = 0;
    let revealed = 0;
    for (const seed of SEEDS) {
      const run = runBot(seed, 26);
      expect(run.offerDay, `seed ${seed}`).not.toBeNull();
      expect(run.offerDay ?? 0, `seed ${seed}`).toBeGreaterThanOrEqual(15);
      expect(run.offerDay ?? 99, `seed ${seed}`).toBeLessThanOrEqual(24);
      passed += run.passed;
      revealed += run.revealed;
    }
    expect(passed / revealed).toBeGreaterThanOrEqual(0.75);
    expect(passed / revealed).toBeLessThanOrEqual(0.9);
  });

  it("earns at least 0.95 of a loft fortnight on plot 1 and reaches Silver", () => {
    for (const seed of SEEDS) {
      const offer = runBot(seed, 26).offerDay ?? 20;
      const atOffer = runBot(seed, offer + 1);
      const day = atOffer.state.calendar.day;
      const loft = runBotFrom(atOffer, day + 14);
      const keys = { ...atOffer, state: reduce(atOffer.state, { type: "openLarkspur" }) };
      expect(keys.state.career).toBe("development");
      const home = runBotFrom(keys, day + 14);
      const loftGain = loft.state.coins - atOffer.state.coins;
      const homeGain = home.state.coins - atOffer.state.coins;
      expect(homeGain, `seed ${seed}`).toBeGreaterThanOrEqual(0.95 * loftGain);
      const record = home.state.larkspur?.history[0];
      expect(record?.plotId).toBe("garden-flat");
      expect(atLeast(record?.keyId ?? null, "silver"), `seed ${seed}`).toBe(true);
    }
  });

  it("fails some makeovers on quality, more often on Challenging and never more on Relaxed", () => {
    const standard = makeovers("standard");
    const challenging = makeovers("challenging");
    const relaxed = makeovers("relaxed");
    expect(standard.qualityMisses).toBeGreaterThan(0);
    expect(challenging.qualityMisses).toBeGreaterThan(standard.qualityMisses);
    expect(standard.rate).toBeGreaterThanOrEqual(0.75);
    expect(standard.rate).toBeLessThanOrEqual(0.9);
    expect(challenging.rate).toBeGreaterThanOrEqual(0.75);
    expect(challenging.rate).toBeLessThanOrEqual(0.85);
    expect(challenging.rate).toBeLessThan(standard.rate);
    expect(relaxed.rate).toBeGreaterThanOrEqual(standard.rate);
  });

  it("earns at least 0.95 of a loft fortnight on plot 1 on Challenging too", () => {
    const runs = SEEDS.map((seed) => fortnight(seed, "challenging")).filter((run) => run.keys);
    expect(runs.length).toBeGreaterThanOrEqual(4);
    const loft = runs.reduce((sum, run) => sum + run.loft, 0);
    const home = runs.reduce((sum, run) => sum + run.home, 0);
    expect(home).toBeGreaterThanOrEqual(0.95 * loft);
    for (const run of runs)
      expect(atLeast(run.run.state.larkspur?.history[0]?.keyId ?? null, "silver")).toBe(true);
  });

  it("keeps a struggling Standard fortnight at or above zero", () => {
    for (const seed of SEEDS) {
      const start = newShowHomeGame({ seed });
      const run = runBotFrom(botStart(start, seed), start.calendar.day + 14, STRUGGLING);
      expect(run.lowestCoins).toBeGreaterThanOrEqual(0);
      expect(run.state.coins).toBeGreaterThanOrEqual(start.coins);
      expect(run.state.larkspur?.history.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("never takes Relaxed coins below zero, never soft-locks and replays identically", () => {
    for (const seed of SEEDS) {
      const play = () => runBotFrom(botStart(newShowHomeGame({ seed, difficulty: "relaxed" }), seed), 29);
      const run = play();
      expect(run.lowestCoins).toBeGreaterThanOrEqual(0);
      expect(run.state.larkspur?.history.length).toBeGreaterThanOrEqual(2);
      expect(play().state).toEqual(run.state);
    }
  });
});
