import { BASE_DAY_HOURS, type DayClock } from "../../../engine/dayHours";
import { idNumber } from "../../../engine/idNumber";
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
  profileShape,
  rngParser,
  storyStateParser,
  trendStateParserOf,
} from "../../../engine/stateParsers";
import { AWARD_IDS } from "../content/award";
import { CAREER, RUNG_IDS, START_IDS } from "../content/career";
import { CUISINE_IDS } from "../content/cuisine";
import { PATH_IDS } from "../content/path";
import { UPGRADE_IDS } from "../content/upgrade";
import { clientById, storyBeatById } from "./catalog";
import { SCHEMA_VERSION, type GameState, type Passes, type Profile } from "./gameState";
import { LOG_SIZE } from "./log";
import { MAX_MASTERY } from "./mastery";
import {
  dayBoardParser,
  diaryEntryParser,
  logEntryParser,
  orderBriefParser,
  orderDishParser,
  platingCardParser,
  tasteMemoryParser,
  testDayParser,
} from "./resultParsers";
import { pathStateParser } from "./pathParser";
import { dishIdParser, dishRunParser, tasteTagParser } from "./runParser";
import { serviceRunParser } from "./serviceParser";

const calendarParser = objectOf<DayClock>({
  day: dayParser,
  hoursLeft: integerRangeParser(0, BASE_DAY_HOURS),
});

const profileParser = objectOf<Profile>({ ...profileShape, start: oneOf(START_IDS) });

const shapeParser = objectOf<GameState>({
  schemaVersion: oneOf([SCHEMA_VERSION]),
  profile: profileParser,
  calendar: calendarParser,
  coins: integerParser,
  reputation: countParser,
  buzz: integerRangeParser(0, MAX_BUZZ),
  rung: oneOf(RUNG_IDS),
  mastery: fixedRecordOf(CUISINE_IDS, integerRangeParser(0, MAX_MASTERY)),
  mentorsMet: distinctListOf(CUISINE_IDS, "mentor"),
  passes: objectOf<Passes>({ line: countParser, sous: countParser, head: countParser }),
  upgrades: distinctListOf(UPGRADE_IDS, "upgrade"),
  trends: trendStateParserOf(tasteTagParser),
  board: dayBoardParser,
  gigs: gigBoardParser(orderBriefParser, knownIdParser(clientById, "client")),
  orderDishes: arrayOf(orderDishParser),
  menu: refined(
    arrayOf(dishIdParser),
    (menu) => new Set(menu).size === menu.length && (menu.length === 0 || menu.length === CAREER.menuSize),
    "a menu of different dishes",
  ),
  story: storyStateParser(knownIdParser(storyBeatById, "story beat")),
  activeRun: nullable(dishRunParser),
  testDay: nullable(testDayParser),
  service: nullable(serviceRunParser),
  platingCards: arrayOf(platingCardParser),
  tasteMemory: arrayOf(tasteMemoryParser),
  diary: refined(
    arrayOf(diaryEntryParser),
    (diary) => diary.length <= CAREER.diarySize,
    "a Dish Diary that fits",
  ),
  log: refined(arrayOf(logEntryParser), (log) => log.length <= LOG_SIZE, "a short results log"),
  awards: distinctListOf(AWARD_IDS, "award"),
  cleanStreak: countParser,
  lastShiftDay: integerRangeParser(0, Number.MAX_SAFE_INTEGER),
  guide: booleanParser,
  nextRunNumber: dayParser,
  path: nullable(pathStateParser),
  peeked: distinctListOf(PATH_IDS, "door"),
  rng: rngParser,
});

function runNumber(id: string): number {
  return Math.max(idNumber(id, "run"), idNumber(id, "service"));
}

function countersFit(state: GameState): boolean {
  const ids = [state.activeRun?.id, state.service?.id].filter((id): id is string => id !== undefined);
  return ids.every((id) => runNumber(id) < state.nextRunNumber);
}

function orderRunFits(state: GameState): boolean {
  const run = state.activeRun;
  if (run === null || run.stage === "done" || run.purpose.kind !== "order") return true;
  const { gigId } = run.purpose;
  return state.gigs.active.some((gig) => gig.id === gigId);
}

function orderDishesFit(state: GameState): boolean {
  return state.orderDishes.every((entry) => {
    const gig = state.gigs.active.find((candidate) => candidate.id === entry.gigId);
    if (gig === undefined) return false;
    return state.orderDishes.filter((other) => other.gigId === entry.gigId).length < gig.brief.dishCount;
  });
}

function pathFits(state: GameState): boolean {
  const path = state.path;
  const kind = state.service?.kind;
  if (path === null) return kind !== "night" && kind !== "festival" && kind !== "launch";
  if (state.rung !== "head") return false;
  const nightOpen = path.kind === "restaurant" && path.tonight !== null;
  const festivalOpen = path.kind === "truck" && path.today !== null;
  if (nightOpen !== (kind === "night") || festivalOpen !== (kind === "festival")) return false;
  return kind !== "launch" || (path.kind === "tv" && path.book !== null);
}

function oneThingAtATime(state: GameState): boolean {
  const cooking = state.activeRun !== null && state.activeRun.stage !== "done";
  if (state.service !== null && cooking) return false;
  return state.testDay === null || state.service === null;
}

export const gameStateParser = refined(
  shapeParser,
  (state) =>
    countersFit(state) &&
    orderRunFits(state) &&
    orderDishesFit(state) &&
    oneThingAtATime(state) &&
    pathFits(state) &&
    state.board.day === state.calendar.day,
  "a kitchen whose counters and hours fit together",
);
