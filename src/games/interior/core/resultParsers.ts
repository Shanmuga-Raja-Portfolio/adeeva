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
  nonNegativeParser,
  shareParser,
  trendRewardShape,
  wholeRewardLineParser,
} from "../../../engine/stateParsers";
import { clientIdParser, roomTagParser } from "./briefParser";
import { CRITERION_IDS } from "./criterion";
import type { LogEntry } from "./gameState";
import type { OpenHouse, PanelScore } from "./openHouse";
import type { Reward } from "./rewards";
import type { Evaluation } from "./roomEvaluate";
import type { QualityBreakdown } from "./roomQuality";

const scoreParser = integerRangeParser(0, 100);

const criterionParser = criterionParserOf(CRITERION_IDS, nonNegativeParser);

const qualityParser = objectOf<QualityBreakdown>({
  flow: shareParser,
  paint: shareParser,
  floor: shareParser,
  light: shareParser,
  fit: shareParser,
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

const rewardParser = objectOf<Reward>(trendRewardShape(roomTagParser, integerParser, wholeRewardLineParser));

const panelParser = objectOf<PanelScore>({
  id: oneOf(["comfort", "flow", "wow"] as const),
  label: stringParser,
  score: scoreParser,
});

const openHouseParser = objectOf<OpenHouse>({
  panels: arrayOf(panelParser),
  score: scoreParser,
  enquiries: integerRangeParser(0, 5),
  coins: countParser,
  buzz: countParser,
  quote: stringParser,
});

export const logEntryParser = objectOf<LogEntry>({
  runId: stringParser,
  clientId: clientIdParser,
  day: dayParser,
  evaluation: evaluationParser,
  reward: rewardParser,
  openHouse: nullable(openHouseParser),
});
