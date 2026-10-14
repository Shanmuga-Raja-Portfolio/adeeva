import {
  arrayOf,
  booleanParser,
  integerParser,
  integerRangeParser,
  nullable,
  objectOf,
  oneOf,
  refined,
  stringParser,
} from "../../../engine/parse";
import {
  colourIdParser,
  countParser,
  criterionParserOf,
  dayParser,
  styleTagParser,
  trendRewardShape,
  wholeRewardLineParser,
} from "../../../engine/stateParsers";
import { FILLING_IDS } from "../content/filling";
import { MIX_IDS } from "../content/mix";
import { PATTERN_CHOICES } from "../content/pipePattern";
import { COUNTER_PRODUCT_IDS, PRODUCT_IDS } from "../content/product";
import type { BakeBookEntry } from "./bakeBook";
import type { Evaluation } from "./bakeEvaluate";
import type { QualityBreakdown } from "./bakeQuality";
import {
  briefClientIdParser,
  clientIdParser,
  nonNegativeParser,
  placedToppingParser,
  shareParser,
} from "./bakeRunParser";
import type {
  CounterSession,
  CounterState,
  CounterSummary,
  CounterTray,
  OrderCard,
  TrayKind,
} from "./counter";
import { CRITERION_IDS } from "./criterion";
import type { LogEntry } from "./gameState";
import type { Reward } from "./rewards";

const scoreParser = integerRangeParser(0, 100);

const criterionParser = criterionParserOf(CRITERION_IDS, nonNegativeParser);

const qualityParser = objectOf<QualityBreakdown>({
  weigh: shareParser,
  stir: shareParser,
  bake: shareParser,
  pipe: shareParser,
  flavourFit: shareParser,
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

const rewardParser = objectOf<Reward>(trendRewardShape(styleTagParser, integerParser, wholeRewardLineParser));

export const logEntryParser = objectOf<LogEntry>({
  runId: stringParser,
  clientId: clientIdParser,
  day: dayParser,
  evaluation: evaluationParser,
  reward: rewardParser,
});

export const bakeBookEntryParser = objectOf<BakeBookEntry>({
  runId: stringParser,
  day: dayParser,
  clientId: briefClientIdParser,
  productId: oneOf(PRODUCT_IDS),
  mixIds: arrayOf(oneOf(MIX_IDS)),
  fillingId: nullable(oneOf(FILLING_IDS)),
  colours: arrayOf(colourIdParser),
  pattern: oneOf(PATTERN_CHOICES),
  toppings: arrayOf(placedToppingParser),
  stars: integerRangeParser(1, 5),
  happy: booleanParser,
  quality: nullable(scoreParser),
});

const trayKindParser = objectOf<TrayKind>({ productId: oneOf(COUNTER_PRODUCT_IDS), colour: colourIdParser });

const counterTrayParser = objectOf<CounterTray>({
  id: stringParser,
  productId: oneOf(COUNTER_PRODUCT_IDS),
  colour: colourIdParser,
  quality: scoreParser,
  tags: arrayOf(styleTagParser),
  left: integerRangeParser(0, 6),
});

const sessionParser = refined(
  objectOf<CounterSession>({
    cards: arrayOf(objectOf<OrderCard>({ items: arrayOf(trayKindParser) })),
    sold: arrayOf(countParser),
    coins: countParser,
  }),
  (session) =>
    new Set(session.sold).size === session.sold.length &&
    session.sold.every((index) => index < session.cards.length),
  "each sold box once, from the cards on the counter",
);

const summaryParser = objectOf<CounterSummary>({
  day: dayParser,
  coins: countParser,
  boxes: countParser,
  shared: countParser,
});

export const counterParser = objectOf<CounterState>({
  trays: arrayOf(counterTrayParser),
  session: nullable(sessionParser),
  closedDay: countParser,
  nextTrayNumber: dayParser,
  lastSummary: nullable(summaryParser),
});
