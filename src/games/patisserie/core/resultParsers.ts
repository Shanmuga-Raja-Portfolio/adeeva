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
import { colourIdParser, countParser, dayParser, styleTagParser } from "../../../engine/stateParsers";
import { FILLING_IDS } from "../content/filling";
import { MIX_IDS } from "../content/mix";
import { PATTERN_CHOICES } from "../content/pipePattern";
import { PRODUCT_IDS, TRAY_PRODUCT_IDS } from "../content/product";
import type { BakeBookEntry } from "./bakeBook";
import type { Evaluation } from "./bakeEvaluate";
import type { QualityBreakdown } from "./bakeQuality";
import { clientIdParser, nonNegativeParser, placedToppingParser, shareParser } from "./bakeRunParser";
import type {
  CounterSession,
  CounterState,
  CounterSummary,
  CounterTray,
  OrderCard,
  TrayKind,
} from "./counter";
import { CRITERION_IDS, type Criterion } from "./criterion";
import type { LogEntry } from "./gameState";
import type { Reward, RewardLine } from "./rewards";

const scoreParser = integerRangeParser(0, 100);

const criterionParser = objectOf<Criterion>({
  id: oneOf(CRITERION_IDS),
  label: stringParser,
  passed: booleanParser,
  detail: stringParser,
  weight: nonNegativeParser,
});

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

const rewardLineParser = objectOf<RewardLine>({ label: stringParser, amount: integerParser });

const rewardParser = objectOf<Reward>({
  outcome: oneOf(["pass", "soft-fail", "fail"] as const),
  coins: integerParser,
  reputation: integerParser,
  buzz: integerParser,
  lines: arrayOf(rewardLineParser),
  trendMatches: arrayOf(styleTagParser),
});

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
  clientId: clientIdParser,
  productId: oneOf(PRODUCT_IDS),
  mixIds: arrayOf(oneOf(MIX_IDS)),
  fillingId: nullable(oneOf(FILLING_IDS)),
  colours: arrayOf(colourIdParser),
  pattern: oneOf(PATTERN_CHOICES),
  toppings: arrayOf(placedToppingParser),
  stars: integerRangeParser(1, 5),
  happy: booleanParser,
});

const trayKindParser = objectOf<TrayKind>({ productId: oneOf(TRAY_PRODUCT_IDS), colour: colourIdParser });

const counterTrayParser = objectOf<CounterTray>({
  id: stringParser,
  productId: oneOf(TRAY_PRODUCT_IDS),
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
