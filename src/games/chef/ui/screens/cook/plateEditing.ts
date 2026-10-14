import type { Point } from "../../../../../engine/geometry/point";
import { ROTATIONS, type Rotation } from "../../../../../engine/geometry/rotation";
import type { ComponentId } from "../../../content/plateComponent";
import {
  MAX_COMPONENT_SCALE,
  MIN_COMPONENT_SCALE,
  placedAt,
  placedCentre,
  PLATE_SIZE,
  SNAP_DISTANCE,
  type PlacedComponent,
} from "../../../core";

function fit(entry: PlacedComponent): PlacedComponent {
  return {
    ...entry,
    x: Math.min(PLATE_SIZE, Math.max(0, entry.x)),
    y: Math.min(PLATE_SIZE, Math.max(0, entry.y)),
  };
}

export function clampCentre(point: Point): Point {
  return [
    Math.min(PLATE_SIZE - 10, Math.max(10, point[0])),
    Math.min(PLATE_SIZE - 10, Math.max(10, point[1])),
  ];
}

export function topLayer(placed: readonly PlacedComponent[]): number {
  return placed.reduce((top, entry) => Math.max(top, entry.layer), -1) + 1;
}

export function snapped(point: Point, ghost: PlacedComponent | undefined, snap: boolean): Point {
  if (!snap || ghost === undefined) return point;
  const target = placedCentre(ghost);
  return Math.hypot(point[0] - target[0], point[1] - target[1]) <= SNAP_DISTANCE ? target : point;
}

export function placeAt(
  placed: readonly PlacedComponent[],
  componentId: ComponentId,
  point: Point,
  layer: number,
): PlacedComponent[] {
  const existing = placed.find((entry) => entry.componentId === componentId);
  const rotation = existing?.rotation ?? 0;
  const scale = existing?.scale ?? 1;
  const next = fit(placedAt(componentId, clampCentre(point), rotation, scale, existing?.layer ?? layer));
  return [...placed.filter((entry) => entry.componentId !== componentId), next];
}

export function rotated(placed: readonly PlacedComponent[], componentId: ComponentId): PlacedComponent[] {
  return placed.map((entry) => {
    if (entry.componentId !== componentId) return entry;
    const index = ROTATIONS.indexOf(entry.rotation);
    const rotation: Rotation = ROTATIONS[(index + 1) % ROTATIONS.length] ?? 0;
    return fit(placedAt(componentId, placedCentre(entry), rotation, entry.scale, entry.layer));
  });
}

export function rescaled(
  placed: readonly PlacedComponent[],
  componentId: ComponentId,
  step: number,
): PlacedComponent[] {
  return placed.map((entry) => {
    if (entry.componentId !== componentId) return entry;
    const scale =
      Math.round(Math.min(MAX_COMPONENT_SCALE, Math.max(MIN_COMPONENT_SCALE, entry.scale + step)) * 10) / 10;
    return fit(placedAt(componentId, placedCentre(entry), entry.rotation, scale, entry.layer));
  });
}

export function nudged(
  placed: readonly PlacedComponent[],
  componentId: ComponentId,
  dx: number,
  dy: number,
): PlacedComponent[] {
  const entry = placed.find((item) => item.componentId === componentId);
  if (entry === undefined) return [...placed];
  const centre = placedCentre(entry);
  return placeAt(placed, componentId, [centre[0] + dx, centre[1] + dy], entry.layer);
}
