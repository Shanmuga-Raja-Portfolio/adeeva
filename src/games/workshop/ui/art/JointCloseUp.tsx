import type { JointKindId } from "../../content/jointKind";

const OUTLINE = "#2f2622";
const SOCKET = "#3b2a20";

interface JointPieceProps {
  readonly kind: JointKindId;
  readonly fill: string;
}

export const MOVING_LENGTH_MM = 56;

export function FixedPiece({ kind, fill }: JointPieceProps) {
  if (kind === "peg")
    return (
      <g>
        <rect
          x={-46}
          y={-20}
          width={46}
          height={40}
          rx={1.5}
          fill={fill}
          stroke={OUTLINE}
          strokeWidth={0.8}
        />
        <rect x={-9} y={-9.5} width={9} height={5} rx={1} fill={SOCKET} />
        <rect x={-9} y={4.5} width={9} height={5} rx={1} fill={SOCKET} />
      </g>
    );
  if (kind === "slot")
    return (
      <g>
        <rect
          x={-46}
          y={-22}
          width={46}
          height={44}
          rx={1.5}
          fill={fill}
          stroke={OUTLINE}
          strokeWidth={0.8}
        />
        <rect x={-11} y={-4.5} width={11} height={9} fill={SOCKET} />
      </g>
    );
  return (
    <g>
      <path
        d="M-46 -18 H0 V-9 H-8 V-3 H0 V3 H-8 V9 H0 V18 H-46 Z"
        fill={fill}
        stroke={OUTLINE}
        strokeWidth={0.8}
        strokeLinejoin="round"
      />
      <path d="M-8 -9 H0 M-8 3 H0" stroke={OUTLINE} strokeWidth={0.4} opacity={0.4} />
    </g>
  );
}

export function MovingPiece({ kind, fill }: JointPieceProps) {
  if (kind === "peg")
    return (
      <g>
        <rect
          x={0}
          y={-15}
          width={MOVING_LENGTH_MM}
          height={30}
          rx={1.5}
          fill={fill}
          stroke={OUTLINE}
          strokeWidth={0.8}
        />
        <rect
          x={-8.5}
          y={-9}
          width={9.5}
          height={4}
          rx={2}
          fill="#e7c48f"
          stroke={OUTLINE}
          strokeWidth={0.6}
        />
        <rect
          x={-8.5}
          y={5}
          width={9.5}
          height={4}
          rx={2}
          fill="#e7c48f"
          stroke={OUTLINE}
          strokeWidth={0.6}
        />
      </g>
    );
  if (kind === "slot")
    return (
      <path
        d={`M0 -14 H${MOVING_LENGTH_MM} V14 H0 V4 H-10.5 V-4 H0 Z`}
        fill={fill}
        stroke={OUTLINE}
        strokeWidth={0.8}
        strokeLinejoin="round"
      />
    );
  return (
    <path
      d={`M-8 -18 H${MOVING_LENGTH_MM} V18 H-8 V9 H0 V3 H-8 V-3 H0 V-9 H-8 Z`}
      fill={fill}
      stroke={OUTLINE}
      strokeWidth={0.8}
      strokeLinejoin="round"
    />
  );
}

export function GhostPiece({ kind }: { readonly kind: JointKindId }) {
  return (
    <g className="ww-joint__ghost-shape">
      <MovingPiece kind={kind} fill="rgba(255, 255, 255, 0.35)" />
    </g>
  );
}
