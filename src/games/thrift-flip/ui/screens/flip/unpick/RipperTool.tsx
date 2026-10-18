export interface RipperToolProps {
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly resting: boolean;
  readonly gradientId: string;
}

const BODY = "M4.2 -0.78 H10.2 A0.78 0.78 0 0 1 10.2 0.78 H4.2 Z";

export function RipperTool({ x, y, angle, resting, gradientId }: RipperToolProps) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(1.6)`} pointerEvents="none">
      <defs>
        <linearGradient
          id={`${gradientId}-grip`}
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={-0.8}
          x2={0}
          y2={0.8}
        >
          <stop offset="0" stopColor="#b9bcf2" />
          <stop offset="0.3" stopColor="#7b7fd1" />
          <stop offset="0.75" stopColor="#4f53a8" />
          <stop offset="1" stopColor="#363a86" />
        </linearGradient>
      </defs>
      <g className={resting ? "tf-ripper tf-ripper--rest" : "tf-ripper"}>
        <g transform="translate(0.45 0.7)" fill="#2a1b10" opacity={0.2}>
          <path d={BODY} />
          <rect x={0.4} y={-0.2} width={4} height={0.4} rx={0.2} />
        </g>
        <path
          d="M0.85 0.07 L-0.75 0.01 L0.85 -0.07 Z"
          fill={`url(#${gradientId})`}
          stroke="#6f747e"
          strokeWidth={0.03}
        />
        <path
          d="M1.05 -0.06 C0.8 -0.18 0.5 -0.32 0.32 -0.44"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={0.13}
          strokeLinecap="round"
        />
        <path d="M0.95 -0.04 Q0.86 -0.2 0.68 -0.22" fill="none" stroke="#5b6069" strokeWidth={0.05} />
        <circle cx={0.28} cy={-0.47} r={0.21} fill="#e2553a" />
        <circle cx={0.22} cy={-0.53} r={0.07} fill="#ffd2c4" />
        <path d="M0.8 0 L3.5 0" stroke={`url(#${gradientId})`} strokeWidth={0.3} strokeLinecap="round" />
        <path d="M1 -0.08 L3.4 -0.08" stroke="#ffffff" strokeOpacity={0.75} strokeWidth={0.06} />
        <path
          d="M3.3 -0.48 L4.35 -0.62 L4.35 0.62 L3.3 0.48 Z"
          fill="#c9ccd3"
          stroke="#8a909a"
          strokeWidth={0.04}
        />
        <path d="M3.55 -0.5 V0.5 M3.85 -0.54 V0.54 M4.15 -0.6 V0.6" stroke="#9aa0aa" strokeWidth={0.05} />
        <path d="M3.35 -0.36 L4.3 -0.48" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={0.07} />
        <path d={BODY} fill={`url(#${gradientId}-grip)`} />
        <rect x={4.5} y={-0.58} width={5.6} height={0.26} rx={0.13} fill="#ffffff" opacity={0.55} />
        {[6.2, 6.6, 7, 7.4, 7.8, 8.2, 8.6].map((ridge) => (
          <g key={ridge}>
            <path d={`M${ridge} -0.74 V0.74`} stroke="#2f327a" strokeWidth={0.12} opacity={0.45} />
            <path d={`M${ridge + 0.1} -0.7 V0.6`} stroke="#d6d8ff" strokeWidth={0.05} opacity={0.6} />
          </g>
        ))}
        <path d="M4.4 -0.78 V0.78 M4.75 -0.78 V0.78" stroke="#2f327a" strokeWidth={0.1} opacity={0.55} />
        <circle cx={10.15} cy={0} r={0.46} fill="#e2553a" />
        <circle cx={10.15} cy={0.1} r={0.3} fill="#9a2c1a" opacity={0.5} />
        <circle cx={10.02} cy={-0.16} r={0.14} fill="#ffffff" opacity={0.65} />
      </g>
    </g>
  );
}
