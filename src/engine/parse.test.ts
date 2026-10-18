import { describe, expect, it } from "vitest";
import { arrayOf, distinctBy, distinctListOf, integerParser, objectOf, recordOf } from "./parse";

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

describe("record parsers", () => {
  it("keeps a stored key short when it names one in an error", () => {
    const long = "k".repeat(5000);
    const known = recordOf((key) => key === "a", integerParser);
    const any = recordOf(() => true, integerParser);
    const expected = { ok: false, error: `root.${"k".repeat(40)}…: expected a known key` };
    expect(known({ [long]: 1 }, "root")).toEqual(expected);
    expect(any({ [long]: "x" }, "root")).toEqual({
      ok: false,
      error: `root.${"k".repeat(40)}…: expected a whole number`,
    });
    const short = "k".repeat(40);
    expect(any({ [short]: "x" }, "root")).toEqual({
      ok: false,
      error: `root.${short}: expected a whole number`,
    });
  });

  it("keeps every stored key whole when the record is valid", () => {
    const keys = ["a", "k".repeat(41), "q".repeat(20_000)];
    const input = Object.fromEntries(keys.map((key, index) => [key, index]));
    const parsed = recordOf(() => true, integerParser)(input, "root");
    expect(parsed).toEqual({ ok: true, value: input });
    expect(parsed.ok && Object.keys(parsed.value)).toEqual(keys);
  });

  it("keeps a __proto__ key as plain data", () => {
    const parsed = recordOf(() => true, integerParser)(JSON.parse('{"__proto__":{"polluted":1}}'), "root");
    expect(parsed.ok).toBe(false);
    const kept = recordOf(() => true, integerParser)(JSON.parse('{"__proto__":3}'), "root");
    expect(kept.ok && Object.hasOwn(kept.value, "__proto__")).toBe(true);
    expect(Object.getPrototypeOf(kept.ok ? kept.value : null)).toBe(Object.prototype);
    expect("polluted" in {}).toBe(false);
  });
});
