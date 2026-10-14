import { FAIR_CLIENT_ID } from "../content/client";
import { addToBakeBook, bakeBookEntry } from "./bakeBook";
import { evaluateBake } from "./bakeEvaluate";
import type { BakeRun } from "./bakeRun";
import { bakeSpend } from "./bakeSpend";
import { bakeTags } from "./bakeTags";
import { fairTentByNumber, fairThemeById } from "./catalog";
import { fairBrief } from "./fairBrief";
import type { FairEntry } from "./fairState";
import { DREAMER_FLAIR_COLOURS, flairScore, touchScores } from "./flair";
import type { GameState } from "./gameState";
import { runStartIssue, withNewRun } from "./runLifecycle";
import {
  fairDayOf,
  seasonDay,
  SHOWPIECE_FIRST_SEASON_DAY,
  SHOWPIECE_LAST_SEASON_DAY,
} from "./seasonCalendar";
import { queueStoryTrigger } from "./storyQueue";
import { consumeToppings } from "./toppingPlacement";

export function showpieceIssue(state: GameState): string | null {
  const { fair, salon } = state;
  if (state.career !== "salon" || fair === null || salon === null) return "Open the Comet Room first.";
  if (salon.parlour === "resting") return "The parlour is resting this season, so no Fair this time.";
  if (fair.themeId === null) return "Pick this season's Fair theme first.";
  if (fair.entry !== null) return "Your showpiece is already waiting for the Fair.";
  const day = seasonDay(fair, state.calendar.day);
  if (day === null || day < SHOWPIECE_FIRST_SEASON_DAY)
    return `Showpieces start on day ${fair.seasonStartDay + SHOWPIECE_FIRST_SEASON_DAY}.`;
  if (day > SHOWPIECE_LAST_SEASON_DAY) return "It's too close to the Fair to start a showpiece now.";
  return runStartIssue(state);
}

export function startShowpiece(state: GameState): GameState {
  const fair = state.fair;
  if (fair === null || fair.themeId === null || showpieceIssue(state) !== null) return state;
  const brief = fairBrief(
    fairThemeById(fair.themeId),
    fairTentByNumber(fair.tent),
    state.profile.difficulty,
    fairDayOf(fair),
  );
  return queueStoryTrigger(withNewRun(state, { kind: "showpiece" }, brief), "first-showpiece");
}

export function takeToFair(state: GameState, run: BakeRun): GameState {
  const fair = state.fair;
  const brief = run.brief;
  if (fair === null || brief === null || run.purpose.kind !== "showpiece" || fair.entry !== null)
    return state;
  const evaluation = evaluateBake(run, brief, state.calendar.day);
  const touches = touchScores(run);
  const entry: FairEntry = {
    runId: run.id,
    design: run.design,
    toppings: run.toppings,
    tags: bakeTags(run),
    colours: run.design.colours,
    spend: bakeSpend(run),
    budget: brief.budget,
    quality: evaluation.quality.quality,
    touches,
    flair: flairScore(
      touches,
      state.profile.trait === "dreamer" && run.design.colours.length >= DREAMER_FLAIR_COLOURS,
    ),
    word: run.word,
  };
  const page = bakeBookEntry(
    run,
    FAIR_CLIENT_ID,
    state.calendar.day,
    evaluation.stars,
    true,
    evaluation.quality.quality,
  );
  return {
    ...state,
    pantry: consumeToppings(state.pantry, run),
    activeRun: { ...run, stage: "done", reached: "done" },
    fair: { ...fair, entry },
    bakeBook: page === null ? state.bakeBook : addToBakeBook(state.bakeBook, page),
  };
}
