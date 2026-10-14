import { describe, expect, it } from "vitest";
import type { DifficultyId } from "../../../engine/difficulty";
import type { GameState } from "./gameState";
import { entriesFor, type DishLogEntry } from "./log";
import { cookDish, must, newTestGame, settleStories, type CookPlan, GOOD_COOK } from "./testPlaythrough";

function lessonWith(
  difficulty: DifficultyId,
  plan: CookPlan,
  trait: GameState["profile"]["trait"] = "dreamer",
) {
  const start = settleStories(newTestGame({ difficulty, trait }));
  const done = cookDish(settleStories(must(start, { type: "startLesson" })), plan);
  const entry = entriesFor(done.log, done.activeRun?.id ?? "").find(
    (item): item is DishLogEntry => item.kind === "dish",
  );
  if (entry === undefined || entry.reward === null || entry.evaluation === null)
    throw new Error("no lesson result");
  return { start, done, entry, reward: entry.reward };
}

const SLOPPY: CookPlan = { chopOffset: 400, sizzleHeat: 5, followShare: 0.2, wipe: false, assisted: false };

describe("rewards per difficulty", () => {
  it("pays the fee, reputation and buzz on a pass", () => {
    const { start, done, reward } = lessonWith("standard", GOOD_COOK);
    const fee = start.board.lesson?.fee ?? 0;
    expect(reward.outcome).toBe("pass");
    expect(reward.lines[0]).toEqual({ label: "Fee", amount: Math.round(fee * (0.8 + 0.4 * 1)) });
    expect(reward.reputation).toBe(3);
    expect(done.coins).toBe(start.coins + reward.coins);
  });

  it("softly fails on Standard: part of the fee and one reputation down", () => {
    const { reward, entry } = lessonWith("standard", SLOPPY);
    expect(entry.evaluation?.passed).toBe(false);
    expect(reward.outcome).toBe("soft-fail");
    expect(reward.reputation).toBe(-1);
    expect(reward.lines[0]?.label).toBe("Part of the fee");
    expect(entry.evaluation?.feedback.length).toBeGreaterThan(0);
  });

  it("always passes on Relaxed, with stars that still show how it went", () => {
    const { reward, entry, done } = lessonWith("relaxed", SLOPPY);
    expect(reward.outcome).toBe("pass");
    expect(entry.evaluation?.stars).toBeLessThan(4);
    expect(done.mentorsMet).toEqual(["indian"]);
  });

  it("pays nothing on a Challenging miss and costs three reputation", () => {
    const { reward, done } = lessonWith("challenging", SLOPPY);
    expect(reward.outcome).toBe("fail");
    expect(reward.coins).toBe(0);
    expect(reward.reputation).toBe(-3);
    expect(done.mentorsMet).toEqual([]);
    expect(done.board.lesson).toBeNull();
  });

  it("raises the lesson minimum by six on Challenging", () => {
    const start = settleStories(newTestGame({ difficulty: "challenging" }));
    expect(must(start, { type: "startLesson" }).activeRun?.brief.minQuality).toBe(61);
  });
});
