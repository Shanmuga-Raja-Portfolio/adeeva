import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { DECENT_PLAYER, playUntil, WEAKER_PLAYER, type PlayerStyle } from "./scriptedPlayer";
import { newTestGame, settleStories } from "./testPlaythrough";

const SEEDS = [3, 7, 11, 19, 23, 31];

function offered(state: GameState): boolean {
  return state.story.queue.includes("tf-boutique-offer");
}

function offerDay(
  seed: number,
  style: PlayerStyle,
  difficulty: GameState["profile"]["difficulty"],
): number | null {
  const start = settleStories(newTestGame({ seed, difficulty, trait: "dreamer" }));
  const end = playUntil(start, style, offered, 60);
  return offered(end) ? end.calendar.day : null;
}

describe("boutique unlock pacing", () => {
  it("offers the boutique to a decent Standard player on day 22 to 36", () => {
    const days = SEEDS.map((seed) => offerDay(seed, DECENT_PLAYER, "standard"));
    for (const day of days) {
      expect(day).not.toBeNull();
      expect(day ?? 0).toBeGreaterThanOrEqual(22);
      expect(day ?? 99).toBeLessThanOrEqual(36);
    }
    expect(days.filter((day) => day === 22).length).toBeGreaterThanOrEqual(SEEDS.length / 2);
    expect(days.every((day) => ((day ?? 0) - 1) % 7 === 0)).toBe(true);
  }, 120_000);

  it("offers it to a weaker Standard player by day 50", () => {
    for (const seed of SEEDS.slice(0, 3)) {
      const day = offerDay(seed, WEAKER_PLAYER, "standard");
      expect(day).not.toBeNull();
      expect(day ?? 99).toBeLessThanOrEqual(50);
      expect(day ?? 0).toBeGreaterThan(22);
    }
  }, 120_000);

  it("offers it on Relaxed by day 22", () => {
    for (const seed of SEEDS.slice(0, 3)) expect(offerDay(seed, DECENT_PLAYER, "relaxed")).toBe(22);
  }, 120_000);
});
