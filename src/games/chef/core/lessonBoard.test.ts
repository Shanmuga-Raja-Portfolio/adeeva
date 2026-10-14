import { describe, expect, it } from "vitest";
import { CUISINE_IDS } from "../content/cuisine";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { GRADUATION_REPUTATION, testGoals } from "./rung";
import { cookDish, must, newTestGame, settleStories } from "./testPlaythrough";

function student(overrides: Partial<GameState> = {}): GameState {
  return { ...settleStories(newTestGame()), ...overrides };
}

function nextDay(state: GameState): GameState {
  return settleStories(reduce(state, { type: "endDay" }));
}

function lessonsWith(state: GameState, dishId: string): number {
  return state.log.filter(
    (entry) => entry.kind === "dish" && entry.purpose === "lesson" && entry.dishId === dishId,
  ).length;
}

describe("the lesson board", () => {
  it("keeps offering a repeat lesson to a student who met every mentor but is short of reputation", () => {
    const short = nextDay(student({ mentorsMet: [...CUISINE_IDS], reputation: GRADUATION_REPUTATION - 1 }));
    expect(testGoals(short, "graduation")).toEqual([`Reach reputation ${GRADUATION_REPUTATION}.`]);
    const lesson = short.board.lesson;
    if (lesson === null) throw new Error("no repeat lesson");
    const taught = settleStories(cookDish(settleStories(must(short, { type: "startLesson" }))));
    expect(taught.reputation).toBeGreaterThanOrEqual(GRADUATION_REPUTATION);
    expect(testGoals(taught, "graduation")).toEqual([]);
    const ready = nextDay(student({ mentorsMet: [...CUISINE_IDS], reputation: GRADUATION_REPUTATION }));
    expect(ready.board.lesson).toBeNull();
  });

  it("never offers the mentor whose lesson is still on the counter, so a lesson pays once", () => {
    const first = student();
    expect(first.board.lesson?.cuisine).toBe("indian");
    const started = must(settleStories(must(first, { type: "startLesson" })), {
      type: "goToStage",
      stage: "mise",
    });
    const tomorrow = nextDay(started);
    expect(tomorrow.activeRun?.dishId).toBe("dal-tadka");
    expect(tomorrow.board.lesson).not.toBeNull();
    expect(tomorrow.board.lesson?.cuisine).not.toBe("indian");
    const finished = settleStories(cookDish(tomorrow));
    expect(finished.mentorsMet).toEqual(["indian"]);
    expect(finished.board.lesson?.cuisine).not.toBe("indian");
    const again = settleStories(cookDish(settleStories(must(finished, { type: "startLesson" }))));
    expect(lessonsWith(again, "dal-tadka")).toBe(1);
    expect(again.mentorsMet).toHaveLength(2);
  });
});
