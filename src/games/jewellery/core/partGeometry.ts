import type { Point } from "../../../engine/geometry/point";
import {
  ACCENT_IDS,
  BAND_IDS,
  SHAPE_IDS,
  type AccentId,
  type BandId,
  type ShapeId,
} from "../content/partOption";
import type { PartDef } from "../content/product";
import type { StoneCut } from "../content/stone";
import { accentOutlines, bandAccentOutlines } from "./accentOutline";
import { bandOutline, barOutline } from "./bandOutline";
import { productById, stoneById } from "./catalog";
import type { DesignOptions } from "./pieceLook";
import type { PieceDesign } from "./pieceRun";
import {
  halfOutline,
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

const isShape = (value: string | undefined): value is ShapeId => SHAPE_IDS.some((id) => id === value);
const isBand = (value: string | undefined): value is BandId => BAND_IDS.some((id) => id === value);
const isAccent = (value: string | undefined): value is AccentId => ACCENT_IDS.some((id) => id === value);

export function shapeOption(options: DesignOptions): ShapeId {
  const value = options.shape;
  return isShape(value) ? value : DEFAULT_SHAPE;
}

export function bandOption(options: DesignOptions): BandId {
  const value = options.band;
  return isBand(value) ? value : DEFAULT_BAND;
}

function accentOption(options: DesignOptions): AccentId {
  const value = options.accent;
  return isAccent(value) ? value : DEFAULT_ACCENT;
}

export function seatCut(design: Pick<PieceDesign, "stoneId">): StoneCut {
  return design.stoneId === null ? "round" : stoneById(design.stoneId).cut;
}

function unitPart(part: PartDef, input: PartShapeInput): UnitShape {
  switch (part.outline) {
    case "band":
      return bandOutline(bandOption(input.options));
    case "shape":
      return shapeOutline(shapeOption(input.options));
    case "half":
      return halfOutline(shapeOption(input.options));
    case "seat":
      return seatOutline(input.cut);
    case "loop":
      return loopOutline();
    case "bar":
      return barOutline();
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

function unitAccents(part: PartDef, input: PartShapeInput): UnitShape[] {
  if (!part.accent) return [];
  const accent = accentOption(input.options);
  if (part.outline === "band") return bandAccentOutlines(accent, part.width / part.height);
  return accentOutlines(accent, shapeOption(input.options));
}

export function partAccents(part: PartDef, input: PartShapeInput): readonly (readonly Point[])[] {
  return unitAccents(part, input).map((shape) => scaled(oriented(part, shape), part.width, part.height));
}

const ACCENT_NAMES: Readonly<Record<AccentId, string>> = {
  plain: "Window",
  "star-window": "Star window",
  "dot-row": "Dot",
  "moon-window": "Moon window",
  "heart-window": "Heart window",
};

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
  const accents = unitAccents(part, input);
  const name = ACCENT_NAMES[accentOption(input.options)];
  accents.forEach((accent, index) => {
    const shape = oriented(part, accent);
    const points = scaled(shape, part.width, part.height);
    paths.push({
      id: `${part.key}-accent-${index + 1}`,
      partKey: part.key,
      name: accents.length === 1 ? name : `${name} ${index + 1}`,
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
