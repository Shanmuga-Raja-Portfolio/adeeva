import { hoursShortfallReason, spendHours } from "../../../engine/dayHours";
import { CAREER } from "../content/career";
import type { DishId } from "../content/dish";
import { difficultyById, dishById, isDishId, lessonDish } from "./catalog";
import { createDishRun, TEST_RUN_KINDS, type DishBrief, type RunPurpose } from "./dishRun";
import type { GameState } from "./gameState";
import { isDishUnlocked } from "./mastery";
import { testHours, testStartIssues } from "./rung";
import { queueStoryTrigger } from "./storyQueue";
import { TEST_DISHES } from "./testDay";

export const OPEN_BRIEF: DishBrief = { minQuality: 0, requiredTags: [], avoid: [] };

export function runStartIssue(state: GameState): string | null {
  const run = state.activeRun;
  if (run !== null && run.stage !== "done") return "Finish or set aside the dish on the board first.";
  if (state.service !== null) return "Finish the service first.";
  if (state.testDay !== null) return "Finish today's test first.";
  return null;
}

export function dishStartIssue(state: GameState, hours: number): string | null {
  return runStartIssue(state) ?? hoursShortfallReason(state.calendar, hours);
}

function minimumBonus(state: GameState): number {
  return difficultyById(state.profile.difficulty).minQualityBonus;
}

export function withRun(
  state: GameState,
  purpose: RunPurpose,
  dishId: DishId,
  brief: DishBrief,
  hours: number,
): GameState {
  const spent = spendHours(state, hours);
  if (spent === null) return state;
  const run = createDishRun(`run-${state.nextRunNumber}`, purpose, dishId, state.calendar.day, brief);
  return { ...spent, activeRun: run, nextRunNumber: state.nextRunNumber + 1 };
}

export function lessonStartIssue(state: GameState): string | null {
  if (state.board.lesson === null) return "There is no lesson on the class board today.";
  return dishStartIssue(state, CAREER.dishHours);
}

export function startLesson(state: GameState): GameState {
  const lesson = state.board.lesson;
  if (lesson === null || lessonStartIssue(state) !== null) return state;
  const first = state.mentorsMet.length === 0;
  const started = withRun(
    { ...state, board: { ...state.board, lesson: null } },
    { kind: "lesson", cuisine: lesson.cuisine, fee: lesson.fee },
    lessonDish(lesson.cuisine).id,
    { minQuality: CAREER.lessonMinimum + minimumBonus(state), requiredTags: [], avoid: [] },
    CAREER.dishHours,
  );
  return first ? queueStoryTrigger(started, "first-lesson") : started;
}

export function practiceStartIssue(state: GameState, dishId: string): string | null {
  if (!isDishId(dishId)) return "That dish is not on the list.";
  if (!isDishUnlocked(state.mastery, dishById(dishId))) return "That dish is still locked.";
  return dishStartIssue(state, CAREER.dishHours);
}

export function startPractice(state: GameState, dishId: string): GameState {
  if (!isDishId(dishId) || practiceStartIssue(state, dishId) !== null) return state;
  return withRun(state, { kind: "practice" }, dishId, OPEN_BRIEF, CAREER.dishHours);
}

export function orderDishIssue(state: GameState, gigId: string, dishId: string): string | null {
  const gig = state.gigs.active.find((entry) => entry.id === gigId);
  if (gig === undefined) return "That order is no longer open.";
  if (!isDishId(dishId)) return "That dish is not on the list.";
  if (!isDishUnlocked(state.mastery, dishById(dishId))) return "That dish is still locked.";
  if (gig.brief.dishId !== null && gig.brief.dishId !== dishId)
    return `This order is for ${dishById(gig.brief.dishId).name}.`;
  const cooked = state.orderDishes.filter((entry) => entry.gigId === gigId);
  if (cooked.length >= gig.brief.dishCount) return "Every dish for this order is ready.";
  if (cooked.some((entry) => entry.dishId === dishId)) return "Pick a different dish for this order.";
  return dishStartIssue(state, CAREER.dishHours);
}

export function startOrderDish(state: GameState, gigId: string, dishId: string): GameState {
  const gig = state.gigs.active.find((entry) => entry.id === gigId);
  if (gig === undefined || !isDishId(dishId) || orderDishIssue(state, gigId, dishId) !== null) return state;
  const brief: DishBrief = {
    minQuality: gig.brief.minQuality,
    requiredTags: gig.brief.requiredTags,
    avoid: gig.brief.avoid,
  };
  return withRun(state, { kind: "order", gigId }, dishId, brief, CAREER.dishHours);
}

export function testDishIssues(state: GameState, dishIds: readonly string[]): string[] {
  if (!Array.isArray(dishIds)) return ["Pick dishes from the list."];
  const issues: string[] = [];
  if (dishIds.length !== TEST_DISHES || new Set(dishIds).size !== TEST_DISHES)
    issues.push(`Pick ${TEST_DISHES} different dishes.`);
  const known = dishIds.filter(isDishId).map(dishById);
  if (known.length !== dishIds.length) issues.push("Pick dishes from the list.");
  if (new Set(known.map((dish) => dish.cuisine)).size !== known.length)
    issues.push("Each dish needs to come from a different cuisine.");
  if (known.some((dish) => !isDishUnlocked(state.mastery, dish)))
    issues.push("One of those dishes is still locked.");
  return issues;
}

function testBrief(state: GameState, test: "graduation" | "tasting"): DishBrief {
  const minimum = test === "graduation" ? 0 : CAREER.tastingMinimum + minimumBonus(state);
  return { ...OPEN_BRIEF, minQuality: minimum };
}

export function startTest(
  state: GameState,
  test: "graduation" | "tasting",
  dishIds: readonly string[],
): GameState {
  if (!TEST_RUN_KINDS.includes(test)) return state;
  if (testStartIssues(state, test).length > 0 || testDishIssues(state, dishIds).length > 0) return state;
  const picked = dishIds.filter(isDishId);
  const first = picked[0];
  if (first === undefined) return state;
  const spent = spendHours(state, testHours(test));
  if (spent === null) return state;
  const withDay: GameState = {
    ...spent,
    testDay: { test, day: state.calendar.day, dishIds: picked, qualities: [] },
  };
  const started = withRun(withDay, { kind: "test", test, index: 0 }, first, testBrief(state, test), 0);
  return test === "tasting" ? queueStoryTrigger(started, "tasting-day") : started;
}

export function nextTestDishIssue(state: GameState): string | null {
  const day = state.testDay;
  if (day === null) return "There is no test today.";
  if (day.qualities.length >= day.dishIds.length) return "Every test dish is cooked.";
  return runStartIssue({ ...state, testDay: null });
}

export function startNextTestDish(state: GameState): GameState {
  const day = state.testDay;
  if (day === null || nextTestDishIssue(state) !== null) return state;
  const index = day.qualities.length;
  const dishId = day.dishIds[index];
  if (dishId === undefined) return state;
  return withRun(state, { kind: "test", test: day.test, index }, dishId, testBrief(state, day.test), 0);
}

export function abandonRun(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || run.stage === "done") return state;
  return { ...state, activeRun: null, testDay: run.purpose.kind === "test" ? null : state.testDay };
}
