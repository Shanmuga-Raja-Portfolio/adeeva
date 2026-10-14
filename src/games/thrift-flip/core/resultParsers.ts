import {
  arrayOf,
  booleanParser,
  integerParser,
  integerRangeParser,
  nullable,
  objectOf,
  oneOf,
  rangeParser,
  stringParser,
} from "../../../engine/parse";
import { rewardLineParser } from "../../../engine/stateParsers";
import { countParser, nonNegativeParser, positiveIntegerParser, shareParser } from "./briefParser";
import { CRITERION_IDS, type Criterion } from "./criterion";
import type { FlipEvaluation } from "./flipEvaluate";
import type { QualityBreakdown } from "./flipQuality";
import { designParser, placedFinishParser } from "./flipRunParser";
import type { LogEntry } from "./gameState";
import {
  clientIdParser,
  colourIdParser,
  materialIdParser,
  printIdParser,
  recipeIdParser,
  styleTagParser,
} from "./idParsers";
import type { PieceCloth, RackPiece } from "./rackPiece";
import type { Reward } from "./rewards";
import type { StallResult, StallSale } from "./stallDay";
import type { LeavesBreakdown } from "./sustainability";

const scoreParser = rangeParser(0, 100);

const criterionParser = objectOf<Criterion>({
  id: oneOf(CRITERION_IDS),
  label: stringParser,
  passed: booleanParser,
  detail: stringParser,
  weight: nonNegativeParser,
});

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
  kind: oneOf(["gig", "own"] as const),
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
  outcome: oneOf(["pass", "soft-fail", "fail"] as const),
  coins: nonNegativeParser,
  reputation: integerParser,
  buzz: integerParser,
  lines: arrayOf(rewardLineParser),
  trendMatches: arrayOf(styleTagParser),
  leafPick: booleanParser,
});

export const logEntryParser = objectOf<LogEntry>({
  runId: stringParser,
  kind: oneOf(["gig", "own"] as const),
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
});

const saleParser = objectOf<StallSale>({
  pieceId: stringParser,
  recipeId: recipeIdParser,
  price: positiveIntegerParser,
  value: countParser,
  low: countParser,
  high: countParser,
  outcome: oneOf(["bargain", "sold", "fair", "stayed"] as const),
});

export const stallResultParser = objectOf<StallResult>({
  day: positiveIntegerParser,
  sales: arrayOf(saleParser),
  coins: countParser,
  reputation: countParser,
  buzz: countParser,
});
