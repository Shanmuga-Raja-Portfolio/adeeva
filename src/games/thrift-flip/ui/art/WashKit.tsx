import { useSvgId } from "../../../../ui/art/useSvgId";

export interface WashKitProps {
  readonly className?: string | undefined;
}

const SUDS: readonly (readonly [number, number, number])[] = [
  [40, 92, 14],
  [62, 84, 18],
  [88, 90, 15],
  [112, 86, 12],
  [76, 72, 11],
  [52, 74, 9],
  [100, 74, 9],
];

export function WashTub({ className }: WashKitProps) {
  const id = useSvgId("tub");
  return (
    <svg className={className} viewBox="0 0 150 190" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8e97a3" />
          <stop offset="0.35" stopColor="#dfe4ea" />
          <stop offset="0.7" stopColor="#aeb6c1" />
          <stop offset="1" stopColor="#7d8692" />
        </linearGradient>
        <radialGradient id={`${id}-sud`} cx="0.35" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#f2fbf7" />
          <stop offset="1" stopColor="#bfe6d4" />
        </radialGradient>
      </defs>
      <ellipse cx={77} cy={176} rx={64} ry={10} fill="#3b2a1c" opacity={0.25} />
      <path d="M14 96 L26 170 Q76 184 126 170 L138 96 Z" fill={`url(#${id}-metal)`} />
      <path
        d="M20 120 Q76 132 132 120 M23 146 Q76 158 129 146"
        stroke="#6f7884"
        strokeWidth={2}
        fill="none"
      />
      <ellipse cx={76} cy={96} rx={64} ry={14} fill="#c9d6de" stroke="#7d8692" strokeWidth={4} />
      <ellipse cx={76} cy={97} rx={56} ry={9} fill="#9fd3e0" />
      {SUDS.map(([x, y, r]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={r}
          fill={`url(#${id}-sud)`}
          stroke="#ffffff"
          strokeWidth={1.5}
        />
      ))}
      <circle cx={58} cy={52} r={7} fill="none" stroke="#ffffff" strokeWidth={1.6} opacity={0.85} />
      <circle cx={90} cy={36} r={5} fill="none" stroke="#ffffff" strokeWidth={1.4} opacity={0.7} />
      <circle cx={56} cy={50} r={1.6} fill="#ffffff" />
    </svg>
  );
}

export function SoapDish({ className }: WashKitProps) {
  const id = useSvgId("soap");
  return (
    <svg className={className} viewBox="0 0 150 190" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-bar`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9f0" />
          <stop offset="1" stopColor="#f2a9bd" />
        </linearGradient>
        <linearGradient id={`${id}-bottle`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7fc4a6" />
          <stop offset="0.4" stopColor="#b9e5d2" />
          <stop offset="1" stopColor="#5fa98a" />
        </linearGradient>
      </defs>
      <ellipse cx={44} cy={178} rx={34} ry={7} fill="#3b2a1c" opacity={0.25} />
      <path
        d="M26 98 h36 v12 q0 6 6 10 q8 6 8 18 v34 q0 8 -8 8 h-48 q-8 0 -8 -8 v-34 q0 -12 8 -18 q6 -4 6 -10 Z"
        fill={`url(#${id}-bottle)`}
      />
      <rect x={30} y={78} width={28} height={22} rx={4} fill="#3f5d84" />
      <path d="M58 84 h18 v8 h-18 Z" fill="#3f5d84" />
      <rect x={20} y={136} width={48} height={26} rx={6} fill="#fff8ec" opacity={0.92} />
      <path d="M30 149 h28" stroke="#5fa98a" strokeWidth={4} strokeLinecap="round" />
      <path d="M26 116 v40" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={108} cy={178} rx={38} ry={8} fill="#3b2a1c" opacity={0.22} />
      <path d="M72 164 Q108 186 144 164 L140 172 Q108 190 76 172 Z" fill="#8fcfb2" />
      <rect x={84} y={146} width={48} height={24} rx={10} fill={`url(#${id}-bar)`} />
      <path
        d="M92 152 q16 -4 32 0"
        stroke="#ffffff"
        strokeOpacity={0.7}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={96} cy={140} r={6} fill="none" stroke="#ffffff" strokeWidth={1.5} />
      <circle cx={112} cy={128} r={4} fill="none" stroke="#ffffff" strokeWidth={1.3} />
      <circle cx={122} cy={138} r={3} fill="none" stroke="#ffffff" strokeWidth={1.2} />
    </svg>
  );
}
