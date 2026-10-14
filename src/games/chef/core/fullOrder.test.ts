import { describe, expect, it } from "vitest";
import { entriesFor } from "./log";
import { reduce } from "./reduce";
import { cookDish, must, newTestGame, settleStories } from "./testPlaythrough";

describe("a full scripted lesson", () => {
  it("goes from a new game to Chef Arjun's lesson plated, belled and paid", () => {
    const start = settleStories(newTestGame({ trait: "charmer" }));
    expect(start.board.lesson?.cuisine).toBe("indian");
    expect(start.coins).toBe(60);
    const begun = must(start, { type: "startLesson" });
    expect(begun.calendar.hoursLeft).toBe(6);
    expect(begun.activeRun?.dishId).toBe("dal-tadka");
    expect(begun.story.queue).toEqual(["ch-first-lesson"]);
    const done = cookDish(settleStories(begun));
    const run = done.activeRun;
    expect(run?.stage).toBe("done");
    const [entry] = entriesFor(done.log, run?.id ?? "");
    if (entry?.kind !== "dish" || entry.evaluation === null || entry.reward === null)
      throw new Error("no lesson log");
    expect(entry.evaluation.passed).toBe(true);
    expect(entry.quality).toBeGreaterThanOrEqual(95);
    expect(entry.reward.outcome).toBe("pass");
    expect(entry.reward.lines.map((line) => line.label)).toContain("Charmer tip");
    expect(done.coins).toBeGreaterThan(start.coins);
    expect(done.reputation).toBe(3);
    expect(done.mentorsMet).toEqual(["indian"]);
    expect(done.mastery.indian).toBe(2);
    expect(done.diary).toHaveLength(1);
    expect(done.platingCards[0]?.dishId).toBe("dal-tadka");
    expect(done.tasteMemory[0]?.dishId).toBe("dal-tadka");
    expect(reduce(done, { type: "ringBell" })).toBe(done);
  });
});
