import { applyStanding } from "../../../engine/standing";
import { starsForScore } from "../../../engine/score";
import { CAREER } from "../content/career";
import { CUISINE_IDS, type CuisineId } from "../content/cuisine";
import { clientById, dishById, mentorFor } from "./catalog";
import { addToDiary, withCard } from "./dishDiary";
import { evaluateDish, evaluateOrder } from "./dishEvaluate";
import { runQuality } from "./dishQuality";
import type { DishRun } from "./dishRun";
import type { GameState } from "./gameState";
import { appendLog, type DishLogEntry, type DishPurposeKind } from "./log";
import { addMastery } from "./mastery";
import type { OrderDish } from "./orderBrief";
import { dishTags, masteryGain, settleChefReward } from "./rewards";
import { nextRung, promote } from "./rung";
import { queueStoryTrigger } from "./storyQueue";
import { rememberTaste } from "./tasteMemory";

export function canRingBell(state: GameState): boolean {
  const run = state.activeRun;
  return run !== null && run.stage === "pass" && run.plated !== null;
}

function noteFor(state: GameState, run: DishRun): string {
  switch (run.purpose.kind) {
    case "lesson":
      return `Lesson with ${mentorFor(run.purpose.cuisine).name}`;
    case "test":
      return run.purpose.test === "graduation" ? "Graduation Practical" : "Tasting Day";
    case "order": {
      const gigId = run.purpose.gigId;
      const clientId = state.gigs.active.find((gig) => gig.id === gigId)?.clientId ?? "";
      return `Order for ${clientById(clientId)?.name ?? "a neighbour"}`;
    }
    case "practice":
      return "Practice kitchen";
  }
}

function recordPlate(state: GameState, run: DishRun, stars: number): GameState {
  const plated = run.plated;
  if (plated === null) return state;
  const solved = run.taste !== null && run.taste.solved;
  return {
    ...state,
    platingCards: withCard(state.platingCards, {
      dishId: run.dishId,
      plateColour: plated.plateColour,
      components: plated.components,
      accuracy: plated.result.accuracy,
      assisted: plated.result.assisted,
      stars,
    }),
    tasteMemory:
      solved && run.taste !== null
        ? rememberTaste(state.tasteMemory, {
            dishId: run.dishId,
            point: run.taste.point,
            savoury: run.taste.savoury,
          })
        : state.tasteMemory,
    diary: addToDiary(state.diary, {
      id: run.id,
      dishId: run.dishId,
      day: state.calendar.day,
      plateColour: plated.plateColour,
      components: plated.components,
      stars,
      note: noteFor(state, run),
    }),
    activeRun: { ...run, stage: "done" },
  };
}

function dishEntry(
  run: DishRun,
  day: number,
  purpose: DishPurposeKind,
  quality: number,
  extra: Pick<DishLogEntry, "evaluation" | "reward" | "mastery">,
): DishLogEntry {
  return {
    kind: "dish",
    runId: run.id,
    day,
    dishId: run.dishId,
    purpose,
    quality,
    stars: starsForScore(quality),
    ...extra,
  };
}

function finishLesson(state: GameState, run: DishRun, cuisine: CuisineId, fee: number): GameState {
  const dish = dishById(run.dishId);
  const evaluation = evaluateDish(run, dish);
  const reward = settleChefReward(state, {
    passed: evaluation.passed,
    score: evaluation.score,
    stars: evaluation.stars,
    fee,
    late: false,
    tags: [...dish.tags],
    colourCount: evaluation.favouredColoursUsed,
  });
  const gain = masteryGain(starsForScore(evaluation.quality.quality));
  const passed = reward.outcome === "pass";
  const met =
    passed && !state.mentorsMet.includes(cuisine) ? [...state.mentorsMet, cuisine] : state.mentorsMet;
  const logged: GameState = {
    ...addMastery(state, cuisine, gain),
    mentorsMet: met,
    log: appendLog(
      state.log,
      dishEntry(run, state.calendar.day, "lesson", evaluation.quality.quality, {
        evaluation,
        reward,
        mastery: gain,
      }),
    ),
  };
  const rewarded = applyStanding(logged, reward);
  return met.length === CUISINE_IDS.length && state.mentorsMet.length < CUISINE_IDS.length
    ? queueStoryTrigger(rewarded, "six-lessons")
    : rewarded;
}

function finishPractice(state: GameState, run: DishRun, quality: number): GameState {
  return {
    ...state,
    log: appendLog(
      state.log,
      dishEntry(run, state.calendar.day, "practice", quality, { evaluation: null, reward: null, mastery: 0 }),
    ),
  };
}

