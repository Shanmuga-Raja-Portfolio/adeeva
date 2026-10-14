import { isWeekEnd } from "../../../engine/week";
import { CAREER, type RungId, type TestId } from "../content/career";
import { CUISINE_IDS } from "../content/cuisine";
import type { GameState } from "./gameState";
import { confidentCuisines } from "./mastery";
import { queueStoryTrigger } from "./storyQueue";

export const GRADUATION_REPUTATION = 15;
export const STATION_REPUTATION = 35;
export const STATION_SERVICES = 5;
export const STATION_CONFIDENT = 2;
export const TASTING_REPUTATION = 55;
export const TASTING_SERVICES = 10;
export const TASTING_CONFIDENT = 4;

export function isFamilyMeal(day: number): boolean {
  return isWeekEnd(day);
}

export function testFor(rung: RungId): TestId | null {
  if (rung === "student") return "graduation";
  if (rung === "line") return "station";
  return rung === "sous" ? "tasting" : null;
}

export function testHours(test: TestId): number {
  return test === "station" ? CAREER.shiftHours : CAREER.testDishHours * 3;
}

export function testGoals(state: GameState, test: TestId): string[] {
  const goals: string[] = [];
  if (test === "graduation") {
    if (state.mentorsMet.length < CUISINE_IDS.length)
      goals.push(`Pass a lesson with every mentor (${state.mentorsMet.length} of ${CUISINE_IDS.length}).`);
    if (state.reputation < GRADUATION_REPUTATION) goals.push(`Reach reputation ${GRADUATION_REPUTATION}.`);
  }
  if (test === "station") {
    if (state.reputation < STATION_REPUTATION) goals.push(`Reach reputation ${STATION_REPUTATION}.`);
    if (state.passes.line < STATION_SERVICES)
      goals.push(`Pass ${STATION_SERVICES} line services (${state.passes.line} so far).`);
    if (confidentCuisines(state.mastery) < STATION_CONFIDENT)
      goals.push(`Become Confident in ${STATION_CONFIDENT} cuisines.`);
  }
  if (test === "tasting") {
    if (state.reputation < TASTING_REPUTATION) goals.push(`Reach reputation ${TASTING_REPUTATION}.`);
    const services = state.passes.line + state.passes.sous;
    if (services < TASTING_SERVICES)
      goals.push(`Pass ${TASTING_SERVICES} services in total (${services} so far).`);
    if (confidentCuisines(state.mastery) < TASTING_CONFIDENT)
      goals.push(`Become Confident in ${TASTING_CONFIDENT} cuisines.`);
  }
  return goals;
}

export function testStartIssues(state: GameState, test: TestId): string[] {
  const issues = testFor(state.rung) === test ? testGoals(state, test) : ["That test is not for this rung."];
  if (isFamilyMeal(state.calendar.day)) issues.push("Today is Family Meal. Tests start again tomorrow.");
  if (state.calendar.hoursLeft < testHours(test))
    issues.push(`The test needs ${testHours(test)} hours. Start it first thing.`);
  if (state.activeRun !== null && state.activeRun.stage !== "done")
    issues.push("Finish the dish on the board first.");
  if (state.service !== null) issues.push("Finish the service first.");
  if (state.testDay !== null) issues.push("A test is already under way.");
  return issues;
}

export function promote(state: GameState, rung: RungId): GameState {
  const raised: GameState = { ...state, rung };
  if (rung === "line") return queueStoryTrigger(raised, "graduation-passed");
  if (rung === "sous")
    return queueStoryTrigger(queueStoryTrigger(raised, "station-test-passed"), "sous-start");
  return rung === "head" ? queueStoryTrigger(raised, "head-chef-start") : raised;
}

export function nextRung(rung: RungId): RungId {
  if (rung === "student") return "line";
  if (rung === "line") return "sous";
  return "head";
}
