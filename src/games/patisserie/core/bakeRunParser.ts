import type { FollowProgress } from "../../../engine/followRecord";
import {
  arrayOf,
  booleanParser,
  failed,
  integerRangeParser,
  keyedRecordOf,
  nullable,
  numberParser,
  objectOf,
  oneOf,
  rangeParser,
  recordOf,
  refined,
  stringParser,
  type Parser,
} from "../../../engine/parse";
import { MAX_PLACED_SCALE, MIN_PLACED_SCALE } from "../../../engine/placedPose";
import {
  colourIdParser,
  countParser,
  dayParser,
  knownIdParser,
  shareParser,
  styleTagParser,
} from "../../../engine/stateParsers";

export { shareParser };
import { FAIR_CLIENT_ID, type ToppingRequirement } from "../content/client";
import { FILLING_IDS } from "../content/filling";
import { FLOURISH_IDS } from "../content/flourish";
import { PLAQUE_WORDS } from "../content/letterPath";
import { MENU_TIER_IDS } from "../content/menuTier";
import { MIX_IDS } from "../content/mix";
import { PATTERN_CHOICES } from "../content/pipePattern";
import { PRODUCT_IDS } from "../content/product";
import { TOPPING_IDS } from "../content/topping";
import type {
  BakeDesign,
  BakeRecord,
  BakeRun,
  BatchState,
  PipeRecord,
  PlacedTopping,
  RunPurpose,
  WeighRecord,
} from "./bakeRun";
import type { Brief } from "./brief";
import { clientById, isIngredientId } from "./catalog";
import { HEAT_DOTS } from "./oven";
import { isRunConsistent } from "./runConsistency";
import { RUN_STAGES } from "./runStage";
import { MAX_WEIGH_ACTIONS } from "./weighAccuracy";
import { CAKE_CANVAS } from "./toppingPlacement";

export const nonNegativeParser = refined(numberParser, (value) => value >= 0, "zero or more");
export const clientIdParser = knownIdParser(clientById, "client");
export const briefClientIdParser = refined(
  stringParser,
  (id) => id === FAIR_CLIENT_ID || clientById(id) !== undefined,
  "a known client id",
);
const mixIdParser = oneOf(MIX_IDS);

const toppingRequirementParser = objectOf<ToppingRequirement>({
  topping: oneOf(TOPPING_IDS),
  count: integerRangeParser(1, 99),
});

export const briefParser = objectOf<Brief>({
  clientId: briefClientIdParser,
  occasion: stringParser,
  products: arrayOf(oneOf(PRODUCT_IDS)),
  deadlineDay: dayParser,
  budget: countParser,
  fee: countParser,
  requiredTags: arrayOf(styleTagParser),
  requiredMixes: arrayOf(mixIdParser),
  avoidMixes: arrayOf(mixIdParser),
  favouredColours: arrayOf(colourIdParser),
  avoidColours: arrayOf(colourIdParser),
  requiredToppings: arrayOf(toppingRequirementParser),
  minColours: integerRangeParser(0, 3),
  minQuality: integerRangeParser(0, 100),
});

const purposeParsers: readonly Parser<RunPurpose>[] = [
  objectOf<{ readonly kind: "tray" }>({ kind: oneOf(["tray"] as const) }),
  objectOf<{ readonly kind: "showpiece" }>({ kind: oneOf(["showpiece"] as const) }),
  objectOf<Extract<RunPurpose, { readonly kind: "salon-tray" }>>({
    kind: oneOf(["salon-tray"] as const),
    tier: oneOf(MENU_TIER_IDS),
  }),
  objectOf<{ readonly kind: "order"; readonly gigId: string }>({
    kind: oneOf(["order"] as const),
    gigId: stringParser,
  }),
];

const purposeParser: Parser<RunPurpose> = (input, path) =>
  purposeParsers.map((parser) => parser(input, path)).find((result) => result.ok) ??
  failed(path, "a known bake purpose");

export const designParser = objectOf<BakeDesign>({
  productId: nullable(oneOf(PRODUCT_IDS)),
  mixIds: arrayOf(nullable(mixIdParser)),
  fillingId: nullable(oneOf(FILLING_IDS)),
  colours: arrayOf(colourIdParser),
  pattern: oneOf(PATTERN_CHOICES),
  split: integerRangeParser(0, 6),
});

const weighRecordParser = objectOf<WeighRecord>({
  grams: countParser,
  actions: integerRangeParser(1, MAX_WEIGH_ACTIONS),
  assisted: booleanParser,
  band: shareParser,
});

const followParser = objectOf<FollowProgress>({
  progress: nonNegativeParser,
  ticks: countParser,
  insideTicks: countParser,
  assisted: booleanParser,
});

const bakeRecordParser = objectOf<BakeRecord>({
  heat: integerRangeParser(1, HEAT_DOTS),
  turnedMinutes: nullable(countParser),
  takenMinutes: countParser,
  assisted: booleanParser,
  window: shareParser,
});

const batchParser = objectOf<BatchState>({
  weighs: keyedRecordOf(isIngredientId, weighRecordParser),
  eggs: countParser,
  committed: booleanParser,
  stir: nullable(followParser),
  bake: nullable(bakeRecordParser),
});

const pipeRecordParser = objectOf<PipeRecord>({ accuracy: shareParser, assisted: booleanParser });

export const placedToppingParser = objectOf<PlacedTopping>({
  id: stringParser,
  toppingId: oneOf(TOPPING_IDS),
  x: rangeParser(0, CAKE_CANVAS.width),
  y: rangeParser(0, CAKE_CANVAS.height),
  rotation: rangeParser(0, 359),
  scale: rangeParser(MIN_PLACED_SCALE, MAX_PLACED_SCALE),
  layer: countParser,
});

export const bakeRunParser = refined(
  objectOf<BakeRun>({
    id: stringParser,
    purpose: purposeParser,
    brief: nullable(briefParser),
    stage: oneOf(RUN_STAGES),
    reached: oneOf(RUN_STAGES),
    startedDay: dayParser,
    design: designParser,
    batches: arrayOf(batchParser),
    stack: recordOf(() => true, stringParser),
    filled: booleanParser,
    iced: booleanParser,
    pipes: recordOf(() => true, pipeRecordParser),
    toppings: arrayOf(placedToppingParser),
    nextToppingNumber: dayParser,
    pantryHourPaid: booleanParser,
    ingredientValue: nonNegativeParser,
    flourishes: arrayOf(oneOf(FLOURISH_IDS)),
    word: nullable(oneOf(PLAQUE_WORDS)),
  }),
  isRunConsistent,
  "a bake whose steps, design and work fit together",
);
