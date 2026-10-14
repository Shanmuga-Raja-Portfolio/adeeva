import { describe, expect, it } from "vitest";
import { bakeQuality } from "./bakeQuality";
import type { GameState } from "./gameState";
import { leaveHours } from "./hourCost";
import { PANTRY_VISIT_HOURS } from "./pantry";
import { reduce } from "./reduce";
import { drawBookings, tableCount } from "./salonBookings";
import { MENU_LOCKED, canSetMenu, suggestedMenu } from "./salonMenu";
import {
  endDays,
  playSalonTray,
  readySeason,
  salonTestGame,
  salonTrayPlan,
  serveTables,
} from "./salonPlaythrough";
import type { SalonMenu, TableState } from "./salonState";
import { platingRefusal } from "./standPlating";
import { tablePay } from "./tablePay";
import { canOpenTables } from "./tableSession";
import { pourAccuracy, teaBand } from "./teaPour";
import { playRunTo, settleStories } from "./testPlaythrough";
import { coveringSplit, splitTally } from "./traySplit";

function stocked(overrides: Parameters<typeof salonTestGame>[0] = {}): GameState {
  let state = readySeason(salonTestGame(overrides));
  for (const tier of ["top", "middle", "bottom"] as const) state = settleStories(playSalonTray(state, tier));
  return state;
}

function salonDay(state: GameState): GameState {
  return endDays(state, (state.fair?.seasonStartDay ?? 1) + 5);
}

const MENU: SalonMenu = {
  top: { productId: "petit-fours", mixId: "vanilla-sponge", colours: ["blush", "sky"] },
  middle: { productId: "tartlet-set", mixId: "shortcrust", colours: ["ivory", "sage"] },
  bottom: { productId: "iced-biscuits", mixId: "rose-biscuit", colours: ["lavender", "mustard"] },
};

describe("the season menu", () => {
  it("opens on Marigold's suggestion and locks for the season", () => {
    const salon = reduce(salonTestGame(), { type: "chooseFairTheme", themeId: "blossom-lane" });
    const menu = suggestedMenu(salon);
    expect(menu?.top.productId).toBeDefined();
    expect(menu?.bottom.productId).toBe("iced-biscuits");
    const set = reduce(salon, { type: "setSalonMenu", menu: MENU });
    expect(set.salon?.menu).toEqual(MENU);
    expect(set.salon?.parlour).toBe("open");
    expect(set.salon?.bookings).toHaveLength(4);
    expect(canSetMenu(set).reasons).toEqual([MENU_LOCKED]);
    expect(reduce(set, { type: "setSalonMenu", menu: MENU })).toBe(set);
  });

  it("refuses menus that do not fit their tier", () => {
    const salon = salonTestGame();
    const wrongTier = { ...MENU, top: { ...MENU.top, productId: "tartlet-set" as const } };
    expect(reduce(salon, { type: "setSalonMenu", menu: wrongTier })).toBe(salon);
    const wrongMix = { ...MENU, middle: { ...MENU.middle, mixId: "vanilla-sponge" as const } };
    expect(reduce(salon, { type: "setSalonMenu", menu: wrongMix })).toBe(salon);
    const sameColour = { ...MENU, bottom: { ...MENU.bottom, colours: ["sky", "sky"] as const } };
    expect(reduce(salon, { type: "setSalonMenu", menu: sameColour })).toBe(salon);
  });

  it("draws the same bookings from the same seed, with one more table from the Tea Trolley", () => {
    const [first, after] = drawBookings(MENU, 4, 1234);
    const [again] = drawBookings(MENU, 4, 1234);
    expect(again).toEqual(first);
    expect(after).not.toBe(1234);
    expect(new Set(first.map((booking) => booking.guestId)).size).toBe(4);
    for (const booking of first) {
      expect(MENU.top.colours).toContain(booking.colours.top);
      expect(booking.teas[0]).not.toBe(booking.teas[1]);
    }
    const salon = salonTestGame();
    expect(tableCount(salon)).toBe(4);
    expect(tableCount({ ...salon, upgrades: ["tea-trolley"] })).toBe(5);
    const fair = salon.fair;
    if (fair === null) throw new Error("no fair");
    expect(tableCount({ ...salon, upgrades: ["tea-trolley"], fair: { ...fair, tent: 3 } })).toBe(6);
  });

  it("counts the bookings per colour and finds a split that covers them", () => {
    const set = reduce(salonTestGame(), { type: "setSalonMenu", menu: MENU });
    const bookings = set.salon?.bookings ?? [];
    const [blush, sky] = splitTally(bookings, MENU, "top");
    expect(blush + sky).toBe(4);
    expect(coveringSplit([4, 0])).toBe(6);
    expect(coveringSplit([0, 4])).toBe(0);
    expect(coveringSplit([2, 2])).toBe(3);
    expect(coveringSplit([1, 3])).toBe(2);
    expect(coveringSplit([5, 1])).toBe(6);
  });
});

