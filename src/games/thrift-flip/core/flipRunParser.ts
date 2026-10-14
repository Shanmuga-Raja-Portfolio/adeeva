import { ROTATIONS } from "../../../engine/geometry/rotation";
import { hasUniqueIds } from "../../../engine/uniqueIds";
import { keysWithin } from "../../../engine/keysWithin";
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
import type { SeamProgress } from "../../adeeva/core/dressRun";
import { MAX_PLACED_SCALE, MIN_PLACED_SCALE } from "../../../engine/placedPose";
import { PAINT_COLOURS } from "../content/finish";
import {
  briefParser,
  countParser,
  nonNegativeParser,
  positiveIntegerParser,
  shareParser,
} from "./briefParser";
import { findById, recipeById, ticketById } from "./catalog";
import type { Design } from "./design";
import { FINISH_CANVAS } from "./finishing";
import { runKind } from "./runKind";
import { runPieces, runSeams } from "./runPieces";
import { runHasStage } from "./runStages";
import { runLines } from "./unpick";
import {
  lineKey,
  stainKey,
  type FinishItem,
  type FlipPurpose,
  type FlipRun,
  type PlacedFinish,
  type StainWork,
  type UnpickLine,
} from "./flipRun";
import { FLIP_STAGES, stageIndex } from "./flipStage";
import {
  colourIdParser,
  conditionParser,
  findIdParser,
  markIdParser,
  materialIdParser,
  partIdParser,
  patchIdParser,
  printIdParser,
  recipeIdParser,
  styleTagParser,
  trimIdParser,
} from "./idParsers";
import { STAIN_CELL_OPTIONS, type OwnedFind, type Stain } from "./ownedFind";
import type { Placement } from "./placement";
import type { Scrap } from "./scrap";
import { taggedParser } from "./taggedParser";

const anyKey = (): boolean => true;

export const scrapParser = objectOf<Scrap>({
  id: stringParser,
  name: stringParser,
  colour: colourIdParser,
  print: printIdParser,
  material: materialIdParser,
  tags: arrayOf(styleTagParser),
});

export const stainParser = objectOf<Stain>({
  id: stringParser,
  panel: countParser,
  cx: nonNegativeParser,
  cy: nonNegativeParser,
  radius: rangeParser(1, 40),
  cells: oneOf(STAIN_CELL_OPTIONS),
});

export const ownedFindParser = refined(
  objectOf<OwnedFind>({
    id: stringParser,
    findId: findIdParser,
    grade: conditionParser,
    price: nonNegativeParser,
    wornSpot: nullable(oneOf([0, 1] as const)),
    stains: arrayOf(stainParser),
  }),
  (owned) => owned.stains.every((stain) => stain.panel < findById(owned.findId).panels.length),
  "stains on the find's own panels",
);

export const designParser = refined(
  objectOf<Design>({ recipeId: nullable(recipeIdParser), parts: recordOf(anyKey, partIdParser) }),
  (design) => {
    const groups = design.recipeId === null ? [] : recipeById(design.recipeId).partGroups;
    return Object.entries(design.parts).every(([groupId, partId]) =>
      groups.some((group) => group.id === groupId && group.partIds.includes(partId)),
    );
  },
  "parts that belong to the recipe",
);

const purposeParser = taggedParser<FlipPurpose>({
  gig: objectOf<FlipPurpose & { kind: "gig" }>({ kind: oneOf(["gig"] as const), gigId: stringParser }),
  own: objectOf<FlipPurpose & { kind: "own" }>({ kind: oneOf(["own"] as const) }),
});

export const unpickLineParser = refined(
  objectOf<UnpickLine>({
    popped: arrayOf(countParser),
    snagsAt: arrayOf(countParser),
    attempts: countParser,
    assisted: booleanParser,
  }),
  (line) =>
    line.popped.length + line.snagsAt.length <= line.attempts &&
    new Set(line.popped).size === line.popped.length,
  "pops and snags within the attempts",
);

export const stainWorkParser = refined(
  objectOf<StainWork>({ cellTicks: arrayOf(countParser), harshTicks: countParser, scrubTicks: countParser }),
  (work) => work.harshTicks <= work.scrubTicks,
  "harsh ticks within the scrub ticks",
);

const placementParser = objectOf<Placement>({ x: numberParser, y: numberParser, rotation: oneOf(ROTATIONS) });

export const seamProgressParser = refined(
  objectOf<SeamProgress>({
    progress: shareParser,
    ticks: countParser,
    insideTicks: countParser,
    assisted: booleanParser,
  }),
  (seam) => seam.insideTicks <= seam.ticks,
  "no more stitches on the line than stitches sewn",
);

