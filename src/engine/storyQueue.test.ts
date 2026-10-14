import { describe, expect, it } from "vitest";
import type { StoryBeat, StoryState } from "./story";
import { headBeat, queueStateTraitBeat, queueStateTrigger, queueTriggerWithFollowUp } from "./storyQueue";
import type { TraitId } from "./trait";

function beat(id: string, trigger: string): StoryBeat<string, string> {
  return { id, trigger, title: id, repeatable: false, lines: [], choices: [] };
}

const BEATS = [
  beat("hello", "first-week"),
  beat("charm", "trait-charmer"),
  beat("trend", "trait-trendsetter"),
];
const empty: StoryState = { seen: [], flags: [], queue: [] };

function player(trait: TraitId) {
  return { story: empty, profile: { trait } };
}

describe("story queue on a game state", () => {
  it("queues a trigger once and returns the same state when nothing changes", () => {
    const state = player("dreamer");
    const queued = queueStateTrigger(state, BEATS, "first-week");
    expect(queued.story.queue).toEqual(["hello"]);
    expect(queueStateTrigger(queued, BEATS, "first-week")).toBe(queued);
    expect(queueStateTrigger(state, BEATS, "unknown")).toBe(state);
  });

  it("queues a trait beat only for a player with that trait", () => {
    expect(queueStateTraitBeat(player("charmer"), BEATS, "charmer").story.queue).toEqual(["charm"]);
    const dreamer = player("dreamer");
    expect(queueStateTraitBeat(dreamer, BEATS, "charmer")).toBe(dreamer);
  });

  it("follows a trigger with its trait beat", () => {
    const followUps = { "first-week": "trendsetter" } as const;
    expect(
      queueTriggerWithFollowUp(player("trendsetter"), BEATS, "first-week", followUps).story.queue,
    ).toEqual(["hello", "trend"]);
    expect(queueTriggerWithFollowUp(player("charmer"), BEATS, "first-week", followUps).story.queue).toEqual([
      "hello",
    ]);
    expect(queueTriggerWithFollowUp(player("charmer"), BEATS, "constructor", followUps).story).toBe(empty);
  });

  it("reads the beat at the head of the queue", () => {
    const byId = (id: string) => BEATS.find((entry) => entry.id === id);
    expect(headBeat(empty, byId)).toBeNull();
    expect(headBeat({ ...empty, queue: ["charm", "hello"] }, byId)?.id).toBe("charm");
    expect(headBeat({ ...empty, queue: ["gone"] }, byId)).toBeNull();
  });
});
