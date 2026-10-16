import { updateActiveRun } from "../../../engine/activeRunUpdate";
import { average } from "../../../engine/average";
import { clamp } from "../../../engine/clamp";
import { runNumber } from "../../../engine/idNumber";
import { nextRandom } from "../../../engine/rng";
import { recordWithout } from "../../../engine/recordWithout";
import type { JointDef } from "../content/product";
import { jointKindById } from "./catalog";
import type { CommissionRun, JointRecord, PieceDesign } from "./commissionRun";
import type { GameState } from "./gameState";
import { designJoints, findJoint, type RunJoint } from "./pieceParts";
import { jointTolerance, type JointTolerance } from "./tolerance";
import { hasJigs, JIG_JOINT_WIDENING, twinSource } from "./twinSaw";

export const ASSIST_JOINT_ACCURACY_CAP = 0.7;
export const SPLAYED_SLOT_ANGLE_DEG = 8;
export const MIN_START_OFFSET_MM = 25;
const MAX_START_OFFSET_MM = 40;
const MIN_START_TURN_DEG = 12;
const MAX_START_TURN_DEG = 25;

export interface JointPose {
  readonly x: number;
  readonly y: number;
  readonly angle: number;
}

interface JointError {
  readonly offsetMm: number;
  readonly angleDeg: number;
}

export function jointTargetAngle(design: PieceDesign, joint: JointDef): number {
  return joint.kind === "slot" && design.options.legs === "splayed-legs" ? SPLAYED_SLOT_ANGLE_DEG : 0;
}

export function jointTaps(joint: JointDef): number {
  return jointKindById(joint.kind).taps;
}

function signedTurn(degrees: number): number {
  return ((((degrees + 180) % 360) + 360) % 360) - 180;
}

export function jointError(pose: JointPose, targetAngle: number): JointError {
  return {
    offsetMm: Math.hypot(pose.x, pose.y),
    angleDeg: Math.abs(signedTurn(pose.angle - targetAngle)),
  };
}

export function gateValue(error: JointError, tolerance: JointTolerance): number {
  return (error.offsetMm / tolerance.offsetMm) ** 2 + (error.angleDeg / tolerance.angleDeg) ** 2;
}

export function isMalletReady(error: JointError, tolerance: JointTolerance): boolean {
  return gateValue(error, tolerance) <= 1;
}

export function jointAccuracy(
  error: JointError,
  tolerance: JointTolerance,
  goodTaps: number,
  taps: number,
): number {
  const fit = clamp(
    1 - 0.5 * (error.offsetMm / tolerance.offsetMm) ** 2 - 0.5 * (error.angleDeg / tolerance.angleDeg) ** 2,
    0,
    1,
  );
  return fit * (0.9 + (0.1 * goodTaps) / taps);
}

export function jointStartPose(runId: string, jointIndex: number, targetAngle: number): JointPose {
  const seed = (runNumber(runId) * 2654435 + (jointIndex + 1) * 40503) | 0;
  const [distanceRoll, afterDistance] = nextRandom(seed);
  const [directionRoll, afterDirection] = nextRandom(afterDistance);
  const [turnRoll, afterTurn] = nextRandom(afterDirection);
  const [signRoll] = nextRandom(afterTurn);
  const distance = MIN_START_OFFSET_MM + distanceRoll * (MAX_START_OFFSET_MM - MIN_START_OFFSET_MM);
  const direction = directionRoll * Math.PI * 2;
  const turn = MIN_START_TURN_DEG + turnRoll * (MAX_START_TURN_DEG - MIN_START_TURN_DEG);
  return {
    x: Math.round(Math.cos(direction) * distance * 10) / 10,
    y: Math.round(Math.sin(direction) * distance * 10) / 10,
    angle: Math.round((targetAngle + (signRoll < 0.5 ? -turn : turn)) * 10) / 10,
  };
}

export function runJointTolerance(
  state: GameState,
  run: CommissionRun,
  joint: RunJoint,
): JointTolerance | null {
  const woodId = run.design.woodId;
  if (woodId === null) return null;
  const tolerance = jointTolerance(state, woodId, joint.kind);
  if (twinSource(run, joint.piece) === null || !hasJigs(state)) return tolerance;
  return {
    offsetMm: tolerance.offsetMm * JIG_JOINT_WIDENING,
    angleDeg: tolerance.angleDeg * JIG_JOINT_WIDENING,
  };
}

function seatedRecord(
  pose: JointPose,
  targetAngle: number,
  tolerance: JointTolerance,
  goodTaps: number,
  taps: number,
  assisted: boolean,
): JointRecord | null {
  if (!Number.isFinite(pose.x) || !Number.isFinite(pose.y) || !Number.isFinite(pose.angle)) return null;
  if (!Number.isInteger(goodTaps) || goodTaps < 0 || goodTaps > taps) return null;
  const error: JointError = assisted ? { offsetMm: 0, angleDeg: 0 } : jointError(pose, targetAngle);
  if (!isMalletReady(error, tolerance)) return null;
  const raw = jointAccuracy(error, tolerance, goodTaps, taps);
  return {
    offsetMm: error.offsetMm,
    angleDeg: error.angleDeg,
    goodTaps,
    assisted,
    accuracy: assisted ? Math.min(ASSIST_JOINT_ACCURACY_CAP, raw) : raw,
    byApprentice: false,
  };
}

export function seatJoint(
  state: GameState,
  jointId: string,
  pose: JointPose,
  goodTaps: number,
  assisted: boolean,
): GameState {
  return updateActiveRun(state, "join", (run) => {
    const joint = findJoint(run, jointId);
    if (joint === undefined || Object.hasOwn(run.joints, jointId)) return null;
    const tolerance = runJointTolerance(state, run, joint);
    if (tolerance === null) return null;
    const record = seatedRecord(
      pose,
      jointTargetAngle(run.design, joint),
      tolerance,
      goodTaps,
      jointTaps(joint),
      assisted,
    );
    return record === null ? null : { ...run, joints: { ...run.joints, [jointId]: record } };
  });
}

export function resetJoint(state: GameState, jointId: string): GameState {
  return updateActiveRun(state, "join", (run) => {
    const record = Object.hasOwn(run.joints, jointId) ? run.joints[jointId] : undefined;
    if (record === undefined || record.byApprentice) return null;
    return { ...run, joints: recordWithout(run.joints, jointId) };
  });
}

export function runJointAccuracy(
  run: CommissionRun,
  joints: readonly RunJoint[] = designJoints(run),
): number {
  if (joints.length === 0) return 0;
  return average(
    joints.map((joint) => (Object.hasOwn(run.joints, joint.id) ? (run.joints[joint.id]?.accuracy ?? 0) : 0)),
  );
}

export function seatedJointCount(
  run: CommissionRun,
  joints: readonly RunJoint[] = designJoints(run),
): number {
  return joints.filter((joint) => Object.hasOwn(run.joints, joint.id)).length;
}