export const finishItemParser = taggedParser<FinishItem>({
  trim: objectOf<FinishItem & { kind: "trim" }>({
    kind: oneOf(["trim"] as const),
    trimId: trimIdParser,
    source: oneOf(["saved", "new"] as const),
  }),
  patch: objectOf<FinishItem & { kind: "patch" }>({
    kind: oneOf(["patch"] as const),
    patchId: patchIdParser,
    scrap: scrapParser,
  }),
  mark: objectOf<FinishItem & { kind: "mark" }>({
    kind: oneOf(["mark"] as const),
    markId: markIdParser,
    colour: nullable(oneOf(PAINT_COLOURS)),
  }),
});

export const placedFinishParser = objectOf<PlacedFinish>({
  id: stringParser,
  item: finishItemParser,
  x: rangeParser(0, FINISH_CANVAS),
  y: rangeParser(0, FINISH_CANVAS),
  rotation: integerRangeParser(0, 359),
  scale: rangeParser(MIN_PLACED_SCALE, MAX_PLACED_SCALE),
  layer: countParser,
});

function unpickWithinLines(run: FlipRun): boolean {
  return Object.entries(run.unpick).every(([key, record]) => {
    const [findKey, line] = key.split("#");
    const owned = run.finds.find((entry) => entry.id === findKey);
    if (owned === undefined) return false;
    const index = Number(line);
    const def = runLines(run, owned).find((entry) => entry.index === index)?.def;
    if (def === undefined || key !== lineKey(owned.id, index)) return false;
    return [...record.popped, ...record.snagsAt].every((stitch) => stitch < def.stitches);
  });
}

function cleanOnStains(run: FlipRun): boolean {
  return Object.entries(run.clean).every(([key, work]) => {
    const owned = run.finds.find((entry) => key.startsWith(`${entry.id}#`));
    const stain = owned?.stains.find((entry) => key === stainKey(owned.id, entry.id));
    return stain !== undefined && work.cellTicks.length === stain.cells;
  });
}

function stagesConsistent(run: FlipRun): boolean {
  const pastCut = runHasStage(run, "cut") && stageIndex(run.stage) > stageIndex("cut");
  return (
    runHasStage(run, run.stage) &&
    runHasStage(run, run.reachedStage) &&
    stageIndex(run.reachedStage) >= stageIndex(run.stage) &&
    run.cutDone === pastCut &&
    (run.stage !== "brief" || run.purpose.kind === "gig")
  );
}

function ticketShaped(run: FlipRun): boolean {
  const ticketId = run.brief?.ticketId ?? null;
  if (ticketId === null) return runKind(run) === "flip";
  const ticket = ticketById(ticketId);
  const lent = run.finds[0];
  return (
    run.purpose.kind === "gig" &&
    run.design.recipeId === null &&
    run.finds.length === 1 &&
    lent !== undefined &&
    lent.id === `lent-${run.purpose.gigId}` &&
    lent.findId === ticket.findId &&
    runKind(run) === ticket.kind
  );
}

function runMatchesDesign(run: FlipRun): boolean {
  const pieces = runPieces(run).map((piece) => piece.id);
  const seams = runSeams(run).map((seam) => seam.id);
  const findKeys = run.finds.map((owned) => owned.id);
  const ownedKeys = (record: Readonly<Record<string, unknown>>) =>
    Object.keys(record).every((key) => findKeys.includes(key.split("#")[0] ?? ""));
  return (
    keysWithin(run.placements, pieces) &&
    keysWithin(run.cutAccuracy, pieces) &&
    keysWithin(run.cutTraces, Object.keys(run.placements)) &&
    hasUniqueIds(run.finds) &&
    hasUniqueIds(run.finishes) &&
    unpickWithinLines(run) &&
    cleanOnStains(run) &&
    stagesConsistent(run) &&
    ticketShaped(run) &&
    keysWithin(run.seams, seams) &&
    ownedKeys(run.unpick) &&
    ownedKeys(run.clean) &&
    (run.purpose.kind === "own") === (run.brief === null)
  );
}

const flipRunShapeParser = objectOf<FlipRun>({
  id: stringParser,
  purpose: purposeParser,
  brief: nullable(briefParser),
  stage: oneOf(FLIP_STAGES),
  reachedStage: oneOf(FLIP_STAGES),
  startedDay: positiveIntegerParser,
  design: designParser,
  finds: refined(arrayOf(ownedFindParser), (finds) => finds.length <= 2, "at most two finds"),
  unpick: recordOf(anyKey, unpickLineParser),
  clean: recordOf(anyKey, stainWorkParser),
  soaked: booleanParser,
  placements: recordOf(anyKey, placementParser),
  autoLaid: booleanParser,
  cutTraces: recordOf(anyKey, shareParser),
  cutAccuracy: recordOf(anyKey, shareParser),
  cutDone: booleanParser,
  seams: recordOf(anyKey, seamProgressParser),
  finishes: arrayOf(placedFinishParser),
  nextFinishNumber: positiveIntegerParser,
});

export const flipRunParser: Parser<FlipRun> = refined(
  flipRunShapeParser,
  runMatchesDesign,
  "progress that belongs to the flip's plan and finds",
);
