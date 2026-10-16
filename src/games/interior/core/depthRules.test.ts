import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import { weekNumber } from "../../../engine/weekday";
import type { GameState } from "./gameState";
import {
  hire,
  newShowHomeGame,
  planHome,
  planShow,
  readyHome,
  stageHome,
  startHome,
} from "./larkspurPlaythrough";
import { showHomeCatchUp } from "./offers";
import { reduce } from "./reduce";
import { newTestGame, settleStories } from "./testPlaythrough";

const PLAN = { tour: [1], music: "beach-pop", time: "morning", fromAchebe: false } as const;

const DEPTH_ACTIONS: readonly Action[] = [
  { type: "chooseStoryOption", beatId: "is-larkspur-offer", choiceId: "take-keys" },
  { type: "openLarkspur" },
  { type: "startProject", storyId: "seaside-days" },
  { type: "placePurpose", purposeId: "kids", spaceIndex: 0 },
  { type: "clearSpace", spaceIndex: 0 },
  { type: "useAchebeMap" },
  { type: "confirmMap" },
  { type: "togglePalettePaint", paintId: "sunflower" },
  { type: "setHallFloor", floorId: "oak-boards" },
  { type: "useAchebePalette" },
  { type: "confirmPalette" },
  { type: "openHomeRoom", roomIndex: 0 },
  { type: "closeHomeRoom" },
  { type: "topUpPurse" },
  { type: "hireCrew", crewId: "rosa" },
  { type: "finishCrew", crewId: "rosa" },
  { type: "assignCrew", crewId: "rosa", roomIndex: 0, job: "paint" },
  { type: "coachCrew", record: { job: "light", col: 1, row: 1 } },
  { type: "planOpenHouse", plan: PLAN },
  { type: "stageOpenHouse" },
  { type: "chooseNextPlot", move: true },
  { type: "pickTray", zone: "bottom" },
  { type: "choosePaint", slot: "lower", paintId: "sunflower" },
];

function same(state: GameState, actions: readonly Action[], except: readonly Action["type"][] = []): void {
  for (const action of actions)
    if (!except.includes(action.type)) expect(reduce(state, action), action.type).toBe(state);
}

describe("every Show-Home action", { timeout: 60_000 }, () => {
  it("returns the same state in a Room Designer save", () => {
    same(settleStories(newTestGame()), DEPTH_ACTIONS);
  });

  it("returns the same state before a home is started, except hiring", () => {
    same(newShowHomeGame(), DEPTH_ACTIONS, ["startProject", "hireCrew"]);
    const fresh = newShowHomeGame();
    expect(
      reduce(fresh, {
        type: "startProject",
        storyId: "get-togethers" === fresh.larkspur?.storyOffer[0] ? "seaside-days" : "get-togethers",
      }),
    ).toBe(fresh);
  });

  it("returns the same state on the map step for anything but map moves", () => {
    const mapping = startHome(newShowHomeGame());
    same(mapping, DEPTH_ACTIONS, ["placePurpose", "useAchebeMap", "hireCrew", "topUpPurse"]);
    expect(reduce(mapping, { type: "placePurpose", purposeId: "hall", spaceIndex: 1 })).toBe(mapping);
    expect(reduce(mapping, { type: "placePurpose", purposeId: "study", spaceIndex: 1 })).toBe(mapping);
    expect(reduce(mapping, { type: "placePurpose", purposeId: "kids", spaceIndex: 7 })).toBe(mapping);
  });

  it("returns the same state on the palette step for anything but palette moves", () => {
    const palette = reduce(reduce(startHome(newShowHomeGame()), { type: "useAchebeMap" }), {
      type: "confirmMap",
    });
    same(palette, DEPTH_ACTIONS, ["togglePalettePaint", "useAchebePalette", "hireCrew", "topUpPurse"]);
    expect(reduce(palette, { type: "setHallFloor", floorId: "oak-boards" })).toBe(palette);
    expect(reduce(palette, { type: "confirmPalette" })).toBe(palette);
  });

  it("returns the same state once the home is planned, for planner and staging moves", () => {
    const rooms = hire(planHome(startHome(newShowHomeGame())), ["rosa"]);
    for (const action of [
      { type: "planOpenHouse", plan: PLAN },
      { type: "stageOpenHouse" },
      { type: "chooseNextPlot", move: false },
      { type: "closeHomeRoom" },
      { type: "openHomeRoom", roomIndex: 5 },
      { type: "assignCrew", crewId: "tobi", roomIndex: 0, job: "paint" },
    ] as const)
      expect(reduce(rooms, action), action.type).toBe(rooms);
    const planner = readyHome(rooms);
    expect(reduce(planner, { type: "planOpenHouse", plan: { ...PLAN, tour: [0] } })).toBe(planner);
    expect(reduce(planner, { type: "openHomeRoom", roomIndex: 0 })).toBe(planner);
  });

  it("replays identically from the same seed and actions", () => {
    const run = () => stageHome(planShow(readyHome(planHome(startHome(newShowHomeGame({ seed: 31 }))))));
    expect(run()).toEqual(run());
  });
});

describe("Bellwind's catch-up", { timeout: 60_000 }, () => {
  function loftDay(day: number, reputation: number): GameState {
    return { ...settleStories(newTestGame()), calendar: { day, hoursLeft: 10 }, reputation, showHomeWeek: 0 };
  }

  it("draws Bellwind first from weekday 3 when none has arrived this week", () => {
    expect(showHomeCatchUp(loftDay(10, 22))).toBe(true);
    expect(showHomeCatchUp(loftDay(9, 22))).toBe(false);
    expect(showHomeCatchUp(loftDay(10, 21))).toBe(false);
    expect(showHomeCatchUp({ ...loftDay(10, 22), showHomeWeek: weekNumber(10) })).toBe(false);
    expect(showHomeCatchUp({ ...loftDay(10, 22), career: "development" })).toBe(false);
    const before = loftDay(9, 22);
    const rolled = reduce({ ...before, gigs: { ...before.gigs, offers: [] } }, { type: "endDay" });
    expect(rolled.gigs.offers.some((offer) => offer.clientId === "bellwind")).toBe(true);
    expect(rolled.showHomeWeek).toBe(weekNumber(10));
  });
});
