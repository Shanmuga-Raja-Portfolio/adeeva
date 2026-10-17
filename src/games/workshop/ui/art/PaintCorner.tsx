import { useSvgId } from "../../../../ui/art/useSvgId";

interface PaintCornerProps {
  readonly paint: string | null;
}

const OUTLINE = "#2f2622";
const FLOOR_Y = 214;
const PLANKS = [0, 1, 2, 3, 4];

export function PaintCorner({ paint }: PaintCornerProps) {
  const id = useSvgId("ww-paint-corner");
  const tin = paint ?? "#c58a4a";
  return (
    <g className="ww-paint-corner" aria-hidden="true" pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7ead3" />
          <stop offset="1" stopColor="#ead3ae" />
        </linearGradient>
        <radialGradient id={`${id}-sun`} cx="0.22" cy="0.18" r="0.75">
          <stop offset="0" stopColor="#fff8dc" stopOpacity={0.9} />
          <stop offset="0.5" stopColor="#fff8dc" stopOpacity={0.25} />
          <stop offset="1" stopColor="#fff8dc" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9935c" />
          <stop offset="1" stopColor="#a8723f" />
        </linearGradient>
        <linearGradient id={`${id}-cloth`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6efe2" />
          <stop offset="1" stopColor="#e2d6c0" />
        </linearGradient>
      </defs>
      <rect width={400} height={FLOOR_Y} fill={`url(#${id}-wall)`} />
      <g stroke="#e0c69e" strokeWidth={1}>
        {[48, 96, 144].map((y) => (
          <path key={y} d={`M0 ${y} H400`} opacity={0.5} />
        ))}
      </g>
      <g transform="translate(24 22)">
        <rect width={84} height={70} rx={3} fill="#bfe2f2" stroke="#8a6a4f" strokeWidth={4} />
        <path d="M42 0 V70 M0 35 H84" stroke="#8a6a4f" strokeWidth={3} />
        <path d="M6 64 Q24 50 40 58 T80 52 V66 H6 Z" fill="#9cc79a" opacity={0.8} />
        <path d="M10 8 L22 8 L10 24 Z" fill="#ffffff" opacity={0.6} />
      </g>
      <rect width={400} height={300} fill={`url(#${id}-sun)`} />
      <g transform="translate(300 40)">
        <rect x={-6} y={44} width={92} height={7} rx={2} fill="#9c6a37" stroke={OUTLINE} strokeWidth={1.5} />
        <rect x={4} y={18} width={20} height={26} rx={3} fill="#4a6378" stroke={OUTLINE} strokeWidth={1.5} />
        <rect x={4} y={22} width={20} height={8} fill="#fffaf0" opacity={0.85} />
        <rect x={30} y={24} width={18} height={20} rx={3} fill="#d9a92b" stroke={OUTLINE} strokeWidth={1.5} />
        <path d="M56 44 V14 M62 44 V20 M68 44 V12" stroke="#8a6a4f" strokeWidth={3} strokeLinecap="round" />
        <path d="M53 14 h6 M59 20 h6 M65 12 h6" stroke="#f0d9ad" strokeWidth={4} strokeLinecap="round" />
      </g>
      <rect y={FLOOR_Y - 10} width={400} height={10} fill="#d9b98a" stroke={OUTLINE} strokeOpacity={0.35} />
      <rect y={FLOOR_Y} width={400} height={300 - FLOOR_Y} fill={`url(#${id}-floor)`} />
      <g stroke="#8f5a26" strokeOpacity={0.45} strokeWidth={1.2}>
        {PLANKS.map((plank) => (
          <path key={plank} d={`M0 ${FLOOR_Y + 16 + plank * 18} H400`} />
        ))}
        {PLANKS.map((plank) => (
          <path
            key={`joint-${plank}`}
            d={`M${(plank * 97 + 40) % 400} ${FLOOR_Y + plank * 18} v16`}
            strokeOpacity={0.3}
          />
        ))}
      </g>
      <path
        d="M22 262 Q60 236 120 240 L300 236 Q352 238 384 262 Q390 284 360 292 L40 294 Q14 286 22 262 Z"
        fill={`url(#${id}-cloth)`}
        stroke={OUTLINE}
        strokeOpacity={0.35}
        strokeWidth={1.5}
      />
      <g stroke="#cbbca2" strokeWidth={1.4} fill="none">
        <path d="M70 250 Q90 270 82 290" />
        <path d="M320 246 Q300 268 316 290" />
        <path d="M190 242 Q200 262 186 292" opacity={0.6} />
      </g>
      <g fill={tin} opacity={0.75}>
        <ellipse cx={300} cy={284} rx={9} ry={3} />
        <ellipse cx={318} cy={278} rx={5} ry={2} />
        <ellipse cx={96} cy={286} rx={6} ry={2} />
      </g>
      <g transform="translate(352 262)">
        <ellipse cx={0} cy={22} rx={22} ry={6} fill="#2f2622" opacity={0.18} />
        <path d="M-18 -6 V18 Q0 26 18 18 V-6 Z" fill="#cfd6dc" stroke={OUTLINE} strokeWidth={1.8} />
        <ellipse cx={0} cy={-6} rx={18} ry={6} fill={tin} stroke={OUTLINE} strokeWidth={1.8} />
        <path d="M-18 2 Q0 10 18 2 V10 Q0 18 -18 10 Z" fill={tin} opacity={0.85} />
        <path d="M-12 -4 L-30 -40" stroke="#a4764b" strokeWidth={4} strokeLinecap="round" />
        <path d="M-12 -4 L-16 -12" stroke={tin} strokeWidth={6} strokeLinecap="round" />
        <path d="M-14 -2 Q-4 -10 6 -8" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={1.4} fill="none" />
      </g>
    </g>
  );
}
