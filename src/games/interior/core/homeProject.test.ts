import { describe, expect, it } from "vitest";
import { HOME_STORIES } from "../content/homeStory";
import { weeklyBill } from "./calendar";
import { homeStoryById } from "./catalog";
import type { GameState } from "./gameState";
import { isRoomReady } from "./homeRoom";
import {
  closeRoom,
  endDays,
  homeRecipe,
  newShowHomeGame,
  openRoom,
  planHome,
  planShow,
  playHomeRoom,
  project,
  readyHome,
  stageHome,
  startHome,
  toStagingDay,
} from "./larkspurPlaythrough";
import { firstStagingDay, lateDay, openHouseDay } from "./projectCalendar";
import { purseLeft } from "./purse";
import { reduce } from "./reduce";
import { tellsStory } from "./storyPieces";
import { lastGigId, playRunTo, settleStories, withOrder } from "./testPlaythrough";

const PLANNED = planHome(startHome(newShowHomeGame()));

function withSpent(state: GameState, spent: number): GameState {
  const larkspur = state.larkspur;
  if (larkspur === null) throw new Error("No Larkspur");
  return { ...state, larkspur: { ...larkspur, project: { ...project(state), spent } } };
}

function opened(state: GameState, index = 0): GameState {
  return openRoom(state, index);
}

