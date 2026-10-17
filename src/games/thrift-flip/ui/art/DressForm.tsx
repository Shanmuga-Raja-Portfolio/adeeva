import { darken, lighten } from "../../../../ui/art/colourMix";

export interface DressFormProps {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly drape: string;
  readonly trim: string;
}

export function DressForm({ x, y, scale, drape, trim }: DressFormProps) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={262} rx={58} ry={10} fill="#3b2a1c" opacity={0.22} />
      <path d="M0 150 V250 M0 250 L-40 262 M0 250 L40 262 M0 250 V264" stroke="#6b5235" strokeWidth={6} />
      <path
        d="M-30 0 Q0 -10 30 0 Q46 6 44 30 Q38 62 30 80 Q44 118 40 150 Q0 162 -40 150 Q-44 118 -30 80 Q-38 62 -44 30 Q-46 6 -30 0 Z"
        fill="#efe1c6"
        stroke="#c6a77b"
        strokeWidth={3}
      />
      <path d="M-30 0 Q-40 60 -30 80 Q-42 118 -38 148" fill="none" stroke="#ffffff" strokeOpacity={0.5} />
      <rect x={-7} y={-18} width={14} height={18} rx={4} fill="#c6a77b" />
      <circle cx={0} cy={-22} r={9} fill="#a07a52" />
      <path
        d="M-40 18 Q0 46 40 18 L44 44 Q10 70 -20 120 Q-34 96 -46 44 Z"
        fill={drape}
        stroke={darken(drape, 0.25)}
        strokeWidth={2.5}
      />
      <path d="M-30 34 Q2 54 34 30" fill="none" stroke={lighten(drape, 0.35)} strokeWidth={3} opacity={0.7} />
      <path
        d="M-20 120 Q-28 138 -18 160 M-20 120 Q-10 140 -14 162"
        fill="none"
        stroke={darken(drape, 0.25)}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path d="M-34 86 Q0 98 34 86" fill="none" stroke={trim} strokeWidth={5} strokeLinecap="round" />
      <path d="M-34 86 Q0 98 34 86" fill="none" stroke="#ffffff" strokeWidth={1.4} strokeDasharray="3 4" />
    </g>
  );
}
