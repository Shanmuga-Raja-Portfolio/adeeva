import { MUSIC_MOODS } from "../../../engine/musicMood";
import {
  arrayOf,
  booleanParser,
  fixedRecordOf,
  integerRangeParser,
  nullable,
  objectOf,
  oneOf,
  recordOf,
  stringParser,
} from "../../../engine/parse";
import { countParser, dayParser, subScoreParser, wholeRewardLineParser } from "../../../engine/stateParsers";
import { AWARD_IDS } from "../content/launchAward";
import { LAUNCH_SPOT_NUMBERS } from "../content/launchSpot";
import { LAUNCH_THEME_IDS } from "../content/launchTheme";
import { LANTERN_COLOUR_IDS } from "../content/lanternColour";
import { METAL_IDS } from "../content/metal";
import { LAUNCH_PANEL_IDS } from "../content/panelMember";
import { PRICE_TAG_IDS } from "../content/priceTag";
import { PRODUCT_IDS } from "../content/product";
import { STONE_IDS } from "../content/stone";
import { clientIdParser, jewelColourParser, jewelTagParser } from "./briefParser";
import type {
  LaunchPanelScore,
  LaunchPlan,
  LaunchResult,
  LaunchState,
  PendingCopy,
  PopupEntry,
  PopupResult,
  ShelfSale,
} from "./launchState";
import { optionsParser } from "./pieceLookParser";
import { scoreParser } from "./resultParsers";

const spotParser = oneOf(LAUNCH_SPOT_NUMBERS);
const awardParser = oneOf(AWARD_IDS);

const planParser = objectOf<LaunchPlan>({
  order: arrayOf(stringParser),
  lantern: oneOf(LANTERN_COLOUR_IDS),
  music: oneOf(MUSIC_MOODS.map((mood) => mood.id)),
  card: integerRangeParser(0, 2),
});

const panelParser = objectOf<LaunchPanelScore>({
  id: oneOf(LAUNCH_PANEL_IDS),
  label: stringParser,
  score: scoreParser,
  parts: arrayOf(subScoreParser),
  praise: stringParser,
});

const resultParser = objectOf<LaunchResult>({
  day: dayParser,
  seasonNumber: dayParser,
  themeId: oneOf(LAUNCH_THEME_IDS),
  spot: spotParser,
  plan: planParser,
  panels: arrayOf(panelParser),
  latePenalty: countParser,
  overall: scoreParser,
  award: awardParser,
  coins: countParser,
  reputation: integerRangeParser(-5, 100),
  buzz: countParser,
  tip: stringParser,
  spotAfter: spotParser,
});

const entryParser = objectOf<PopupEntry>({
  pieceId: stringParser,
  tag: oneOf(PRICE_TAG_IDS),
  hearts: countParser,
  price: countParser,
  sold: booleanParser,
  cameBack: booleanParser,
});

const shelfParser = objectOf<ShelfSale>({ pieceId: stringParser, coins: countParser, sold: booleanParser });

const popupParser = objectOf<PopupResult>({
  day: dayParser,
  seasonNumber: dayParser,
  plinth: stringParser,
  entries: arrayOf(entryParser),
  shelf: arrayOf(shelfParser),
  lines: arrayOf(wholeRewardLineParser),
  coins: countParser,
  buzz: countParser,
  copyRequests: integerRangeParser(0, 2),
});

const copyParser = objectOf<PendingCopy>({
  visitorId: clientIdParser,
  pieceId: stringParser,
  productId: oneOf(PRODUCT_IDS),
  options: optionsParser,
  metalId: oneOf(METAL_IDS),
  stoneId: nullable(oneOf(STONE_IDS)),
  colours: arrayOf(jewelColourParser),
  tag: jewelTagParser,
  fee: countParser,
  budget: countParser,
  days: integerRangeParser(1, 14),
});

export const launchParser = objectOf<LaunchState>({
  spot: spotParser,
  spotOffer: booleanParser,
  result: nullable(resultParser),
  popup: nullable(popupParser),
  garland: fixedRecordOf(LAUNCH_THEME_IDS, nullable(awardParser)),
  awardsBySeason: recordOf((key) => /^[1-9][0-9]*$/.test(key), awardParser),
  pendingCopies: arrayOf(copyParser),
});
