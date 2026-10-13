import { avatarLookParser } from "../../../engine/avatar";
import { CAREER_IDS } from "../content/career";
import { DIFFICULTY_IDS } from "../../../engine/difficulty";
import { TRAIT_IDS } from "../../../engine/trait";
import { TRIM_IDS } from "../content/trim";
import { UPGRADE_IDS } from "../content/upgrade";
import { fabricById } from "./catalog";
import { hoursPerDay } from "./dayHours";
import { clientIdParser, storyBeatIdParser } from "./catalogIdParsers";
import {
  countParser,
  dayParser,
  gigBoardParser,
  rngParser,
  storyStateParser,
  trendStateParser,
} from "../../../engine/stateParsers";
import { METRE_STEP } from "./cutMetres";
import { briefParser, dressRunParser, nonNegativeParser } from "./dressRunParser";
import {
  SCHEMA_VERSION,
  type CalendarState,
  type GameState,
  type GigBoard,
  type Inventory,
  type Profile,
  type StudioState,
} from "./gameState";
import { labelSeasonParser, logEntryParser } from "./resultParsers";
import {
  arrayOf,
  booleanParser,
  fixedRecordOf,
  integerParser,
  integerRangeParser,
  nullable,
  objectOf,
  oneOf,
  rangeParser,
  recordOf,
  refined,
  stringParser,
  type Parser,
} from "../../../engine/parse";

const profileParser = objectOf<Profile>({
  name: refined(stringParser, (name) => name.trim().length > 0, "a name"),
  look: avatarLookParser,
  trait: oneOf(TRAIT_IDS),
  difficulty: oneOf(DIFFICULTY_IDS),
  career: oneOf(CAREER_IDS),
});

const calendarParser = objectOf<CalendarState>({
  day: dayParser,
  hoursLeft: integerRangeParser(0, 24),
  shopOpen: booleanParser,
});

const metresParser = refined(
  nonNegativeParser,
  (metres) => Number.isInteger(metres / METRE_STEP),
  "half-metre steps",
);

const inventoryParser = objectOf<Inventory>({
  fabricMetres: recordOf((id) => fabricById(id) !== undefined, metresParser),
  trims: fixedRecordOf(TRIM_IDS, countParser),
});

const studioParser = objectOf<StudioState>({
  upgrades: refined(
    arrayOf(oneOf(UPGRADE_IDS)),
    (upgrades) => new Set(upgrades).size === upgrades.length,
    "each upgrade at most once",
  ),
  assistantHired: booleanParser,
  assistantPaidThroughDay: countParser,
});

const gigBoardStateParser: Parser<GigBoard> = gigBoardParser(briefParser, clientIdParser);

const storyParser = storyStateParser(storyBeatIdParser);

const gameStateShapeParser = objectOf<GameState>({
  schemaVersion: oneOf([SCHEMA_VERSION]),
  profile: profileParser,
  calendar: calendarParser,
  coins: integerParser,
  reputation: countParser,
  buzz: rangeParser(0, 100),
  inventory: inventoryParser,
  studio: studioParser,
  trends: trendStateParser,
  gigs: gigBoardStateParser,
  story: storyParser,
  activeRun: nullable(dressRunParser),
  season: nullable(labelSeasonParser),
  log: arrayOf(logEntryParser),
  deliveredRunIds: arrayOf(stringParser),
  gigsDelivered: countParser,
  nextRunNumber: dayParser,
  rng: rngParser,
});

function runNumber(runId: string): number {
  const match = /^run-(\d+)$/.exec(runId);
  return match?.[1] === undefined ? 0 : Number(match[1]);
}

function runNumbersBelowNext(state: GameState): boolean {
  const ids = [...state.deliveredRunIds, ...state.log.map((entry) => entry.runId)];
  if (state.activeRun !== null) ids.push(state.activeRun.id);
  return ids.every((id) => runNumber(id) < state.nextRunNumber);
}

function lookRunHasSeason(state: GameState): boolean {
  return state.activeRun?.purpose.kind !== "look" || state.season !== null;
}

export const gameStateParser = refined(
  refined(
    refined(gameStateShapeParser, lookRunHasSeason, "a season for the look on the table"),
    (state) => state.calendar.hoursLeft <= hoursPerDay(state.studio),
    "no more hours left than a working day holds",
  ),
  runNumbersBelowNext,
  "a run counter above every saved run",
);
