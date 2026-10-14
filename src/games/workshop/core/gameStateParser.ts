import type { DayClock } from "../../../engine/dayHours";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import {
  arrayOf,
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
} from "../../../engine/stateParsers";
import { UPGRADE_IDS } from "../content/upgrade";
import { dayHours, SKYLIGHT_HOURS } from "./calendar";
import { storyBeatById } from "./catalog";
import { runNumber } from "./commissionRun";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { boardNumber } from "./ownedBoard";
import { decorParser, logEntryParser, woodTrendsParser } from "./resultParsers";
import { briefParser, clientIdParser, ownedBoardParser, runParser } from "./runParser";

const calendarParser = objectOf<DayClock>({
  day: dayParser,
  hoursLeft: integerRangeParser(0, BASE_DAY_HOURS + SKYLIGHT_HOURS),
});

function unique<T>(items: readonly T[]): boolean {
  return new Set(items).size === items.length;
}

const gameStateShapeParser = objectOf<GameState>({
  schemaVersion: oneOf([SCHEMA_VERSION]),
  profile: profileParser,
  calendar: calendarParser,
  coins: integerParser,
  reputation: countParser,
  buzz: integerRangeParser(0, MAX_BUZZ),
  trends: woodTrendsParser,
  gigs: gigBoardParser(briefParser, clientIdParser),
  story: storyStateParser(knownIdParser(storyBeatById, "story beat")),
  boards: arrayOf(ownedBoardParser),
  upgrades: refined(arrayOf(oneOf(UPGRADE_IDS)), unique, "each upgrade at most once"),
  decor: refined(arrayOf(decorParser), (decor) => unique(decor.map((entry) => entry.id)), "each decor once"),
  activeRun: nullable(runParser),
  log: arrayOf(logEntryParser),
  delivered: countParser,
  nextRunNumber: dayParser,
  nextBoardNumber: dayParser,
  rng: rngParser,
});

function countersAhead(state: GameState): boolean {
  const runIds = [
    ...state.log.map((entry) => entry.runId),
    ...(state.activeRun === null ? [] : [state.activeRun.id]),
  ];
  const boardIds = [...state.boards, ...(state.activeRun?.usedBoards ?? [])].map((board) => board.id);
  return (
    runIds.every((id) => runNumber(id) < state.nextRunNumber) &&
    boardIds.every((id) => boardNumber(id) < state.nextBoardNumber) &&
    unique(boardIds)
  );
}

const countedStateParser = refined(
  gameStateShapeParser,
  countersAhead,
  "counters above every saved run and board",
);

export const gameStateParser = refined(
  countedStateParser,
  (state) => state.calendar.hoursLeft <= dayHours(state),
  "no more hours left today than the garage's day holds",
);
