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
  rngParser,
  storyStateParser,
  trendStateParserOf,
} from "../../../engine/stateParsers";
import { CAREER_IDS } from "../content/career";
import { DECOR_IDS } from "../content/decor";
import { EXTRA_IDS } from "../content/extra";
import { THEME_IDS } from "../content/marketTheme";
import { METAL_IDS } from "../content/metal";
import { STOCK_SIZE_IDS } from "../content/stockSize";
import { STONE_IDS } from "../content/stone";
import { UPGRADE_IDS } from "../content/upgrade";
import { sameBrief } from "./brief";
import { briefParser, clientIdParser, jewelTagParser } from "./briefParser";
import { dayLength, STOOL_HOURS } from "./calendarHours";
import { storyBeatById } from "./catalog";
import { collectionParser } from "./collectionParsers";
import { jewelleryProfileParser } from "./jewelleryProfile";
import { launchParser } from "./launchParsers";
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

const gameStateShapeParser = objectOf<GameState>({
  schemaVersion: oneOf([SCHEMA_VERSION]),
  profile: jewelleryProfileParser,
  career: oneOf(CAREER_IDS),
  calendar: calendarParser,
  coins: integerParser,
  reputation: countParser,
  buzz: integerRangeParser(0, MAX_BUZZ),
  stock: stockParser,
  upgrades: distinctListOf(UPGRADE_IDS, "upgrade"),
  decor: distinctListOf(DECOR_IDS, "decoration"),
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
  collection: nullable(collectionParser),
  launch: nullable(launchParser),
  rng: rngParser,
});

function runNumbersBelowNext(state: GameState): boolean {
  const ids = state.log.map((entry) => entry.runId);
  if (state.activeRun !== null) ids.push(state.activeRun.id);
  return runIdsBelow(ids, state.nextRunNumber);
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

function careerFits(state: GameState): boolean {
  const loft = state.career === "collection";
  if (loft !== (state.collection !== null) || loft !== (state.launch !== null)) return false;
  if (state.profile.startedAs === "collection" && !loft) return false;
  const run = state.activeRun;
  return loft || run === null || run.purpose.kind !== "collection";
}

function lineFits(state: GameState): boolean {
  const collection = state.collection;
  if (collection === null) return true;
  const brief = collection.brief;
  const slots = brief?.products.length ?? 0;
  const run = state.activeRun;
  const runSlot =
    run !== null && run.purpose.kind === "collection" && run.stage !== "done" ? run.purpose.slot : null;
  if (runSlot !== null && brief !== null && brief.products[runSlot] !== run?.design.productId) return false;
  if (collection.pieces.some((piece) => piece.slot >= slots)) return false;
  if (new Set(collection.pieces.map((piece) => piece.slot)).size !== collection.pieces.length) return false;
  if (
    run !== null &&
    run.purpose.kind === "collection" &&
    run.potStones.some((index) => collection.stonePot[index] === undefined)
  )
    return false;
  return collection.pieces.every((piece) => brief?.products[piece.slot] === piece.look.productId);
}

export const gameStateParser = refined(
  gameStateShapeParser,
  (state) =>
    runNumbersBelowNext(state) &&
    hoursFitDay(state) &&
    orderRunMatchesGig(state) &&
    careerFits(state) &&
    lineFits(state),
  "a bench whose counters and hours fit together",
);
