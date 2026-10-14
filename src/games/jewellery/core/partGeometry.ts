import type { Point } from "../../../engine/geometry/point";
import type { AccentId, BandId, ShapeId } from "../content/partOption";
import type { PartDef } from "../content/product";
import type { StoneCut } from "../content/stone";
import { productById, stoneById } from "./catalog";
import type { DesignOptions } from "./pieceLook";
import type { PieceDesign } from "./pieceRun";
import {
  accentOutlines,
  bandOutline,
  loopOutline,
  mirroredShape,
  seatOutline,
  shapeOutline,
  type UnitShape,
} from "./shapeOutline";

export interface CutPath {
  readonly id: string;
  readonly partKey: string;
  readonly name: string;
  readonly points: readonly Point[];
  readonly dots: readonly Point[];
  readonly width: number;
  readonly height: number;
}

interface PartShapeInput {
  readonly options: DesignOptions;
  readonly cut: StoneCut;
}

const DEFAULT_SHAPE: ShapeId = "circle";
const DEFAULT_BAND: BandId = "smooth-band";
const DEFAULT_ACCENT: AccentId = "plain";

export function shapeOption(options: DesignOptions): ShapeId {
  const value = options.shape;
  return value === "circle" ||
    value === "heart" ||
    value === "leaf" ||
    value === "raindrop" ||
    value === "crescent" ||
    value === "star"
    ? value
    : DEFAULT_SHAPE;
}

export function bandOption(options: DesignOptions): BandId {
  const value = options.band;
  return value === "smooth-band" || value === "wavy-band" || value === "hammered-band" ? value : DEFAULT_BAND;
}

function accentOption(options: DesignOptions): AccentId {
  const value = options.accent;
  return value === "plain" || value === "star-window" || value === "dot-row" ? value : DEFAULT_ACCENT;
}

export function seatCut(design: PieceDesign): StoneCut {
  return design.stoneId === null ? "round" : stoneById(design.stoneId).cut;
}

function unitPart(part: PartDef, input: PartShapeInput): UnitShape {
  switch (part.outline) {
    case "band":
      return bandOutline(bandOption(input.options));
    case "shape":
      return shapeOutline(shapeOption(input.options));
    case "seat":
      return seatOutline(input.cut);
    case "loop":
      return loopOutline();
  }
}

function scaled(shape: UnitShape, width: number, height: number): Point[] {
  return shape.points.map(([x, y]): Point => [x * width, y * height]);
}

function dotsOf(shape: UnitShape, points: readonly Point[]): Point[] {
  return shape.dots.flatMap((index) => {
    const point = points[index];
    return point === undefined ? [] : [point];
  });
}

function oriented(part: PartDef, shape: UnitShape): UnitShape {
  return part.mirrored ? mirroredShape(shape) : shape;
}

export function partOutline(part: PartDef, input: PartShapeInput): readonly Point[] {
  return scaled(oriented(part, unitPart(part, input)), part.width, part.height);
}

export function partAccents(part: PartDef, input: PartShapeInput): readonly (readonly Point[])[] {
  if (!part.accent) return [];
  return accentOutlines(accentOption(input.options), shapeOption(input.options)).map((shape) =>
    scaled(oriented(part, shape), part.width, part.height),
  );
}

function pathsForPart(part: PartDef, input: PartShapeInput): CutPath[] {
  const outer = oriented(part, unitPart(part, input));
  const outerPoints = scaled(outer, part.width, part.height);
  const paths: CutPath[] = [
    {
      id: part.key,
      partKey: part.key,
      name: part.name,
      points: outerPoints,
      dots: dotsOf(outer, outerPoints),
      width: part.width,
      height: part.height,
    },
  ];
  if (!part.accent) return paths;
  const accents = accentOutlines(accentOption(input.options), shapeOption(input.options));
  accents.forEach((accent, index) => {
    const shape = oriented(part, accent);
    const points = scaled(shape, part.width, part.height);
    paths.push({
      id: `${part.key}-accent-${index + 1}`,
      partKey: part.key,
      name: accents.length === 1 ? "Star window" : `Dot ${index + 1}`,
      points,
      dots: dotsOf(shape, points),
      width: part.width,
      height: part.height,
    });
  });
  return paths;
}

export function designInput(design: PieceDesign): PartShapeInput {
  return { options: design.options, cut: seatCut(design) };
}

export function productParts(design: PieceDesign): readonly PartDef[] {
  return productById(design.productId).parts;
}

export function designCutPaths(design: PieceDesign): CutPath[] {
  const input = designInput(design);
  return productParts(design).flatMap((part) => pathsForPart(part, input));
}
