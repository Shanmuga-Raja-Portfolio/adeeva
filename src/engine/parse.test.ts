import { describe, expect, it } from "vitest";
import { arrayOf, distinctBy, distinctListOf, integerParser, objectOf } from "./parse";

describe("distinct list parsers", () => {
  it("accepts each option at most once and rejects repeats", () => {
    const parser = distinctListOf(["a", "b", "c"], "letter");
    expect(parser(["a", "c"], "root")).toEqual({ ok: true, value: ["a", "c"] });
    expect(parser(["a", "a"], "root")).toEqual({
      ok: false,
      error: "root: expected each letter at most once",
    });
  });

  it("checks distinctness by a key", () => {
    const parser = distinctBy(
      arrayOf(objectOf<{ id: number }>({ id: integerParser })),
      (row) => row.id,
      "one per id",
    );
    expect(parser([{ id: 1 }, { id: 2 }], "rows").ok).toBe(true);
    expect(parser([{ id: 1 }, { id: 1 }], "rows")).toEqual({ ok: false, error: "rows: expected one per id" });
  });
});
