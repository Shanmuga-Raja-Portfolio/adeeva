export const ROTATIONS = [0, 45, 90, 135, 180, 225, 270, 315] as const;
export type Rotation = (typeof ROTATIONS)[number];

export function isRotation(value: number): value is Rotation {
  return ROTATIONS.some((rotation) => rotation === value);
}
