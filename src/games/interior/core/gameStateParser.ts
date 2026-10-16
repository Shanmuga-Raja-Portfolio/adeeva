import { BASE_DAY_HOURS, type DayClock } from "../../../engine/dayHours";
import { runIdsBelow } from "../../../engine/idNumber";
import {
  arrayOf,
  booleanParser,
  distinctListOf,
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
  rngParser,
  storyStateParser,
  trendStateParserOf,
} from "../../../engine/stateParsers";
import { CAREER_IDS } from "../content/career";
import { LOFT_DECOR_IDS } from "../content/loftDecor";
import { UPGRADE_IDS } from "../content/upgrade";
import { sameBrief } from "./brief";
import { briefParser, clientIdParser, roomTagParser } from "./briefParser";
import { dayLength, VAN_HOURS } from "./calendar";
import { storyBeatById } from "./catalog";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { interiorProfileParser } from "./interiorProfile";
import { larkspurParser } from "./larkspurParser";
import { logEntryParser } from "./resultParsers";
import { runParser } from "./runParser";
import { stockParser } from "./stockParser";

const calendarParser = objectOf<DayClock>({
  day: dayParser,
  hoursLeft: integerRangeParser(0, BASE_DAY_HOURS + VAN_HOURS),
});

const gameStateShapeParser = objectOf<GameState>({
  schemaVersion: oneOf([SCHEMA_VERSION]),
  profile: interiorProfileParser,
  career: oneOf(CAREER_IDS),
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
  larkspur: nullable(larkspurParser),
  log: arrayOf(logEntryParser),
  ordersDelivered: countParser,
  nextRunNumber: dayParser,
  rng: rngParser,
});

function runNumbersBelowNext(state: GameState): boolean {
  const ids = state.log.map((entry) => entry.runId);
  if (state.activeRun !== null) ids.push(state.activeRun.id);
  for (const room of state.larkspur?.project?.rooms ?? []) if (room !== null) ids.push(room.id);
  return runIdsBelow(ids, state.nextRunNumber);
}

function homeRoomFits(state: GameState): boolean {
  const purpose = state.activeRun?.purpose;
  if (purpose === undefined || purpose.kind !== "home-room") return true;
  const project = state.larkspur?.project ?? null;
  return (
    project !== null &&
    project.stage === "rooms" &&
    project.plotId === purpose.plotId &&
    project.rooms[purpose.roomIndex] === null &&
    project.map.spaces[purpose.roomIndex] === purpose.purposeId &&
    !project.crewJobs.some((job) => job.roomIndex === purpose.roomIndex)
  );
}

function careerFits(state: GameState): boolean {
  return (state.career === "development") === (state.larkspur !== null);
}

function runMatchesGig(state: GameState): boolean {
  const run = state.activeRun;
  if (run === null) return true;
  if (run.purpose.kind === "home-room") return homeRoomFits(state);
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
    runNumbersBelowNext(state) &&
    hoursFitDay(state) &&
    careerFits(state) &&
    runMatchesGig(state) &&
    runStartedByToday(state),
  "a loft whose counters and hours fit together",
);
