import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import type { RngState } from "../../../engine/rng";
import { drawDistinct } from "../../../engine/rngDraw";
import { CLIENTS } from "../content/client";
import type { FairThemeId } from "../content/fairTheme";
import type { IngredientId } from "../content/ingredient";
import { fairThemeById, ingredientById, isFairThemeId } from "./catalog";
import type { FairState } from "./fairState";
import type { GameState } from "./gameState";
import { EMPTY_SALON } from "./salonState";
import { nextSeasonStart, seasonBegun, seasonThemes } from "./seasonCalendar";
import { queueStoryTrigger } from "./storyQueue";

export const VISITOR_COUNT = 3;
export const HAMPER_PACKS: readonly IngredientId[] = ["flour", "butter", "caster-sugar"];
export const HAMPER_TOPPINGS = 2;
export const OTTI_TEA_SEASON = 3;

export function drawVisitors(state: GameState, rng: RngState): [string[], RngState] {
  const past = [...new Set(state.log.map((entry) => entry.clientId))];
  const pool = past.length >= VISITOR_COUNT ? past : CLIENTS.map((client) => client.id);
  return drawDistinct(rng, pool, VISITOR_COUNT);
}

export function initialFair(seasonStartDay: number, visitors: readonly string[]): FairState {
  return {
    seasonStartDay,
    seasonNumber: 1,
    tent: 1,
    themeId: null,
    visitors,
    entry: null,
    result: null,
    tentOffer: false,
    shownRunIds: [],
    ribbonWall: {},
    ribbonsByRun: {},
  };
}

export function canChooseTheme(state: GameState, themeId: FairThemeId): ActionCheck {
  const { fair, salon } = state;
  if (state.career !== "salon" || fair === null || salon === null)
    return actionCheck(["Open the Comet Room first."]);
  if (!seasonBegun(fair, state.calendar.day))
    return actionCheck([`Fair Season ${fair.seasonNumber} opens on day ${fair.seasonStartDay}.`]);
  if (salon.parlour === "resting") return actionCheck(["The parlour is resting this season."]);
  if (fair.themeId !== null) return actionCheck(["This season's theme is already chosen."]);
  if (!seasonThemes(fair.seasonNumber).some((theme) => theme.id === themeId))
    return actionCheck(["That theme belongs to another season."]);
  return actionCheck([]);
}

export function chooseFairTheme(state: GameState, themeId: FairThemeId): GameState {
  const fair = state.fair;
  if (fair === null || !isFairThemeId(themeId) || !canChooseTheme(state, themeId).ok) return state;
  const theme = fairThemeById(themeId);
  const ingredients = { ...state.pantry.ingredients };
  for (const id of HAMPER_PACKS) ingredients[id] += ingredientById(id).packAmount;
  const toppings = {
    ...state.pantry.toppings,
    [theme.topping]: state.pantry.toppings[theme.topping] + HAMPER_TOPPINGS,
  };
  return { ...state, fair: { ...fair, themeId }, pantry: { ...state.pantry, ingredients, toppings } };
}

export function seasonOpened(state: GameState): GameState {
  const fair = state.fair;
  if (fair === null) return state;
  const invited = queueStoryTrigger(state, "fair-invite");
  const preview =
    state.profile.trait === "trendsetter" ? queueStoryTrigger(invited, "trendsetter-preview") : invited;
  return fair.seasonNumber >= OTTI_TEA_SEASON ? queueStoryTrigger(preview, "otti-tea") : preview;
}

function showpieceMissed(state: GameState): boolean {
  const fair = state.fair;
  const run = state.activeRun;
  const inProgress = run !== null && run.stage !== "done" && run.purpose.kind === "showpiece";
  return (
    state.salon?.parlour !== "resting" && (inProgress || (fair?.entry !== null && fair?.result === null))
  );
}

export function rollSeason(state: GameState): GameState {
  const fair = state.fair;
  const salon = state.salon;
  if (fair === null || salon === null || state.calendar.day !== nextSeasonStart(fair)) return state;
  const missed = showpieceMissed(state);
  const run = state.activeRun;
  const cleared =
    run !== null &&
    run.stage !== "done" &&
    (run.purpose.kind === "showpiece" || run.purpose.kind === "salon-tray")
      ? { ...state, activeRun: null }
      : state;
  const [visitors, rng] = drawVisitors(cleared, cleared.rng);
  const next: GameState = {
    ...cleared,
    rng,
    fair: {
      ...fair,
      seasonStartDay: state.calendar.day,
      seasonNumber: fair.seasonNumber + 1,
      themeId: null,
      visitors,
      entry: null,
      result: null,
      tentOffer: false,
    },
    salon: {
      ...EMPTY_SALON,
      graceSeason: salon.graceSeason,
      lastSummary: salon.lastSummary,
      nextTrayNumber: salon.nextTrayNumber,
    },
  };
  const opened = seasonOpened(next);
  return missed ? queueStoryTrigger(opened, "fair-skipped") : opened;
}
