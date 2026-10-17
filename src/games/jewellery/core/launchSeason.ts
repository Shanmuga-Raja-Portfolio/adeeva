import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import type { LaunchThemeId } from "../content/launchTheme";
import type { LineNameId } from "../content/lineName";
import { EMPTY_LOOKBOOK, type CollectionState } from "./collectionState";
import type { GameState } from "./gameState";
import { launchStaged } from "./launchStatus";
import { addToDrawer } from "./lineDrawer";
import { drawStoryCorner, isLineNameId } from "./loftOffer";
import {
  BOARD_LAST_SEASON_DAY,
  loftCollection,
  nextSeasonStart,
  seasonDayOf,
  seasonThemes,
} from "./seasonCalendar";
import { keepBenchStones } from "./stonePot";
import { queueStoryTrigger } from "./storyQueue";

export const THEME_SEASON_DAY = 1;

function withCollection(state: GameState, collection: CollectionState): GameState {
  return { ...state, collection };
}

export function canPickTheme(state: GameState, themeId: LaunchThemeId): ActionCheck {
  const collection = loftCollection(state);
  if (collection === null) return actionCheck(["Open the Lantern Loft first."]);
  const day = seasonDayOf(collection, state.calendar.day);
  if (day === null)
    return actionCheck([`Season ${collection.seasonNumber} opens on day ${collection.seasonStartDay}.`]);
  if (collection.rested) return actionCheck(["The line is resting this season."]);
  if (collection.themeId !== null) return actionCheck(["This season's theme is already chosen."]);
  if (day > BOARD_LAST_SEASON_DAY) return actionCheck(["It's too late to start a line this season."]);
  if (!seasonThemes(collection.seasonNumber).some((theme) => theme.id === themeId))
    return actionCheck(["Pick one of this season's two themes."]);
  return actionCheck([]);
}

export function pickLaunchTheme(state: GameState, themeId: LaunchThemeId): GameState {
  const collection = loftCollection(state);
  if (collection === null || !canPickTheme(state, themeId).ok) return state;
  return withCollection(state, { ...collection, themeId });
}

export function canRestLine(state: GameState): ActionCheck {
  const collection = loftCollection(state);
  if (collection === null) return actionCheck(["Open the Lantern Loft first."]);
  if (seasonDayOf(collection, state.calendar.day) !== THEME_SEASON_DAY)
    return actionCheck(["You can rest the line on the first day of a season."]);
  if (collection.rested) return actionCheck(["The line is already resting."]);
  if (collection.themeId !== null || collection.carried)
    return actionCheck(["This season's line has begun."]);
  const run = state.activeRun;
  if (run !== null && run.stage !== "done" && run.purpose.kind === "collection")
    return actionCheck(["Finish or set aside the line piece on your bench first."]);
  return actionCheck([]);
}

export function restLine(state: GameState): GameState {
  const collection = loftCollection(state);
  if (collection === null || !canRestLine(state).ok) return state;
  return withCollection(state, { ...collection, rested: true });
}

export function canRenameLine(state: GameState, lineNameId: LineNameId): ActionCheck {
  const collection = loftCollection(state);
  if (collection === null) return actionCheck(["Open the Lantern Loft first."]);
  if (!isLineNameId(lineNameId)) return actionCheck(["Pick one of the line names."]);
  if (collection.lineNameId === lineNameId) return actionCheck(["That is already your line's name."]);
  if (collection.brief !== null) return actionCheck(["Rename your line at the start of a season."]);
  return actionCheck([]);
}

export function renameLine(state: GameState, lineNameId: LineNameId): GameState {
  const collection = loftCollection(state);
  if (collection === null || !canRenameLine(state, lineNameId).ok) return state;
  return withCollection(state, { ...collection, lineNameId });
}

function carriedSeason(collection: CollectionState): CollectionState {
  return {
    ...collection,
    seasonStartDay: nextSeasonStart(collection),
    seasonNumber: collection.seasonNumber + 1,
    carried: true,
  };
}

function freshSeason(state: GameState, collection: CollectionState): GameState {
  const benched = keepBenchStones(state);
  const [storyCorner, rng] = drawStoryCorner(state, state.rng);
  const drawer = collection.pieces.reduce((current, piece) => addToDrawer(current, piece), {
    drawer: collection.drawer,
    sold: [] as readonly string[],
    coins: 0,
  });
  return {
    ...state,
    rng,
    activeRun: benched.activeRun,
    coins: state.coins + drawer.coins,
    collection: {
      ...collection,
      seasonStartDay: nextSeasonStart(collection),
      seasonNumber: collection.seasonNumber + 1,
      themeId: null,
      rested: false,
      carried: false,
      brief: null,
      pieces: [],
      gemTray: [],
      stonePot: benched.collection?.stonePot ?? [],
      gemSpent: null,
      lineSheets: [],
      motifMaster: null,
      lookbook: EMPTY_LOOKBOOK,
      drawer: drawer.drawer,
      storyCorner,
    },
  };
}

export function seasonSkipped(state: GameState, collection: CollectionState): boolean {
  return !collection.rested && collection.themeId !== null && !launchStaged(state, collection);
}

export function turnSeason(state: GameState): GameState {
  const collection = loftCollection(state);
  if (collection === null || state.calendar.day !== nextSeasonStart(collection)) return state;
  if (seasonSkipped(state, collection) && collection.brief !== null) {
    const carried = withCollection(state, carriedSeason(collection));
    return queueStoryTrigger(carried, "launch-skipped");
  }
  return freshSeason(state, collection);
}