function finishTestDish(state: GameState, run: DishRun, quality: number): GameState {
  const day = state.testDay;
  if (day === null) return state;
  const gain = masteryGain(starsForScore(quality));
  const qualities = [...day.qualities, quality];
  const logged: GameState = {
    ...addMastery(state, dishById(run.dishId).cuisine, gain),
    testDay: { ...day, qualities },
    log: appendLog(
      state.log,
      dishEntry(run, state.calendar.day, "test", quality, { evaluation: null, reward: null, mastery: gain }),
    ),
  };
  return qualities.length < day.dishIds.length ? logged : finishTestDay(logged, run.id);
}

function finishTestDay(state: GameState, runId: string): GameState {
  const day = state.testDay;
  if (day === null) return state;
  const bonus = state.profile.difficulty === "challenging" ? 6 : 0;
  const graduation = day.test === "graduation";
  const mark = (graduation ? CAREER.graduationAverage : CAREER.tastingMinimum) + bonus;
  const average = Math.round(day.qualities.reduce((sum, value) => sum + value, 0) / day.qualities.length);
  const reached = graduation ? average >= mark : day.qualities.every((quality) => quality >= mark);
  const passed = reached || state.profile.difficulty === "relaxed";
  const feedback = passed
    ? []
    : graduation
      ? [
          `The average reached ${average}, hoping for ${mark}. The mentors say: rest, then try again tomorrow.`,
        ]
      : [`Each plate needs ${mark}. Hollis says: come back tomorrow and show me again.`];
  const logged: GameState = {
    ...state,
    testDay: null,
    log: appendLog(state.log, {
      kind: "test",
      runId,
      day: state.calendar.day,
      test: day.test,
      passed,
      scores: day.qualities,
      mark,
      feedback,
    }),
  };
  if (!passed) return logged;
  return promote(
    applyStanding(logged, { coins: 0, reputation: CAREER.testReputation, buzz: 0 }),
    nextRung(state.rung),
  );
}

function finishOrderDish(state: GameState, run: DishRun, gigId: string, quality: number): GameState {
  const gig = state.gigs.active.find((entry) => entry.id === gigId);
  if (gig === undefined || run.plated === null) return state;
  const stars = starsForScore(quality);
  const gain = masteryGain(stars);
  const cooked: OrderDish = {
    gigId,
    runId: run.id,
    dishId: run.dishId,
    quality,
    stars,
    garnishMet: run.plated.result.garnishMet,
    colourCount: run.plated.result.colourCount,
  };
  const orderDishes = [...state.orderDishes, cooked];
  const logged: GameState = {
    ...addMastery(state, dishById(run.dishId).cuisine, gain),
    orderDishes,
    log: appendLog(
      state.log,
      dishEntry(run, state.calendar.day, "order", quality, { evaluation: null, reward: null, mastery: gain }),
    ),
  };
  const dishes = orderDishes.filter((entry) => entry.gigId === gigId);
  if (dishes.length < gig.brief.dishCount) return logged;
  const evaluation = evaluateOrder(gig.brief, dishes, state.calendar.day);
  const reward = settleChefReward(state, {
    passed: evaluation.passed,
    score: evaluation.score,
    stars: evaluation.stars,
    fee: gig.brief.fee,
    late: state.calendar.day > gig.brief.deadlineDay,
    tags: dishTags(dishes.map((entry) => dishById(entry.dishId))),
    colourCount: evaluation.favouredColoursUsed,
  });
  const delivered: GameState = {
    ...logged,
    gigs: { ...logged.gigs, active: logged.gigs.active.filter((entry) => entry.id !== gigId) },
    orderDishes: logged.orderDishes.filter((entry) => entry.gigId !== gigId),
    passes: reward.outcome === "pass" ? { ...logged.passes, head: logged.passes.head + 1 } : logged.passes,
    log: appendLog(logged.log, {
      kind: "order",
      runId: run.id,
      day: state.calendar.day,
      gigId,
      clientId: gig.clientId,
      evaluation,
      reward,
    }),
  };
  return applyStanding(delivered, reward);
}

export function ringBell(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || !canRingBell(state)) return state;
  const dish = dishById(run.dishId);
  const quality = runQuality(run, dish);
  const plated = recordPlate(state, run, starsForScore(quality));
  switch (run.purpose.kind) {
    case "lesson":
      return finishLesson(plated, run, run.purpose.cuisine, run.purpose.fee);
    case "practice":
      return finishPractice(plated, run, quality);
    case "test":
      return finishTestDish(plated, run, quality);
    case "order":
      return finishOrderDish(plated, run, run.purpose.gigId, quality);
  }
}
