import type { Point } from "../../../engine/geometry/point";
import {
  arrayOf,
  booleanParser,
  failed,
  integerParser,
  integerRangeParser,
  nullable,
  objectOf,
  oneOf,
  parsed,
  rangeParser,
  recordOf,
  refined,
  stringParser,
  type Parser,
} from "../../../engine/parse";
import { MAX_PLACED_SCALE, MIN_PLACED_SCALE } from "../../../engine/placedPose";
import { countParser, dayParser, rngParser, shareParser } from "../../../engine/stateParsers";
import { DECOR_IDS } from "../content/decor";
import { FLOOR_IDS } from "../content/floor";
import { FURNITURE_IDS } from "../content/furniture";
import { LIGHT_IDS } from "../content/light";
import { PAINT_IDS } from "../content/paint";
import { SOFT_COLOURS } from "../content/softColour";
import { briefParser } from "./briefParser";
import { STYLE_CANVAS } from "./decorPlacement";
import { TURNS, type PlacedPiece } from "./floorPlan";
import type {
  EdgeRecord,
  FloorRecord,
  LightPlace,
  MakeoverRun,
  PlacedDecor,
  RollRecord,
  RoomPlan,
} from "./makeoverRun";
import { ROLLER_LOAD } from "./makeoverRun";
import { MAX_PASSES, MAX_STROKES_PER_WALL, ROLL_CANVAS } from "./paintRoll";
import { isRunConsistent } from "./runConsistency";
import { RUN_STAGES } from "./runStage";

const cellParser = integerParser;

const pieceParser = objectOf<PlacedPiece>({
  id: stringParser,
  furnitureId: oneOf(FURNITURE_IDS),
  col: cellParser,
  row: cellParser,
  rotation: oneOf(TURNS),
});

const planParser = objectOf<RoomPlan>({
  pieces: arrayOf(pieceParser),
  nextPieceNumber: dayParser,
  wallPaint: nullable(oneOf(PAINT_IDS)),
  featurePaint: nullable(oneOf(PAINT_IDS)),
  floor: nullable(oneOf(FLOOR_IDS)),
  lights: arrayOf(oneOf(LIGHT_IDS)),
  tidied: booleanParser,
});

const edgeParser = objectOf<EdgeRecord>({ accuracy: shareParser, assisted: booleanParser });

const splatParser: Parser<Point> = (input, path) => {
  const outcome = arrayOf(rangeParser(0, ROLL_CANVAS.width))(input, path);
  if (!outcome.ok) return outcome;
  const [x, y] = outcome.value;
  return outcome.value.length === 2 && x !== undefined && y !== undefined
    ? parsed([x, y])
    : failed(path, "a point");
};

const rollParser = objectOf<RollRecord>({
  passes: arrayOf(integerRangeParser(0, MAX_PASSES)),
  strokes: refined(countParser, (strokes) => strokes <= MAX_STROKES_PER_WALL, "a stroke count in range"),
  splats: arrayOf(splatParser),
  dryStrokes: countParser,
  assisted: booleanParser,
});

const floorRecordParser = objectOf<FloorRecord>({
  offset: rangeParser(0, 100),
  accuracy: shareParser,
  assisted: booleanParser,
});

const lightPlaceParser = objectOf<LightPlace>({ col: cellParser, row: cellParser });

const decorParser = objectOf<PlacedDecor>({
  id: stringParser,
  decorId: oneOf(DECOR_IDS),
  x: rangeParser(0, STYLE_CANVAS.width),
  y: rangeParser(0, STYLE_CANVAS.height),
  rotation: rangeParser(0, 359),
  scale: rangeParser(MIN_PLACED_SCALE, MAX_PLACED_SCALE),
  layer: countParser,
});

const anyKey = () => true;

export const runParser = refined(
  objectOf<MakeoverRun>({
    id: stringParser,
    gigId: stringParser,
    brief: briefParser,
    stage: oneOf(RUN_STAGES),
    reached: oneOf(RUN_STAGES),
    startedDay: dayParser,
    seed: rngParser,
    plan: planParser,
    spend: countParser,
    locked: booleanParser,
    edges: recordOf(anyKey, edgeParser),
    rolls: recordOf(anyKey, rollParser),
    roller: refined(countParser, (load) => load <= ROLLER_LOAD, "a roller load"),
    floorLaid: recordOf(anyKey, floorRecordParser),
    lightPlaces: recordOf(anyKey, lightPlaceParser),
    lightAssisted: booleanParser,
    decor: arrayOf(decorParser),
    nextDecorNumber: dayParser,
    softColour: oneOf(SOFT_COLOURS),
  }),
  isRunConsistent,
  "a room whose steps, plan and work fit together",
);
