import {
  arrayOf,
  booleanParser,
  integerParser,
  integerRangeParser,
  nullable,
  objectOf,
  oneOf,
  stringParser,
  type Parser,
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
import { THEME_IDS, type ThemeId } from "../content/marketTheme";
import { TRAY_CLOTHS } from "../content/stallTray";
import { clientIdParser, jewelColourParser, jewelTagParser } from "./briefParser";
import { CRITERION_IDS } from "./criterion";
import type { LogEntry } from "./gameState";
import type { KeepsakeEntry, KeepsakeSource } from "./keepsakeCase";
import type { MarketState, MarketSummary, SoldPiece } from "./marketDay";
import type { Evaluation } from "./pieceEvaluate";
import { pieceLookParser } from "./pieceLookParser";
import type { QualityBreakdown } from "./pieceQuality";
import type { Reward } from "./rewards";
import type { StallPiece } from "./stallBox";

const scoreParser = integerRangeParser(0, 100);
const starsParser = integerRangeParser(1, 5);
const themeIdParser = oneOf(THEME_IDS);

const criterionParser = criterionParserOf(CRITERION_IDS, nonNegativeParser);

const qualityParser = objectOf<QualityBreakdown>({
  cut: shareParser,
  join: shareParser,
  set: shareParser,
  polish: shareParser,
  metalFit: shareParser,
  hasStones: booleanParser,
  quality: scoreParser,
});

const evaluationParser = objectOf<Evaluation>({
  criteria: arrayOf(criterionParser),
  quality: qualityParser,
  favouredColoursUsed: countParser,
  spend: countParser,
  score: scoreParser,
  stars: starsParser,
  passed: booleanParser,
  feedback: arrayOf(stringParser),
});

const rewardParser = objectOf<Reward>(trendRewardShape(jewelTagParser, integerParser, wholeRewardLineParser));

export const logEntryParser = objectOf<LogEntry>({
  runId: stringParser,
  clientId: clientIdParser,
  day: dayParser,
  evaluation: evaluationParser,
  reward: rewardParser,
});

const keepsakeSourceParser: Parser<KeepsakeSource> = (input, path) => {
  const order = objectOf<{ readonly kind: "order"; readonly clientId: string; readonly happy: boolean }>({
    kind: oneOf(["order"] as const),
    clientId: clientIdParser,
    happy: booleanParser,
  })(input, path);
  if (order.ok) return order;
  return objectOf<{ readonly kind: "market"; readonly themeId: ThemeId; readonly score: number }>({
    kind: oneOf(["market"] as const),
    themeId: themeIdParser,
    score: scoreParser,
  })(input, path);
};

export const keepsakeParser = objectOf<KeepsakeEntry>({
  id: stringParser,
  day: dayParser,
  source: keepsakeSourceParser,
  look: pieceLookParser,
  stars: starsParser,
  line: stringParser,
});

export const stallPieceParser = objectOf<StallPiece>({
  id: stringParser,
  look: pieceLookParser,
  quality: scoreParser,
  tags: arrayOf(jewelTagParser),
  colours: arrayOf(jewelColourParser),
  madeDay: dayParser,
});

const soldParser = objectOf<SoldPiece>({ pieceId: stringParser, coins: countParser });

const summaryParser = objectOf<MarketSummary>({
  day: dayParser,
  themeId: themeIdParser,
  score: scoreParser,
  cloth: oneOf(TRAY_CLOTHS.map((cloth) => cloth.id)),
  sign: integerRangeParser(0, 2),
  slots: arrayOf(nullable(stallPieceParser)),
  sold: arrayOf(soldParser),
  lines: arrayOf(wholeRewardLineParser),
  coins: countParser,
  reputation: countParser,
  buzz: countParser,
});

export const marketParser = objectOf<MarketState>({
  shownDay: countParser,
  last: nullable(summaryParser),
});
