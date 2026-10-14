export const JOINT_KINDS = ["peg", "slot", "comb"] as const;
export type JointKindId = (typeof JOINT_KINDS)[number];

export interface JointKindDef {
  readonly id: JointKindId;
  readonly name: string;
  readonly baseOffsetMm: number;
  readonly baseAngleDeg: number;
  readonly taps: number;
}

export const JOINT_KIND_DEFS: readonly JointKindDef[] = [
  { id: "peg", name: "Peg joint", baseOffsetMm: 5, baseAngleDeg: 6, taps: 2 },
  { id: "slot", name: "Slot joint", baseOffsetMm: 4, baseAngleDeg: 5, taps: 3 },
  { id: "comb", name: "Comb joint", baseOffsetMm: 3, baseAngleDeg: 4, taps: 4 },
];
