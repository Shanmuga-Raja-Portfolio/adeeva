export const MIN_PLACED_SCALE = 0.5;
export const MAX_PLACED_SCALE = 2;

export interface PlacedPose {
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly scale: number;
  readonly layer: number;
}

export interface CanvasSize {
  readonly width: number;
  readonly height: number;
}

export function isOnCanvas(canvas: CanvasSize, x: number, y: number): boolean {
  return (
    Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height
  );
}

export function normalisedRotation(rotation: number): number {
  return ((rotation % 360) + 360) % 360;
}

export function topLayer(placed: readonly { readonly layer: number }[]): number {
  return placed.reduce((highest, entry) => Math.max(highest, entry.layer), 0);
}

export function isValidPose(canvas: CanvasSize, pose: PlacedPose): boolean {
  return (
    isOnCanvas(canvas, pose.x, pose.y) &&
    pose.scale >= MIN_PLACED_SCALE &&
    pose.scale <= MAX_PLACED_SCALE &&
    Number.isFinite(pose.rotation) &&
    Number.isInteger(pose.layer) &&
    pose.layer >= 0
  );
}

export function samePose(a: PlacedPose, b: PlacedPose): boolean {
  return (
    a.x === b.x && a.y === b.y && a.rotation === b.rotation && a.scale === b.scale && a.layer === b.layer
  );
}

export function clampPose(canvas: CanvasSize, pose: PlacedPose): PlacedPose {
  const round = (value: number) => Math.round(value * 10) / 10;
  return {
    x: round(Math.min(canvas.width, Math.max(0, pose.x))),
    y: round(Math.min(canvas.height, Math.max(0, pose.y))),
    rotation: Math.round(normalisedRotation(pose.rotation)),
    scale: Math.round(Math.min(MAX_PLACED_SCALE, Math.max(MIN_PLACED_SCALE, pose.scale)) * 100) / 100,
    layer: Math.max(0, Math.round(pose.layer)),
  };
}

export function poseOf(placed: PlacedPose): PlacedPose {
  return { x: placed.x, y: placed.y, rotation: placed.rotation, scale: placed.scale, layer: placed.layer };
}
