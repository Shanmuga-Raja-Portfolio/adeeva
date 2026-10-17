import type { Point } from "../../../engine/geometry/point";
import type { AccentId, ShapeId } from "../content/partOption";
import { shapeOutline } from "./shapeOutline";
import { ellipsePoints, placedUnit, starPoints, type UnitShape } from "./unitCurves";

interface AccentAnchor {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly vertical: boolean;
}

const ACCENT_ANCHORS: Readonly<Record<ShapeId, AccentAnchor>> = {
  circle: { x: 0.5, y: 0.5, size: 0.34, vertical: false },
  heart: { x: 0.5, y: 0.42, size: 0.3, vertical: false },
  leaf: { x: 0.5, y: 0.5, size: 0.3, vertical: true },
  raindrop: { x: 0.5, y: 0.64, size: 0.3, vertical: false },
  crescent: { x: 0.2, y: 0.52, size: 0.2, vertical: true },
  star: { x: 0.5, y: 0.53, size: 0.24, vertical: false },
  shell: { x: 0.5, y: 0.5, size: 0.26, vertical: false },
  flower: { x: 0.5, y: 0.5, size: 0.3, vertical: false },
  wave: { x: 0.5, y: 0.47, size: 0.2, vertical: false },
  lantern: { x: 0.5, y: 0.62, size: 0.32, vertical: false },
};

const BAND_ANCHOR: AccentAnchor = { x: 0.5, y: 0.5, size: 0.62, vertical: false };

function squashed(points: readonly Point[], cx: number, aspect: number): Point[] {
  if (aspect === 1) return [...points];
  return points.map(([x, y]): Point => [cx + (x - cx) / aspect, y]);
}

function windows(accent: AccentId, anchor: AccentAnchor, aspect: number): UnitShape[] {
  switch (accent) {
    case "plain":
      return [];
    case "star-window": {
      const half = anchor.size / 2;
      return [
        {
          points: squashed(starPoints(anchor.x, anchor.y, half, half * 0.45), anchor.x, aspect),
          dots: Array.from({ length: 10 }, (_, i) => i),
        },
      ];
    }
    case "moon-window":
      return [placedUnit(shapeOutline("crescent"), anchor.x, anchor.y, anchor.size * 0.85, aspect)];
    case "heart-window":
      return [placedUnit(shapeOutline("heart"), anchor.x, anchor.y, anchor.size * 0.85, aspect)];
    case "dot-row": {
      const radius = anchor.size * 0.2;
      const gap = anchor.size * 0.5;
      return [-1, 0, 1].map((offset) => ({
        points: squashed(
          ellipsePoints(
            anchor.vertical ? anchor.x : anchor.x + offset * gap,
            anchor.vertical ? anchor.y + offset * gap : anchor.y,
            radius,
            radius,
            20,
          ),
          anchor.x,
          aspect,
        ),
        dots: [],
      }));
    }
  }
}

export function accentOutlines(accent: AccentId, shape: ShapeId): UnitShape[] {
  return windows(accent, ACCENT_ANCHORS[shape], 1);
}

export function bandAccentOutlines(accent: AccentId, aspect: number): UnitShape[] {
  return windows(accent, BAND_ANCHOR, aspect);
}
