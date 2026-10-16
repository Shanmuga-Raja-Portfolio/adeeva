import { describe, expect, it } from "vitest";
import { DECOR_IDS } from "../content/decor";
import type { GameState } from "./gameState";
import {
  closeRoom,
  homeRecipe,
  newShowHomeGame,
  openRoom,
  planHome,
  planShow,
  project,
  readyHome,
  stageHome,
  startHome,
  toStagingDay,
} from "./larkspurPlaythrough";
import { purseLeft } from "./purse";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import type { Stock } from "./stock";
import { playRunTo, settleStories } from "./testPlaythrough";

function total(stock: Stock): number {
  return Object.values(stock).reduce(
    (sum, shelf: Readonly<Record<string, number>>) => sum + Object.values(shelf).reduce((a, b) => a + b, 0),
    0,
  );
}

function atShop(state: GameState, index = 0): GameState {
  const opened = openRoom(state, index);
  const run = opened.activeRun;
  if (run === null) throw new Error("No room");
  return reduce(playRunTo(opened, homeRecipe(opened, run), "shop"), { type: "buyPlan" });
}

function buyDecorRun(state: GameState, count: number): GameState {
  let next = state;
  for (let index = 0; index < count; index += 1) {
    const decorId = DECOR_IDS[index % DECOR_IDS.length] ?? "potted-fern";
    next = reduce(next, { type: "buyDecor", decorId });
  }
  return next;
}

function untilDoorsOpen(state: GameState): GameState {
  let next = state;
  for (let guard = 0; guard < 20; guard += 1) {
    const ended = reduce(next, { type: "endDay" });
    if ((ended.larkspur?.history.length ?? 0) > (state.larkspur?.history.length ?? 0)) return ended;
    next = settleStories(ended);
  }
  throw new Error("The doors never opened");
}

describe("Bellwind's project shelf", { timeout: 60_000 }, () => {
  it("keeps purse-bought goods off the player's shelf, even on Relaxed", () => {
    const relaxed = planHome(startHome(newShowHomeGame({ difficulty: "relaxed" })));
    const before = relaxed.stock;
    const shopped = buyDecorRun(atShop(relaxed), 60);
    expect(shopped.coins).toBe(relaxed.coins);
    expect(shopped.stock.decor).toEqual(before.decor);
    expect(total(project(shopped).shelf)).toBeGreaterThanOrEqual(60);
    const done = untilDoorsOpen(closeRoom(shopped));
    expect(total(done.stock)).toBeLessThanOrEqual(total(before));
    expect(done.stock.decor).toEqual(before.decor);
    expect(done.larkspur?.project?.shelf === undefined || total(done.larkspur.project.shelf) === 0).toBe(
      true,
    );
  });

  it("uses the goods bought for a room when Bellwind finishes it himself", () => {
    const planned = planHome(startHome(newShowHomeGame()));
    let state = planned;
    for (let index = 0; index < project(state).rooms.length; index += 1)
      state = closeRoom(atShop(state, index));
    expect(total(project(state).shelf)).toBeGreaterThan(0);
    const done = untilDoorsOpen(state);
    expect(done.larkspur?.history[0]?.auto).toBe(true);
    expect(total(done.stock)).toBeLessThanOrEqual(total(planned.stock));
  });

  it("survives a save and load with goods on it", () => {
    const shopped = buyDecorRun(atShop(planHome(startHome(newShowHomeGame()))), 3);
    const loaded = parseSave(serialize(shopped));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.state).toEqual(shopped);
  });
});

describe("the purse top-up", { timeout: 60_000 }, () => {
  it("gives back unspent top-ups at the Open House", () => {
    const planned = planHome(startHome(newShowHomeGame({ seed: 41 })));
    let topped = planned;
    for (let tap = 0; tap < 10; tap += 1) topped = reduce(topped, { type: "topUpPurse" });
    expect(planned.coins - topped.coins).toBe(100);
    const play = (state: GameState) => stageHome(planShow(toStagingDay(readyHome(state))));
    const plain = play(planned);
    const back = play(topped);
    expect(back.coins).toBe(plain.coins);
    expect(back.larkspur?.history[0]?.prize.at(-1)?.amount).toBe(100);
  });

  it("is refused at the Supply Yard when the purse already covers the plan", () => {
    const planned = planHome(startHome(newShowHomeGame()));
    const opened = openRoom(planned, 0);
    const run = opened.activeRun;
    if (run === null) throw new Error("No room");
    const shop = playRunTo(opened, homeRecipe(opened, run), "shop");
    expect(purseLeft(project(shop))).toBeGreaterThan(0);
    expect(reduce(shop, { type: "topUpPurse" })).toBe(shop);
  });
});

describe("when Bellwind opens the doors", { timeout: 60_000 }, () => {
  it("tells only his story, not the player's first Open House", () => {
    const opened = untilDoorsOpen(planHome(startHome(newShowHomeGame())));
    expect(opened.story.queue).toContain("is-doors-opened");
    expect(opened.story.queue).not.toContain("is-first-open-house");
  });
});
