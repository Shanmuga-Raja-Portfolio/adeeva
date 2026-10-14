import { productById } from "./catalog";
import { runCutPaths } from "./cutRecord";
import { isJoinDone } from "./joiningLamp";
import { runJoints } from "./joinRecord";
import type { PieceRun } from "./pieceRun";
import { polishedParts } from "./polish";
import { runSeats } from "./stoneSetting";

export interface ConstructionCount {
  readonly paths: number;
  readonly cut: number;
  readonly joints: number;
  readonly joined: number;
  readonly stones: number;
  readonly set: number;
  readonly parts: number;
  readonly polished: number;
}

export function constructionCount(run: PieceRun): ConstructionCount {
  const paths = runCutPaths(run);
  const joints = runJoints(run);
  const seats = runSeats(run);
  return {
    paths: paths.length,
    cut: paths.filter((path) => Object.hasOwn(run.cuts, path.id)).length,
    joints: joints.length,
    joined: joints.filter((joint) => isJoinDone(run.joins[joint.id], joint.ticks)).length,
    stones: seats.length,
    set: seats.filter((seat) => Object.hasOwn(run.sets, seat)).length,
    parts: productById(run.design.productId).parts.length,
    polished: polishedParts(run),
  };
}

export function isConstructionComplete(count: ConstructionCount): boolean {
  return (
    count.cut === count.paths &&
    count.joined === count.joints &&
    count.set === count.stones &&
    count.polished === count.parts
  );
}
