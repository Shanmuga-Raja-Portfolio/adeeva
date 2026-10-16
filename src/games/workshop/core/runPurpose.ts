import type { JointKindId } from "../content/jointKind";
import type { SetTemplateId } from "../content/setTemplate";

export interface CommissionPurpose {
  readonly kind: "commission";
}

export interface SetPurpose {
  readonly kind: "set";
  readonly setId: string;
  readonly templateId: SetTemplateId;
  readonly setJoint: JointKindId;
}

export type RunPurpose = CommissionPurpose | SetPurpose;

export const COMMISSION_PURPOSE: CommissionPurpose = { kind: "commission" };
