import type { StitchLineDef } from "../../../../content/find";

export interface LineFrame {
  readonly cx: number;
  readonly cy: number;
  readonly angle: number;
  readonly halfWidth: number;
  readonly halfHeight: number;
}

const MARGIN_CM = 6;
const HALF_HEIGHT_CM = 9;
const MIN_HALF_WIDTH_CM = 16;

export function lineFrame(line: StitchLineDef): LineFrame {
  const dx = line.to[0] - line.from[0];
  const dy = line.to[1] - line.from[1];
  const length = Math.hypot(dx, dy);
  return {
    cx: (line.from[0] + line.to[0]) / 2,
    cy: (line.from[1] + line.to[1]) / 2,
    angle: (Math.atan2(dy, dx) * 180) / Math.PI,
    halfWidth: Math.max(MIN_HALF_WIDTH_CM, length / 2 + MARGIN_CM),
    halfHeight: HALF_HEIGHT_CM,
  };
}

export function frameTransform(frame: LineFrame): string {
  return `rotate(${-frame.angle}) translate(${-frame.cx} ${-frame.cy})`;
}

export function frameViewBox(frame: LineFrame): string {
  return `${-frame.halfWidth} ${-frame.halfHeight} ${frame.halfWidth * 2} ${frame.halfHeight * 2}`;
}
