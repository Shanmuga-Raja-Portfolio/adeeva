import {
  arrayOf,
  booleanParser,
  distinctListOf,
  integerParser,
  nullable,
  objectOf,
  oneOf,
  rangeParser,
  recordOf,
  refined,
  stringParser,
  type Parser,
} from "../../../engine/parse";
import { subScoreParser } from "../../../engine/stateParsers";
import { hasUniqueIds } from "../../../engine/uniqueIds";
import { SHOW_PANEL_IDS } from "../content/showPanel";
import { SWAP_TABLE_KINDS } from "../content/swapNeighbour";
import { WINDOW_PROP_IDS } from "../content/windowProp";
import type {
  Boutique,
  BoutiqueSeason,
  RosetteEntry,
  Showcase,
  ShowcasePlan,
  SwapDay,
  SwapSlot,
  SwapTable,
  WindowDisplay,
  WindowPiece,
  WindowProp,
} from "./boutique";
import { countParser, positiveIntegerParser } from "./briefParser";
import { findById } from "./catalog";
import { stainParser, stainWorkParser, seamProgressParser, unpickLineParser } from "./flipRunParser";
import {
  conditionParser,
  findIdParser,
  lightIdParser,
  moodIdParser,
  propIdParser,
  rosetteIdParser,
  seasonIdParser,
  signIdParser,
} from "./idParsers";
import { rackPieceParser } from "./resultParsers";
import type { ShowcaseResult, ShowPanelScore } from "./showcaseScore";
import { WINDOW_HEIGHT, WINDOW_WIDTH } from "./windowDisplay";

const anyKey = (): boolean => true;
const scoreParser = rangeParser(0, 100);
const xParser = rangeParser(0, WINDOW_WIDTH);
const yParser = rangeParser(0, WINDOW_HEIGHT);

const windowParser = objectOf<WindowDisplay>({
  pieces: arrayOf(objectOf<WindowPiece>({ pieceId: stringParser, x: xParser, y: yParser })),
  props: arrayOf(objectOf<WindowProp>({ propId: propIdParser, x: xParser, y: yParser })),
});

const planParser = objectOf<ShowcasePlan>({
  order: arrayOf(stringParser),
  mood: moodIdParser,
  light: lightIdParser,
  cards: recordOf(anyKey, stringParser),
});

const panelParser = objectOf<ShowPanelScore>({
  id: oneOf(SHOW_PANEL_IDS),
  label: stringParser,
  score: scoreParser,
  parts: arrayOf(subScoreParser),
  praise: stringParser,
  tip: nullable(stringParser),
});

const resultParser = objectOf<ShowcaseResult>({
  panels: arrayOf(panelParser),
  latePenalty: countParser,
  overall: scoreParser,
  rosette: rosetteIdParser,
  requests: countParser,
  coins: countParser,
  reputation: integerParser,
  buzz: countParser,
});

const showcaseParser = objectOf<Showcase>({
  day: positiveIntegerParser,
  plan: planParser,
  pieces: arrayOf(rackPieceParser),
  result: resultParser,
});

const tableParser = refined(
  objectOf<SwapTable>({
    id: stringParser,
    neighbour: stringParser,
    request: stringParser,
    findId: findIdParser,
    kind: oneOf(SWAP_TABLE_KINDS),
    line: countParser,
    stain: stainParser,
    unpick: unpickLineParser,
    scrub: stainWorkParser,
    soaked: booleanParser,
    seam: nullable(seamProgressParser),
    charged: booleanParser,
    rewarded: booleanParser,
  }),
  (table) =>
    table.line < findById(table.findId).lines.length &&
    table.scrub.cellTicks.length === table.stain.cells &&
    (table.charged ||
      (table.unpick.attempts === 0 && table.scrub.scrubTicks === 0 && !table.soaked && table.seam === null)),
  "a stitch line and stain that belong to the table's item, and work only on a paid table",
);

const slotParser = objectOf<SwapSlot>({
  id: stringParser,
  findId: findIdParser,
  grade: conditionParser,
  taken: booleanParser,
});

const swapDayParser = refined(
  objectOf<SwapDay>({
    day: positiveIntegerParser,
    committed: booleanParser,
    tables: arrayOf(tableParser),
    rail: arrayOf(slotParser),
    swaps: countParser,
  }),
  (swapDay) =>
    hasUniqueIds(swapDay.tables) &&
    hasUniqueIds(swapDay.rail) &&
    swapDay.swaps === swapDay.rail.filter((slot) => slot.taken).length,
  "tables and swap slots with their own ids, and one swap for each taken slot",
);

const seasonParser = objectOf<BoutiqueSeason>({
  number: positiveIntegerParser,
  themeId: seasonIdParser,
  startDay: positiveIntegerParser,
  capsule: refined(arrayOf(stringParser), (ids) => new Set(ids).size === ids.length, "each piece once"),
  showcase: nullable(showcaseParser),
  swapDay: nullable(swapDayParser),
});

const rosetteEntryParser = objectOf<RosetteEntry>({
  season: positiveIntegerParser,
  themeId: seasonIdParser,
  rosette: rosetteIdParser,
  overall: scoreParser,
});

export const boutiqueParser: Parser<Boutique> = objectOf<Boutique>({
  signId: signIdParser,
  openedDay: positiveIntegerParser,
  season: seasonParser,
  window: windowParser,
  props: distinctListOf(WINDOW_PROP_IDS, "prop"),
  rosettes: arrayOf(rosetteEntryParser),
});
