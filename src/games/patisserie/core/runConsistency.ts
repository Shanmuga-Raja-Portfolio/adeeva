import type { ProductDef } from "../content/product";
import { runKind, type BakeRun } from "./bakeRun";
import { mixById, productById } from "./catalog";
import { designIssues, maxColours, productOptions } from "./design";
import { runPipePaths } from "./pipe";
import { stageIndex, stagesFor, type RunStage } from "./runStage";
import { needsFilling, stackComplete } from "./stack";
import { stirDone } from "./stir";
import { batchMix } from "./weigh";

function stagesAreReal(run: BakeRun): boolean {
  const stages = stagesFor(runKind(run));
  return (
    stages.includes(run.stage) &&
    stages.includes(run.reached) &&
    stageIndex(run.reached) >= stageIndex(run.stage)
  );
}

function coloursFit(run: BakeRun): boolean {
  const { colours } = run.design;
  return new Set(colours).size === colours.length && colours.length <= maxColours(run);
}

function designFitsProduct(run: BakeRun, product: ProductDef): boolean {
  return (
    productOptions(run).includes(product.id) &&
    run.batches.length === product.batches &&
    run.design.mixIds.every((mixId) => mixId === null || mixById(mixId).kind === product.mixKind)
  );
}

function stackFitsProduct(run: BakeRun, product: ProductDef): boolean {
  return Object.entries(run.stack).every(([slot, pieceId]) =>
    product.stackPieces.some((piece) => piece.id === pieceId && piece.slot === slot),
  );
}

function pipesFitPattern(run: BakeRun): boolean {
  const paths = runPipePaths(run);
  return Object.keys(run.pipes).every((pathId) => paths.some((path) => path.id === pathId));
}

function past(run: BakeRun, stage: RunStage): boolean {
  return stageIndex(run.stage) > stageIndex(stage);
}

function everyBatch(run: BakeRun, done: (batch: number) => boolean): boolean {
  return run.batches.every((_, batch) => done(batch));
}

function workMatchesStage(run: BakeRun): boolean {
  const order = runKind(run) === "order";
  if (past(run, "design") && designIssues(run).length > 0) return false;
  if (past(run, "weigh") && !everyBatch(run, (batch) => run.batches[batch]?.committed === true)) return false;
  if (
    past(run, "mix") &&
    !everyBatch(run, (batch) => {
      const mix = batchMix(run, batch);
      return mix !== null && stirDone(run.batches[batch]?.stir ?? null, mix);
    })
  )
    return false;
  if (past(run, "bake") && !everyBatch(run, (batch) => run.batches[batch]?.bake !== null)) return false;
  if (order && past(run, "stack") && (!stackComplete(run) || (needsFilling(run) && !run.filled) || !run.iced))
    return false;
  return !(
    order &&
    past(run, "pipe") &&
    runPipePaths(run).some((path) => !Object.hasOwn(run.pipes, path.id))
  );
}

export function isRunConsistent(run: BakeRun): boolean {
  if ((run.purpose.kind === "order") !== (run.brief !== null)) return false;
  if (run.design.mixIds.length !== run.batches.length) return false;
  if (!stagesAreReal(run) || !coloursFit(run)) return false;
  const productId = run.design.productId;
  if (productId === null)
    return run.batches.length === 0 && Object.keys(run.stack).length === 0 && !past(run, "design");
  const product = productById(productId);
  return (
    designFitsProduct(run, product) &&
    stackFitsProduct(run, product) &&
    pipesFitPattern(run) &&
    workMatchesStage(run)
  );
}
