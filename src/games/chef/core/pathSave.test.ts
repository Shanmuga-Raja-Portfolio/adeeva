import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import { crossroadsReady, dispatchAll, must, playWholeService, settleStories } from "./testPlaythrough";

function roundTrip(state: GameState): GameState {
  const parsed = parseSave(serialize(state));
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.state;
}

function legacy(state: GameState): string {
  const raw = JSON.parse(serialize(state)) as Record<string, unknown>;
  delete raw.path;
  delete raw.peeked;
  const service = raw.service as Record<string, unknown> | null;
  if (service !== null) {
    delete service.spotlight;
    const plan = service.plan as Record<string, unknown>;
    delete plan.lampHoldSeconds;
    delete plan.pans;
  }
  return JSON.stringify({ ...raw, schemaVersion: 1 });
}

function tampered(state: GameState, change: (raw: Record<string, unknown>) => void): string {
  const raw = JSON.parse(serialize(state)) as Record<string, unknown>;
  change(raw);
  return JSON.stringify(raw);
}

const RESTAURANT: readonly Action[] = [
  { type: "choosePath", path: "restaurant", nameCard: "tide-and-thyme" },
  { type: "setPathMenu", dishIds: ["dal-tadka", "jollof-rice", "kelewele", "elote", "miso-soup"] },
  { type: "hireStaff", staffId: "nilufar" },
  { type: "toggleShift", staffId: "nilufar", night: 2 },
  { type: "endDay" },
];

function restaurantNight(seed = 7): GameState {
  return settleStories(
    must(settleStories(dispatchAll(crossroadsReady({ seed }), RESTAURANT)), { type: "openNight" }),
  );
}

