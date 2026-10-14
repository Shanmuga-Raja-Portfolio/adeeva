import type { JointDef, PartDef } from "../content/product";
import { productById } from "./catalog";
import type { PieceDesign } from "./commissionRun";

export function designParts(design: PieceDesign): readonly PartDef[] {
  return design.productId === null ? [] : productById(design.productId).parts;
}

export function designJoints(design: PieceDesign): readonly JointDef[] {
  return design.productId === null ? [] : productById(design.productId).joints;
}

export function designSurfaces(design: PieceDesign): readonly PartDef[] {
  if (design.productId === null) return [];
  const product = productById(design.productId);
  return product.parts.filter((part) => product.showSurfaces.includes(part.id));
}

export function findPart(design: PieceDesign, partId: string): PartDef | undefined {
  return designParts(design).find((part) => part.id === partId);
}

export function findJoint(design: PieceDesign, jointId: string): JointDef | undefined {
  return designJoints(design).find((joint) => joint.id === jointId);
}
