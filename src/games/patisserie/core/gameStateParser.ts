import { BASE_DAY_HOURS, type DayClock } from "../../../engine/dayHours";
import { runIdsBelow } from "../../../engine/idNumber";
import { MAX_BUZZ } from "../../../engine/standing";
import {
  arrayOf,
  booleanParser,
  distinctListOf,
  fixedRecordOf,
  integerParser,
  integerRangeParser,
  keyedRecordOf,
  nullable,
  objectOf,
  oneOf,
  refined,
} from "../../../engine/parse";
import { isColourId } from "../../../engine/palette";
import {
  countParser,
  dayParser,
  gigBoardParser,
  knownIdParser,
  profileParser,
  rngParser,
  storyStateParser,
  trendStateParser,
} from "../../../engine/stateParsers";
import { FILLING_IDS } from "../content/filling";
import { INGREDIENT_IDS } from "../content/ingredient";
import { TOPPING_IDS } from "../content/topping";
import { UPGRADE_IDS } from "../content/upgrade";
import { bakeRunParser, briefParser, clientIdParser } from "./bakeRunParser";
import { storyBeatById } from "./catalog";
import { SCHEMA_VERSION, type GameState, type Pantry } from "./gameState";
import { bakeBookEntryParser, counterParser, logEntryParser } from "./resultParsers";

const calendarParser = objectOf<DayClock>({
  day: dayParser,
  hoursLeft: integerRangeParser(0, BASE_DAY_HOURS),
});

const pantryParser = objectOf<Pantry>({
  ingredients: fixedRecordOf(INGREDIENT_IDS, countParser),
  gels: keyedRecordOf(isColourId, countParser),
  fillings: fixedRecordOf(FILLING_IDS, countParser),
  toppings: fixedRecordOf(TOPPING_IDS, countParser),
});

const upgradesParser = distinctListOf(UPGRADE_IDS, "upgrade");

const gameStateShapeParser = objectOf<GameState>({
  schemaVersion: oneOf([SCHEMA_VERSION]),
  profile: profileParser,
  calendar: calendarParser,
  coins: integerParser,
  reputation: countParser,
  buzz: integerRangeParser(0, MAX_BUZZ),
  pantry: pantryParser,
  upgrades: upgradesParser,
  guide: booleanParser,
  trends: trendStateParser,
  gigs: gigBoardParser(briefParser, clientIdParser),
  story: storyStateParser(knownIdParser(storyBeatById, "story beat")),
  activeRun: nullable(bakeRunParser),
  counter: counterParser,
  bakeBook: arrayOf(bakeBookEntryParser),
  log: arrayOf(logEntryParser),
  ordersDelivered: countParser,
  nextRunNumber: dayParser,
  rng: rngParser,
});

function runNumbersBelowNext(state: GameState): boolean {
  const ids = [...state.log.map((entry) => entry.runId), ...state.bakeBook.map((entry) => entry.runId)];
  if (state.activeRun !== null) ids.push(state.activeRun.id);
  return runIdsBelow(ids, state.nextRunNumber);
}

export const gameStateParser = refined(
  gameStateShapeParser,
  runNumbersBelowNext,
  "a run counter above every saved run",
);
