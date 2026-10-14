import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { grantPathAward, noteCleanService, notePathOrder } from "./pathAwards";
import { bestNewSeason, warmestSeason } from "./pathDay";
import { restaurantOf } from "./path";
import type { Reward } from "./rewards";
import { newSeason } from "./season";
import { crossroadsReady, must, settleStories } from "./testPlaythrough";

const PASS: Reward = { outcome: "pass", coins: 60, reputation: 2, buzz: 3, lines: [], trendMatches: [] };

function chosen(path: "restaurant" | "truck" | "tv"): GameState {
  return settleStories(
    must(crossroadsReady(), {
      type: "choosePath",
      path,
      nameCard: path === "restaurant" ? "harbour-table" : null,
    }),
  );
}

describe("path awards", () => {
  it("judge a warm season: average 85 and all three critics at 4 spoons or more", () => {
    const season = {
      ...newSeason(1),
      scores: [90, 86, 84],
      critics: [
        { criticId: "ottoline-reyes", spoons: 4 },
        { criticId: "barnaby-quill", spoons: 5 },
        { criticId: "hazel-oduya", spoons: 4 },
      ] as const,
    };
    expect(warmestSeason(season)).toBe(true);
    expect(warmestSeason({ ...season, scores: [80, 84] })).toBe(false);
    expect(warmestSeason({ ...season, critics: season.critics.slice(0, 2) })).toBe(false);
  });

  it("judge a best new table: money left over and under a tenth unserved", () => {
    const season = { ...newSeason(1), moneyIn: 900, moneyOut: 800, ingredients: 200, unserved: 19 };
    expect(bestNewSeason(season)).toBe(true);
    expect(bestNewSeason({ ...season, unserved: 20 })).toBe(false);
    expect(bestNewSeason({ ...season, moneyOut: 900 })).toBe(false);
  });

  it("grant season awards when two weeks have passed", () => {
    const state = chosen("restaurant");
    const place = restaurantOf(state);
    if (place === null) throw new Error("no restaurant");
    const season = { ...place.season, moneyIn: 500, moneyOut: 100, ingredients: 100, unserved: 5 };
    const late = { ...state, calendar: { day: 14, hoursLeft: 10 }, board: { ...state.board, day: 14 } };
    const judged = must({ ...late, path: { ...place, season } }, { type: "endDay" });
    expect(restaurantOf(judged)?.awards).toEqual(["best-new-table"]);
    expect(restaurantOf(judged)?.season.startDay).toBe(15);
    expect(judged.awards).toContain("best-new-table");
  });

  it("count community orders from after the path starts", () => {
    let state = chosen("truck");
    state = notePathOrder(state, "netball-supper", PASS);
    state = notePathOrder(state, "book-club", PASS);
    state = notePathOrder(state, "science-fair", { ...PASS, outcome: "soft-fail" });
    expect(state.path?.community).toBe(1);
    expect(state.path?.week.amounts.bookings).toBe(180);
    state = notePathOrder(notePathOrder(state, "thursday-table", PASS), "science-fair", PASS);
    expect(state.path?.awards).toEqual(["community-table"]);
  });

  it("earn the clean pass on the path itself", () => {
    let state = chosen("tv");
    for (let index = 0; index < 4; index += 1) state = noteCleanService(state, true);
    expect(noteCleanService(state, false).path?.cleanStreak).toBe(0);
    expect(noteCleanService(state, true).path?.awards).toEqual(["clean-pass"]);
  });

  it("hang the Larkspur Ladle with all three, and close the restaurant chapter", () => {
    let state = chosen("restaurant");
    state = grantPathAward(grantPathAward(state, "warmest-kitchen"), "community-table");
    expect(state.awards).not.toContain("larkspur-ladle");
    expect(grantPathAward(state, "festival-favourite")).toBe(state);
    state = grantPathAward(state, "best-new-table");
    expect(state.awards).toContain("larkspur-ladle");
    expect(state.path?.finished).toBe(true);
    expect(state.story.queue).toEqual(["ch-ladle", "rs-chapter-end"]);
  });
});
