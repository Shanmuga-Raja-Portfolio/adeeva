import { describe, expect, it } from "vitest";
import { FESTIVAL_IDS } from "../content/festival";
import { festivalById } from "./catalog";
import { festivalToday } from "./festivalBoard";
import type { GameState } from "./gameState";
import { truckOf, type TruckState } from "./path";
import { nightOfWeek } from "./pathCalendar";
import { reduce } from "./reduce";
import { crossroadsReady, dispatchAll, must, playWholeService, settleStories } from "./testPlaythrough";
import { festivalCost, festivalGuests, forecastFestival, openFestivalIssues } from "./truckDay";

const TRIO = ["kelewele", "elote", "jollof-rice"];

function truck(state: GameState): TruckState {
  const found = truckOf(state);
  if (found === null) throw new Error("not a truck");
  return found;
}

function onTheRoad(seed = 7): GameState {
  return settleStories(
    dispatchAll(must(crossroadsReady({ seed }), { type: "choosePath", path: "truck", nameCard: null }), [
      { type: "setPathMenu", dishIds: TRIO },
    ]),
  );
}

function toFestival(state: GameState): GameState {
  let next = state;
  for (let guard = 0; guard < 10 && festivalToday(truck(next), next.calendar.day) === null; guard += 1)
    next = settleStories(must(next, { type: "endDay" }));
  return next;
}

describe("Clementine, the food truck", () => {
  it("rolls three festival days a week among days 2 to 6, and every festival within three weeks", () => {
    let state = onTheRoad();
    const seen = new Set<string>();
    for (let day = 1; day <= 21; day += 1) {
      const board = truck(state).board;
      expect(board.length).toBeLessThanOrEqual(3);
      for (const slot of board) {
        expect(nightOfWeek(slot.day)).toBeGreaterThanOrEqual(2);
        expect(nightOfWeek(slot.day)).toBeLessThanOrEqual(6);
        seen.add(slot.festivalId);
      }
      state = settleStories(must(state, { type: "endDay" }));
    }
    expect(seen.size).toBe(FESTIVAL_IDS.length);
  });

  it("splits a 40-portion fridge across exactly three dishes", () => {
    const state = onTheRoad();
    expect(truck(state).menu.map((entry) => entry.par)).toEqual([14, 13, 13]);
    expect(reduce(state, { type: "setPathMenu", dishIds: ["kelewele", "elote"] })).toBe(state);
    expect(reduce(state, { type: "setPar", dishId: "kelewele", count: 15 })).toBe(state);
    const less = must(state, { type: "setPar", dishId: "elote", count: 5 });
    expect(must(less, { type: "setPar", dishId: "kelewele", count: 22 }).path?.kind).toBe("truck");
  });

  it("brings a crowd by reputation, and the festival's tastes make matching dishes more popular", () => {
    const state = toFestival(onTheRoad());
    expect(festivalGuests(state, 45)).toBe(Math.round(45 * (0.5 + state.reputation / 200)));
    const plan = forecastFestival(state, truck(state));
    expect(plan?.guests).toBe(
      festivalGuests(state, festivalById(truck(state).board[0]?.festivalId ?? "kite-day").crowd),
    );
  });

  it("pays the pitch and helper up front, plays a Hatch Rush and sells from the fridge", () => {
    const state = toFestival(onTheRoad());
    const slot = festivalToday(truck(state), state.calendar.day);
    if (slot === null) throw new Error("no festival");
    expect(openFestivalIssues(state, "teo")).toContain("Pick a helper for the day.");
    const cost = festivalCost(state, truck(state));
    const open = must(state, { type: "openFestival", helperId: "nilufar" });
    expect(open.coins).toBe(state.coins - cost);
    expect(open.service?.kind).toBe("festival");
    expect(open.service?.plan.railSize).toBe(3);
    expect(open.service?.tickets).toHaveLength(8);
    expect(reduce(open, { type: "openFestival", helperId: "nilufar" })).toBe(open);
    const done = playWholeService(open);
    const report = truck(done).lastFestival;
    expect(report?.festivalId).toBe(slot.festivalId);
    expect(report?.ribbon).toBe(true);
    expect(truck(done).ribbons).toEqual([slot.festivalId]);
    expect(truck(done).visited).toEqual([slot.festivalId]);
    expect(done.story.seen).toContain("tr-first-ribbon");
    expect(done.coins).toBe(open.coins + (report?.plateCoins ?? 0));
    expect(reduce(done, { type: "openFestival", helperId: "nilufar" })).toBe(done);
  });

  it("wins Festival Favourite at three ribbons and ends the chapter after all eight festivals", () => {
    const state = toFestival(onTheRoad());
    const slot = festivalToday(truck(state), state.calendar.day);
    if (slot === null) throw new Error("no festival");
    const others = FESTIVAL_IDS.filter((id) => id !== slot.festivalId);
    const nearly = { ...state, path: { ...truck(state), ribbons: others.slice(0, 2), visited: others } };
    const done = playWholeService(must(nearly, { type: "openFestival", helperId: "lin" }));
    expect(truck(done).awards).toContain("festival-favourite");
    expect(truck(done).finished).toBe(true);
    expect(done.story.seen).toContain("tr-chapter-end");
  });

  it("takes one private order at a time", () => {
    let state = onTheRoad();
    for (let guard = 0; guard < 6 && state.gigs.offers.length < 2; guard += 1)
      state = settleStories(must(state, { type: "endDay" }));
    const [first, second] = state.gigs.offers;
    if (first === undefined || second === undefined) throw new Error("expected two offers");
    const one = must(state, { type: "acceptOffer", offerId: first.id });
    expect(reduce(one, { type: "acceptOffer", offerId: second.id })).toBe(one);
  });

  it("hands back the same state when Hollis has nothing left to change", () => {
    const relaxed = settleStories(
      must(crossroadsReady({ difficulty: "relaxed" }), { type: "choosePath", path: "truck", nameCard: null }),
    );
    const menu = must(relaxed, { type: "askHollis", desk: "menu" });
    expect(reduce(menu, { type: "askHollis", desk: "menu" })).toBe(menu);
    const ready = must(menu, { type: "askHollis", desk: "ready" });
    expect(reduce(ready, { type: "askHollis", desk: "ready" })).toBe(ready);
  });
});
