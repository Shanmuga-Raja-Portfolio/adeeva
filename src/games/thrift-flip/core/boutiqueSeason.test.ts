import { describe, expect, it } from "vitest";
import { boutiqueStart, endDays, rackPieceFixture, withRack } from "./boutiquePlaythrough";
import { suggestedShelf } from "./capsuleShelf";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { hangingPieces } from "./rackRoom";
import { isShowcaseDay, isSwapDay, seasonDay, themeForDay } from "./seasonCalendar";
import { isStallDay } from "./stallCalendar";
import { pieceFairBand } from "./stallDay";
import { SEASON_RACK_BUZZ, tillBonuses } from "./tillDay";

function seasonPicks(state: GameState): GameState {
  return withRack(state, [
    rackPieceFixture("piece-1", { tags: ["casual"], madeDay: 1 }),
    rackPieceFixture("piece-2", { tags: ["sporty"], madeDay: 1 }),
    rackPieceFixture("piece-3", { tags: ["casual", "playful"], madeDay: 1 }),
    rackPieceFixture("piece-4", { tags: ["elegant"], madeDay: 1, quality: 70 }),
  ]);
}

describe("the boutique season", () => {
  it("runs Till Days, Swap & Mend and the Showcase days on a 28-day calendar", () => {
    const start = boutiqueStart();
    expect(start.boutique?.season).toMatchObject({ number: 1, themeId: "blossom-mend", startDay: 1 });
    const days: Record<number, { till: boolean; swap: boolean; show: boolean }> = {};
    let state = start;
    for (let day = 1; day <= 28; day += 1) {
      days[day] = {
        till: state.boutique !== null && isStallDay(state.calendar.day),
        swap: isSwapDay(state),
        show: isShowcaseDay(state),
      };
      expect(seasonDay(state)).toBe(day);
      state = endDays(state, 1);
    }
    expect(
      Object.entries(days)
        .filter(([, flags]) => flags.till)
        .map(([day]) => Number(day)),
    ).toEqual([7, 14, 21, 28]);
    expect(
      Object.entries(days)
        .filter(([, flags]) => flags.swap)
        .map(([day]) => Number(day)),
    ).toEqual([11]);
    expect(
      Object.entries(days)
        .filter(([, flags]) => flags.show)
        .map(([day]) => Number(day)),
    ).toEqual([22, 23, 24, 25, 26, 27]);
    expect(state.boutique?.season).toMatchObject({ number: 2, themeId: "seaside-swap", startDay: 29 });
    expect(state.story.seen).toContain("tf-season-turn");
  });

  it("starts the first season by the week the boutique opens", () => {
    expect(themeForDay(1)).toBe("blossom-mend");
    expect(themeForDay(8)).toBe("seaside-swap");
    expect(themeForDay(29)).toBe("blossom-mend");
  });

  it("adds Season pick, In the window and Showcase piece bonuses to the fair value", () => {
    const state = endDays(seasonPicks(boutiqueStart()), 3);
    const boutique = state.boutique;
    if (boutique === null) throw new Error("No boutique");
    const windowed: GameState = {
      ...state,
      rack: state.rack.map((piece) => (piece.id === "piece-1" ? { ...piece, showcaseSeason: 1 } : piece)),
      boutique: { ...boutique, window: { pieces: [{ pieceId: "piece-1", x: 100, y: 200 }], props: [] } },
    };
    const piece = windowed.rack[0];
    if (piece === undefined) throw new Error("No piece");
    expect(tillBonuses(windowed, piece)).toEqual(["in-window", "showcase-piece"]);
    const dressed = windowed.boutique;
    if (dressed === null) throw new Error("No boutique");
    const seasonal = {
      ...windowed,
      boutique: { ...dressed, season: { ...boutique.season, themeId: "seaside-swap" as const } },
    };
    expect(tillBonuses(seasonal, piece)).toEqual(["season-pick", "in-window", "showcase-piece"]);
    const plain = pieceFairBand({ ...state, boutique: null }, piece).value;
    expect(pieceFairBand(seasonal, piece).value).toBeGreaterThan(plain);
  });

  it("gives the Season rack bonus with three season picks and sells only rack pieces on Till Day", () => {
    const base = boutiqueStart();
    const boutique = base.boutique;
    if (boutique === null) throw new Error("No boutique");
    const seaside = {
      ...base,
      boutique: { ...boutique, season: { ...boutique.season, themeId: "seaside-swap" as const } },
    };
    const shelved = reduce(seasonPicks(seaside), { type: "shelvePiece", pieceId: "piece-4" });
    const till = endDays(shelved, 6);
    expect(till.boutique !== null && isStallDay(till.calendar.day)).toBe(true);
    expect(hangingPieces(till).map((piece) => piece.id)).toEqual(["piece-1", "piece-2", "piece-3"]);
    const prices = Object.fromEntries(
      hangingPieces(till).map((piece) => [piece.id, pieceFairBand(till, piece).high]),
    );
    const held = reduce(till, { type: "holdStall", prices });
    expect(held.rack.map((piece) => piece.id)).toEqual(["piece-4"]);
    expect(held.stall?.buzz).toBe(SEASON_RACK_BUZZ);
    expect(held.stall?.sales.every((sale) => sale.bonuses.includes("season-pick"))).toBe(true);
  });

  it("moves this season's pieces to the show shelf and back, at most three", () => {
    const state = seasonPicks(boutiqueStart());
    const one = reduce(state, { type: "shelvePiece", pieceId: "piece-1" });
    expect(one.boutique?.season.capsule).toEqual(["piece-1"]);
    expect(reduce(one, { type: "shelvePiece", pieceId: "piece-1" })).toBe(one);
    const three = reduce(reduce(one, { type: "shelvePiece", pieceId: "piece-2" }), {
      type: "shelvePiece",
      pieceId: "piece-3",
    });
    expect(reduce(three, { type: "shelvePiece", pieceId: "piece-4" })).toBe(three);
    const back = reduce(three, { type: "unshelvePiece", pieceId: "piece-2" });
    expect(back.boutique?.season.capsule).toEqual(["piece-1", "piece-3"]);
    const nextSeason = endDays(state, 28);
    expect(nextSeason.boutique?.season.number).toBe(2);
    expect(reduce(nextSeason, { type: "shelvePiece", pieceId: "piece-4" })).toBe(nextSeason);
  });

  it("suggests the best pieces made this season and fills the shelf in one tap", () => {
    const state = seasonPicks(boutiqueStart());
    expect(suggestedShelf(state).map((piece) => piece.id)).toEqual(["piece-1", "piece-2", "piece-3"]);
    const filled = reduce(state, { type: "fillShelf" });
    expect(filled.boutique?.season.capsule).toEqual(["piece-1", "piece-2", "piece-3"]);
    expect(reduce(filled, { type: "fillShelf" })).toBe(filled);
  });
});
