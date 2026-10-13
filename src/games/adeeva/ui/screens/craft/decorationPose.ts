import { clampPose as clampToCanvas, type PlacedPose } from "../../../../../engine/placedPose";
import { DOLL_HEIGHT, DOLL_WIDTH } from "../../../core";

export { poseOf, samePose } from "../../../../../engine/placedPose";

export function clampPose(pose: PlacedPose): PlacedPose {
  return clampToCanvas({ width: DOLL_WIDTH, height: DOLL_HEIGHT }, pose);
}
