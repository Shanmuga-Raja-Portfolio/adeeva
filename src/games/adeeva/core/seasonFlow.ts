import { SHOW_THEMES, type ShowThemeDef } from "../content/showTheme";
import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import type { GameState } from "./gameState";
import { createSeason } from "./labelSeason";
import type { RngState } from "../../../engine/rng";
import { drawItem } from "../../../engine/rngDraw";
import { queueStoryTrigger } from "./storyQueue";

export function selectableThemes(state: GameState): ShowThemeDef[] {
  const previous = state.season?.themeId ?? null;
  return SHOW_THEMES.filter((theme) => theme.id !== previous);
}

export function beginSeason(state: GameState, themeId: string | null): GameState | null {
  const candidates = selectableThemes(state);
  const chosen = themeId === null ? null : candidates.find((theme) => theme.id === themeId);
  if (chosen === undefined) return null;
  const [theme, rng]: [ShowThemeDef, RngState] =
    chosen === null ? drawItem(state.rng, candidates) : [chosen, state.rng];
  const seasonNumber = (state.season?.number ?? 0) + 1;
  const started: GameState = { ...state, rng, season: createSeason(seasonNumber, theme, state.calendar.day) };
  return queueStoryTrigger(started, "season-start");
}

export function canStartNextSeason(state: GameState): ActionCheck {
  if (state.profile.career !== "label") return actionCheck(["Seasons belong to a label."]);
  if (state.season !== null && state.season.result === null)
    return actionCheck(["Finish this season's show first."]);
  if (state.season !== null && state.calendar.day <= state.season.deadlineDay)
    return actionCheck(["The next season opens the day after the show."]);
  if (state.activeRun?.purpose.kind === "look" && state.activeRun.stage !== "done")
    return actionCheck(["Finish or set aside the look on the table first."]);
  return actionCheck([]);
}

export function startNextSeason(state: GameState, themeId: string | null): GameState {
  if (!canStartNextSeason(state).ok) return state;
  return beginSeason(state, themeId) ?? state;
}
