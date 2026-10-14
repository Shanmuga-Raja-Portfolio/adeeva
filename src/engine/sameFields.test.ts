import { describe, expect, it } from "vitest";
import { sameFields } from "./sameFields";

describe("sameFields", () => {
  it("matches records with the same keys and values only", () => {
    expect(sameFields({ accuracy: 0.5, assisted: false }, { accuracy: 0.5, assisted: false })).toBe(true);
    expect(sameFields({ accuracy: 0.5, assisted: false }, { accuracy: 0.6, assisted: false })).toBe(false);
    expect(sameFields<{ readonly a: number; readonly b?: number }>({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    expect(sameFields(undefined, { accuracy: 0.5 })).toBe(false);
  });
});
