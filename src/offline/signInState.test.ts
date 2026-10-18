import { describe, expect, it } from "vitest";
import { readSignIn } from "./signInState";

describe("readSignIn", () => {
  it("treats a redirect the browser hid as signed out", () => {
    expect(readSignIn({ type: "opaqueredirect", status: 0 })).toBe("signed-out");
  });

  it("treats redirects, 401 and 403 as signed out", () => {
    for (const status of [301, 302, 303, 307, 308, 401, 403])
      expect(readSignIn({ type: "basic", status })).toBe("signed-out");
  });

  it("treats a plain 200 as signed in", () => {
    expect(readSignIn({ type: "basic", status: 200 })).toBe("signed-in");
  });

  it("stays unsure about anything else", () => {
    for (const status of [0, 404, 500, 503]) expect(readSignIn({ type: "basic", status })).toBe("unknown");
  });
});
