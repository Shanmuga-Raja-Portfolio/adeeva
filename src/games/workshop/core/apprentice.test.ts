import { describe, expect, it } from "vitest";
import { renAccuracy, renLevel, renWage } from "./apprentice";
import type { GameState } from "./gameState";
import { stageHours } from "./hourCost";
import { pieceQuality } from "./pieceQuality";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import { NOOK_PLAN, playSetUntil, READING_PLAN, showroomTestGame } from "./setPlaythrough";
import {
  BIRDHOUSE_PLAN,
  dispatchAll,
  lastGigId,
  newTestGame,
  playSteps,
  playUntil,
  runOf,
  settleStories,
  withActiveGig,
} from "./testPlaythrough";

function endDaysTo(state: GameState, day: number): GameState {
  let current = state;
  while (current.calendar.day < day) current = settleStories(reduce(current, { type: "endDay" }));
  return current;
}

const hired = () => reduce(showroomTestGame(), { type: "takeRenOn" });

describe("Ren, the apprentice", () => {
  it("is hired, paid weekly and given a week off without the wage", () => {
    const state = hired();
    expect(state.apprentice?.hired).toBe(true);
    expect(renWage(state)).toBe(40);
    expect(renWage({ ...state, profile: { ...state.profile, difficulty: "challenging" } })).toBe(60);
    expect(renWage({ ...state, profile: { ...state.profile, difficulty: "relaxed" } })).toBe(0);
    const off = reduce(state, { type: "giveRenWeekOff" });
    expect(renWage(off)).toBe(0);
    expect(reduce(off, { type: "giveRenWeekOff" })).toBe(off);
    let week = state;
    while (week.calendar.day < 8) week = settleStories(reduce(week, { type: "endDay" }));
    expect(week.apprentice?.paidThroughDay).toBe(14);
  });

  it("pays this week's wage on taking Ren on, so a week off before rent day saves nothing", () => {
    const start = showroomTestGame();
    const taken = reduce(start, { type: "takeRenOn" });
    expect(start.coins - taken.coins).toBe(40);
    expect(taken.apprentice?.paidThroughDay).toBe(7);
    const honest = endDaysTo(taken, 8);
    const dayBefore = endDaysTo(taken, 7);
    const dodged = endDaysTo(reduce(dayBefore, { type: "giveRenWeekOff" }), 8);
    const back = reduce(dodged, { type: "takeRenOn" });
    expect(back.apprentice?.hired).toBe(true);
    expect(back.coins).toBe(honest.coins);
    const again = reduce(reduce(honest, { type: "giveRenWeekOff" }), { type: "takeRenOn" });
    expect(again.coins).toBe(honest.coins);
    const broke = { ...start, coins: 39 };
    expect(reduce(broke, { type: "takeRenOn" })).toBe(broke);
  });

  it("rests with the shop, refusing jobs in a resting season", () => {
    const rested = reduce(hired(), { type: "restShowroom" });
    expect(rested.showroom?.rested).toBe(true);
    const atSand = playSetUntil(rested, READING_PLAN, "sand");
    expect(runOf(atSand).stage).toBe("sand");
    expect(reduce(atSand, { type: "handToRen", job: "sand" })).toBe(atSand);
  });

  it("levels every 8 jobs with fixed accuracies", () => {
    expect([0, 7, 8, 16, 40].map(renLevel)).toEqual([1, 1, 2, 3, 3]);
    expect([0, 8, 16].map(renAccuracy)).toEqual([0.74, 0.8, 0.86]);
  });

  it("fetches the boards with no trip hour", () => {
    const atTimber = dispatchAll(hired(), [
      { type: "startSet", templateId: "reading-corner" },
      { type: "goToStage", stage: "design" },
      { type: "chooseOption", slot: "edge", optionId: "square-edge" },
      { type: "chooseOption", slot: "legs", optionId: "straight-legs" },
      { type: "chooseOption", slot: "accent", optionId: "no-accent" },
      { type: "chooseWood", woodId: "birch" },
      { type: "goToStage", stage: "timber" },
    ]);
    const fetched = reduce(atTimber, { type: "handToRen", job: "fetch" });
    expect(fetched.calendar.hoursLeft).toBe(atTimber.calendar.hoursLeft);
    expect(fetched.coins).toBeLessThan(atTimber.coins);
    expect(runOf(fetched).renJobs).toEqual(["fetch"]);
    expect(reduce(fetched, { type: "handToRen", job: "fetch" })).toBe(fetched);
  });

  it("sands every surface at Ren's accuracy for no hours", () => {
    const atSand = playSetUntil(hired(), READING_PLAN, "sand");
    const sanded = reduce(atSand, { type: "handToRen", job: "sand" });
    const run = runOf(sanded);
    expect(Object.values(run.sanding).every((record) => record.renAccuracy === 0.74)).toBe(true);
    expect(stageHours(run, "sand")).toBe(0);
    expect(reduce(sanded, { type: "resetSurface", surfaceId: "0:side-1" })).toBe(sanded);
    expect(parseSave(serialize(sanded)).ok).toBe(true);
  });

  it("taps peg joints home, saving an hour, but never comb joints", () => {
    const atJoin = playSetUntil(hired(), READING_PLAN, "join");
    const pegged = reduce(atJoin, { type: "handToRen", job: "pegs" });
    const run = runOf(pegged);
    const ren = Object.values(run.joints).filter((record) => record.byApprentice);
    expect(ren).toHaveLength(6);
    expect(ren.every((record) => record.accuracy === 0.74 && record.offsetMm === 0)).toBe(true);
    expect(stageHours(run, "join")).toBe(3);
    const combSet = playSetUntil(hired(), { ...NOOK_PLAN, setJoint: "comb" }, "join");
    expect(reduce(combSet, { type: "handToRen", job: "pegs" })).toBe(combSet);
  });

  it("does at most two jobs a day, three with Ren's Own Bench", () => {
    const atJoin = playSetUntil(hired(), READING_PLAN, "join");
    const tired = { ...atJoin, apprentice: { hired: true, paidThroughDay: 0, jobsDone: 2, jobsToday: 2 } };
    expect(reduce(tired, { type: "handToRen", job: "pegs" })).toBe(tired);
    const benched = { ...tired, upgrades: ["ren-bench" as const] };
    expect(reduce(benched, { type: "handToRen", job: "pegs" })).not.toBe(benched);
    expect(reduce(tired, { type: "endDay" }).apprentice?.jobsToday).toBe(0);
  });

  it("queues a beat at level 2", () => {
    const atJoin = playSetUntil(hired(), READING_PLAN, "join");
    const almost = { ...atJoin, apprentice: { hired: true, paidThroughDay: 0, jobsDone: 7, jobsToday: 0 } };
    expect(reduce(almost, { type: "handToRen", job: "pegs" }).story.queue).toContain("ww-ren-level-2");
  });

  it("refuses saw work, a missing hire and the garage", () => {
    const atSaw = playSetUntil(hired(), READING_PLAN, "saw");
    expect(reduce(atSaw, { type: "handToRen", job: "sand" })).toBe(atSaw);
    const notHired = playSetUntil(showroomTestGame(), READING_PLAN, "sand");
    expect(reduce(notHired, { type: "handToRen", job: "sand" })).toBe(notHired);
    const garage = withActiveGig(settleStories(newTestGame()), "grandpa-teodor");
    const atJoin = playUntil(garage, lastGigId(garage), BIRDHOUSE_PLAN, "join");
    expect(reduce(atJoin, { type: "handToRen", job: "pegs" })).toBe(atJoin);
    expect(reduce(atJoin, { type: "takeRenOn" })).toBe(atJoin);
  });

  it("still lets a Ren-pegged birdhouse clear Grandpa Teodor's minimum", () => {
    const base = hired();
    const withGig = withActiveGig(base, "grandpa-teodor");
    const atJoin = playUntil(
      withGig,
      lastGigId(withGig),
      { ...BIRDHOUSE_PLAN, joinOffsetShare: 0.4 },
      "join",
    );
    const pegged = reduce(atJoin, { type: "handToRen", job: "pegs" });
    const sanded = playSteps(reduce(pegged, { type: "goToStage", stage: "sand" }), BIRDHOUSE_PLAN, "review");
    const quality = pieceQuality(sanded, runOf(sanded));
    expect(quality.join).toBeCloseTo(0.74, 6);
    expect(quality.quality).toBeGreaterThanOrEqual(withGig.gigs.active[0]?.brief.minQuality ?? 99);
  });
});
