import type { DayClock } from "../../../engine/dayHours";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { runIdsBelow } from "../../../engine/idNumber";
import {
  arrayOf,
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
} from "../../../engine/stateParsers";
import { CAREER_IDS } from "../content/career";
import { UPGRADE_IDS } from "../content/upgrade";
import { dayHours, SKYLIGHT_HOURS } from "./calendar";
import { storyBeatById } from "./catalog";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { renJobsPerDay } from "./apprentice";
import { setNumber } from "./fairPick";
import { boardNumber } from "./ownedBoard";
import { decorParser, logEntryParser, woodTrendsParser } from "./resultParsers";
import { briefParser, clientIdParser, ownedBoardParser, runParser } from "./runParser";
import { bayCount } from "./showroomFloor";
import { apprenticeStateParser, fairStateParser, showroomStateParser } from "./showroomParsers";
import { workshopProfileParser } from "./workshopProfile";

const calendarParser = objectOf<DayClock>({
  day: dayParser,
  hoursLeft: integerRangeParser(0, BASE_DAY_HOURS + SKYLIGHT_HOURS),
});

function unique<T>(items: readonly T[]): boolean {
  return new Set(items).size === items.length;
}

const gameStateShapeParser = objectOf<GameState>({
  schemaVersion: oneOf([SCHEMA_VERSION]),
  profile: workshopProfileParser,
  career: oneOf(CAREER_IDS),
  calendar: calendarParser,
  coins: integerParser,
  reputation: countParser,
  buzz: integerRangeParser(0, MAX_BUZZ),
  trends: woodTrendsParser,
  gigs: gigBoardParser(briefParser, clientIdParser),
  story: storyStateParser(knownIdParser(storyBeatById, "story beat")),
  boards: arrayOf(ownedBoardParser),
  upgrades: distinctListOf(UPGRADE_IDS, "upgrade"),
  decor: refined(arrayOf(decorParser), (decor) => unique(decor.map((entry) => entry.id)), "each decor once"),
  activeRun: nullable(runParser),
  log: arrayOf(logEntryParser),
  delivered: countParser,
  nextRunNumber: dayParser,
  nextBoardNumber: dayParser,
  showroom: nullable(showroomStateParser),
  fair: nullable(fairStateParser),
  apprentice: nullable(apprenticeStateParser),
  rng: rngParser,
});

function countersAhead(state: GameState): boolean {
  const runIds = [
    ...state.log.map((entry) => entry.runId),
    ...(state.activeRun === null ? [] : [state.activeRun.id]),
  ];
  const boardIds = [...state.boards, ...(state.activeRun?.usedBoards ?? [])].map((board) => board.id);
  return (
    runIdsBelow(runIds, state.nextRunNumber) &&
    boardIds.every((id) => boardNumber(id) < state.nextBoardNumber) &&
    unique(boardIds)
  );
}

const countedStateParser = refined(
  gameStateShapeParser,
  countersAhead,
  "counters above every saved run and board",
);

function setNumbersBelow(state: GameState): boolean {
  const showroom = state.showroom;
  if (showroom === null) return true;
  const purpose = state.activeRun?.purpose;
  const setIds = [
    ...showroom.floor.map((set) => set.setId),
    ...(purpose?.kind === "set" ? [purpose.setId] : []),
  ];
  return setIds.every((id) => setNumber(id) < showroom.nextSetNumber);
}

function showroomFits(state: GameState): boolean {
  const bays = bayCount(state);
  const jobs = state.apprentice === null ? 0 : state.apprentice.jobsToday;
  return (
    setNumbersBelow(state) &&
    (state.showroom?.floor ?? []).every((set) => set.bay < bays) &&
    jobs <= renJobsPerDay(state)
  );
}

function careerFits(state: GameState): boolean {
  const showroomParts = [state.showroom, state.fair, state.apprentice];
  if (state.career === "garage")
    return showroomParts.every((part) => part === null) && state.activeRun?.purpose.kind !== "set";
  return showroomParts.every((part) => part !== null) && showroomFits(state);
}

const careerStateParser = refined(
  countedStateParser,
  careerFits,
  "a showroom only in the showroom career, with sets in its own bays and Ren within a day's jobs",
);

export const gameStateParser = refined(
  careerStateParser,
  (state) => state.calendar.hoursLeft <= dayHours(state),
  "no more hours left today than the garage's day holds",
);
