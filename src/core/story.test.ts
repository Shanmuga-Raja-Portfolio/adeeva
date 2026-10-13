import { describe, expect, it } from "vitest";
import { STORY_BEATS, STORY_TRIGGERS } from "../content/storyBeat";
import { TRAIT_IDS } from "../content/trait";
import { storyBeatById } from "./catalog";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { currentBeat, queueStoryTrigger } from "./storyQueue";
import { beatLines } from "./storyVoice";
import { newTestGame } from "./testPlaythrough";

describe("story beats", () => {
  it("cover every trigger with short scenes", () => {
    expect(STORY_TRIGGERS.every((trigger) => STORY_BEATS.some((beat) => beat.trigger === trigger))).toBe(
      true,
    );
    expect(STORY_BEATS.every((beat) => beat.lines.length >= 2 && beat.lines.length <= 5)).toBe(true);
  });

  it("voice the player by trait", () => {
    const beat = storyBeatById("thread-one");
    if (beat === undefined) throw new Error("expected the intro beat");
    const playerLines = TRAIT_IDS.map(
      (trait) => beatLines(beat, trait, "Ada").find((line) => line.isPlayer)?.text,
    );
    expect(new Set(playerLines).size).toBe(TRAIT_IDS.length);
    expect(beatLines(beat, "dreamer", "Ada").find((line) => line.isPlayer)?.speaker).toBe("Ada");
  });

  it("queue once, mark seen and never requeue one-off beats", () => {
    const start = newTestGame();
    expect(currentBeat(start)?.id).toBe("thread-one");
    expect(queueStoryTrigger(start, "intro-student")).toBe(start);
    const seen = reduce(start, { type: "markBeatSeen", beatId: "thread-one" });
    expect(seen.story).toEqual({ seen: ["thread-one"], flags: [], queue: [] });
    expect(queueStoryTrigger(seen, "intro-student")).toBe(seen);
    const runway: GameState = { ...seen, story: { ...seen.story, seen: ["after-the-lights"] } };
    expect(queueStoryTrigger(runway, "runway-done").story.queue).toEqual(["after-the-lights"]);
  });

  it("set flags from choices", () => {
    const queued = queueStoryTrigger(newTestGame({ trait: "perfectionist" }), "trait-perfectionist");
    expect(reduce(queued, { type: "markBeatSeen", beatId: "measure-twice" })).toBe(queued);
    expect(reduce(queued, { type: "chooseStoryOption", beatId: "measure-twice", choiceId: "nope" })).toBe(
      queued,
    );
    const chosen = reduce(queued, {
      type: "chooseStoryOption",
      beatId: "measure-twice",
      choiceId: "ask-lesson",
    });
    expect(chosen.story.flags).toEqual(["odile-lesson"]);
    expect(chosen.story.seen).toContain("measure-twice");
    expect(chosen.story.queue).not.toContain("measure-twice");
  });
});
