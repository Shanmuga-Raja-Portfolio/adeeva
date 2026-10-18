import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";

export interface DressFormProps {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly drape: string;
  readonly trim: string;
}

const BODICE =
  "M-36 14 Q-20 30 0 24 Q20 30 36 14 Q44 40 34 66 Q30 76 32 84 L-32 84 Q-30 76 -34 66 Q-44 40 -36 14 Z";
const SKIRT = "M-33 84 L33 84 Q50 120 62 158 Q30 170 0 164 Q-30 170 -62 158 Q-50 120 -33 84 Z";

export function DressForm({ x, y, scale, drape, trim }: DressFormProps) {
  const id = useSvgId("dress-form");
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <linearGradient id={`${id}-cloth`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={lighten(drape, 0.28)} />
          <stop offset="0.45" stopColor={drape} />
          <stop offset="1" stopColor={darken(drape, 0.3)} />
        </linearGradient>
        <linearGradient id={`${id}-form`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fbf2e2" />
          <stop offset="0.6" stopColor="#efe1c6" />
          <stop offset="1" stopColor="#cdb58e" />
        </linearGradient>
      </defs>
      <ellipse cx={0} cy={262} rx={60} ry={10} fill="#3b2a1c" opacity={0.24} />
      <path d="M0 160 V250 M0 250 L-40 262 M0 250 L40 262 M0 250 V264" stroke="#6b5235" strokeWidth={6} />
      <path
        d="M-30 0 Q0 -10 30 0 Q46 6 44 30 Q38 62 30 80 Q44 118 40 150 Q0 162 -40 150 Q-44 118 -30 80 Q-38 62 -44 30 Q-46 6 -30 0 Z"
        fill={`url(#${id}-form)`}
        stroke="#c6a77b"
        strokeWidth={3}
      />
      <rect x={-7} y={-18} width={14} height={18} rx={4} fill="#c6a77b" />
      <circle cx={0} cy={-22} r={9} fill="#a07a52" />
      <circle cx={-3} cy={-25} r={3} fill="#ffffff" opacity={0.35} />
      <path d={SKIRT} fill={`url(#${id}-cloth)`} stroke={darken(drape, 0.32)} strokeWidth={2} />
      <path
        d="M-20 90 Q-30 126 -36 160 M0 92 Q0 130 0 164 M20 90 Q30 126 36 160"
        fill="none"
        stroke={darken(drape, 0.28)}
        strokeWidth={2}
        opacity={0.45}
      />
      <path
        d="M-56 156 Q-30 166 0 160 Q30 166 56 156"
        fill="none"
        stroke={lighten(drape, 0.45)}
        strokeWidth={3}
        opacity={0.7}
      />
      <path d={BODICE} fill={`url(#${id}-cloth)`} stroke={darken(drape, 0.32)} strokeWidth={2} />
      <path
        d="M-36 14 Q-20 30 0 24 Q20 30 36 14"
        fill="none"
        stroke={lighten(drape, 0.5)}
        strokeWidth={3}
        opacity={0.8}
      />
      <path
        d="M-14 30 Q-12 56 -16 82 M14 30 Q12 56 16 82"
        fill="none"
        stroke={darken(drape, 0.25)}
        strokeWidth={1.4}
        opacity={0.5}
      />
      <path d="M-34 84 Q0 92 34 84" fill="none" stroke={trim} strokeWidth={7} strokeLinecap="round" />
      <path
        d="M-34 84 Q0 92 34 84"
        fill="none"
        stroke="#ffffff"
        strokeWidth={1.4}
        strokeDasharray="3 4"
        opacity={0.8}
      />
      <path d="M14 88 q-12 -12 -18 -2 q6 8 18 2 q12 -12 18 -2 q-6 8 -18 2 Z" fill={trim} />
      <path d="M12 90 l-6 16 M16 90 l6 15" stroke={trim} strokeWidth={3.5} strokeLinecap="round" />
      <path
        d="M-24 40 Q-28 52 -24 64"
        fill="none"
        stroke="#ffffff"
        strokeWidth={4}
        opacity={0.25}
        strokeLinecap="round"
      />
    </g>
  );
}
