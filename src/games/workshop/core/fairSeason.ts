import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import type { FairThemeId } from "../content/fairTheme";
import { isFairThemeId } from "./catalog";
import type { GameState } from "./gameState";
import { nextSeasonStart, seasonBegun, seasonDay, seasonThemes, THEME_SEASON_DAY } from "./seasonCalendar";
import { drawVisitors } from "./showroomOffer";
import { queueStoryTrigger } from "./storyQueue";

export function canChooseTheme(state: GameState, themeId: FairThemeId): ActionCheck {
  const { showroom } = state;
  if (state.career !== "showroom" || showroom === null) return actionCheck(["Open the showroom first."]);
  if (!seasonBegun(showroom, state.calendar.day))
    return actionCheck([`Season ${showroom.seasonNumber} starts on day ${showroom.seasonStartDay}.`]);
  if (showroom.rested) return actionCheck(["The shop is resting this season."]);
  if (showroom.themeId !== null) return actionCheck(["This season's theme is already chosen."]);
  if (!seasonThemes(showroom.seasonNumber).some((theme) => theme.id === themeId))
    return actionCheck(["That theme belongs to another season."]);
  return actionCheck([]);
}

export function chooseFairTheme(state: GameState, themeId: FairThemeId): GameState {
  const showroom = state.showroom;
  if (showroom === null || !isFairThemeId(themeId) || !canChooseTheme(state, themeId).ok) return state;
  return { ...state, showroom: { ...showroom, themeId } };
}

export function canRestShowroom(state: GameState): ActionCheck {
  const { showroom } = state;
  if (state.career !== "showroom" || showroom === null) return actionCheck(["Open the showroom first."]);
  if (seasonDay(showroom, state.calendar.day) !== THEME_SEASON_DAY)
    return actionCheck(["The shop can only rest from the first day of a season."]);
  if (showroom.rested) return actionCheck(["The shop is already resting."]);
  if (showroom.themeId !== null) return actionCheck(["This season's theme is already chosen."]);
  return actionCheck([]);
}

export function restShowroom(state: GameState): GameState {
  const showroom = state.showroom;
  if (showroom === null || !canRestShowroom(state).ok) return state;
  const apprentice = state.apprentice;
  return {
    ...state,
    showroom: { ...showroom, rested: true },
    apprentice: apprentice === null ? null : { ...apprentice, hired: false },
  };
}

export function seasonOpened(state: GameState): GameState {
  return queueStoryTrigger(queueStoryTrigger(state, "ren-hello"), "fair-invite");
}

function fairMissed(state: GameState): boolean {
  const { showroom, fair } = state;
  return showroom !== null && fair !== null && !showroom.rested && fair.result === null;
}

export function rollSeason(state: GameState): GameState {
  const { showroom, fair } = state;
  if (showroom === null || fair === null) return state;
  const day = state.calendar.day;
  if (day === showroom.seasonStartDay && showroom.seasonNumber === 1) return seasonOpened(state);
  if (day !== nextSeasonStart(showroom)) return state;
  const missed = fairMissed(state);
  const [visitors, rng] = drawVisitors(state, state.rng);
  const next: GameState = {
    ...state,
    rng,
    showroom: {
      ...showroom,
      seasonStartDay: day,
      seasonNumber: showroom.seasonNumber + 1,
      themeId: null,
      rested: false,
    },
    fair: { ...fair, pickSetId: null, visitors, result: null, boothOffer: false },
  };
  const opened = seasonOpened(next);
  return missed ? queueStoryTrigger(opened, "fair-skipped") : opened;
}
