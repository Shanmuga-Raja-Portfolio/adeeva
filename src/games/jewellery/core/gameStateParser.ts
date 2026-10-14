import { BASE_DAY_HOURS, type DayClock } from "../../../engine/dayHours";
import {
  arrayOf,
  booleanParser,
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
import { EXTRA_IDS } from "../content/extra";
import { THEME_IDS } from "../content/marketTheme";
import { METAL_IDS } from "../content/metal";
import { STOCK_SIZE_IDS } from "../content/stockSize";
import { STONE_IDS } from "../content/stone";
import { UPGRADE_IDS } from "../content/upgrade";
import { sameBrief } from "./brief";
import { briefParser, clientIdParser, jewelTagParser } from "./briefParser";
import { dayLength, STOOL_HOURS } from "./calendar";
import { storyBeatById } from "./catalog";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { KEEPSAKE_CASE_SIZE } from "./keepsakeCase";
import { pieceRunParser } from "./pieceRunParser";
import { keepsakeParser, logEntryParser, marketParser, stallPieceParser } from "./resultParsers";
import { STALL_BOX_SIZE } from "./stallBox";
import type { Stock } from "./stock";

const calendarParser = objectOf<DayClock>({
  day: dayParser,
  hoursLeft: integerRangeParser(0, BASE_DAY_HOURS + STOOL_HOURS),
});

const stockParser = objectOf<Stock>({
  metal: fixedRecordOf(METAL_IDS, fixedRecordOf(STOCK_SIZE_IDS, countParser)),
  stones: fixedRecordOf(STONE_IDS, countParser),
  extras: fixedRecordOf(EXTRA_IDS, countParser),
  clips: countParser,
});

function uniqueList<T extends string>(options: readonly T[], label: string) {
  return refined(
    arrayOf(oneOf(options)),
    (values) => new Set(values).size === values.length,
    `each ${label} at most once`,
  );
}

const gameStateShapeParser = objectOf<GameState>({
  schemaVersion: oneOf([SCHEMA_VERSION]),
  profile: profileParser,
  calendar: calendarParser,
  coins: integerParser,
  reputation: countParser,
  buzz: integerRangeParser(0, MAX_BUZZ),
  stock: stockParser,
  upgrades: uniqueList(UPGRADE_IDS, "upgrade"),
  decor: uniqueList(DECOR_IDS, "decoration"),
  guide: booleanParser,
  trends: trendStateParserOf(jewelTagParser),
  marketTheme: oneOf(THEME_IDS),
  gigs: gigBoardParser(briefParser, clientIdParser),
  story: storyStateParser(knownIdParser(storyBeatById, "story beat")),
  activeRun: nullable(pieceRunParser),
  stallBox: refined(
    arrayOf(stallPieceParser),
    (box) => box.length <= STALL_BOX_SIZE,
    "a stall box that fits",
  ),
  market: marketParser,
  keepsakes: refined(
    arrayOf(keepsakeParser),
    (entries) => entries.length <= KEEPSAKE_CASE_SIZE,
    "a Keepsake Case that fits",
  ),
  log: arrayOf(logEntryParser),
  ordersDelivered: countParser,
  nextRunNumber: dayParser,
  rng: rngParser,
});

function runNumber(runId: string): number {
  const match = /^run-(\d+)$/.exec(runId);
  return match?.[1] === undefined ? 0 : Number(match[1]);
}

function runNumbersBelowNext(state: GameState): boolean {
  const ids = state.log.map((entry) => entry.runId);
  if (state.activeRun !== null) ids.push(state.activeRun.id);
  return ids.every((id) => runNumber(id) < state.nextRunNumber);
}

function orderRunMatchesGig(state: GameState): boolean {
  const run = state.activeRun;
  if (run === null || run.stage === "done" || run.purpose.kind !== "order" || run.brief === null) return true;
  const { gigId } = run.purpose;
  const gig = state.gigs.active.find((entry) => entry.id === gigId);
  return gig !== undefined && sameBrief(gig.brief, run.brief);
}

function hoursFitDay(state: GameState): boolean {
  return state.calendar.hoursLeft <= dayLength(state);
}

export const gameStateParser = refined(
  gameStateShapeParser,
  (state) => runNumbersBelowNext(state) && hoursFitDay(state) && orderRunMatchesGig(state),
  "a bench whose counters and hours fit together",
);
