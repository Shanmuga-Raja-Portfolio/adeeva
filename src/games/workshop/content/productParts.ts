import type { JointKindId } from "./jointKind";
import type { CanonicalSpot, JointDef, PartDef, PartRole } from "./product";

export function part(id: string, name: string, width: number, height: number, role: PartRole): PartDef {
  return { id, name, width, height, role };
}

export function joint(
  id: string,
  kind: JointKindId,
  label: string,
  movingPart: string,
  show = false,
): JointDef {
  return { id, kind, label, movingPart, show };
}

export function spot(partId: string, x: number, y: number): CanonicalSpot {
  return { partId, x, y };
}
