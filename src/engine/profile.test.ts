import { describe, expect, it } from "vitest";
import type { AvatarLook } from "./avatar";
import { MAX_NAME_LENGTH, profileIssues, type ProfileSettings } from "./profile";

const look: AvatarLook = { skinTone: "honey", hairStyle: "braids", hairColour: "auburn", outfit: "blazer" };
const valid: ProfileSettings = { seed: 7, name: "Ada", look, trait: "dreamer", difficulty: "standard" };

describe("profileIssues", () => {
  it("accepts a finished profile", () => {
    expect(profileIssues(valid)).toEqual([]);
  });

  it("lists every problem in a fixed order", () => {
    const broken = {
      seed: 1.5,
      name: "   ",
      look: { ...look, hairStyle: "mohawk" },
      trait: "grumpy",
      difficulty: "brutal",
    } as unknown as ProfileSettings;
    expect(profileIssues(broken)).toEqual([
      "Choose a name.",
      "The seed must be a whole number.",
      "Finish your avatar.",
      "Choose a trait.",
      "Choose a difficulty.",
    ]);
  });

  it("caps the trimmed name length", () => {
    expect(profileIssues({ ...valid, name: "x".repeat(MAX_NAME_LENGTH) })).toEqual([]);
    expect(profileIssues({ ...valid, name: "x".repeat(MAX_NAME_LENGTH + 1) })).toEqual([
      `Names can be up to ${MAX_NAME_LENGTH} characters.`,
    ]);
  });
});
