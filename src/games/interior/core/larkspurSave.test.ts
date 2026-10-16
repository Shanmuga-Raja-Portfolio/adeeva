import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import type { Larkspur, Project } from "./larkspur";
import {
  assign,
  hire,
  newShowHomeGame,
  planHome,
  planShow,
  playHomeRoom,
  project,
  readyHome,
  startHome,
} from "./larkspurPlaythrough";
import { parseSave, serialize } from "./save";

function withLarkspur(state: GameState, change: (larkspur: Larkspur) => Larkspur): GameState {
  const larkspur = state.larkspur;
  if (larkspur === null) throw new Error("No Larkspur");
  return { ...state, larkspur: change(larkspur) };
}

function withProject(state: GameState, change: (current: Project) => Project): GameState {
  return withLarkspur(state, (larkspur) => ({ ...larkspur, project: change(project(state)) }));
}

const CREWED = assign(
  playHomeRoom(hire(planHome(startHome(newShowHomeGame())), ["rosa", "tobi"]), 0, "paint"),
  "rosa",
  0,
  "paint",
);
const PLANNED = planShow(readyHome(planHome(startHome(newShowHomeGame()))));

describe("a Show-Home save", { timeout: 60_000 }, () => {
  it("loads the states the game makes", () => {
    for (const state of [CREWED, PLANNED]) expect(parseSave(serialize(state)).ok).toBe(true);
  });

  it("refuses crew jobs the game could never book", () => {
    const job = project(CREWED).crewJobs[0];
    if (job === undefined) throw new Error("No crew job");
    const forged: GameState[] = [
      withLarkspur(CREWED, (larkspur) => ({ ...larkspur, crew: { ...larkspur.crew, hired: ["tobi"] } })),
      withProject(CREWED, (current) => ({ ...current, crewJobs: [job, { ...job, crewId: "tobi" }] })),
      withProject(CREWED, (current) => ({ ...current, crewJobs: [{ ...job, job: "floor" }] })),
      withProject(CREWED, (current) => ({ ...current, crewJobs: [{ ...job, roomIndex: 1 }] })),
    ];
    for (const state of forged) expect(parseSave(serialize(state)).ok).toBe(false);
  });

  it("refuses a tour, plot or Key Wall that disagrees with the street", () => {
    const plan = project(PLANNED).plan;
    if (plan === null) throw new Error("No plan");
    const forged: GameState[] = [
      withProject(PLANNED, (current) => ({ ...current, plan: { ...plan, tour: [9] } })),
      withLarkspur(PLANNED, (larkspur) => ({ ...larkspur, plot: 2 })),
      withLarkspur(PLANNED, (larkspur) => ({
        ...larkspur,
        keyWall: { ...larkspur.keyWall, "garden-flat": "gold" },
      })),
    ];
    for (const state of forged) expect(parseSave(serialize(state)).ok).toBe(false);
  });
});
