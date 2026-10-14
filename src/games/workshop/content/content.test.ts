import { describe, expect, it } from "vitest";
import { BOARD_SIZES } from "./boardSize";
import { CLIENTS } from "./client";
import { COACH_HINTS, HINTS } from "./hint";
import { PRODUCTS } from "./product";
import { BEAT_BUZZ, STORY_BEATS } from "./storyBeat";
import { hammersFor, WOODS } from "./wood";
import { EXTRAS } from "./extra";
import { FINISHES } from "./finish";
import { PART_OPTIONS } from "./partOption";

function words(text: string): number {
  return text.trim().split(/\s+/).length;
}

function sentences(text: string): number {
  return text.split(/[.!?]+/).filter((part) => part.trim().length > 0).length;
}

describe("workshop content", () => {
  it("gives buzz only for beats that play once", () => {
    const buzzBeats = STORY_BEATS.filter((beat) => Object.hasOwn(BEAT_BUZZ, beat.id));
    expect(buzzBeats).toHaveLength(Object.keys(BEAT_BUZZ).length);
    for (const beat of buzzBeats) expect(beat.repeatable, beat.id).toBe(false);
  });
  it("keeps every hint to 12 words or fewer", () => {
    for (const hint of [...Object.values(HINTS), ...Object.values(COACH_HINTS)])
      expect(words(hint ?? ""), hint).toBeLessThanOrEqual(12);
  });

  it("keeps every client line to 1 or 2 short sentences", () => {
    for (const client of CLIENTS)
      for (const line of Object.values(client.lines)) expect(sentences(line), line).toBeLessThanOrEqual(2);
  });

  it("has 8 clients, two of them for one trait each", () => {
    expect(CLIENTS).toHaveLength(8);
    expect(
      CLIENTS.filter((client) => client.traitGate !== undefined).map((client) => client.traitGate),
    ).toEqual(["dreamer", "perfectionist"]);
  });

  it("gives every wood the right number of hammers", () => {
    expect(WOODS).toHaveLength(12);
    const hammers = Object.fromEntries(WOODS.map((wood) => [wood.id, hammersFor(wood)]));
    expect(hammers).toMatchObject({ pine: 1, larch: 2, birch: 2, beech: 2, maple: 3, oak: 3, walnut: 3 });
  });

  it("fits every product's typical layout inside its boards", () => {
    for (const product of PRODUCTS)
      for (const board of product.canonical) {
        const size = BOARD_SIZES.find((entry) => entry.id === board.size);
        for (const spot of board.spots) {
          const part = product.parts.find((entry) => entry.id === spot.partId);
          expect(part).toBeDefined();
          expect(spot.x + (part?.width ?? 0)).toBeLessThanOrEqual(size?.width ?? 0);
          expect(spot.y + (part?.height ?? 0)).toBeLessThanOrEqual(size?.height ?? 0);
        }
      }
    for (const product of PRODUCTS) {
      const placed = product.canonical.flatMap((board) => board.spots.map((spot) => spot.partId)).sort();
      expect(placed).toEqual(product.parts.map((part) => part.id).sort());
    }
  });

  it("never shows the grown-up woodworking words", () => {
    const shown = JSON.stringify([
      CLIENTS,
      PRODUCTS,
      STORY_BEATS,
      HINTS,
      COACH_HINTS,
      EXTRAS,
      FINISHES,
      PART_OPTIONS,
    ]);
    for (const word of ["tenon", "dowel", "grain", "offcut"]) expect(shown.toLowerCase()).not.toContain(word);
  });

  it("never suggests a piece is for standing, sitting or climbing on", () => {
    const shown = JSON.stringify([
      CLIENTS,
      PRODUCTS,
      STORY_BEATS,
      HINTS,
      COACH_HINTS,
      EXTRAS,
      FINISHES,
    ]).toLowerCase();
    for (const phrase of ["reach", "climb", "stand on", "standing on", "step up", "sit on", "sitting on"])
      expect(shown, phrase).not.toContain(phrase);
  });
});
