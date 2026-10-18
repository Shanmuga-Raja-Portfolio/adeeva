import { clamp } from "../../../../../../engine/clamp";
import type { StitchLineDef } from "../../../../content/find";

export interface LineFrame {
  readonly cx: number;
  readonly cy: number;
  readonly angle: number;
  readonly halfWidth: number;
}

const MARGIN_CM = 4;
const HALF_HEIGHT_CM = 7.4;
const MIN_HALF_WIDTH_CM = 16;
const MAX_SHIFT_CM = 1.5;

export interface PanelExtent {
  readonly width: number;
  readonly height: number;
}

function towardPanel(centre: number, low: number, high: number): number {
  const target =
    high - low >= HALF_HEIGHT_CM * 2
      ? clamp(centre, low + HALF_HEIGHT_CM, high - HALF_HEIGHT_CM)
      : (low + high) / 2;
  return clamp(target - centre, -MAX_SHIFT_CM, MAX_SHIFT_CM);
}

export function lineFrame(line: StitchLineDef, panel?: PanelExtent): LineFrame {
  const dx = line.to[0] - line.from[0];
  const dy = line.to[1] - line.from[1];
  const length = Math.hypot(dx, dy);
  const cx = (line.from[0] + line.to[0]) / 2;
  const cy = (line.from[1] + line.to[1]) / 2;
  const halfWidth = Math.max(MIN_HALF_WIDTH_CM, length / 2 + MARGIN_CM);
  const level = Math.abs(dy) < 1e-6;
  const upright = Math.abs(dx) < 1e-6;
  const shiftY = panel !== undefined && level ? towardPanel(cy, 0, panel.height) : 0;
  const shiftX = panel !== undefined && upright ? towardPanel(cx, 0, panel.width) : 0;
  return {
    cx: cx + shiftX,
    cy: cy + shiftY,
    angle: (Math.atan2(dy, dx) * 180) / Math.PI,
    halfWidth,
  };
}

export function frameTransform(frame: LineFrame): string {
  return `rotate(${-frame.angle}) translate(${-frame.cx} ${-frame.cy})`;
}

export interface BenchMargins {
  readonly top: number;
  readonly bottom: number;
}

export interface FittedFrame extends LineFrame {
  readonly halfHeight: number;
  readonly viewTop: number;
  readonly clothHalf: number;
}

const MIN_CLOTH_HALF_CM = 4.2;

export function fitFrame(
  frame: LineFrame,
  width: number,
  height: number,
  margins: BenchMargins,
): FittedFrame {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const clothPx = Math.max(1, safeHeight - margins.top - margins.bottom);
  const halfWidth = Math.max(frame.halfWidth, (MIN_CLOTH_HALF_CM * safeWidth) / clothPx);
  const pxPerCm = safeWidth / (halfWidth * 2);
  const clothHalf = clothPx / pxPerCm / 2;
  return {
    ...frame,
    halfWidth,
    halfHeight: safeHeight / pxPerCm / 2,
    viewTop: -clothHalf - margins.top / pxPerCm,
    clothHalf,
  };
}

export function fittedViewBox(frame: FittedFrame): string {
  return `${-frame.halfWidth} ${frame.viewTop} ${frame.halfWidth * 2} ${frame.halfHeight * 2}`;
}
