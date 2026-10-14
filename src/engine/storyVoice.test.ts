import { describe, expect, it } from "vitest";
import { playerVoiceSample } from "./storyVoice";

describe("playerVoiceSample", () => {
  const beat = {
    lines: [
      { kind: "spoken" as const, speaker: "Gran", text: "Welcome." },
      { kind: "player" as const, text: "Thanks!", byTrait: { charmer: "Lovely to be here!" } },
    ],
  };

  it("picks the first player line in the voice of the trait", () => {
    expect(playerVoiceSample(beat, "charmer", "Mo")).toBe("Lovely to be here!");
    expect(playerVoiceSample(beat, "dreamer", "Mo")).toBe("Thanks!");
  });

  it("is empty without a beat or a player line", () => {
    expect(playerVoiceSample(undefined, "dreamer", "Mo")).toBe("");
    expect(playerVoiceSample({ lines: [] }, "dreamer", "Mo")).toBe("");
  });
});
