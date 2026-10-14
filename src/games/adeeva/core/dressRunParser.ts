import type { TrimRequirement } from "../content/client";
import { GARMENT_PARTS, PART_CATEGORIES } from "../content/garmentPart";
import { GARMENT_SLOTS } from "../content/garmentSlot";
import type { Brief } from "./brief";
import { partById } from "./catalog";
import { DOLL_HEIGHT, DOLL_WIDTH } from "./decoration";
import {
  clientIdParser,
  colourIdParser,
  fabricIdParser,
  materialIdParser,
  partIdParser,
  styleTagParser,
  themeIdParser,
  trimIdParser,
} from "./catalogIdParsers";
import type { Decoration, Design, DressRun, PiecePlacement, RunPurpose, SeamProgress } from "./dressRun";
import { requiredPieces } from "./requiredPieces";
import { requiredSeams } from "./requiredSeams";
import { ROTATIONS } from "../../../engine/geometry/rotation";
import { RUN_STAGES } from "./runStage";
import {
  arrayOf,
  booleanParser,
  failed,
  fixedRecordOf,
  integerRangeParser,
  isPlainObject,
  nullable,
  numberParser,
  objectOf,
  oneOf,
  parsed,
  rangeParser,
  recordOf,
  refined,
  stringParser,
  type Parser,
} from "../../../engine/parse";
import { nonNegativeParser, shareParser } from "../../../engine/stateParsers";
import { keysWithin } from "../../../engine/keysWithin";

export { nonNegativeParser, shareParser };
const positiveIntegerParser = integerRangeParser(1, Number.MAX_SAFE_INTEGER);
const catalogPieceIds = new Set(GARMENT_PARTS.flatMap((part) => part.pieces.map((piece) => piece.id)));
const catalogSeamIds = new Set(GARMENT_PARTS.flatMap((part) => part.seams.map((seam) => seam.id)));
const isCatalogPieceId = (key: string): boolean => catalogPieceIds.has(key);
const isCatalogSeamId = (key: string): boolean => catalogSeamIds.has(key);
export const SAVED_DECORATION_SCALE_RANGE = [0.25, 3] as const;

const trimRequirementParser = objectOf<TrimRequirement>({ trim: trimIdParser, count: positiveIntegerParser });

export const briefParser = objectOf<Brief>({
  clientId: nullable(clientIdParser),
  themeId: nullable(themeIdParser),
  occasion: stringParser,
  deadlineDay: positiveIntegerParser,
  budget: nonNegativeParser,
  fee: nonNegativeParser,
  requiredTags: arrayOf(styleTagParser),
  favouredColours: arrayOf(colourIdParser),
  avoidColours: arrayOf(colourIdParser),
  avoidMaterials: arrayOf(materialIdParser),
  requiredTrims: arrayOf(trimRequirementParser),
  minQuality: rangeParser(0, 100),
});

function partsMatchCategories(design: Design): boolean {
  return PART_CATEGORIES.every((category) => {
    const partId = design.parts[category];
    return partId === null || partById(partId)?.category === category;
  });
}

export const designParser = refined(
  objectOf<Design>({
    parts: fixedRecordOf(PART_CATEGORIES, nullable(partIdParser)),
    fabrics: fixedRecordOf(PART_CATEGORIES, nullable(fabricIdParser)),
  }),
  partsMatchCategories,
  "each part in its own category",
);

const placementParser = objectOf<PiecePlacement>({
  fabricId: fabricIdParser,
  x: numberParser,
  y: numberParser,
  rotation: oneOf(ROTATIONS),
});

const tickCountParser = integerRangeParser(0, Number.MAX_SAFE_INTEGER);

const seamProgressParser = refined(
  objectOf<SeamProgress>({
    progress: shareParser,
    ticks: tickCountParser,
    insideTicks: tickCountParser,
    assisted: booleanParser,
  }),
  (seam) => seam.insideTicks <= seam.ticks && (seam.ticks === 0) === (seam.progress === 0),
  "no more stitches on the line than stitches sewn, and stitches only once progress is made",
);

export const decorationParser = objectOf<Decoration>({
  id: stringParser,
  trimId: trimIdParser,
  x: rangeParser(0, DOLL_WIDTH),
  y: rangeParser(0, DOLL_HEIGHT),
  rotation: numberParser,
  scale: rangeParser(SAVED_DECORATION_SCALE_RANGE[0], SAVED_DECORATION_SCALE_RANGE[1]),
  layer: integerRangeParser(0, Number.MAX_SAFE_INTEGER),
});

export const runPurposeParser: Parser<RunPurpose> = (input, path) => {
  if (!isPlainObject(input)) return failed(path, "an object");
  if (input.kind === "gig") {
    const gigId = stringParser(input.gigId, `${path}.gigId`);
    return gigId.ok ? parsed({ kind: "gig", gigId: gigId.value }) : gigId;
  }
  if (input.kind === "look") {
    const lookIndex = integerRangeParser(0, 2)(input.lookIndex, `${path}.lookIndex`);
    return lookIndex.ok ? parsed({ kind: "look", lookIndex: lookIndex.value }) : lookIndex;
  }
  return failed(`${path}.kind`, "gig or look");
};

function runKeysMatchDesign(run: DressRun): boolean {
  const pieceIds = requiredPieces(run.design).map((entry) => entry.piece.id);
  const seamIds = requiredSeams(run.design).map((entry) => entry.seam.id);
  return (
    keysWithin(run.placements, pieceIds) &&
    keysWithin(run.cutAccuracy, pieceIds) &&
    keysWithin(run.seams, seamIds)
  );
}

const dressRunShapeParser = objectOf<DressRun>({
  id: stringParser,
  purpose: runPurposeParser,
  brief: briefParser,
  stage: oneOf(RUN_STAGES),
  startedDay: positiveIntegerParser,
  design: designParser,
  placements: recordOf(isCatalogPieceId, placementParser),
  cutFabrics: arrayOf(fabricIdParser),
  cutAccuracy: recordOf(isCatalogPieceId, shareParser),
  assembly: fixedRecordOf(GARMENT_SLOTS, nullable(stringParser)),
  seams: recordOf(isCatalogSeamId, seamProgressParser),
  decorations: arrayOf(decorationParser),
  nextDecorationNumber: positiveIntegerParser,
  fabricSpend: nonNegativeParser,
});

export const dressRunParser = refined(
  dressRunShapeParser,
  runKeysMatchDesign,
  "pieces and seams that belong to the design",
);
