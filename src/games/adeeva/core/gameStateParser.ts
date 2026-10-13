import { avatarLookParser } from "../../../engine/avatar";
import { CAREER_IDS } from "../content/career";
import { DIFFICULTY_IDS } from "../../../engine/difficulty";
import { TRAIT_IDS } from "../../../engine/trait";
import { TRIM_IDS } from "../content/trim";
import { UPGRADE_IDS } from "../content/upgrade";
import { fabricById } from "./catalog";
import { hoursPerDay } from "./dayHours";
import { clientIdParser, storyBeatIdParser, styleTagParser } from "./catalogIdParsers";
import { METRE_STEP } from "./cutMetres";
import { briefParser, dressRunParser, nonNegativeParser } from "./dressRunParser";
import {
  SCHEMA_VERSION,
  type CalendarState,
  type GameState,
  type Gig,
  type GigBoard,
  type Inventory,
  type LapsedGig,
  type Offer,
  type Profile,
  type StoryState,
  type StudioState,
} from "./gameState";
import { HOT_TAGS_PER_WEEK, type TrendState } from "./trendMarket";
import { labelSeasonParser, logEntryParser } from "./resultParsers";
import {
  arrayOf,
  booleanParser,
  fixedRecordOf,
  integerParser,
  integerRangeParser,
  nullable,
  objectOf,
  oneOf,
  rangeParser,
  recordOf,
  refined,
  stringParser,
} from "../../../engine/parse";

const dayParser = integerRangeParser(1, Number.MAX_SAFE_INTEGER);
const countParser = integerRangeParser(0, Number.MAX_SAFE_INTEGER);

const profileParser = objectOf<Profile>({
  name: refined(stringParser, (name) => name.trim().length > 0, "a name"),
  look: avatarLookParser,
  trait: oneOf(TRAIT_IDS),
  difficulty: oneOf(DIFFICULTY_IDS),
  career: oneOf(CAREER_IDS),
});

const calendarParser = objectOf<CalendarState>({
  day: dayParser,
  hoursLeft: integerRangeParser(0, 24),
  shopOpen: booleanParser,
});

const metresParser = refined(
  nonNegativeParser,
  (metres) => Number.isInteger(metres / METRE_STEP),
  "half-metre steps",
);

const inventoryParser = objectOf<Inventory>({
  fabricMetres: recordOf((id) => fabricById(id) !== undefined, metresParser),
  trims: fixedRecordOf(TRIM_IDS, countParser),
});

const studioParser = objectOf<StudioState>({
  upgrades: refined(
    arrayOf(oneOf(UPGRADE_IDS)),
    (upgrades) => new Set(upgrades).size === upgrades.length,
    "each upgrade at most once",
  ),
  assistantHired: booleanParser,
  assistantPaidThroughDay: countParser,
});

const hotTagsParser = refined(
  arrayOf(styleTagParser),
  (tags) => tags.length === HOT_TAGS_PER_WEEK,
  `${HOT_TAGS_PER_WEEK} hot tags`,
);

const trendParser = objectOf<TrendState>({ current: hotTagsParser, next: hotTagsParser });

const offerParser = objectOf<Offer>({
  id: stringParser,
  clientId: clientIdParser,
  brief: briefParser,
  expiresDay: dayParser,
});

const gigParser = objectOf<Gig>({
  id: stringParser,
  clientId: clientIdParser,
  brief: briefParser,
  acceptedDay: dayParser,
});

const lapsedGigParser = objectOf<LapsedGig>({
  gigId: stringParser,
  clientId: clientIdParser,
  day: dayParser,
  reputation: integerParser,
});

const gigBoardParser = objectOf<GigBoard>({
  offers: arrayOf(offerParser),
  active: arrayOf(gigParser),
  lapsed: arrayOf(lapsedGigParser),
  nextGigNumber: dayParser,
});

const storyParser = objectOf<StoryState>({
  seen: arrayOf(storyBeatIdParser),
  flags: arrayOf(stringParser),
  queue: arrayOf(storyBeatIdParser),
});

const gameStateShapeParser = objectOf<GameState>({
  schemaVersion: oneOf([SCHEMA_VERSION]),
  profile: profileParser,
  calendar: calendarParser,
  coins: integerParser,
  reputation: countParser,
  buzz: rangeParser(0, 100),
  inventory: inventoryParser,
  studio: studioParser,
  trends: trendParser,
  gigs: gigBoardParser,
  story: storyParser,
  activeRun: nullable(dressRunParser),
  season: nullable(labelSeasonParser),
  log: arrayOf(logEntryParser),
  deliveredRunIds: arrayOf(stringParser),
  gigsDelivered: countParser,
  nextRunNumber: dayParser,
  rng: integerRangeParser(-2147483648, 2147483647),
});

function runNumber(runId: string): number {
  const match = /^run-(\d+)$/.exec(runId);
  return match?.[1] === undefined ? 0 : Number(match[1]);
}

function runNumbersBelowNext(state: GameState): boolean {
  const ids = [...state.deliveredRunIds, ...state.log.map((entry) => entry.runId)];
  if (state.activeRun !== null) ids.push(state.activeRun.id);
  return ids.every((id) => runNumber(id) < state.nextRunNumber);
}

function lookRunHasSeason(state: GameState): boolean {
  return state.activeRun?.purpose.kind !== "look" || state.season !== null;
}

export const gameStateParser = refined(
  refined(
    refined(gameStateShapeParser, lookRunHasSeason, "a season for the look on the table"),
    (state) => state.calendar.hoursLeft <= hoursPerDay(state.studio),
    "no more hours left than a working day holds",
  ),
  runNumbersBelowNext,
  "a run counter above every saved run",
);
