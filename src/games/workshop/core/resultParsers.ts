import {
  arrayOf,
  booleanParser,
  integerParser,
  integerRangeParser,
  nullable,
  objectOf,
  oneOf,
  stringParser,
} from "../../../engine/parse";
import {
  countParser,
  criterionParserOf,
  dayParser,
  shareParser,
  trendRewardShape,
  wholeRewardLineParser,
} from "../../../engine/stateParsers";
import { DECOR_IDS } from "../content/decor";
import { PRODUCT_IDS } from "../content/product";
import { WOOD_IDS } from "../content/wood";
import { CRITERION_IDS } from "./criterion";
import type { LogEntry, OwnedDecor } from "./gameState";
import type { Evaluation } from "./pieceEvaluate";
import type { QualityBreakdown } from "./pieceQuality";
import type { Reward } from "./rewards";
import { clientIdParser, scoreParser, woodTagParser } from "./runParser";
import { colourIdParser, trendStateParserOf } from "../../../engine/stateParsers";

const criterionParser = criterionParserOf(CRITERION_IDS, countParser);

const qualityParser = objectOf<QualityBreakdown>({
  saw: shareParser,
  join: shareParser,
  sand: shareParser,
  grain: shareParser,
  woodFit: shareParser,
  quality: scoreParser,
});

const evaluationParser = objectOf<Evaluation>({
  criteria: arrayOf(criterionParser),
  quality: qualityParser,
  favouredColoursUsed: countParser,
  spend: countParser,
  score: scoreParser,
  stars: integerRangeParser(1, 5),
  passed: booleanParser,
  feedback: arrayOf(stringParser),
});

const rewardParser = objectOf<Reward>(trendRewardShape(woodTagParser, integerParser, wholeRewardLineParser));

export const logEntryParser = objectOf<LogEntry>({
  runId: stringParser,
  clientId: clientIdParser,
  day: dayParser,
  productId: oneOf(PRODUCT_IDS),
  woodId: oneOf(WOOD_IDS),
  evaluation: evaluationParser,
  reward: rewardParser,
});

export const woodTrendsParser = trendStateParserOf(woodTagParser);

export const decorParser = objectOf<OwnedDecor>({ id: oneOf(DECOR_IDS), paint: nullable(colourIdParser) });
