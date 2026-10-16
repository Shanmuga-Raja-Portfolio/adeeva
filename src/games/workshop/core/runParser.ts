import type { FollowProgress } from "../../../engine/followRecord";
import {
  arrayOf,
  booleanParser,
  distinctListOf,
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
  nonNegativeParser,
  shareParser,
} from "../../../engine/stateParsers";
import { APPRENTICE_JOB_IDS } from "../content/apprentice";
import { BOARD_SIZE_IDS } from "../content/boardSize";
import { FAIR_CLIENT_ID } from "../content/client";
import { CUSHION_FABRIC_IDS } from "../content/cushionFabric";
import { EXTRA_IDS, type ExtraNeed } from "../content/extra";
import { FINISH_IDS } from "../content/finish";
import { JOINT_KINDS } from "../content/jointKind";
import { PART_OPTION_IDS, PART_SLOTS, type PartSlot } from "../content/partOption";
import { PRODUCT_IDS } from "../content/product";
import { RUN_STAGES } from "../content/runStage";
import { SET_TEMPLATE_IDS } from "../content/setTemplate";
import { SHADE_IDS } from "../content/shade";
import { WOOD_IDS } from "../content/wood";
import { WOOD_TAGS } from "../content/woodTag";
import type { Brief } from "./brief";
import { clientById } from "./catalog";
import {
  QUARTER_TURNS,
  type CommissionRun,
  type CushionWork,
  type CutRecord,
  type FinishChoice,
  type JointRecord,
  type PartPlacement,
  type PieceDesign,
  type PlacedExtra,
  type SandRecord,
} from "./commissionRun";
import { FINISH_CANVAS } from "./finishChoice";
import type { Knot, OwnedBoard } from "./ownedBoard";
import { isRunConsistent } from "./runConsistency";
import type { CommissionPurpose, RunPurpose, SetPurpose } from "./runPurpose";
import { MAX_PASSES, MAX_STROKES, SAND_CELLS } from "./sanding";

export const clientIdParser = knownIdParser(clientById, "client");
export const woodTagParser = oneOf(WOOD_TAGS);
export const shadeParser = oneOf(SHADE_IDS);
export const scoreParser = integerRangeParser(0, 100);

const extraNeedParser = objectOf<ExtraNeed>({ extra: oneOf(EXTRA_IDS), count: integerRangeParser(1, 9) });

function briefParserFor(clientId: Parser<string>): Parser<Brief> {
  return objectOf<Brief>({
    clientId,
    occasion: stringParser,
    products: refined(arrayOf(oneOf(PRODUCT_IDS)), (list) => list.length > 0, "at least one product"),
    deadlineDay: dayParser,
    budget: countParser,
    fee: countParser,
    requiredTags: arrayOf(woodTagParser),
    favouredColours: arrayOf(shadeParser),
    avoidColours: arrayOf(shadeParser),
    avoidWoods: arrayOf(oneOf(WOOD_IDS)),
    requiredExtras: arrayOf(extraNeedParser),
    minQuality: scoreParser,
  });
}

export const briefParser = briefParserFor(clientIdParser);

const runBriefParser = briefParserFor(
  refined(stringParser, (id) => id === FAIR_CLIENT_ID || clientById(id) !== undefined, "a known client id"),
);

const knotParser = objectOf<Knot>({
  x: rangeParser(-5, 120),
  y: rangeParser(0, 40),
  r: rangeParser(1, 5),
});

export const ownedBoardParser = objectOf<OwnedBoard>({
  id: refined(stringParser, (id) => /^board-\d+$/.test(id), "a board id"),
  woodId: oneOf(WOOD_IDS),
  size: oneOf(BOARD_SIZE_IDS),
  knots: arrayOf(knotParser),
  cost: countParser,
  spare: booleanParser,
});

function isSlot(key: string): key is PartSlot {
  return PART_SLOTS.some((slot) => slot === key);
}

export const optionsParser = keyedRecordOf(isSlot, oneOf(PART_OPTION_IDS));

