import {
  DOLL_HEIGHT,
  DOLL_WIDTH,
  MAX_DECORATION_SCALE,
  MIN_DECORATION_SCALE,
  type Decoration,
  type DecorationPose,
} from "../../../core";

export function clampPose(pose: DecorationPose): DecorationPose {
  const round = (value: number) => Math.round(value * 10) / 10;
  return {
    x: round(Math.min(DOLL_WIDTH, Math.max(0, pose.x))),
    y: round(Math.min(DOLL_HEIGHT, Math.max(0, pose.y))),
    rotation: Math.round(((pose.rotation % 360) + 360) % 360),
    scale: Math.round(Math.min(MAX_DECORATION_SCALE, Math.max(MIN_DECORATION_SCALE, pose.scale)) * 100) / 100,
    layer: Math.max(0, Math.round(pose.layer)),
  };
}

export function poseOf(decoration: Decoration): DecorationPose {
  return {
    x: decoration.x,
    y: decoration.y,
    rotation: decoration.rotation,
    scale: decoration.scale,
    layer: decoration.layer,
  };
}

export function samePose(a: DecorationPose, b: DecorationPose): boolean {
  return (
    a.x === b.x && a.y === b.y && a.rotation === b.rotation && a.scale === b.scale && a.layer === b.layer
  );
}
