import { afterEach, describe, expect, it, vi } from "vitest";
import { parseJson, readStoredJson, readStoredText } from "./storedJson";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("stored JSON", () => {
  it("reads text and JSON, and treats a missing key as nothing", () => {
    const items = new Map([
      ["kept", '{"buns":3}'],
      ["torn", "{buns"],
    ]);
    vi.stubGlobal("window", { localStorage: { getItem: (key: string) => items.get(key) ?? null } });
    expect(readStoredText("kept")).toBe('{"buns":3}');
    expect(readStoredJson("kept")).toEqual({ buns: 3 });
    expect(readStoredText("torn")).toBe("{buns");
    expect(readStoredJson("torn")).toBeNull();
    expect(readStoredText("missing")).toBeNull();
    expect(readStoredJson("missing")).toBeNull();
  });

  it("returns nothing when the browser blocks storage", () => {
    vi.stubGlobal("window", {
      get localStorage(): Storage {
        throw new Error("blocked");
      },
    });
    expect(readStoredText("kept")).toBeNull();
    expect(readStoredJson("kept")).toBeNull();
  });

  it("parses JSON text and gives nothing back for damaged text", () => {
    expect(parseJson("[1,2]")).toEqual([1, 2]);
    expect(parseJson("not json")).toBeNull();
  });
});
