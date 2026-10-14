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
  stringParser,
  type Parser,
} from "../../../engine/parse";
import {
  countParser,
  criterionParserOf,
  dayParser,
  rewardLineParser,
  shareParser,
  trendRewardShape,
} from "../../../engine/stateParsers";
import { TEST_IDS } from "../content/career";
import { STEP_KINDS } from "../content/dish";
import type { LessonOffer, ShiftOffer, DayBoard } from "./dayBoard";
import { CRITERION_IDS } from "./criterion";
import type { DiaryEntry, PlatingCard } from "./dishDiary";
import type { DishEvaluation, DishQualityBreakdown, OrderEvaluation, OrderQuality } from "./dishEvaluate";
import { TEST_RUN_KINDS } from "./dishRun";
import type {
  DishLogEntry,
  LogEntry,
  MasteryGain,
  OrderLogEntry,
  ServiceLogEntry,
  SpecialSale,
  TestLogEntry,
} from "./log";
import type { OrderBrief, OrderDish } from "./orderBrief";
import type { Reward } from "./rewards";
import {
  cuisineIdParser,
  dishIdParser,
  ingredientIdParser,
  placedComponentParser,
  plateColourParser,
  qualityParser,
  starsParser,
  tastePointParser,
  tasteTagParser,
} from "./runParser";
import { specialParser } from "./serviceParser";
import { SERVICE_KINDS } from "./service";
import { MAX_SAVOURY } from "./taste";
import type { TasteMemory } from "./tasteMemory";
import type { TestDay } from "./testDay";

export const rewardParser = objectOf<Reward>(
  trendRewardShape(tasteTagParser, integerParser, rewardLineParser),
);

const criterionParser = criterionParserOf(CRITERION_IDS, countParser);

function evaluationShape<Q>(quality: Parser<Q>) {
  return {
    criteria: arrayOf(criterionParser),
    quality,
    favouredColoursUsed: countParser,
    score: qualityParser,
    stars: starsParser,
    passed: booleanParser,
    feedback: arrayOf(stringParser),
  };
}

const dishEvaluationParser = objectOf<DishEvaluation>(
  evaluationShape(
    objectOf<DishQualityBreakdown>({
      quality: qualityParser,
      accuracies: fixedRecordOf(STEP_KINDS, shareParser),
    }),
  ),
);

const orderEvaluationParser = objectOf<OrderEvaluation>({
  ...evaluationShape(objectOf<OrderQuality>({ quality: qualityParser })),
  spend: rangeParser(0, 9999),
});

const dishEntryParser = objectOf<DishLogEntry>({
  kind: oneOf(["dish"]),
  runId: stringParser,
  day: dayParser,
  dishId: dishIdParser,
  purpose: oneOf(["lesson", "test", "order", "practice"]),
  quality: qualityParser,
  stars: starsParser,
  evaluation: nullable(dishEvaluationParser),
  reward: nullable(rewardParser),
  mastery: countParser,
});

const orderEntryParser = objectOf<OrderLogEntry>({
  kind: oneOf(["order"]),
  runId: stringParser,
  day: dayParser,
  gigId: stringParser,
  clientId: stringParser,
  evaluation: orderEvaluationParser,
  reward: rewardParser,
});

const testEntryParser = objectOf<TestLogEntry>({
  kind: oneOf(["test"]),
  runId: stringParser,
  day: dayParser,
  test: oneOf(TEST_IDS),
  passed: booleanParser,
  scores: arrayOf(qualityParser),
  mark: qualityParser,
  feedback: arrayOf(stringParser),
});

const saleParser = objectOf<SpecialSale>({
  special: specialParser,
  sold: countParser,
  bonus: countParser,
  soldOut: booleanParser,
});

const gainParser = objectOf<MasteryGain>({ cuisine: cuisineIdParser, gain: countParser });

const serviceEntryParser = objectOf<ServiceLogEntry>({
  kind: oneOf(["service"]),
  runId: stringParser,
  day: dayParser,
  service: oneOf(SERVICE_KINDS),
  cuisines: arrayOf(cuisineIdParser),
  score: qualityParser,
  stars: starsParser,
  averageQuality: qualityParser,
  averageOnTime: shareParser,
  handledShare: shareParser,
  passed: booleanParser,
  teamTickets: countParser,
  dishes: countParser,
  wage: countParser,
  reward: rewardParser,
  special: nullable(saleParser),
  mastery: arrayOf(gainParser),
  feedback: arrayOf(stringParser),
});

export const logEntryParser: Parser<LogEntry> = (input, path) => {
  const kind = objectOf<{ kind: LogEntry["kind"] }>({ kind: oneOf(["dish", "order", "test", "service"]) })(
    input,
    path,
  );
  if (!kind.ok) return kind;
  switch (kind.value.kind) {
    case "dish":
      return dishEntryParser(input, path);
    case "order":
      return orderEntryParser(input, path);
    case "test":
      return testEntryParser(input, path);
    case "service":
      return serviceEntryParser(input, path);
  }
};

export const platingCardParser = objectOf<PlatingCard>({
  dishId: dishIdParser,
  plateColour: plateColourParser,
  components: arrayOf(placedComponentParser),
  accuracy: shareParser,
  assisted: booleanParser,
  stars: starsParser,
});

export const diaryEntryParser = objectOf<DiaryEntry>({
  id: stringParser,
  dishId: dishIdParser,
  day: dayParser,
  plateColour: plateColourParser,
  components: arrayOf(placedComponentParser),
  stars: starsParser,
  note: stringParser,
});

export const tasteMemoryParser = objectOf<TasteMemory>({
  dishId: dishIdParser,
  point: tastePointParser,
  savoury: integerRangeParser(0, MAX_SAVOURY),
});

export const orderDishParser = objectOf<OrderDish>({
  gigId: stringParser,
  runId: stringParser,
  dishId: dishIdParser,
  quality: qualityParser,
  stars: starsParser,
  garnishMet: booleanParser,
  colourCount: countParser,
});

export const orderBriefParser = objectOf<OrderBrief>({
  clientId: stringParser,
  occasion: stringParser,
  dishCount: integerRangeParser(1, 6),
  cuisines: integerRangeParser(1, 6),
  requiredTags: arrayOf(tasteTagParser),
  dishId: nullable(dishIdParser),
  avoid: arrayOf(ingredientIdParser),
  budget: countParser,
  fee: countParser,
  deadlineDay: dayParser,
  minQuality: qualityParser,
});

export const dayBoardParser = objectOf<DayBoard>({
  day: dayParser,
  lesson: nullable(objectOf<LessonOffer>({ cuisine: cuisineIdParser, fee: countParser })),
  shifts: arrayOf(objectOf<ShiftOffer>({ id: stringParser, cuisines: arrayOf(cuisineIdParser) })),
});

export const testDayParser = objectOf<TestDay>({
  test: oneOf(TEST_RUN_KINDS),
  day: dayParser,
  dishIds: arrayOf(dishIdParser),
  qualities: arrayOf(qualityParser),
});
