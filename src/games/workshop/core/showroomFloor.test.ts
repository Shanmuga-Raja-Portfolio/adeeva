import { describe, expect, it } from "vitest";
import { isOnOwnRug, rugsFor } from "./floorArrange";
import type { GameState } from "./gameState";
import { openHouseSale, RUG_BUZZ, SALE_BUZZ, SHOW_BUZZ } from "./openHouse";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import { NOOK_PLAN, playSetToFloor, READING_PLAN, showroomTestGame } from "./setPlaythrough";
import { FLOOR_FULL, bayCount } from "./showroomFloor";
import { setStartCheck } from "./setStart";
import { settleStories } from "./testPlaythrough";

function twoSets(): GameState {
  const start = reduce(showroomTestGame(), { type: "chooseFairTheme", themeId: "orchard-picnic" });
  return playSetToFloor(playSetToFloor(start, READING_PLAN), NOOK_PLAN);
}

function endDaysTo(state: GameState, day: number): GameState {
  let current = state;
  while (current.calendar.day < day) current = settleStories(reduce(current, { type: "endDay" }));
  return current;
}

describe("the showroom floor", () => {
  it("has two bays, three with the hand cart, and refuses a set when full", () => {
    const full = twoSets();
    expect(bayCount(full)).toBe(2);
    expect(full.showroom?.floor.map((set) => set.bay)).toEqual([0, 1]);
    expect(setStartCheck(full).reasons).toEqual([FLOOR_FULL]);
    expect(reduce(full, { type: "startSet", templateId: "playroom" })).toBe(full);
    const carted = { ...full, upgrades: [...full.upgrades, "hand-cart" as const] };
    expect(setStartCheck(carted).ok).toBe(true);
  });

  it("lays each new set out on its own rug", () => {
    const state = twoSets();
    const rugs = rugsFor(bayCount(state));
    expect(state.showroom?.floor.every((set) => isOnOwnRug(set, rugs))).toBe(true);
  });

  it("moves pieces by hand, in bounds and never onto another piece", () => {
    const state = twoSets();
    const set = state.showroom?.floor[0];
    const spot = set?.pieces[0]?.spot;
    if (set === undefined || spot === undefined) throw new Error("No set");
    const moved = reduce(state, {
      type: "arrangeFloorPiece",
      setId: set.setId,
      piece: 0,
      x: 150,
      y: 180,
      rotation: 0,
    });
    expect(moved.showroom?.floor[0]?.pieces[0]?.spot).toEqual({ x: 150, y: 180, rotation: 0 });
    expect(isOnOwnRug(moved.showroom?.floor[0] ?? set, rugsFor(2))).toBe(false);
    const other = set.pieces[1]?.spot;
    if (other === undefined) throw new Error("No second piece");
    expect(reduce(state, { type: "arrangeFloorPiece", setId: set.setId, piece: 0, ...other })).toBe(state);
    expect(
      reduce(state, { type: "arrangeFloorPiece", setId: set.setId, piece: 0, x: 290, y: 0, rotation: 0 }),
    ).toBe(state);
    expect(
      reduce(state, { type: "arrangeFloorPiece", setId: set.setId, piece: 0, x: 10.5, y: 40, rotation: 0 }),
    ).toBe(state);
    expect(parseSave(serialize(moved)).ok).toBe(true);
  });
});

describe("Open House", () => {
  it("sells the oldest For-sale set on season day 7, with buzz", () => {
    const state = twoSets();
    expect(openHouseSale(state)?.setId).toBe("set-1");
    const atSeven = endDaysTo(state, 7);
    const after = reduce(atSeven, { type: "endDay" });
    expect(after.showroom?.floor.map((set) => set.setId)).toEqual(["set-2"]);
    const price = atSeven.showroom?.floor[0]?.price ?? 0;
    expect(after.coins).toBeGreaterThan(atSeven.coins + price - 400);
    expect(after.story.queue).toContain("ww-first-open-house");
    expect(SALE_BUZZ).toBe(3);
  });

  it("sells the set the player picked instead", () => {
    const picked = reduce(endDaysTo(twoSets(), 7), { type: "pickOpenHouse", setId: "set-2" });
    const after = reduce(picked, { type: "endDay" });
    expect(after.showroom?.floor.map((set) => set.setId)).toEqual(["set-1"]);
  });

  it("never sells a set kept on show or saved for the Fair", () => {
    const shown = reduce(twoSets(), { type: "markFloorSet", setId: "set-2", mode: "show" });
    const saved = reduce(shown, { type: "pickFairSet", setId: "set-1" });
    expect(saved.fair?.pickSetId).toBe("set-1");
    expect(openHouseSale(saved)).toBeNull();
    const atSeven = endDaysTo(saved, 7);
    const after = reduce(atSeven, { type: "endDay" });
    expect(after.showroom?.floor).toHaveLength(2);
    expect(after.buzz).toBe(Math.max(0, atSeven.buzz + SHOW_BUZZ + 2 * RUG_BUZZ - 2));
  });

  it("refuses a save with a set in a bay the floor lacks, or Ren past a day's jobs", () => {
    const full = twoSets();
    const showroom = full.showroom;
    const apprentice = full.apprentice;
    if (showroom === null || apprentice === null) throw new Error("No showroom");
    const thirdBay = {
      ...full,
      showroom: {
        ...showroom,
        floor: showroom.floor.map((set, at) => (at === 1 ? { ...set, bay: 2 } : set)),
      },
    };
    expect(parseSave(serialize(thirdBay)).ok).toBe(false);
    expect(parseSave(serialize({ ...thirdBay, upgrades: [...full.upgrades, "hand-cart" as const] })).ok).toBe(
      true,
    );
    const busy = { ...full, apprentice: { ...apprentice, hired: true, jobsToday: 3 } };
    expect(parseSave(serialize(busy)).ok).toBe(false);
    expect(parseSave(serialize({ ...busy, upgrades: [...full.upgrades, "ren-bench" as const] })).ok).toBe(
      true,
    );
  });

  it("is quiet while the shop rests", () => {
    const rested = reduce(showroomTestGame(), { type: "restShowroom" });
    expect(rested.showroom?.rested).toBe(true);
    const day7 = endDaysTo(rested, 7);
    expect(reduce(day7, { type: "endDay" }).story.queue).not.toContain("ww-first-open-house");
  });
});
