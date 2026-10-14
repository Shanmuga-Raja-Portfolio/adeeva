import { cappedAccuracy } from "../../../engine/assistCap";
import type { Point } from "../../../engine/geometry/point";
import { polygonsOverlap } from "../../../engine/geometry/polygonOverlap";
import { placedPolygon, polygonBounds } from "../../../engine/geometry/polygonPlacement";
import { isRotation, type Rotation } from "../../../engine/geometry/rotation";
import { scaledShape } from "../../../engine/geometry/scaledShape";
import type { DishDef } from "../content/dish";
import { PLATE_COLOURS, type ComponentId, type PlateColour } from "../content/plateComponent";
import { componentById } from "./catalog";

export const PLATE_SIZE = 400;
export const PLATE_CENTRE = 200;
export const RIM_RADIUS = 190;
export const WELL_RADIUS = 150;
export const THIRDS_OFFSET = 55;
export const FOCUS_RADIUS = 40;
export const FOCUS_FALLOFF = 80;
export const MIN_COMPONENT_SCALE = 0.8;
export const MAX_COMPONENT_SCALE = 1.2;
export const SNAP_DISTANCE = 30;
export const GHOST_SCORE = 0.75;
export const DRIP_FACTOR = 0.95;
export const MISSED_GARNISH_FACTOR = 0.7;
export const IN_WELL_WEIGHT = 0.4;
export const SPACING_WEIGHT = 0.3;
export const FOCUS_WEIGHT = 0.3;
export const OVERLAP_COST = 0.25;
const ELLIPSE_POINTS = 12;

export interface PlacedComponent {
  readonly componentId: ComponentId;
  readonly x: number;
  readonly y: number;
  readonly rotation: Rotation;
  readonly scale: number;
  readonly layer: number;
}

export interface PlateRecord {
  readonly components: readonly PlacedComponent[];
  readonly plateColour: PlateColour;
  readonly wiped: boolean;
  readonly assisted: boolean;
}

export interface PlateResult {
  readonly accuracy: number;
  readonly inWell: number;
  readonly spacing: number;
  readonly focus: number;
  readonly garnishes: number;
  readonly garnishMet: boolean;
  readonly colourCount: number;
  readonly wiped: boolean;
  readonly assisted: boolean;
}

export const FOCUS_POINTS: readonly Point[] = [
  [PLATE_CENTRE, PLATE_CENTRE],
  [PLATE_CENTRE - THIRDS_OFFSET, PLATE_CENTRE - THIRDS_OFFSET],
  [PLATE_CENTRE + THIRDS_OFFSET, PLATE_CENTRE - THIRDS_OFFSET],
  [PLATE_CENTRE - THIRDS_OFFSET, PLATE_CENTRE + THIRDS_OFFSET],
  [PLATE_CENTRE + THIRDS_OFFSET, PLATE_CENTRE + THIRDS_OFFSET],
];

export function plateComponentIds(dish: DishDef): ComponentId[] {
  const { base, hero, sauce, garnishes } = dish.plate;
  return [...(base === null ? [] : [base]), hero, ...(sauce === null ? [] : [sauce]), ...garnishes];
}

export function componentShape(componentId: ComponentId): Point[] {
  const { width, height } = componentById(componentId);
  return Array.from({ length: ELLIPSE_POINTS }, (_, index): Point => {
    const angle = (index / ELLIPSE_POINTS) * Math.PI * 2;
    return [width / 2 + (width / 2) * Math.cos(angle), height / 2 + (height / 2) * Math.sin(angle)];
  });
}

export function placedComponentPolygon(placed: PlacedComponent): Point[] {
  return placedPolygon(scaledShape(componentShape(placed.componentId), placed.scale), placed);
}

