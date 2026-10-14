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
  rngParser,
  storyStateParser,
  trendStateParser,
} from "../../../engine/stateParsers";
import { CAREER_IDS } from "../content/career";
import { FILLING_IDS } from "../content/filling";
import { INGREDIENT_IDS } from "../content/ingredient";
import { TEA_IDS } from "../content/tea";
import { TOPPING_IDS } from "../content/topping";
import { UPGRADE_IDS } from "../content/upgrade";
import { bakeRunParser, briefParser, clientIdParser } from "./bakeRunParser";
import { storyBeatById } from "./catalog";
import { SCHEMA_VERSION, type GameState, type Pantry } from "./gameState";
import { fairStateParser } from "./fairParsers";
import { patisserieProfileParser } from "./patisserieProfile";
import { bakeBookEntryParser, counterParser, logEntryParser } from "./resultParsers";
import { salonStateParser } from "./salonParsers";

const calendarParser = objectOf<DayClock>({
  day: dayParser,
  hoursLeft: integerRangeParser(0, BASE_DAY_HOURS),
});

const pantryParser = objectOf<Pantry>({
  ingredients: fixedRecordOf(INGREDIENT_IDS, countParser),
  gels: keyedRecordOf(isColourId, countParser),
  fillings: fixedRecordOf(FILLING_IDS, countParser),
  toppings: fixedRecordOf(TOPPING_IDS, countParser),
  teas: fixedRecordOf(TEA_IDS, countParser),
});

const upgradesParser = distinctListOf(UPGRADE_IDS, "upgrade");

const gameStateShapeParser = objectOf<GameState>({
  schemaVersion: oneOf([SCHEMA_VERSION]),
  profile: patisserieProfileParser,
  career: oneOf(CAREER_IDS),
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
  salon: nullable(salonStateParser),
  fair: nullable(fairStateParser),
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

function careerFits(state: GameState): boolean {
  const kind = state.activeRun?.purpose.kind;
  if (state.career === "salon") return state.salon !== null && state.fair !== null;
  return state.salon === null && state.fair === null && kind !== "salon-tray" && kind !== "showpiece";
}

export const gameStateParser = refined(
  refined(gameStateShapeParser, runNumbersBelowNext, "a run counter above every saved run"),
  careerFits,
  "a career with its own rooms",
);
