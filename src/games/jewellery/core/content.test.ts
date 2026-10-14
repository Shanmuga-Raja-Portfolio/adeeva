import { describe, expect, it } from "vitest";
import { hasUniqueIds } from "../../../engine/uniqueIds";
import { CLIENTS } from "../content/client";
import { DECOR } from "../content/decor";
import { EXTRAS } from "../content/extra";
import { FINISHES } from "../content/finish";
import { COACH_LINES, HINTS } from "../content/hints";
import { MARKET_THEMES } from "../content/marketTheme";
import { METALS } from "../content/metal";
import { OPTIONS } from "../content/partOption";
import { PRODUCTS } from "../content/product";
import { STONES } from "../content/stone";
import { BEAT_BUZZ, STORY_BEATS } from "../content/storyBeat";
import { UPGRADES } from "../content/upgrade";
import { stockPrice } from "./stock";

function words(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

function sentences(text: string): number {
  return text.split(/[.!?]+/).filter((part) => part.trim().length > 0).length;
}

describe("catalogs", () => {
  it("have unique ids everywhere", () => {
    for (const list of [
      CLIENTS,
      DECOR,
      EXTRAS,
      FINISHES,
      MARKET_THEMES,
      METALS,
      OPTIONS,
      PRODUCTS,
      STONES,
      STORY_BEATS,
      UPGRADES,
    ])
      expect(hasUniqueIds(list)).toBe(true);
  });

  it("price strips at ×0.7 and wide sheets at ×1.8, rounded", () => {
    expect(stockPrice("copper", "strip")).toBe(3);
    expect(stockPrice("silver", "strip")).toBe(8);
    expect(stockPrice("gold", "strip")).toBe(17);
    expect(stockPrice("brass", "wide")).toBe(9);
  });

  it("keep 8 clients with exactly two trait-gated ones", () => {
    expect(CLIENTS).toHaveLength(8);
    expect(CLIENTS.filter((client) => client.traitGate !== undefined).map((client) => client.id)).toEqual([
      "juniper",
      "mr-farouk",
    ]);
  });

  it("gives buzz only for beats that play once", () => {
    const buzzBeats = STORY_BEATS.filter((beat) => Object.hasOwn(BEAT_BUZZ, beat.id));
    expect(buzzBeats).toHaveLength(Object.keys(BEAT_BUZZ).length);
    for (const beat of buzzBeats) expect(beat.repeatable, beat.id).toBe(false);
  });
});

describe("kid-friendly words", () => {
  it("keeps every hint at 12 words or fewer and 2 sentences or fewer", () => {
    for (const line of [...Object.values(HINTS), ...Object.values(COACH_LINES)]) {
      expect(words(line), line).toBeLessThanOrEqual(12);
      expect(sentences(line), line).toBeLessThanOrEqual(2);
    }
  });

  it("keeps every client line to 1 or 2 sentences", () => {
    for (const client of CLIENTS)
      for (const line of Object.values(client.lines)) expect(sentences(line), line).toBeLessThanOrEqual(2);
  });
});
