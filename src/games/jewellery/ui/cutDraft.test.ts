import { afterEach, describe, expect, it, vi } from "vitest";
import { hostileTexts } from "../../../engine/hostileJson";
import { prototypeChanged, prototypeShape } from "../../../engine/saveFuzz";
import { readCutDraft, writeCutDraft } from "./cutDraft";

const DRAFT_KEY = "jewellery-cut-drafts";

function install(): Map<string, string> {
  const items = new Map<string, string>();
  vi.stubGlobal("window", {
    sessionStorage: {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => items.set(key, value),
    },
  });
  return items;
}

function isFinitePoint(point: unknown): boolean {
  return (
    Array.isArray(point) &&
    point.length === 2 &&
    point.every((value) => typeof value === "number" && Number.isFinite(value))
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("cut drafts", () => {
  it("keep a piece's strokes per cut and forget them for another piece", () => {
    install();
    writeCutDraft("ring", "band", [
      [
        [1, 2],
        [3, 4],
      ],
    ]);
    expect(readCutDraft("ring", "band")).toEqual([
      [
        [1, 2],
        [3, 4],
      ],
    ]);
    expect(readCutDraft("ring", "constructor")).toEqual([]);
    expect(readCutDraft("pendant", "band")).toEqual([]);
  });

  it("read only finite strokes from hostile session text and never throw", () => {
    const before = prototypeShape();
    const items = install();
    const sample = JSON.stringify({
      piece: "ring",
      drafts: {
        band: [
          [
            [1, 2],
            [3, 4],
          ],
        ],
        face: [],
      },
    });
    for (const entry of hostileTexts([sample], 0xd4af, 600)) {
      items.set(DRAFT_KEY, entry.input);
      for (const cut of ["band", "face", "__proto__", "constructor", "toString"]) {
        const strokes = readCutDraft("ring", cut);
        expect(Array.isArray(strokes)).toBe(true);
        expect(strokes.every((stroke) => Array.isArray(stroke) && stroke.every(isFinitePoint))).toBe(true);
      }
    }
    expect(prototypeChanged(before)).toBe(false);
  }, 60_000);
});