describe("salon trays", () => {
  it("bake the menu pair in 6 hours with one quick pipe and a colour split", () => {
    const ready = readySeason(salonTestGame());
    const started = reduce(ready, { type: "startSalonTray", tier: "top" });
    const run = started.activeRun;
    expect(run?.purpose).toEqual({ kind: "salon-tray", tier: "top" });
    expect(run?.design.productId).toBe(ready.salon?.menu?.top.productId);
    expect(reduce(started, { type: "chooseProduct", productId: "cupcake-tray" })).toBe(started);
    expect(reduce(started, { type: "toggleColour", colour: "navy" })).toBe(started);
    expect(reduce(started, { type: "chooseSplit", split: 5 })).toBe(started);
    const split = reduce(started, { type: "chooseSplit", split: 4 });
    expect(split.activeRun?.design.split).toBe(4);
    const atPipe = playRunTo(split, salonTrayPlan(ready, "top"), "pipe");
    expect(atPipe.activeRun?.iced).toBe(true);
    if (atPipe.activeRun === null) throw new Error("no run");
    expect(leaveHours(atPipe.activeRun, [])).toBe(1);
    expect(10 - atPipe.calendar.hoursLeft).toBe(5 + PANTRY_VISIT_HOURS);
    const done = settleStories(playSalonTray(ready, "top"));
    expect(done.calendar.hoursLeft).toBe(10 - 6 - PANTRY_VISIT_HOURS);
    const tray = done.salon?.shelf[0];
    expect(tray?.left[0]).toBeGreaterThanOrEqual(0);
    expect((tray?.left[0] ?? 0) + (tray?.left[1] ?? 0)).toBe(6);
  });

  it("weighs a tray's quality 0.30 weigh, 0.20 stir, 0.30 bake and 0.20 pipe", () => {
    const ready = readySeason(salonTestGame());
    const plan = { ...salonTrayPlan(ready, "middle"), stirShare: 0.5 };
    const atReview = playRunTo(reduce(ready, { type: "startSalonTray", tier: "middle" }), plan, "review");
    const run = atReview.activeRun;
    if (run === null) throw new Error("no run");
    const breakdown = bakeQuality(run);
    const expected =
      0.3 * breakdown.weigh + 0.2 * breakdown.stir + 0.3 * breakdown.bake + 0.2 * breakdown.pipe;
    expect(breakdown.quality).toBe(Math.round(100 * expected));
    expect(breakdown.stir).toBeCloseTo(0.5, 2);
  });

  it("keep one tray per tier and pre-count the split on Relaxed", () => {
    const relaxed = readySeason(salonTestGame({ difficulty: "relaxed" }));
    const salon = relaxed.salon;
    const menu = salon?.menu ?? null;
    if (salon === null || menu === null) throw new Error("no menu");
    const started = reduce(relaxed, { type: "startSalonTray", tier: "bottom" });
    expect(started.activeRun?.design.split).toBe(coveringSplit(splitTally(salon.bookings, menu, "bottom")));
    const once = settleStories(playSalonTray(relaxed, "bottom"));
    expect(reduce(once, { type: "startSalonTray", tier: "bottom" })).toBe(once);
    expect(reduce(salonTestGame(), { type: "startSalonTray", tier: "top" })).toEqual(salonTestGame());
  });
});

