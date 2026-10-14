import { describe, expect, it } from "vitest";
import { seeBeatWithBuzz } from "./beatBuzz";
import { MAX_BUZZ } from "./standing";
import type { StoryState } from "./story";

const BUZZ: Readonly<Record<string, number>> = { cheer: 2 };
const known = (id: string) => (id === "cheer" || id === "plain" ? id : undefined);

function state(queue: readonly string[], seen: readonly string[], buzz = 10) {
  const story: StoryState = { queue, seen, flags: [] };
  return { coins: 5, reputation: 1, buzz, story };
}

describe("seeBeatWithBuzz", () => {
  it("adds a beat's buzz the first time it is seen and caps it", () => {
    const after = seeBeatWithBuzz(state(["cheer"], []), "cheer", known, BUZZ);
    expect(after.buzz).toBe(12);
    expect(after.story.seen).toEqual(["cheer"]);
    expect(seeBeatWithBuzz(state(["cheer"], [], MAX_BUZZ - 1), "cheer", known, BUZZ).buzz).toBe(MAX_BUZZ);
  });

  it("gives nothing for a beat without buzz, a repeat viewing or a beat that is not queued", () => {
    expect(seeBeatWithBuzz(state(["plain"], []), "plain", known, BUZZ).buzz).toBe(10);
    expect(seeBeatWithBuzz(state(["cheer"], ["cheer"]), "cheer", known, BUZZ).buzz).toBe(10);
    const idle = state([], []);
    expect(seeBeatWithBuzz(idle, "cheer", known, BUZZ)).toBe(idle);
  });
});