describe("a home project", { timeout: 60_000 }, () => {
  it("pays half the fee on signing and opens the plan for an hour", () => {
    const fresh = newShowHomeGame();
    const started = startHome(fresh);
    expect(started.coins - fresh.coins).toBe(Math.round(project(started).fee / 2));
    expect(project(started).fee).toBe(330);
    expect(project(started).purse).toBe(150);
    expect(project(PLANNED).stage).toBe("rooms");
    expect(PLANNED.calendar.hoursLeft).toBe(started.calendar.hoursLeft - 1);
    expect(reduce(started, { type: "startProject", storyId: HOME_STORIES[0]?.id ?? "seaside-days" })).toBe(
      started,
    );
  });

  it("builds each home-room brief from its purpose, the story palette and the purse", () => {
    const state = opened(PLANNED, 1);
    const run = state.activeRun;
    if (run === null || run.purpose.kind !== "home-room") throw new Error("No home room");
    const story = homeStoryById(project(state).storyId);
    expect(run.gigId).toBe("home-garden-flat-1");
    expect(run.brief.clientId).toBe("bellwind");
    expect(run.brief.showHome).toBe(false);
    expect(run.brief.requiredTags).toEqual(["cosy"]);
    expect(run.brief.mustHaves.map((need) => need.itemId)).toEqual(["sofa", "armchair"]);
    expect(run.brief.favouredColours).toHaveLength(2);
    expect(run.brief.favouredColours.every((colour) => story.palette.includes(colour))).toBe(true);
    expect(run.brief.avoidColours).toEqual([]);
    expect(run.brief.budget).toBe(purseLeft(project(state)));
    expect(run.brief.fee).toBe(0);
    expect(run.brief.minQuality).toBe(0);
    expect(run.brief.deadlineDay).toBe(project(state).startDay + 13);
  });

  it("never reveals a home room, never lets it lapse and keeps it apart from makeovers", () => {
    const style = playHomeRoom(PLANNED, 0, "reveal");
    const reopened = reduce(style, { type: "openHomeRoom", roomIndex: 0 });
    expect(reopened).toBe(style);
    const room = opened(PLANNED, 0);
    expect(reduce(room, { type: "reveal" })).toBe(room);
    expect(reduce(room, { type: "abandonRun" })).toBe(room);
    const late = endDays(room, 4);
    expect(late.activeRun?.purpose.kind).toBe("home-room");
    const booked = withOrder(room, "nana-pearl");
    expect(reduce(booked, { type: "startOrder", gigId: lastGigId(booked) })).toBe(booked);
    const makeover = reduce(withOrder(PLANNED, "nana-pearl"), { type: "startOrder", gigId: "gig-2" });
    const busy = makeover.activeRun === null ? withOrder(PLANNED, "nana-pearl") : makeover;
    if (busy.activeRun !== null) expect(reduce(busy, { type: "openHomeRoom", roomIndex: 0 })).toBe(busy);
  });

  it("stores a room with all its work and resumes it", () => {
    const halfway = playHomeRoom(PLANNED, 0, "floor");
    const stored = project(halfway).rooms[0];
    expect(stored?.stage).toBe("floor");
    const resumed = opened(halfway, 0);
    expect(resumed.activeRun).toBe(stored);
    expect(closeRoom(resumed).larkspur?.project?.rooms[0]).toBe(stored);
  });

  it("spends the purse, never coins, and tops it up only when asked", () => {
    const shopped = playHomeRoom(PLANNED, 0, "paint");
    expect(shopped.coins).toBe(PLANNED.coins);
    expect(project(shopped).spent).toBeGreaterThan(0);
    const broke = withSpent(PLANNED, 150);
    const shop = reduce(reduce(opened(broke, 0), { type: "goToStage", stage: "plan" }), { type: "tidyUp" });
    expect(purseLeft(project(shop))).toBe(0);
    const topped = reduce(broke, { type: "topUpPurse" });
    expect(topped.coins).toBe(broke.coins - 10);
    expect(purseLeft(project(topped))).toBe(10);
    expect(reduce({ ...broke, coins: 5 }, { type: "topUpPurse" }).coins).toBe(5);
  });

  it("lets Bellwind cover a short purse on Relaxed", () => {
    const relaxed = planHome(startHome(newShowHomeGame({ difficulty: "relaxed" })));
    expect(project(relaxed).purse).toBe(180);
    const broke = withSpent(relaxed, 180);
    const room = opened(broke, 0);
    const run = room.activeRun;
    if (run === null) throw new Error("No room");
    const bought = closeRoom(playRunTo(room, homeRecipe(room, run), "paint"));
    expect(project(bought).added).toBeGreaterThan(0);
    expect(purseLeft(project(bought))).toBe(0);
    expect(bought.coins).toBe(broke.coins);
  });

  it("charges 140 rent while a project is open and 90 otherwise", () => {
    expect(weeklyBill(newShowHomeGame())).toBe(90);
    expect(weeklyBill(PLANNED)).toBe(140);
    const challenging = planHome(startHome(newShowHomeGame({ difficulty: "challenging" })));
    expect(weeklyBill(challenging)).toBe(210);
  });

  it("opens the staging window from day 7 once every room is ready and holds rent to day 12", () => {
    const ready = planShow(readyHome(PLANNED));
    const start = project(ready).startDay;
    expect(firstStagingDay(project(ready))).toBe(start + 7);
    expect(openHouseDay(project(ready))).toBe(start + 12);
    expect(reduce(ready, { type: "stageOpenHouse" })).toBe(ready);
    const staged = stageHome(ready);
    expect(staged.calendar.day).toBe(start + 7);
    expect(project(staged).stage).toBe("done");
    expect(weeklyBill(staged)).toBe(140);
    const held = endDays(staged, 5);
    expect(held.calendar.day).toBe(start + 12);
    expect(weeklyBill(held)).toBe(140);
    const next = endDays(held, 1);
    expect(next.larkspur?.project).toBeNull();
    expect(weeklyBill(next)).toBe(90);
    expect(next.larkspur?.nextStartDay).toBe(start + 13);
    expect(
      reduce(held, { type: "startProject", storyId: held.larkspur?.storyOffer[0] ?? "seaside-days" }),
    ).toBe(held);
  });

  it("takes 10 off a late Open House on day 13, except on Relaxed", () => {
    const ready = planShow(readyHome(PLANNED));
    const onTime = stageHome(ready);
    const late = settleStories(reduce(endDays(toStagingDay(ready), 6), { type: "stageOpenHouse" }));
    expect(late.calendar.day).toBe(lateDay(project(ready)));
    const early = onTime.larkspur?.history.at(-1);
    const slow = late.larkspur?.history.at(-1);
    expect(slow?.late).toBe(true);
    expect((early?.overall ?? 0) - (slow?.overall ?? 0)).toBe(10);
  });

  it("opens the doors itself the morning after day 13, finishing rooms at 0.6", () => {
    const halfway = playHomeRoom(PLANNED, 0, "floor");
    const start = project(halfway).startDay;
    const auto = endDays(halfway, start + 14 - halfway.calendar.day);
    const record = auto.larkspur?.history.at(-1);
    expect(record?.auto).toBe(true);
    expect(record?.late).toBe(true);
    expect(auto.story.seen).toContain("is-doors-opened");
    expect(auto.larkspur?.project?.rooms.every((room) => isRoomReady(room)) ?? true).toBe(true);
  });

  it("tells the story with a story piece on a palette-coloured surface", () => {
    const ready = readyHome(PLANNED);
    const story = homeStoryById(project(ready).storyId);
    for (const room of project(ready).rooms) if (room !== null) expect(tellsStory(room, story)).toBe(true);
    const bare = project(ready).rooms[0];
    if (bare === null || bare === undefined) throw new Error("No room");
    expect(tellsStory({ ...bare, decor: [] }, story)).toBe(false);
    expect(
      tellsStory(
        { ...bare, plan: { ...bare.plan, wallPaint: "chalk-white", floor: "walnut-boards" } },
        { ...story, palette: ["plum"] },
      ),
    ).toBe(false);
  });
});
