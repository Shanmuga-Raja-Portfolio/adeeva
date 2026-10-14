import { describe, expect, it } from "vitest";
import type { Action, FairAction, SalonAction } from "./action";
import { reduce } from "./reduce";
import { endDays, readySeason, salonTestGame } from "./salonPlaythrough";
import type { SalonMenu } from "./salonState";
import { newTestGame, settleStories } from "./testPlaythrough";

const MENU: SalonMenu = {
  top: { productId: "cupcake-tray", mixId: "lemon-sponge", colours: ["sky", "mustard"] },
  middle: { productId: "spiral-roll", mixId: "orange-sponge", colours: ["coral", "ivory"] },
  bottom: { productId: "iced-biscuits", mixId: "biscuit-dough", colours: ["teal", "sky"] },
};

const SALON_ACTIONS: readonly SalonAction[] = [
  { type: "restParlour" },
  { type: "setSalonMenu", menu: MENU },
  { type: "startSalonTray", tier: "top" },
  { type: "chooseSplit", split: 4 },
  { type: "openTables" },
  { type: "closeTables" },
  { type: "plateItem", tableIndex: 0, tier: "top", colour: "sky" },
  { type: "unplateItem", tableIndex: 0, tier: "top" },
  { type: "pourTea", tableIndex: 0, ml: 150, actions: 1, assisted: false },
  { type: "serveTable", tableIndex: 0 },
];

const FAIR_ACTIONS: readonly FairAction[] = [
  { type: "chooseFairTheme", themeId: "blossom-lane" },
  { type: "startShowpiece" },
  { type: "toggleFlourish", flourish: "blind-scale" },
  { type: "chooseWord", word: "JOY" },
  { type: "bakeTogether", heat: 3, turnedMinutes: 10, takenMinutes: [24, 18], assisted: false },
  { type: "stageFair", plan: { sidePlates: [], order: [0], cloth: "linen", music: "string-trio" } },
  { type: "moveUpTent" },
];

describe("salon and Fair actions in the wrong place", () => {
  it("return the very same state for a Corner Baker", () => {
    const bakery = settleStories(newTestGame());
    for (const action of [...SALON_ACTIONS, ...FAIR_ACTIONS, { type: "openSalon" } as Action])
      expect(reduce(bakery, action), action.type).toBe(bakery);
  });

  it("return the very same state before the season's choices are made", () => {
    const salon = salonTestGame();
    const illegal: Action[] = [
      { type: "startSalonTray", tier: "top" },
      { type: "chooseSplit", split: 4 },
      { type: "openTables" },
      { type: "closeTables" },
      { type: "plateItem", tableIndex: 0, tier: "top", colour: "sky" },
      { type: "pourTea", tableIndex: 0, ml: 150, actions: 1, assisted: false },
      { type: "serveTable", tableIndex: 0 },
      { type: "startShowpiece" },
      { type: "chooseFairTheme", themeId: "snow-globe" },
      { type: "chooseFairTheme", themeId: "atlantis" as never },
      { type: "toggleFlourish", flourish: "blind-scale" },
      { type: "bakeTogether", heat: 3, turnedMinutes: 10, takenMinutes: [24, 18], assisted: false },
      { type: "stageFair", plan: { sidePlates: [], order: [0], cloth: "linen", music: "string-trio" } },
      { type: "moveUpTent" },
      { type: "openSalon" },
      { type: "buyUpgrade", upgradeId: "silver-stands" },
    ];
    for (const action of illegal) expect(reduce(salon, action), action.type).toBe(salon);
  });

  it("return the very same state with malformed salon input", () => {
    const day = endDays(readySeason(salonTestGame()), 6);
    const open = reduce(day, { type: "openTables" });
    const illegal: Action[] = [
      { type: "plateItem", tableIndex: 0.5, tier: "top", colour: "sky" },
      { type: "plateItem", tableIndex: 0, tier: "roof" as never, colour: "sky" },
      { type: "pourTea", tableIndex: 0, ml: -1, actions: 1, assisted: false },
      { type: "pourTea", tableIndex: 0, ml: 150.5, actions: 1, assisted: false },
      { type: "pourTea", tableIndex: 0, ml: 150, actions: 41, assisted: false },
      { type: "pourTea", tableIndex: 7, ml: 150, actions: 1, assisted: false },
      { type: "serveTable", tableIndex: -1 },
      { type: "unplateItem", tableIndex: 0, tier: "top" },
      { type: "setSalonMenu", menu: MENU },
    ];
    for (const action of illegal) expect(reduce(open, action), action.type).toBe(open);
  });

  it("keep salon upgrades for the Comet Room", () => {
    const rich = { ...settleStories(newTestGame()), coins: 999, reputation: 40 };
    expect(reduce(rich, { type: "buyUpgrade", upgradeId: "silver-stands" })).toBe(rich);
    const salon = { ...salonTestGame(), coins: 999, reputation: 40 };
    expect(reduce(salon, { type: "buyUpgrade", upgradeId: "silver-stands" }).upgrades).toContain(
      "silver-stands",
    );
  });
});
