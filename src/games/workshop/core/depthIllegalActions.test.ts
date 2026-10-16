import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import { reduce } from "./reduce";
import { NOOK_PLAN, playSetToFloor, playSetUntil, READING_PLAN, showroomTestGame } from "./setPlaythrough";
import { newTestGame, settleStories } from "./testPlaythrough";

const SHOWROOM_ACTIONS: readonly Action[] = [
  { type: "chooseStoryOption", beatId: "ww-showroom-offer", choiceId: "open" },
  { type: "setBenchTour", on: true },
  { type: "openShowroom" },
  { type: "startSet", templateId: "reading-corner" },
  { type: "chooseSetJoint", kind: "comb" },
  { type: "planTheRest" },
  { type: "sawLikeFirst", partId: "2:seat" },
  { type: "finishSet" },
  { type: "markFloorSet", setId: "set-1", mode: "show" },
  { type: "pickOpenHouse", setId: "set-1" },
  { type: "arrangeFloorPiece", setId: "set-1", piece: 0, x: 10, y: 40, rotation: 0 },
  { type: "takeRenOn" },
  { type: "giveRenWeekOff" },
  { type: "handToRen", job: "sand" },
  { type: "chooseFairTheme", themeId: "orchard-picnic" },
  { type: "restShowroom" },
  { type: "pickFairSet", setId: "set-1" },
  {
    type: "stageFair",
    plan: { setId: "set-1", order: [0, 1], backdrop: "bunting", music: "fiddle-folk", note: "one-board" },
  },
  { type: "moveUpBooth" },
  { type: "buyUpgrade", upgradeId: "matching-jigs" },
  { type: "buyDecor", decorId: "shop-sign", paint: "teal" },
];

describe("showroom and Fair actions", () => {
  it("return the very same state in a fresh garage", () => {
    const state = settleStories(newTestGame());
    for (const action of SHOWROOM_ACTIONS) expect(reduce(state, action), action.type).toBe(state);
  });

  it("return the very same state when out of turn in the showroom", () => {
    const busy = playSetUntil(showroomTestGame(), READING_PLAN, "layout");
    const wrong: readonly Action[] = [
      { type: "startSet", templateId: "playroom" },
      { type: "chooseSetJoint", kind: "comb" },
      { type: "sawLikeFirst", partId: "1:top" },
      { type: "finishSet" },
      { type: "deliver" },
      { type: "chooseProduct", productId: "bookshelf" },
      { type: "chooseFairTheme", themeId: "harvest-barn" },
      {
        type: "stageFair",
        plan: { setId: "set-1", order: [0, 1], backdrop: "bunting", music: "fiddle-folk", note: "one-board" },
      },
      { type: "handToRen", job: "pegs" },
      { type: "addExtra", extraId: "wood-knob", x: 10, y: 10, piece: 0 },
      { type: "arrangeFloorPiece", setId: "set-9", piece: 0, x: 10, y: 40, rotation: 0 },
      { type: "markFloorSet", setId: "set-9", mode: "show" },
      { type: "pickOpenHouse", setId: "set-9" },
      { type: "moveUpBooth" },
      { type: "openShowroom" },
      { type: "buyUpgrade", upgradeId: "hand-cart" },
    ];
    for (const action of wrong) expect(reduce(busy, action), action.type).toBe(busy);
  });

  it("return the very same state for repeats on the floor", () => {
    const floored = playSetToFloor(showroomTestGame(), NOOK_PLAN);
    const repeats: readonly Action[] = [
      { type: "markFloorSet", setId: "set-1", mode: "sale" },
      { type: "pickFairSet", setId: "set-1" },
      { type: "finishSet" },
      { type: "planTheRest" },
    ];
    for (const action of repeats) expect(reduce(floored, action), action.type).toBe(floored);
    const picked = reduce(floored, { type: "pickOpenHouse", setId: "set-1" });
    expect(reduce(picked, { type: "pickOpenHouse", setId: "set-1" })).toBe(picked);
  });

  it("refuses showroom upgrades before their gate", () => {
    const rich = { ...showroomTestGame(), coins: 2000 };
    expect(reduce(rich, { type: "buyUpgrade", upgradeId: "hand-cart" })).toBe(rich);
    expect(reduce(rich, { type: "buyUpgrade", upgradeId: "ren-bench" })).toBe(rich);
    expect(reduce(rich, { type: "buyUpgrade", upgradeId: "booth-awning" })).toBe(rich);
    expect(reduce(rich, { type: "buyUpgrade", upgradeId: "matching-jigs" }).upgrades).toContain(
      "matching-jigs",
    );
    const boothTwo = { ...rich, fair: rich.fair === null ? null : { ...rich.fair, booth: 2 as const } };
    expect(reduce(boothTwo, { type: "buyUpgrade", upgradeId: "hand-cart" }).upgrades).toContain("hand-cart");
  });
});