export function polygonCentre(polygon: readonly Point[]): Point {
  const bounds = polygonBounds(polygon);
  return [(bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2];
}

export function placedCentre(placed: PlacedComponent): Point {
  return polygonCentre(placedComponentPolygon(placed));
}

export function placedAt(
  componentId: ComponentId,
  centre: Point,
  rotation: Rotation,
  scale: number,
  layer: number,
): PlacedComponent {
  const turned = placedPolygon(scaledShape(componentShape(componentId), scale), { x: 0, y: 0, rotation });
  const bounds = polygonBounds(turned);
  return {
    componentId,
    x: Math.round((centre[0] - bounds.maxX / 2) * 10) / 10,
    y: Math.round((centre[1] - bounds.maxY / 2) * 10) / 10,
    rotation,
    scale,
    layer,
  };
}

function insideWell(polygon: readonly Point[]): boolean {
  return polygon.every(([x, y]) => Math.hypot(x - PLATE_CENTRE, y - PLATE_CENTRE) <= WELL_RADIUS);
}

function overlapAllowed(first: ComponentId, second: ComponentId): boolean {
  const roles = [componentById(first).role, componentById(second).role];
  if (roles.includes("base")) return true;
  return roles.includes("sauce") && roles.includes("hero");
}

export function focusScore(centre: Point, tolerance: number): number {
  const radius = FOCUS_RADIUS * tolerance;
  const nearest = Math.min(
    ...FOCUS_POINTS.map((point) => Math.hypot(centre[0] - point[0], centre[1] - point[1])),
  );
  if (nearest <= radius) return 1;
  return Math.max(0, 1 - (nearest - radius) / FOCUS_FALLOFF);
}

export function plateIssues(dish: DishDef, record: PlateRecord): string[] {
  const allowed = plateComponentIds(dish);
  const ids = record.components.map((placed) => placed.componentId);
  const issues: string[] = [];
  if (!PLATE_COLOURS.includes(record.plateColour)) issues.push("Pick a plate.");
  if (typeof record.wiped !== "boolean" || typeof record.assisted !== "boolean")
    issues.push("Plate it again.");
  if (!ids.includes(dish.plate.hero)) issues.push("Put the main part of the dish on the plate.");
  if (new Set(ids).size !== ids.length || ids.some((id) => !allowed.includes(id)))
    issues.push("Each part of the dish goes on the plate once.");
  const posed = record.components.every(
    (placed) =>
      isRotation(placed.rotation) &&
      Number.isFinite(placed.x) &&
      Number.isFinite(placed.y) &&
      placed.x >= 0 &&
      placed.y >= 0 &&
      placed.x <= PLATE_SIZE &&
      placed.y <= PLATE_SIZE &&
      placed.scale >= MIN_COMPONENT_SCALE &&
      placed.scale <= MAX_COMPONENT_SCALE &&
      Number.isInteger(placed.layer) &&
      placed.layer >= 0,
  );
  if (!posed) issues.push("Keep every piece on the plate.");
  return issues;
}

export function scorePlate(dish: DishDef, record: PlateRecord, tolerance: number): PlateResult {
  const polygons = record.components.map((placed) => ({
    id: placed.componentId,
    polygon: placedComponentPolygon(placed),
  }));
  const inWell =
    polygons.length === 0
      ? 0
      : polygons.filter((entry) => insideWell(entry.polygon)).length / polygons.length;
  let overlaps = 0;
  polygons.forEach((first, index) => {
    for (const second of polygons.slice(index + 1))
      if (!overlapAllowed(first.id, second.id) && polygonsOverlap(first.polygon, second.polygon))
        overlaps += 1;
  });
  const spacing = Math.max(0, 1 - OVERLAP_COST * overlaps);
  const hero = polygons.find((entry) => entry.id === dish.plate.hero);
  const focus = hero === undefined ? 0 : focusScore(polygonCentre(hero.polygon), tolerance);
  const garnishIds = record.components
    .map((placed) => componentById(placed.componentId))
    .filter((component) => component.role === "garnish");
  const garnishMet = garnishIds.length >= dish.plate.garnishCount;
  const colourCount = new Set(garnishIds.map((component) => component.garnishColour)).size;
  const raw =
    (IN_WELL_WEIGHT * inWell + SPACING_WEIGHT * spacing + FOCUS_WEIGHT * focus) *
    (garnishMet ? 1 : MISSED_GARNISH_FACTOR) *
    (record.wiped ? 1 : DRIP_FACTOR);
  return {
    accuracy: cappedAccuracy(raw, record.assisted),
    inWell,
    spacing,
    focus,
    garnishes: garnishIds.length,
    garnishMet,
    colourCount,
    wiped: record.wiped,
    assisted: record.assisted,
  };
}

const GHOST_ANGLES: Readonly<Record<number, readonly number[]>> = {
  1: [-90],
  2: [-90, 90],
  3: [-90, 140, 40],
};
const GHOST_MARGIN = 4;
const HERO_LIFT = 6;

export function ghostLayout(dish: DishDef): PlacedComponent[] {
  const { base, hero, sauce, garnishes } = dish.plate;
  const placed: PlacedComponent[] = [];
  if (base !== null) placed.push(placedAt(base, [PLATE_CENTRE, PLATE_CENTRE], 0, 1, 0));
  if (sauce !== null) placed.push(placedAt(sauce, [PLATE_CENTRE, PLATE_CENTRE + 18], 0, 1, 1));
  placed.push(placedAt(hero, [PLATE_CENTRE, PLATE_CENTRE - HERO_LIFT], 0, 1, 2));
  const angles = GHOST_ANGLES[garnishes.length] ?? [];
  garnishes.forEach((id, index) => {
    const angle = ((angles[index] ?? 0) * Math.PI) / 180;
    const component = componentById(id);
    const reach = WELL_RADIUS - Math.max(component.width, component.height) / 2 - GHOST_MARGIN;
    placed.push(
      placedAt(
        id,
        [PLATE_CENTRE + Math.cos(angle) * reach, PLATE_CENTRE + Math.sin(angle) * reach],
        0,
        1,
        3 + index,
      ),
    );
  });
  return placed;
}
