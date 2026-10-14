import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import { mixById } from "./catalog";
import { canDeliver } from "./delivery";
import type { GameState } from "./gameState";
import { canRestParlour } from "./parlour";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import {
  endDays,
  readySeason,
  salonTestGame,
  salonTrayPlan,
  playSalonTray,
  showpiecePlan,
} from "./salonPlaythrough";
import { nextSeasonStart, salonDayOf } from "./seasonCalendar";
import { playRunTo } from "./testPlaythrough";

function seasonFair(state: GameState) {
  if (state.fair === null) throw new Error("No Fair season");
  return state.fair;
}

function trayInReview(state: GameState): GameState {
  const started = reduce(state, { type: "startSalonTray", tier: "top" });
  return playRunTo(started, salonTrayPlan(state, "top"), "review");
}

describe("Blind Scale keeps its promise", () => {
  it("clears earlier weighing when the touch is switched on or off", () => {
    const ready = endDays(readySeason(salonTestGame()), 3);
    const started = reduce(ready, { type: "startShowpiece" });
    const atScale = playRunTo(started, showpiecePlan(ready), "weigh");
    const first = mixById("vanilla-sponge").weighed[0];
    if (first === undefined) throw new Error("No weighed ingredient");
    const weighed = reduce(atScale, {
      type: "recordWeigh",
      batch: 0,
      ingredientId: first.ingredient,
      grams: first.grams,
      actions: 1,
      assisted: false,
    });
    expect(Object.keys(weighed.activeRun?.batches[0]?.weighs ?? {}).length).toBeGreaterThan(0);
    const back = reduce(weighed, { type: "goToStage", stage: "design" });
    const blind = reduce(back, { type: "toggleFlourish", flourish: "blind-scale" });
    expect(blind.activeRun?.flourishes).toContain("blind-scale");
    for (const batch of blind.activeRun?.batches ?? []) {
      expect(batch.weighs).toEqual({});
      expect(batch.eggs).toBe(0);
      expect(batch.committed).toBe(false);
    }
    const plaque = reduce(back, { type: "toggleFlourish", flourish: "plaque-lettering" });
    expect(plaque.activeRun?.batches).toEqual(back.activeRun?.batches);
  });
});

describe("salon trays belong to their own Salon Day", () => {
  it("cannot be shelved once Salon Day has passed", () => {
    const ready = readySeason(salonTestGame());
    const review = trayInReview(ready);
    const late = endDays(review, salonDayOf(seasonFair(ready)) + 1);
    expect(late.activeRun?.stage).toBe("review");
    expect(canDeliver(late).ok).toBe(false);
    expect(reduce(late, { type: "deliver" })).toBe(late);
  });

  it("cannot be shelved after the tables are cleared on Salon Day", () => {
    const ready = readySeason(salonTestGame());
    const review = trayInReview(playSalonTray(ready, "middle"));
    const day = endDays(review, salonDayOf(seasonFair(ready)));
    expect(canDeliver(day).ok).toBe(true);
    const closed = reduce(reduce(day, { type: "openTables" }), { type: "closeTables" });
    expect(closed.salon?.doneDay).toBe(day.calendar.day);
    expect(closed.activeRun?.stage).toBe("review");
    expect(reduce(closed, { type: "deliver" })).toBe(closed);
  });

  it("is cleared from the bench when a new season begins", () => {
    const ready = readySeason(salonTestGame());
    const review = trayInReview(ready);
    const rolled = endDays(review, nextSeasonStart(seasonFair(ready)));
    expect(rolled.fair?.seasonNumber).toBe(2);
    expect(rolled.activeRun).toBeNull();
    expect(rolled.salon?.shelf).toEqual([]);
  });
});

describe("the parlour's plan", () => {
  it("cannot rest once the season's theme is chosen", () => {
    const ready = readySeason(salonTestGame());
    expect(canRestParlour(ready).ok).toBe(false);
    expect(reduce(ready, { type: "restParlour" })).toBe(ready);
  });
});

describe("plating with a tier that does not exist", () => {
  it("returns the very same state", () => {
    const ready = readySeason(salonTestGame());
    const stocked = playSalonTray(playSalonTray(playSalonTray(ready, "top"), "middle"), "bottom");
    const open = reduce(endDays(stocked, salonDayOf(seasonFair(ready))), { type: "openTables" });
    expect(open.salon?.session).not.toBeNull();
    const illegal: Action[] = [
      { type: "plateItem", tableIndex: 0, tier: "bogus" as never, colour: "ivory" },
      { type: "plateItem", tableIndex: 0, tier: null as never, colour: "ivory" },
      { type: "unplateItem", tableIndex: 0, tier: "bogus" as never },
      { type: "unplateItem", tableIndex: 0, tier: "toString" as never },
    ];
    for (const action of illegal) expect(reduce(open, action), action.type).toBe(open);
  });
});

describe("loading a Fair season", () => {
  it("refuses a season that does not start a new week", () => {
    const ready = readySeason(salonTestGame());
    const fair = seasonFair(ready);
    expect(parseSave(serialize(ready)).ok).toBe(true);
    const shifted = { ...ready, fair: { ...fair, seasonStartDay: fair.seasonStartDay + 1 } };
    expect(parseSave(serialize(shifted)).ok).toBe(false);
  });
});