const designParser = objectOf<PieceDesign>({
  productId: nullable(oneOf(PRODUCT_IDS)),
  options: optionsParser,
  woodId: nullable(oneOf(WOOD_IDS)),
});

const placementParser = objectOf<PartPlacement>({
  boardId: stringParser,
  x: numberParser,
  y: numberParser,
  rotation: oneOf(QUARTER_TURNS),
  assisted: booleanParser,
});

const cutRecordParser = objectOf<CutRecord>({ accuracy: shareParser, assisted: booleanParser });

const jointRecordParser = objectOf<JointRecord>({
  offsetMm: nonNegativeParser,
  angleDeg: rangeParser(0, 180),
  goodTaps: integerRangeParser(0, 9),
  assisted: booleanParser,
  accuracy: shareParser,
  byApprentice: booleanParser,
});

const sandRecordParser = refined(
  objectOf<SandRecord>({
    passes: refined(
      arrayOf(integerRangeParser(0, MAX_PASSES)),
      (passes) => passes.length === SAND_CELLS,
      `${SAND_CELLS} cells`,
    ),
    strokes: integerRangeParser(0, MAX_STROKES),
    across: countParser,
    assisted: booleanParser,
    renAccuracy: nullable(shareParser),
  }),
  (record) => record.across <= record.strokes,
  "no more strokes across than strokes",
);

export const finishParser = objectOf<FinishChoice>({
  finishId: nullable(oneOf(FINISH_IDS)),
  paint: nullable(colourIdParser),
});

export const placedExtraParser = objectOf<PlacedExtra>({
  id: stringParser,
  extraId: oneOf(EXTRA_IDS),
  x: rangeParser(0, FINISH_CANVAS.width),
  y: rangeParser(0, FINISH_CANVAS.height),
  rotation: rangeParser(0, 359),
  scale: rangeParser(MIN_PLACED_SCALE, MAX_PLACED_SCALE),
  layer: countParser,
  piece: integerRangeParser(0, 3),
});

const followParser = objectOf<FollowProgress>({
  progress: rangeParser(0, 1),
  ticks: countParser,
  insideTicks: countParser,
  assisted: booleanParser,
});

const cushionParser = objectOf<CushionWork>({
  fabricId: oneOf(CUSHION_FABRIC_IDS),
  seam: nullable(followParser),
});

const anyKey = () => true;

const purposeParsers: readonly Parser<RunPurpose>[] = [
  objectOf<CommissionPurpose>({ kind: oneOf(["commission"] as const) }),
  objectOf<SetPurpose>({
    kind: oneOf(["set"] as const),
    setId: refined(stringParser, (id) => /^set-\d+$/.test(id), "a set id"),
    templateId: oneOf(SET_TEMPLATE_IDS),
    setJoint: oneOf(JOINT_KINDS),
  }),
];

const purposeParser: Parser<RunPurpose> = (input, path) =>
  purposeParsers.map((parser) => parser(input, path)).find((result) => result.ok) ??
  failed(path, "a known run purpose");

export const runParser = refined(
  objectOf<CommissionRun>({
    id: refined(stringParser, (id) => /^run-\d+$/.test(id), "a run id"),
    gigId: nullable(stringParser),
    purpose: purposeParser,
    brief: runBriefParser,
    stage: oneOf(RUN_STAGES),
    reached: oneOf(RUN_STAGES),
    startedDay: dayParser,
    design: designParser,
    tripPaid: booleanParser,
    placements: recordOf(anyKey, placementParser),
    usedBoards: arrayOf(ownedBoardParser),
    cuts: recordOf(anyKey, cutRecordParser),
    joints: recordOf(anyKey, jointRecordParser),
    sanding: recordOf(anyKey, sandRecordParser),
    finish: finishParser,
    extras: arrayOf(placedExtraParser),
    nextExtraNumber: dayParser,
    cushion: nullable(cushionParser),
    renJobs: distinctListOf(APPRENTICE_JOB_IDS, "Ren job"),
  }),
  isRunConsistent,
  "a piece whose steps, design and work fit together",
);
