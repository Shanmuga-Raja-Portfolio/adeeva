import { describe, expect, it } from "vitest";
import { nextRandom } from "./rng";

describe("nextRandom", () => {
  it("is deterministic and in [0,1)", () => {
    const [a, s1] = nextRandom(42);
    const [b] = nextRandom(42);
    expect(a).toBe(b);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(1);
    expect(nextRandom(s1)[0]).not.toBe(a);
  });
});
