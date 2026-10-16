import { PART_SLOTS, type PartSlot } from "../content/partOption";
import type { CanonicalBoard, JointDef, PartDef, ProductId } from "../content/product";
import { productById, setTemplateById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import { setPartId } from "./setPartId";

export type RunShape = Pick<CommissionRun, "design" | "purpose">;

export interface RunPiece {
  readonly index: number;
  readonly productId: ProductId;
  readonly twinOf: number | null;
  readonly name: string;
}

export interface RunPart extends PartDef {
  readonly piece: number;
  readonly baseId: string;
  readonly accent: boolean;
}

export interface RunJoint extends JointDef {
  readonly piece: number;
  readonly baseId: string;
}

function pieceProducts(run: RunShape): readonly ProductId[] {
  if (run.purpose.kind === "set") return setTemplateById(run.purpose.templateId).pieces;
  return run.design.productId === null ? [] : [run.design.productId];
}

export function runPieces(run: RunShape): RunPiece[] {
  const products = pieceProducts(run);
  return products.map((productId, index) => {
    const first = products.indexOf(productId);
    const repeats = products.filter((entry) => entry === productId).length;
    const number = products.slice(0, index + 1).filter((entry) => entry === productId).length;
    const name = productById(productId).name;
    return {
      index,
      productId,
      twinOf: first < index ? first : null,
      name: repeats > 1 ? `${name} ${number}` : name,
    };
  });
}

export function isSetRun(run: RunShape): boolean {
  return run.purpose.kind === "set";
}

function scopedId(run: RunShape, piece: number, id: string): string {
  return isSetRun(run) ? setPartId(piece, id) : id;
}

function scopedName(run: RunShape, piece: RunPiece, name: string): string {
  return isSetRun(run) ? `${piece.name}: ${name}` : name;
}

export function designParts(run: RunShape): RunPart[] {
  return runPieces(run).flatMap((piece) => {
    const product = productById(piece.productId);
    return product.parts.map((part) => ({
      ...part,
      id: scopedId(run, piece.index, part.id),
      name: scopedName(run, piece, part.name),
      piece: piece.index,
      baseId: part.id,
      accent: product.accentPart === part.id,
    }));
  });
}

export function designJoints(run: RunShape): RunJoint[] {
  const purpose = run.purpose;
  return runPieces(run).flatMap((piece) =>
    productById(piece.productId).joints.map((joint) => ({
      ...joint,
      id: scopedId(run, piece.index, joint.id),
      label: scopedName(run, piece, joint.label),
      movingPart: scopedId(run, piece.index, joint.movingPart),
      kind: purpose.kind === "set" && joint.show ? purpose.setJoint : joint.kind,
      piece: piece.index,
      baseId: joint.id,
    })),
  );
}

export function designSurfaces(run: RunShape): RunPart[] {
  const products = pieceProducts(run);
  return designParts(run).filter((part) => {
    const productId = products[part.piece];
    return productId !== undefined && productById(productId).showSurfaces.includes(part.baseId);
  });
}

export function findPart(run: RunShape, partId: string): RunPart | undefined {
  return designParts(run).find((part) => part.id === partId);
}

export function findJoint(run: RunShape, jointId: string): RunJoint | undefined {
  return designJoints(run).find((joint) => joint.id === jointId);
}

export function runCanonical(run: RunShape): CanonicalBoard[] {
  return runPieces(run).flatMap((piece) =>
    productById(piece.productId).canonical.map((board) => ({
      size: board.size,
      spots: board.spots.map((spot) => ({ ...spot, partId: scopedId(run, piece.index, spot.partId) })),
    })),
  );
}

export function runSlots(run: RunShape): PartSlot[] {
  const slots = new Set(runPieces(run).flatMap((piece) => productById(piece.productId).slots));
  return PART_SLOTS.filter((slot) => slots.has(slot));
}

export function seatPieces(run: RunShape): RunPiece[] {
  return runPieces(run).filter((piece) => productById(piece.productId).seat);
}

export function partsOfPiece<T extends { readonly piece: number }>(items: readonly T[], piece: number): T[] {
  return items.filter((item) => item.piece === piece);
}
