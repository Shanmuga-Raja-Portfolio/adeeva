import { describe, expect, it } from "vitest";
import {
  completeBeat,
  headBeatId,
  markBeatSeen,
  queueTrigger,
  type StoryBeat,
  type StoryState,
} from "./story";
import { beatLines } from "./storyVoice";

const firstDay: StoryBeat<"open" | "sale", "party"> = {
  id: "first-day",
  trigger: "open",
  title: "First Day",
  repeatable: false,
  lines: [
    { kind: "spoken", speaker: "Gran", text: "The shop is yours today." },
    { kind: "player", text: "I will look after it.", byTrait: { charmer: "Leave it with me, Gran!" } },
  ],
  choices: [],
};
const beats: readonly StoryBeat<"open" | "sale", "party">[] = [
  firstDay,
  { id: "big-sale", trigger: "sale", title: "Big Sale", repeatable: true, lines: [], choices: [] },
];
const fresh: StoryState = { seen: [], flags: [], queue: [] };

describe("story queue", () => {
  it("queues a beat for its trigger and reads the head", () => {
    const queued = queueTrigger(fresh, beats, "open");
    expect(queued.queue).toEqual(["first-day"]);
    expect(headBeatId(queued)).toBe("first-day");
    expect(headBeatId(fresh)).toBeNull();
  });

  it("returns the same story when the beat is queued, seen or unknown", () => {
    const queued = queueTrigger(fresh, beats, "open");
    expect(queueTrigger(queued, beats, "open")).toBe(queued);
    const seen = completeBeat(queued, "first-day", null);
    expect(queueTrigger(seen, beats, "open")).toBe(seen);
    expect(queueTrigger(fresh, [], "open")).toBe(fresh);
  });

  it("lets a repeatable beat come back after it is seen", () => {
    const done = completeBeat(queueTrigger(fresh, beats, "sale"), "big-sale", "sold");
    expect(done).toEqual({ seen: ["big-sale"], flags: ["sold"], queue: [] });
    expect(queueTrigger(done, beats, "sale").queue).toEqual(["big-sale"]);
    expect(completeBeat(done, "big-sale", "sold").flags).toEqual(["sold"]);
  });
});

describe("beatLines", () => {
  it("voices player lines by trait and falls back to the plain text", () => {
    const beat = firstDay;
    expect(beatLines(beat, "charmer", "Ada")).toEqual([
      { speaker: "Gran", text: "The shop is yours today.", isPlayer: false },
      { speaker: "Ada", text: "Leave it with me, Gran!", isPlayer: true },
    ]);
    expect(beatLines(beat, "dreamer", "Ada")[1]?.text).toBe("I will look after it.");
  });
});

describe("markBeatSeen", () => {
  const known = (id: string) => beats.find((beat) => beat.id === id);

  it("completes a queued, known beat", () => {
    const state = { story: { ...fresh, queue: ["first-day"] } };
    expect(markBeatSeen(state, "first-day", known).story).toEqual({
      seen: ["first-day"],
      flags: [],
      queue: [],
    });
  });

  it("returns the same state for a beat that is not queued or not known", () => {
    const state = { story: { ...fresh, queue: ["ghost"] } };
    expect(markBeatSeen(state, "first-day", known)).toBe(state);
    expect(markBeatSeen(state, "ghost", known)).toBe(state);
  });
});
