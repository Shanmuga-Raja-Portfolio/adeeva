import { describe, expect, it } from "vitest";
import type { Point } from "../../../engine/geometry/point";
import { COACH_CORNER, COACH_LAMP, coachCrew } from "./coachCrew";
import { COACH_TAPE } from "./paintEdge";
import { coachedSkill, crewSkill, crewWage, EMPTY_CREW, SKILL_CAP, workSkill } from "./crewSkill";
import type { GameState } from "./gameState";
import {
  assign,
  crewRoom,
  endDays,
  hire,
  newShowHomeGame,
  planHome,
  planShow,
  playHomeRoom,
  project,
  readyHome,
  stageHome,
  startHome,
} from "./larkspurPlaythrough";
import { reduce } from "./reduce";
import { edgeSamples } from "./testPlaythrough";

const PLANNED = planHome(startHome(newShowHomeGame()));
const CREWED = hire(PLANNED, ["rosa", "tobi"]);

function tapeSamples(offset: number): Point[] {
  return edgeSamples(COACH_TAPE, offset);
}

describe("the crew", { timeout: 60_000 }, () => {
  it("grows with each job, caps at 0.86 and loses a little on Challenging", () => {
    const state = { profile: newShowHomeGame().profile, upgrades: [] as GameState["upgrades"] };
    expect(crewSkill(state, EMPTY_CREW, "rosa", "paint")).toBeCloseTo(0.8);
    expect(crewSkill(state, EMPTY_CREW, "rosa", "floor")).toBeCloseTo(0.64);
    const busy = {
      ...EMPTY_CREW,
      jobsDone: { ...EMPTY_CREW.jobsDone, rosa: { paint: 20, floor: 0, light: 0 } },
    };
    expect(crewSkill(state, busy, "rosa", "paint")).toBeCloseTo(SKILL_CAP);
    expect(crewSkill({ ...state, upgrades: ["tool-trailer"] }, busy, "rosa", "paint")).toBe(SKILL_CAP);
    expect(crewSkill({ ...state, upgrades: ["tool-trailer"] }, EMPTY_CREW, "marcus", "light")).toBeCloseTo(
      0.75,
    );
    const hard = { ...state, profile: { ...state.profile, difficulty: "challenging" as const } };
    expect(crewSkill(hard, EMPTY_CREW, "rosa", "paint")).toBeCloseTo(0.76);
    expect(crewWage({ upgrades: ["supply-account"] }, "rosa")).toBe(12);
  });

  it("copies a good demo up to a decent hand, never past 0.88", () => {
    expect(coachedSkill(0.8, 1)).toBeCloseTo(0.88);
    expect(coachedSkill(0.8, 0.9)).toBeCloseTo(0.86);
    expect(coachedSkill(0.8, 0.5)).toBeCloseTo(0.8);
    expect(coachedSkill(0.64, 0.95)).toBeCloseTo(0.826);
    const state = { profile: newShowHomeGame().profile, upgrades: [] as GameState["upgrades"] };
    expect(workSkill(state, EMPTY_CREW, { coached: { paint: 1 } }, "rosa", "paint")).toBeCloseTo(0.88);
  });

  it("hires up to two, three with walkie-talkies, and only changes crew on a day with no jobs", () => {
    expect(reduce(CREWED, { type: "hireCrew", crewId: "hana" })).toBe(CREWED);
    const radio = reduce(
      { ...CREWED, upgrades: [...CREWED.upgrades, "crew-radio"] },
      { type: "hireCrew", crewId: "hana" },
    );
    expect(radio.larkspur?.crew.hired).toEqual(["rosa", "tobi", "hana"]);
    const painting = assign(playHomeRoom(CREWED, 0, "paint"), "rosa", 0, "paint");
    expect(reduce(painting, { type: "finishCrew", crewId: "rosa" })).toBe(painting);
    expect(reduce(painting, { type: "finishCrew", crewId: "tobi" })).toBe(painting);
    const finished = reduce(CREWED, { type: "finishCrew", crewId: "tobi" });
    expect(finished.larkspur?.crew.hired).toEqual(["rosa"]);
  });

  it("assigns only the next hands-on step of a closed, bought room, paid from the purse", () => {
    const shopped = playHomeRoom(CREWED, 0, "paint");
    expect(reduce(CREWED, { type: "assignCrew", crewId: "rosa", roomIndex: 0, job: "paint" })).toBe(CREWED);
    expect(reduce(shopped, { type: "assignCrew", crewId: "rosa", roomIndex: 0, job: "floor" })).toBe(shopped);
    expect(reduce(shopped, { type: "assignCrew", crewId: "hana", roomIndex: 0, job: "paint" })).toBe(shopped);
    const open = reduce(shopped, { type: "openHomeRoom", roomIndex: 0 });
    expect(reduce(open, { type: "assignCrew", crewId: "rosa", roomIndex: 0, job: "paint" })).toBe(open);
    const painting = assign(shopped, "rosa", 0, "paint");
    expect(project(painting).spent - project(shopped).spent).toBe(14);
    expect(project(painting).rooms[0]?.locked).toBe(true);
    expect(reduce(painting, { type: "assignCrew", crewId: "rosa", roomIndex: 1, job: "paint" })).toBe(
      painting,
    );
    expect(reduce(painting, { type: "assignCrew", crewId: "tobi", roomIndex: 0, job: "paint" })).toBe(
      painting,
    );
    expect(reduce(painting, { type: "openHomeRoom", roomIndex: 0 })).toBe(painting);
    const done = endDays(painting, 1);
    const room = project(done).rooms[0];
    expect(room?.stage).toBe("floor");
    expect(Object.values(room?.edges ?? {}).every((edge) => edge.byCrew && !edge.assisted)).toBe(true);
    expect(done.larkspur?.crew.jobsDone.rosa.paint).toBe(1);
    expect(project(done).crewJobs).toEqual([]);
  });

  it("shows the crew how in the real mini-games, once per job, for an hour", () => {
    const tape = reduce(CREWED, { type: "coachCrew", record: { job: "paint", samples: tapeSamples(0) } });
    expect(project(tape).coached.paint).toBeGreaterThan(0.95);
    expect(tape.calendar.hoursLeft).toBe(CREWED.calendar.hoursLeft - 1);
    expect(tape.story.queue).toContain("is-first-coaching");
    expect(reduce(tape, { type: "coachCrew", record: { job: "paint", samples: tapeSamples(0) } })).toBe(tape);
    expect(reduce(CREWED, { type: "coachCrew", record: { job: "paint", samples: [[1, 1]] } })).toBe(CREWED);
    const light = reduce(CREWED, { type: "coachCrew", record: { job: "light", col: 1, row: 1 } });
    expect(project(light).coached.light).toBe(1);
    const dim = reduce(CREWED, { type: "coachCrew", record: { job: "light", col: 3, row: 2 } });
    expect(project(dim).coached.light).toBeLessThan(1);
    expect(COACH_CORNER.cols * COACH_CORNER.rows).toBe(12);
    expect(COACH_LAMP).toBe("lantern-pendant");
    const floor = reduce(CREWED, {
      type: "coachCrew",
      record: {
        job: "floor",
        drops: [
          [0, 0],
          [60, 0],
          [0, 15],
        ],
      },
    });
    expect(project(floor).coached.floor).toBe(1);
    expect(
      reduce(CREWED, {
        type: "coachCrew",
        record: {
          job: "floor",
          drops: [
            [40, 40],
            [60, 0],
            [0, 15],
          ],
        },
      }),
    ).toBe(CREWED);
    const board = reduce(
      { ...CREWED, upgrades: [...CREWED.upgrades, "sample-board"] },
      { type: "coachCrew", record: { job: "light", col: 1, row: 1 } },
    );
    expect(board.calendar.hoursLeft).toBe(CREWED.calendar.hoursLeft);
    expect(coachCrew(PLANNED, { job: "light", col: 1, row: 1 })).not.toBe(PLANNED);
  });

  it("buys time, not quality: crew on every job scores at least 3 below the same home by hand", () => {
    const hand = stageHome(planShow(readyHome(PLANNED)));
    let crew = CREWED;
    for (let index = 0; index < project(crew).rooms.length; index += 1) crew = crewRoom(crew, index);
    const crewed = stageHome(planShow(crew));
    const byHand = hand.larkspur?.history.at(-1)?.overall ?? 0;
    const byCrew = crewed.larkspur?.history.at(-1)?.overall ?? 0;
    expect(byHand - byCrew).toBeGreaterThanOrEqual(3);
  });
});
