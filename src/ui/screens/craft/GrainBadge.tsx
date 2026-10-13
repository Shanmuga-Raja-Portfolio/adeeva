import type { PatternPieceDef } from "../../../content/garmentPart";
import { grainScore, isBiasRotation, type Rotation } from "../../../core";

export interface GrainBadgeProps {
  readonly piece: PatternPieceDef;
  readonly rotation: Rotation;
  readonly compact?: boolean | undefined;
}

export type GrainKind = "straight" | "drape" | "bias" | "cross";

export function grainKind(piece: PatternPieceDef, rotation: Rotation): GrainKind {
  if (rotation % 180 === 0) return "straight";
  if (isBiasRotation(rotation)) return grainScore(piece, rotation) >= 1 ? "drape" : "bias";
  return "cross";
}

const GRAIN_NAMES: Readonly<Record<GrainKind, string>> = {
  straight: "Straight grain",
  drape: "Bias drape",
  bias: "On the bias",
  cross: "Cross grain",
};

export const GRAIN_EXPLANATIONS: Readonly<Record<GrainKind, string>> = {
  straight: "The grain arrow runs along the bolt, so the piece hangs true and keeps its shape.",
  drape: "Cut at 45° this skirt piece flows and swirls beautifully, and the dress gains a dreamy drape.",
  bias: "At 45° the fabric stretches. Lovely for flowing skirts, but this piece may twist and sag.",
  cross: "Turned sideways the grain fights the piece, so it can pucker and pull out of shape.",
};

export function GrainBadge({ piece, rotation, compact = false }: GrainBadgeProps) {
  const kind = grainKind(piece, rotation);
  const score = Math.round(grainScore(piece, rotation) * 100);
  return (
    <span className={`ad-grain-badge ad-grain-badge--${kind}`} title={GRAIN_EXPLANATIONS[kind]}>
      <svg viewBox="-8 -8 16 16" width={16} height={16} aria-hidden="true">
        <g transform={`rotate(${rotation})`}>
          <path
            d="M0 -6 V6 M-2.4 -3.4 L0 -6 L2.4 -3.4 M-2.4 3.4 L0 6 L2.4 3.4"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        </g>
      </svg>
      {compact ? `${score}%` : `${GRAIN_NAMES[kind]} · ${score}%`}
    </span>
  );
}
