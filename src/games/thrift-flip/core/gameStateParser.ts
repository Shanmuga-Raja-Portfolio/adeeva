import { BASE_DAY_HOURS } from "../../../engine/dayHours";
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
  type Parser,
  rangeParser,
  refined,
  stringParser,
} from "../../../engine/parse";
import {
  gigBoardParser,
  profileShape,
  rngParser,
  storyStateParser,
  trendStateParser,
} from "../../../engine/stateParsers";
import { hasUniqueIds } from "../../../engine/uniqueIds";
import { TRIM_IDS } from "../../adeeva/content/trim";
import { MAX_SCRAPS } from "../content/finish";
import { SEASON_LENGTH_DAYS } from "../content/season";
import { UPGRADE_IDS } from "../content/upgrade";
import { briefParser, countParser, positiveIntegerParser } from "./briefParser";
import { flipRunParser, ownedFindParser, scrapParser } from "./flipRunParser";
import { boutiqueParser } from "./boutiqueParser";
import { SHELF_SIZE } from "./capsuleShelf";
import { seasonDayOf } from "./seasonCalendar";
import { swapLimit } from "./swapRoll";
import { windowLimits } from "./windowDisplay";
import {
  SCHEMA_VERSION,
  type CalendarState,
  type Counters,
  type GameState,
  type GigBoard,
  type Profile,
  type RailSlot,
  type Stock,
} from "./gameState";
import {
  careerIdParser,
  clientIdParser,
  conditionParser,
  findIdParser,
  storyBeatIdParser,
} from "./idParsers";
import type { FlipStage } from "./flipStage";
import { slotPrice } from "./marketRail";
import { rackPieceParser, stallResultParser, logEntryParser } from "./resultParsers";
import { runKind } from "./runKind";
import { runStagesBefore } from "./runStages";
import { stageIssues } from "./stageReadiness";

const profileParser = objectOf<Profile>({ ...profileShape, career: careerIdParser });

const calendarParser = objectOf<CalendarState>({
  day: positiveIntegerParser,
  hoursLeft: integerRangeParser(0, BASE_DAY_HOURS),
  marketOpen: booleanParser,
});

const gigBoardStateParser: Parser<GigBoard> = gigBoardParser(briefParser, clientIdParser);

const railSlotParser = objectOf<RailSlot>({
  id: stringParser,
  findId: findIdParser,
  grade: conditionParser,
  price: positiveIntegerParser,
  sold: booleanParser,
});

const stockParser = objectOf<Stock>({
  finds: arrayOf(ownedFindParser),
  savedTrims: fixedRecordOf(TRIM_IDS, countParser),
  scraps: refined(
    arrayOf(scrapParser),
    (scraps) => scraps.length <= MAX_SCRAPS,
    `at most ${MAX_SCRAPS} scraps`,
  ),
});

const countersParser = objectOf<Counters>({
  run: positiveIntegerParser,
  find: positiveIntegerParser,
  scrap: positiveIntegerParser,
  piece: positiveIntegerParser,
});

const shapeParser = objectOf<GameState>({
  schemaVersion: oneOf([SCHEMA_VERSION] as const),
  profile: profileParser,
  calendar: calendarParser,
  coins: integerParser,
  reputation: countParser,
  buzz: rangeParser(0, 100),
  trends: trendStateParser,
  gigs: gigBoardStateParser,
  story: storyStateParser(storyBeatIdParser),
  rail: arrayOf(railSlotParser),
  stock: stockParser,
  upgrades: distinctListOf(UPGRADE_IDS, "upgrade"),
  activeRun: nullable(flipRunParser),
  rack: arrayOf(rackPieceParser),
  stall: nullable(stallResultParser),
  log: arrayOf(logEntryParser),
  flipsFinished: countParser,
  gigsDelivered: countParser,
  fairSales: countParser,
  keptInUse: countParser,
  boutique: nullable(boutiqueParser),
  next: countersParser,
  rng: rngParser,
});

function numbered(id: string, prefix: string): number {
  const match = new RegExp(`^${prefix}-(\\d+)$`).exec(id);
  return match?.[1] === undefined ? 0 : Number(match[1]);
}

function countersAhead(state: GameState): boolean {
  const runs = [
    ...state.log.map((entry) => entry.runId),
    ...(state.activeRun === null ? [] : [state.activeRun.id]),
  ];
  const finds = [...state.stock.finds, ...(state.activeRun?.finds ?? [])].map((owned) => owned.id);
  return (
    runs.every((id) => numbered(id, "run") < state.next.run) &&
    finds.every((id) => numbered(id, "find") < state.next.find) &&
    state.stock.scraps.every((scrap) => numbered(scrap.id, "scrap") < state.next.scrap) &&
    state.rack.every((piece) => numbered(piece.id, "piece") < state.next.piece)
  );
}

function idsUnique(state: GameState): boolean {
  return (
    hasUniqueIds(state.stock.finds) &&
    hasUniqueIds(state.stock.scraps) &&
    hasUniqueIds(state.rack) &&
    hasUniqueIds(state.rail) &&
    hasUniqueIds([...state.gigs.offers, ...state.gigs.active])
  );
}

const PROGRESS_STAGES: readonly FlipStage[] = ["design", "market", "unpick", "clean", "layout", "sew"];

function runProgressHolds(state: GameState): boolean {
  const run = state.activeRun;
  if (run === null) return true;
  const stocked = new Set(state.stock.finds.map((owned) => owned.id));
  const lent = runKind(run) !== "flip";
  const findsPlaced = run.finds.every((owned) => stocked.has(owned.id) === (!lent && !run.cutDone));
  const earlierDone = runStagesBefore(run, run.stage)
    .filter((stage) => PROGRESS_STAGES.includes(stage))
    .every((stage) => stageIssues(state, { ...run, stage }).length === 0);
  return findsPlaced && earlierDone;
}

function boutiqueConsistent(state: GameState): boolean {
  const boutique = state.boutique;
  if ((state.profile.career === "boutique") !== (boutique !== null)) return false;
  if (boutique === null) return true;
  const rackIds = new Set(state.rack.map((piece) => piece.id));
  const season = boutique.season;
  const limits = windowLimits(state);
  return (
    season.capsule.every((id) => rackIds.has(id)) &&
    boutique.window.pieces.every(
      (entry) => rackIds.has(entry.pieceId) && !season.capsule.includes(entry.pieceId),
    ) &&
    boutique.window.props.every((entry) => boutique.props.includes(entry.propId)) &&
    season.startDay <= state.calendar.day &&
    seasonDayOf(season, state.calendar.day) <= SEASON_LENGTH_DAYS &&
    boutique.openedDay <= season.startDay &&
    season.capsule.length <= SHELF_SIZE &&
    boutique.window.pieces.length <= limits.pieces &&
    boutique.window.props.length <= limits.props &&
    (season.swapDay === null || season.swapDay.swaps <= swapLimit(state))
  );
}

function worldConsistent(state: GameState): boolean {
  return (
    countersAhead(state) &&
    idsUnique(state) &&
    runProgressHolds(state) &&
    boutiqueConsistent(state) &&
    (state.stall === null || state.stall.day <= state.calendar.day) &&
    state.rail.every((slot) => slot.price === slotPrice(slot.findId, slot.grade))
  );
}

export const gameStateParser = refined(
  shapeParser,
  worldConsistent,
  "ids, prices, days and flip progress that agree with each other",
);
