import { drawDistinct, drawInt } from "../../../engine/rngDraw";
import { CAREER, LESSON_ORDER } from "../content/career";
import { CUISINE_IDS, type CuisineId } from "../content/cuisine";
import type { DayBoard, ShiftOffer } from "./dayBoard";
import type { GameState } from "./gameState";
import { GRADUATION_REPUTATION, isFamilyMeal } from "./rung";

function lessonCuisine(state: GameState): CuisineId | null {
  const run = state.activeRun;
  const busy =
    run !== null && run.stage !== "done" && run.purpose.kind === "lesson" ? run.purpose.cuisine : null;
  const open = LESSON_ORDER.filter((cuisine) => cuisine !== busy);
  const unmet = open.find((cuisine) => !state.mentorsMet.includes(cuisine));
  if (unmet !== undefined) return unmet;
  if (state.reputation >= GRADUATION_REPUTATION) return null;
  return open[state.calendar.day % open.length] ?? null;
}

function lessonBoard(state: GameState): GameState {
  const next = lessonCuisine(state);
  if (next === null) return { ...state, board: { day: state.calendar.day, lesson: null, shifts: [] } };
  const [fee, rng] = drawInt(state.rng, CAREER.lessonFee[0], CAREER.lessonFee[1]);
  return { ...state, rng, board: { day: state.calendar.day, lesson: { cuisine: next, fee }, shifts: [] } };
}

function shiftBoard(state: GameState, perShift: number): GameState {
  const day = state.calendar.day;
  if (perShift === 0) {
    const board: DayBoard = { day, lesson: null, shifts: [{ id: `shift-${day}-1`, cuisines: [] }] };
    return { ...state, board };
  }
  const [picked, rng] = drawDistinct(state.rng, CUISINE_IDS, CAREER.shiftOffersPerDay * perShift);
  const shifts: ShiftOffer[] = Array.from({ length: CAREER.shiftOffersPerDay }, (_, index) => ({
    id: `shift-${day}-${index + 1}`,
    cuisines: picked.slice(index * perShift, index * perShift + perShift),
  }));
  return { ...state, rng, board: { day, lesson: null, shifts } };
}

export function rollDayBoard(state: GameState): GameState {
  const day = state.calendar.day;
  if (isFamilyMeal(day)) return { ...state, board: { day, lesson: null, shifts: [] } };
  if (state.rung === "student") return lessonBoard(state);
  if (state.rung === "line") return shiftBoard(state, 1);
  if (state.rung === "sous") return shiftBoard(state, 2);
  return shiftBoard(state, 0);
}

export function declineLesson(state: GameState): GameState {
  if (state.board.lesson === null) return state;
  return { ...state, board: { ...state.board, lesson: null } };
}
