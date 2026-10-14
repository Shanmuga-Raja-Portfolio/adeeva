import {
  arrayOf,
  booleanParser,
  integerRangeParser,
  nullable,
  objectOf,
  oneOf,
  rangeParser,
  refined,
  stringParser,
  type Parser,
} from "../../../engine/parse";
import type { FollowProgress } from "../../../engine/followRecord";
import { ROTATIONS } from "../../../engine/geometry/rotation";
import { countParser, dayParser, shareParser } from "../../../engine/stateParsers";
import { CUISINE_IDS } from "../content/cuisine";
import { DISH_IDS } from "../content/dish";
import { INGREDIENT_IDS } from "../content/ingredient";
import { COMPONENT_IDS, PLATE_COLOURS } from "../content/plateComponent";
import { TASTE_TAGS } from "../content/tasteTag";
import type { ChopResult } from "./chop";
import {
  RUN_STAGES,
  TEST_RUN_KINDS,
  type DishBrief,
  type DishRun,
  type PlatedDish,
  type RunPurpose,
  type SimmerProgress,
} from "./dishRun";
import {
  MAX_COMPONENT_SCALE,
  MIN_COMPONENT_SCALE,
  PLATE_SIZE,
  type PlacedComponent,
  type PlateResult,
} from "./plate";
import type { SimmerResult } from "./simmer";
import type { SizzleResult } from "./sizzle";
import { COMPASS_REACH, MAX_PINCHES, MAX_SAVOURY, MAX_TASTES, type TasteResult } from "./taste";

export const dishIdParser = oneOf(DISH_IDS);
export const cuisineIdParser = oneOf(CUISINE_IDS);
export const tasteTagParser = oneOf(TASTE_TAGS);
export const ingredientIdParser = oneOf(INGREDIENT_IDS);
export const qualityParser = integerRangeParser(0, 100);
export const starsParser = integerRangeParser(1, 5);

export const tastePointParser: Parser<readonly [number, number]> = (input, path) => {
  const outcome = arrayOf(integerRangeParser(-COMPASS_REACH, COMPASS_REACH))(input, path);
  if (!outcome.ok) return outcome;
  const [x, y] = outcome.value;
  return outcome.value.length === 2 && x !== undefined && y !== undefined
    ? { ok: true, value: [x, y] }
    : { ok: false, error: `${path}: expected a taste point` };
};

export const placedComponentParser = objectOf<PlacedComponent>({
  componentId: oneOf(COMPONENT_IDS),
  x: rangeParser(0, PLATE_SIZE),
  y: rangeParser(0, PLATE_SIZE),
  rotation: oneOf(ROTATIONS),
  scale: rangeParser(MIN_COMPONENT_SCALE, MAX_COMPONENT_SCALE),
  layer: countParser,
});

export const plateColourParser = oneOf(PLATE_COLOURS);

const purposeParser: Parser<RunPurpose> = (input, path) => {
  const kind = objectOf<{ kind: RunPurpose["kind"] }>({
    kind: oneOf(["lesson", "test", "order", "practice"]),
  })(input, path);
  if (!kind.ok) return kind;
  switch (kind.value.kind) {
    case "lesson":
      return objectOf<RunPurpose & { kind: "lesson" }>({
        kind: oneOf(["lesson"]),
        cuisine: cuisineIdParser,
        fee: countParser,
      })(input, path);
    case "test":
      return objectOf<RunPurpose & { kind: "test" }>({
        kind: oneOf(["test"]),
        test: oneOf(TEST_RUN_KINDS),
        index: integerRangeParser(0, 2),
      })(input, path);
    case "order":
      return objectOf<RunPurpose & { kind: "order" }>({ kind: oneOf(["order"]), gigId: stringParser })(
        input,
        path,
      );
    case "practice":
      return objectOf<RunPurpose & { kind: "practice" }>({ kind: oneOf(["practice"]) })(input, path);
  }
};

const briefParser = objectOf<DishBrief>({
  minQuality: qualityParser,
  requiredTags: arrayOf(tasteTagParser),
  avoid: arrayOf(ingredientIdParser),
});

const chopResultParser = objectOf<ChopResult>({
  accuracy: shareParser,
  perfect: booleanParser,
  assisted: booleanParser,
});

const sizzleResultParser = objectOf<SizzleResult>({
  accuracy: shareParser,
  heatFit: shareParser,
  sides: arrayOf(rangeParser(0, 2)),
  assisted: booleanParser,
});

const followParser = objectOf<FollowProgress>({
  progress: rangeParser(0, 4),
  ticks: countParser,
  insideTicks: countParser,
  assisted: booleanParser,
});

const simmerResultParser = objectOf<SimmerResult>({
  accuracy: shareParser,
  follow: shareParser,
  level: shareParser,
  levelScore: shareParser,
  assisted: booleanParser,
});

const simmerProgressParser = objectOf<SimmerProgress>({
  follow: followParser,
  result: nullable(simmerResultParser),
});

const tasteResultParser = objectOf<TasteResult>({
  accuracy: shareParser,
  point: tastePointParser,
  savoury: integerRangeParser(0, MAX_SAVOURY),
  pinches: integerRangeParser(0, MAX_PINCHES),
  tastes: integerRangeParser(0, MAX_TASTES),
  solved: booleanParser,
  assisted: booleanParser,
});

const plateResultParser = objectOf<PlateResult>({
  accuracy: shareParser,
  inWell: shareParser,
  spacing: shareParser,
  focus: shareParser,
  garnishes: countParser,
  garnishMet: booleanParser,
  colourCount: countParser,
  wiped: booleanParser,
  assisted: booleanParser,
});

const platedParser = objectOf<PlatedDish>({
  result: plateResultParser,
  components: arrayOf(placedComponentParser),
  plateColour: plateColourParser,
});

export const dishRunParser = refined(
  objectOf<DishRun>({
    id: refined(stringParser, (id) => /^run-\d+$/.test(id), "a run id"),
    purpose: purposeParser,
    dishId: dishIdParser,
    day: dayParser,
    stage: oneOf(RUN_STAGES),
    brief: briefParser,
    mise: arrayOf(ingredientIdParser),
    chop: arrayOf(chopResultParser),
    sizzle: nullable(sizzleResultParser),
    simmer: nullable(simmerProgressParser),
    taste: nullable(tasteResultParser),
    plated: nullable(platedParser),
  }),
  (run) => new Set(run.mise).size === run.mise.length,
  "a dish run",
);
