import {
  FINISH_CANVAS,
  FINISH_ROTATION_STEP,
  MAX_FINISH_SCALE,
  MIN_FINISH_SCALE,
  type FinishPose,
} from "../../../../core";
import { normalisedRotation } from "../../../../../../engine/placedPose";

export { poseOf, samePose } from "../../../../../../engine/placedPose";

export function snapPose(pose: FinishPose): FinishPose {
  const clampTo = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const rotation = Math.round(pose.rotation / FINISH_ROTATION_STEP) * FINISH_ROTATION_STEP;
  return {
    x: Math.round(clampTo(pose.x, 0, FINISH_CANVAS) * 10) / 10,
    y: Math.round(clampTo(pose.y, 0, FINISH_CANVAS) * 10) / 10,
    rotation: normalisedRotation(rotation),
    scale: Math.round(clampTo(pose.scale, MIN_FINISH_SCALE, MAX_FINISH_SCALE) * 20) / 20,
    layer: Math.max(0, Math.round(pose.layer)),
  };
}