describe("saves with career paths", () => {
  it("load a version 1 head-chef save and still reach the Crossroads", () => {
    const ready = crossroadsReady();
    const parsed = parseSave(legacy(ready));
    expect(parsed).toEqual({ ok: true, state: ready });
    if (!parsed.ok) return;
    const chosen = must(parsed.state, { type: "choosePath", path: "truck", nameCard: null });
    expect(chosen.path?.kind).toBe("truck");
  });

  it("upgrade a version 1 save with a Hall service still on the pass", () => {
    const head = settleStories(
      must(crossroadsReady(), {
        type: "setMenu",
        dishIds: ["dal-tadka", "jollof-rice", "kelewele", "elote", "miso-soup", "ratatouille"],
      }),
    );
    const offer = head.board.shifts[0];
    if (offer === undefined) throw new Error("no shift");
    const open = must(head, {
      type: "startShift",
      offerId: offer.id,
      setup: { special: null, helpers: ["lin", "yaw"] },
    });
    const parsed = parseSave(legacy(open));
    expect(parsed).toEqual({ ok: true, state: open });
  });

  it("round-trip each path mid-service, mid-prep and with a cookbook", () => {
    const night = restaurantNight();
    expect(roundTrip(night)).toEqual(night);
    const after = playWholeService(night);
    expect(roundTrip(after)).toEqual(after);
    const truck = settleStories(
      dispatchAll(crossroadsReady(), [{ type: "choosePath", path: "truck", nameCard: null }]),
    );
    expect(roundTrip(truck)).toEqual(truck);
    const tv = dispatchAll(crossroadsReady(), [
      { type: "choosePath", path: "tv", nameCard: null },
      { type: "prepSegment", dishId: "kelewele" },
      { type: "placeCue", cue: "ready" },
      { type: "pickTip", index: 1, tip: 2 },
    ]);
    expect(roundTrip(tv)).toEqual(tv);
  });

  it("refuse path saves that don't fit together", () => {
    const night = restaurantNight();
    expect(parseSave(tampered(night, (raw) => (raw.service = null))).ok).toBe(false);
    expect(
      parseSave(
        tampered(night, (raw) => {
          (raw.path as { kind: string }).kind = "castle";
        }),
      ).ok,
    ).toBe(false);
    expect(
      parseSave(
        tampered(night, (raw) => {
          (raw.path as { nameCard: string }).nameCard = "the-ritz";
        }),
      ).ok,
    ).toBe(false);
    expect(
      parseSave(
        tampered(night, (raw) => {
          (raw.path as { team: unknown[] }).team = ["tavi", "lin", "yaw", "esme", "sol"].map((staffId) => ({
            staffId,
            nights: [],
          }));
        }),
      ).ok,
    ).toBe(false);
    expect(parseSave(tampered(night, (raw) => (raw.peeked = ["tv", "tv"]))).ok).toBe(false);
    const firstDish = (change: { par?: number; price?: number }) =>
      tampered(night, (raw) => {
        const [first, ...rest] = (raw.path as { menu: object[] }).menu;
        (raw.path as { menu: object[] }).menu = [{ ...first, ...change }, ...rest];
      });
    expect(parseSave(firstDish({})).ok).toBe(true);
    expect(parseSave(firstDish({ par: 31 })).ok).toBe(false);
    expect(parseSave(firstDish({ price: 0 })).ok).toBe(false);
    expect(parseSave(firstDish({ price: 999 })).ok).toBe(false);
    expect(parseSave(tampered(night, (raw) => (raw.rung = "sous"))).ok).toBe(false);
  });

  it("refuse a truck fridge that holds more than forty portions", () => {
    const truck = settleStories(
      dispatchAll(crossroadsReady(), [
        { type: "choosePath", path: "truck", nameCard: null },
        { type: "setPathMenu", dishIds: ["dal-tadka", "jollof-rice", "elote"] },
      ]),
    );
    expect(roundTrip(truck)).toEqual(truck);
    const stuffed = tampered(truck, (raw) => {
      for (const entry of (raw.path as { menu: { par: number }[] }).menu) entry.par = 20;
    });
    expect(parseSave(stuffed).ok).toBe(false);
  });

  it("refuse a cookbook with repeated chapters, extra cards or a dish twice", () => {
    const tv = dispatchAll(crossroadsReady(), [{ type: "choosePath", path: "tv", nameCard: null }]);
    const path = tv.path;
    if (path === null || path.kind !== "tv") throw new Error("not a studio");
    const card = (dishId: string) => ({ dishId, tip: 0 });
    const chapter = (chapterId: string, cards: { dishId: string; tip: number }[]) => ({
      chapterId,
      cards,
      spoons: null,
      review: null,
    });
    const book = (chapters: unknown[]) =>
      serialize({ ...tv, path: { ...path, book: { chapters, launched: false } } } as GameState);
    const fair = [
      chapter("weeknight-warmers", [card("dal-tadka")]),
      chapter("festival-food", []),
      chapter("fresh-and-bright", []),
      chapter("around-the-hall", []),
    ];
    expect(parseSave(book(fair)).ok).toBe(true);
    expect(parseSave(book([0, 1, 2, 3].map(() => chapter("around-the-hall", [])))).ok).toBe(false);
    expect(parseSave(book([fair[1], fair[0], fair[2], fair[3]])).ok).toBe(false);
    const crowded = chapter(
      "weeknight-warmers",
      ["dal-tadka", "sambar", "minestrone", "chana-masala"].map(card),
    );
    expect(parseSave(book([crowded, ...fair.slice(1)])).ok).toBe(false);
    const twice = chapter("festival-food", [card("dal-tadka")]);
    expect(parseSave(book([fair[0], twice, ...fair.slice(2)])).ok).toBe(false);
  });

  it("play the same restaurant night the same way from the same seed", () => {
    expect(playWholeService(restaurantNight(3))).toEqual(playWholeService(restaurantNight(3)));
    expect(playWholeService(restaurantNight(3)).path).not.toEqual(playWholeService(restaurantNight(4)).path);
  });

  it("ignore every path action before a path is chosen", () => {
    const ready = crossroadsReady();
    const actions: Action[] = [
      { type: "setPathMenu", dishIds: ["dal-tadka"] },
      { type: "setPrice", dishId: "dal-tadka", price: 6 },
      { type: "setPar", dishId: "dal-tadka", count: 3 },
      { type: "askHollis", desk: "menu" },
      { type: "hireStaff", staffId: "tavi" },
      { type: "partWays", staffId: "tavi" },
      { type: "toggleShift", staffId: "tavi", night: 2 },
      { type: "openNight" },
      { type: "openFestival", helperId: "lin" },
      { type: "prepSegment", dishId: "kelewele" },
      { type: "placeCue", cue: "ready" },
      { type: "clearCues" },
      { type: "pickTip", index: 0, tip: 0 },
      { type: "dropSegment" },
      { type: "startSegment" },
      { type: "startBook" },
      { type: "addRecipeCard", chapterId: "festival-food", dishId: "kelewele", tip: 0 },
      { type: "launchBook" },
      { type: "choosePath", path: "moon", nameCard: null },
    ];
    for (const action of actions) expect(reduce(ready, action), action.type).toBe(ready);
  });
});