describe("Table Service on Salon Day", () => {
  it("is a quiet day with an empty shelf, with no penalty", () => {
    const quiet = salonDay(readySeason(salonTestGame()));
    expect(canOpenTables(quiet).ok).toBe(false);
    expect(canOpenTables(quiet).reasons[0]).toContain("A quiet day in the parlour.");
    expect(reduce(quiet, { type: "openTables" })).toBe(quiet);
    const tomorrow = reduce(quiet, { type: "endDay" });
    expect(tomorrow.coins).toBe(quiet.coins);
  });

  it("plates by tier, refuses the wrong tier with a reason and swaps a missing colour", () => {
    const open = reduce(salonDay(stocked()), { type: "openTables" });
    const booking = open.salon?.bookings[0];
    if (booking === undefined) throw new Error("no booking");
    const wrong = platingRefusal(open, 0, "top", "middle", booking.colours.middle);
    expect(wrong).toMatch(/sit on the middle tier\.$/);
    expect(reduce(open, { type: "plateItem", tableIndex: 9, tier: "top", colour: booking.colours.top })).toBe(
      open,
    );
    const plated = reduce(open, {
      type: "plateItem",
      tableIndex: 0,
      tier: "top",
      colour: booking.colours.top,
    });
    expect(plated.salon?.session?.tables[0]?.plated.top?.swapped).toBe(false);
    expect(
      reduce(plated, { type: "plateItem", tableIndex: 0, tier: "top", colour: booking.colours.top }),
    ).toBe(plated);
    const back = reduce(plated, { type: "unplateItem", tableIndex: 0, tier: "top" });
    expect(back.salon?.shelf).toEqual(open.salon?.shelf);
    const menu = open.salon?.menu;
    const shelf = open.salon?.shelf ?? [];
    if (menu === undefined || menu === null) throw new Error("no menu");
    const booked = booking.colours.top;
    const bookedIndex = menu.top.colours.indexOf(booked);
    const other = menu.top.colours[1 - bookedIndex];
    if (other === undefined) throw new Error("no other colour");
    const emptied = {
      ...open,
      salon: {
        ...(open.salon ?? { shelf: [] }),
        shelf: shelf.map((tray) =>
          tray.tier === "top"
            ? { ...tray, left: (bookedIndex === 0 ? [0, 6] : [6, 0]) as [number, number] }
            : tray,
        ),
      },
    } as GameState;
    const swapped = reduce(emptied, { type: "plateItem", tableIndex: 0, tier: "top", colour: other });
    expect(swapped.salon?.session?.tables[0]?.plated.top?.swapped).toBe(true);
    const fullShelf = reduce(open, { type: "plateItem", tableIndex: 0, tier: "top", colour: other });
    if (open.salon?.shelf.find((tray) => tray.tier === "top")?.left[bookedIndex] !== 0)
      expect(fullShelf).toBe(open);
  });

  it("pours to a 150 ml line with a band that the Gooseneck Teapot widens", () => {
    const salon = salonTestGame();
    expect(teaBand(salon)).toBeCloseTo(0.06);
    expect(teaBand({ ...salon, upgrades: ["gooseneck-teapot"] })).toBeCloseTo(0.072);
    expect(teaBand(salonTestGame({ difficulty: "relaxed" }))).toBeCloseTo(0.078);
    expect(pourAccuracy({ ml: 150, actions: 1, assisted: false, band: 0.06 })).toBe(1);
    expect(pourAccuracy({ ml: 159, actions: 1, assisted: false, band: 0.06 })).toBe(1);
    expect(pourAccuracy({ ml: 168, actions: 1, assisted: false, band: 0.06 })).toBeCloseTo(2 / 3, 5);
    expect(pourAccuracy({ ml: 150, actions: 1, assisted: true, band: 0.06 })).toBe(0.8);
    const open = reduce(salonDay(stocked()), { type: "openTables" });
    expect(reduce(open, { type: "pourTea", tableIndex: 0, ml: 301, actions: 1, assisted: false })).toBe(open);
    expect(reduce(open, { type: "pourTea", tableIndex: 0, ml: 150, actions: 0, assisted: false })).toBe(open);
    const poured = reduce(open, { type: "pourTea", tableIndex: 0, ml: 150, actions: 1, assisted: false });
    expect(poured.salon?.session?.tables[0]?.pour?.ml).toBe(150);
  });

  it("pays each table once: base, stand, pour, booking and season bonus", () => {
    const day = salonDay(stocked());
    const table = (overrides: Partial<TableState> = {}): TableState => ({
      plated: {
        top: { colour: "blush", quality: 100, seasonTag: true, swapped: false },
        middle: { colour: "ivory", quality: 100, seasonTag: false, swapped: false },
        bottom: { colour: "sage", quality: 100, seasonTag: false, swapped: false },
      },
      pour: { ml: 150, actions: 1, assisted: false, band: 0.06 },
      served: false,
      pay: 0,
      ...overrides,
    });
    expect(tablePay(day, table())).toBe(29 + 12 + 6 + 4 + 3);
    const swapped = table({
      plated: {
        ...table().plated,
        middle: { colour: "sage", quality: 100, seasonTag: false, swapped: true },
      },
    });
    expect(tablePay(day, swapped)).toBe(29 + 12 + 6 - 4 + 3);
    expect(tablePay({ ...day, upgrades: ["silver-stands"] }, table())).toBe(Math.round(54 * 1.1));
    expect(tablePay(salonTestGame({ trait: "charmer" }), table())).toBe(55);
    for (const difficulty of ["relaxed", "standard", "challenging"] as const)
      expect(tablePay(salonTestGame({ difficulty }), table())).toBe(54);
  });

  it("serves every table, sends leftovers to the counter and pays coins and buzz only", () => {
    const day = salonDay(stocked());
    const served = serveTables(day);
    const summary = served.salon?.lastSummary;
    expect(summary?.served).toBe(4);
    expect(summary?.coins).toBeGreaterThan(4 * 45);
    expect(served.coins).toBe(day.coins + (summary?.coins ?? 0));
    expect(served.reputation).toBe(day.reputation);
    expect(served.buzz).toBe(Math.min(100, day.buzz + 8));
    expect(served.salon?.shelf).toEqual([]);
    expect((summary?.toCounter ?? 0) + (summary?.shared ?? 0)).toBe(18 - 12);
    expect(served.counter.trays.length).toBeGreaterThan(0);
    expect(reduce(served, { type: "openTables" })).toBe(served);
    expect(served.pantry.teas["garden-mint"]).toBeLessThanOrEqual(day.pantry.teas["garden-mint"]);
  });

  it("refuses to serve an unfinished table or without tea in the tins", () => {
    const open = reduce(salonDay(stocked()), { type: "openTables" });
    expect(reduce(open, { type: "serveTable", tableIndex: 0 })).toBe(open);
    const noTea = {
      ...open,
      pantry: {
        ...open.pantry,
        teas: { "garden-mint": 0, "apple-cinnamon": 0, "red-bush-vanilla": 0, "hot-cocoa": 0 },
      },
    };
    const ready = serveTables(noTea);
    expect(ready.salon?.lastSummary?.served).toBe(0);
  });
});
