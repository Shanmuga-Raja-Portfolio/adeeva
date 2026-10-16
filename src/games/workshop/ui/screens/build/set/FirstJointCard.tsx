import type { JointKindId } from "../../../../content/jointKind";
import type { WoodId } from "../../../../content/wood";
import type { JointRecord } from "../../../../core";
import { FixedPiece, MovingPiece } from "../../../art/JointCloseUp";
import { woodLook } from "../../../art/woodLook";

export interface FirstJointCardProps {
  readonly kind: JointKindId;
  readonly woodId: WoodId;
  readonly record: JointRecord;
  readonly label: string;
}

export function FirstJointCard({ kind, woodId, record, label }: FirstJointCardProps) {
  const fill = woodLook(woodId).base;
  return (
    <figure className="ww-first-joint ww-paper" data-testid="first-joint">
      <svg viewBox="-56 -34 132 68" role="img" aria-label={`Your first joint: ${label}`}>
        <rect x={-56} y={-34} width={132} height={68} rx={6} fill="#3f6b4f" />
        <FixedPiece kind={kind} fill={fill} />
        <g transform={`translate(${record.offsetMm.toFixed(1)} 0) rotate(${record.angleDeg.toFixed(1)})`}>
          <MovingPiece kind={kind} fill={fill} />
        </g>
      </svg>
      <figcaption>
        <strong>Your first joint</strong> · {Math.round(record.accuracy * 100)}% snug. Match it!
      </figcaption>
    </figure>
  );
}
