import type { Point } from "../../../../engine/geometry/point";
import type { LightId } from "../../content/light";

const HEADS: Readonly<Record<LightId, Point>> = {
  "paper-pendant": [0, 0.22],
  "dome-pendant": [0, 0.3],
  "arc-lamp": [0.48, -1.4],
  "clip-lamp": [0.18, -0.46],
  "brass-sconce": [0, -0.1],
  "firefly-string": [0, 0],
  "lantern-pendant": [0, 0.26],
  "track-spots": [0, 0.3],
  "table-lamp": [0, -0.4],
  "globe-lamp": [0, -1.42],
  "picture-light": [0, 0.1],
  "starry-nightlight": [0, -0.22],
};

export function lampHead(lightId: LightId, x: number, y: number, unit: number): Point {
  const [dx, dy] = HEADS[lightId];
  return [x + dx * unit, y + dy * unit];
}
