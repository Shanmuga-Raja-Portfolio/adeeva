import { BASE_DAY_HOURS, type DayClock } from "../../../engine/dayHours";
import { runIdsBelow } from "../../../engine/idNumber";
import {
  arrayOf,
  booleanParser,
  distinctListOf,
  fixedRecordOf,
  integerParser,
  integerRangeParser,
  nullable,
  objectOf,
  oneOf,
  refined,
} from "../../../engine/parse";
import { MAX_BUZZ } from "../../../engine/standing";
import {
  countParser,
  dayParser,
  gigBoardParser,
  knownIdParser,
  profileParser,
  rngParser,
  storyStateParser,
  trendStateParserOf,
} from "../../../engine/stateParsers";
import { DECOR_IDS } from "../content/decor";
import { FLOOR_IDS } from "../content/floor";
import { FURNITURE_IDS } from "../content/furniture";
import { LIGHT_IDS } from "../content/light";
import { LOFT_DECOR_IDS } from "../content/loftDecor";
import { PAINT_IDS } from "../content/paint";
import { UPGRADE_IDS } from "../content/upgrade";
import { sameBrief } from "./brief";
import { briefParser, clientIdParser, roomTagParser } from "./briefParser";
import { dayLength, VAN_HOURS } from "./calendar";
import { storyBeatById } from "./catalog";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { logEntryParser } from "./resultParsers";
import { runParser } from "./runParser";
import type { Stock } from "./stock";

const calendarParser = objectOf<DayClock>({
  day: dayParser,
  hoursLeft: integerRangeParser(0, BASE_DAY_HOURS + VAN_HOURS),
});

const stockParser = objectOf<Stock>({
  furniture: fixedRecordOf(FURNITURE_IDS, countParser),
  paints: fixedRecordOf(PAINT_IDS, countParser),
  floors: fixedRecordOf(FLOOR_IDS, countParser),
  lights: fixedRecordOf(LIGHT_IDS, countParser),
  decor: fixedRecordOf(DECOR_IDS, countParser),
});

const gameStateShapeParser = objectOf<GameState>({
  schemaVersion: oneOf([SCHEMA_VERSION]),
  profile: profileParser,
  calendar: calendarParser,
  coins: integerParser,
  reputation: countParser,
  buzz: integerRangeParser(0, MAX_BUZZ),
  stock: stockParser,
  upgrades: distinctListOf(UPGRADE_IDS, "upgrade"),
  loftDecor: distinctListOf(LOFT_DECOR_IDS, "loft decoration"),
  guide: booleanParser,
  trends: trendStateParserOf(roomTagParser),
  showHomeWeek: countParser,
  gigs: gigBoardParser(briefParser, clientIdParser),
  story: storyStateParser(knownIdParser(storyBeatById, "story beat")),
  activeRun: nullable(runParser),
  log: arrayOf(logEntryParser),
  ordersDelivered: countParser,
  nextRunNumber: dayParser,
  rng: rngParser,
});

function runNumbersBelowNext(state: GameState): boolean {
  const ids = state.log.map((entry) => entry.runId);
  if (state.activeRun !== null) ids.push(state.activeRun.id);
  return runIdsBelow(ids, state.nextRunNumber);
}

function runMatchesGig(state: GameState): boolean {
  const run = state.activeRun;
  if (run === null) return true;
  const gig = state.gigs.active.find((entry) => entry.id === run.gigId);
  if (run.stage === "done") return gig === undefined && state.log.some((entry) => entry.runId === run.id);
  return gig !== undefined && sameBrief(gig.brief, run.brief);
}

function runStartedByToday(state: GameState): boolean {
  return state.activeRun === null || state.activeRun.startedDay <= state.calendar.day;
}

function hoursFitDay(state: GameState): boolean {
  return state.calendar.hoursLeft <= dayLength(state);
}

export const gameStateParser = refined(
  gameStateShapeParser,
  (state) =>
    runNumbersBelowNext(state) && hoursFitDay(state) && runMatchesGig(state) && runStartedByToday(state),
  "a loft whose counters and hours fit together",
);
