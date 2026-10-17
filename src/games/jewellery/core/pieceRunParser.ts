import { ROTATIONS } from "../../../engine/geometry/rotation";
import {
  arrayOf,
  booleanParser,
  integerRangeParser,
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
import { countParser, dayParser, rngParser, shareParser } from "../../../engine/stateParsers";
import { CHAIN_IDS } from "../content/extra";
import { FINISH_IDS } from "../content/finish";
import { METAL_IDS } from "../content/metal";
import { PRODUCT_IDS } from "../content/product";
import { STOCK_SIZE_IDS } from "../content/stockSize";
import { STONE_IDS } from "../content/stone";
import { briefParser } from "./briefParser";
import { MAX_CLAW_TRAVEL, MAX_STONE_OFFSET_MM } from "./stoneSetting";
import { MAX_POLISH_STROKES } from "./polish";
import { glazeParser, optionsParser, placedCharmParser } from "./pieceLookParser";
import type {
  CutRecord,
  DisplayChoice,
  JoinRecord,
  PieceDesign,
  PieceRun,
  Placement,
  PolishRecord,
  RunPurpose,
  SetRecord,
} from "./pieceRun";
import { isRunConsistent } from "./runConsistency";
import { RUN_STAGES } from "./runStage";

const purposeParser: Parser<RunPurpose> = (input, path) => {
  const stall = objectOf<{ readonly kind: "stall" }>({ kind: oneOf(["stall"] as const) })(input, path);
  if (stall.ok) return stall;
  const line = objectOf<{ readonly kind: "collection"; readonly slot: number }>({
    kind: oneOf(["collection"] as const),
    slot: integerRangeParser(0, 4),
  })(input, path);
  if (line.ok) return line;
  return objectOf<{ readonly kind: "order"; readonly gigId: string }>({
    kind: oneOf(["order"] as const),
    gigId: stringParser,
  })(input, path);
};

const designParser = objectOf<PieceDesign>({
  productId: oneOf(PRODUCT_IDS),
  options: optionsParser,
  metalId: nullable(oneOf(METAL_IDS)),
  stoneId: nullable(oneOf(STONE_IDS)),
});

const placementParser = objectOf<Placement>({
  size: oneOf(STOCK_SIZE_IDS),
  x: numberParser,
  y: numberParser,
  rotation: oneOf(ROTATIONS),
});

const cutParser = objectOf<CutRecord>({ accuracy: shareParser, assisted: booleanParser });

const joinParser = objectOf<JoinRecord>({
  ticks: countParser,
  insideTicks: countParser,
  overTicks: countParser,
  assisted: booleanParser,
  twin: booleanParser,
});

const offsetParser = rangeParser(-MAX_STONE_OFFSET_MM, MAX_STONE_OFFSET_MM);

const setParser = objectOf<SetRecord>({
  x: offsetParser,
  y: offsetParser,
  rotation: numberParser,
  claws: arrayOf(rangeParser(0, MAX_CLAW_TRAVEL)),
  accuracy: shareParser,
  assisted: booleanParser,
});

const polishParser = objectOf<PolishRecord>({
  passes: arrayOf(countParser),
  strokes: refined(countParser, (strokes) => strokes <= MAX_POLISH_STROKES, "a stroke count in range"),
  assisted: booleanParser,
});

const displayParser = objectOf<DisplayChoice>({
  finish: oneOf(FINISH_IDS),
  glaze: glazeParser,
  chain: nullable(oneOf(CHAIN_IDS)),
  cordColour: glazeParser,
  charms: arrayOf(placedCharmParser),
  nextCharmNumber: dayParser,
});

const anyKey = () => true;

export const pieceRunParser = refined(
  objectOf<PieceRun>({
    id: stringParser,
    purpose: purposeParser,
    brief: nullable(briefParser),
    stage: oneOf(RUN_STAGES),
    reached: oneOf(RUN_STAGES),
    startedDay: dayParser,
    seed: rngParser,
    design: designParser,
    plan: recordOf(anyKey, placementParser),
    consumed: nullable(arrayOf(oneOf(STOCK_SIZE_IDS))),
    stonesTaken: booleanParser,
    cuts: recordOf(anyKey, cutParser),
    joins: recordOf(anyKey, joinParser),
    sets: recordOf(anyKey, setParser),
    polish: recordOf(anyKey, polishParser),
    display: displayParser,
    suppliesHourPaid: booleanParser,
    twinGlow: booleanParser,
    lineSheet: booleanParser,
    potStones: arrayOf(integerRangeParser(0, 64)),
  }),
  isRunConsistent,
  "a piece whose steps, design and work fit together",
);
