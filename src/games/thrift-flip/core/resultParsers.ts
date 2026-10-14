import {
  arrayOf,
  booleanParser,
  distinctListOf,
  integerRangeParser,
  nullable,
  objectOf,
  oneOf,
  rangeParser,
  stringParser,
} from "../../../engine/parse";
import { criterionParserOf, rewardLineParser, trendRewardShape } from "../../../engine/stateParsers";
import { countParser, nonNegativeParser, positiveIntegerParser, shareParser } from "./briefParser";
import { CRITERION_IDS } from "./criterion";
import type { FlipEvaluation } from "./flipEvaluate";
import type { QualityBreakdown } from "./flipQuality";
import { designParser, placedFinishParser } from "./flipRunParser";
import type { LogEntry } from "./gameState";
import {
  clientIdParser,
  colourIdParser,
  findIdParser,
  materialIdParser,
  printIdParser,
  recipeIdParser,
  styleTagParser,
} from "./idParsers";
import type { LeavesParts, PieceCloth, RackPiece } from "./rackPiece";
import { TILL_BONUS_IDS } from "./tillDay";
import type { Reward } from "./rewards";
import type { StallResult, StallSale } from "./stallDay";
import type { LeavesBreakdown } from "./sustainability";

const scoreParser = rangeParser(0, 100);

const criterionParser = criterionParserOf(CRITERION_IDS, nonNegativeParser);

const qualityParser = objectOf<QualityBreakdown>({
  unpick: shareParser,
  clean: shareParser,
  cut: shareParser,
  seams: shareParser,
  grain: shareParser,
  restored: shareParser,
  quality: scoreParser,
});

const leavesParser = objectOf<LeavesBreakdown>({
  reuse: shareParser,
  salvage: shareParser,
  secondhand: shareParser,
  leaves: scoreParser,
});

const evaluationParser = objectOf<FlipEvaluation>({
  kind: oneOf(["gig", "own", "ticket"] as const),
  criteria: arrayOf(criterionParser),
  quality: qualityParser,
  leaves: leavesParser,
  favouredColoursUsed: integerRangeParser(0, 16),
  score: scoreParser,
  stars: integerRangeParser(1, 5),
  passed: booleanParser,
  feedback: arrayOf(stringParser),
  tags: arrayOf(styleTagParser),
  colours: arrayOf(colourIdParser),
  spend: nonNegativeParser,
});

const rewardParser = objectOf<Reward>({
  ...trendRewardShape(styleTagParser, nonNegativeParser, rewardLineParser),
  leafPick: booleanParser,
});

export const logEntryParser = objectOf<LogEntry>({
  runId: stringParser,
  kind: oneOf(["gig", "own", "ticket"] as const),
  clientId: nullable(clientIdParser),
  day: positiveIntegerParser,
  evaluation: evaluationParser,
  reward: nullable(rewardParser),
});

const clothParser = objectOf<PieceCloth>({
  colour: colourIdParser,
  print: printIdParser,
  material: materialIdParser,
});

const leavesPartsParser = objectOf<LeavesParts>({
  reuse: shareParser,
  salvage: shareParser,
  secondhand: shareParser,
});

export const rackPieceParser = objectOf<RackPiece>({
  id: stringParser,
  runId: stringParser,
  recipeId: recipeIdParser,
  design: designParser,
  cloth: clothParser,
  quality: scoreParser,
  leaves: scoreParser,
  tags: arrayOf(styleTagParser),
  finishes: arrayOf(placedFinishParser),
  madeDay: positiveIntegerParser,
  findIds: arrayOf(findIdParser),
  seamAccuracy: shareParser,
  leavesParts: leavesPartsParser,
  colours: arrayOf(colourIdParser),
  showcaseSeason: nullable(positiveIntegerParser),
});

const saleParser = objectOf<StallSale>({
  pieceId: stringParser,
  recipeId: recipeIdParser,
  price: positiveIntegerParser,
  value: countParser,
  low: countParser,
  high: countParser,
  outcome: oneOf(["bargain", "sold", "fair", "stayed"] as const),
  bonuses: distinctListOf(TILL_BONUS_IDS, "till bonus"),
});

export const stallResultParser = objectOf<StallResult>({
  day: positiveIntegerParser,
  sales: arrayOf(saleParser),
  coins: countParser,
  reputation: countParser,
  buzz: countParser,
});
