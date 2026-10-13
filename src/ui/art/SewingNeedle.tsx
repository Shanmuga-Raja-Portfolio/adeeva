import { useSvgId } from "./useSvgId";

export interface SewingNeedleProps {
  x: number;
  y: number;
  running?: boolean | undefined;
  threadColour?: string | undefined;
}

export function SewingNeedle({ x, y, running = false, threadColour = "#a93d63" }: SewingNeedleProps) {
  const id = useSvgId("needle");
  const metal = `url(#${id}-metal)`;
  return (
    <g transform={`translate(${x} ${y})`} className="ad-sewing-needle" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8d8a94" />
          <stop offset="0.35" stopColor="#f4f2f6" />
          <stop offset="0.6" stopColor="#c4c1ca" />
          <stop offset="1" stopColor="#6f6b78" />
        </linearGradient>
        <linearGradient id={`${id}-foot`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f0f4" />
          <stop offset="1" stopColor="#8f8b98" />
        </linearGradient>
      </defs>
      <ellipse cx={4} cy={14} rx={40} ry={7} fill="#1c1220" opacity={0.18} />
      <rect x={14} y={-120} width={10} height={98} rx={3} fill={metal} />
      <g
        className={running ? "ad-sewing-needle__bar ad-sewing-needle__bar--running" : "ad-sewing-needle__bar"}
      >
        <rect x={-5} y={-300} width={10} height={236} rx={3} fill={metal} />
        <rect x={-10} y={-74} width={20} height={18} rx={3} fill={metal} stroke="#6f6b78" strokeWidth={0.6} />
        <circle cx={7} cy={-65} r={2.4} fill="#6f6b78" />
        <path
          d="M-1.8 -56 L-1.2 -6 L0 2 L1.2 -6 L1.8 -56 Z"
          fill={metal}
          stroke="#6f6b78"
          strokeWidth={0.4}
        />
        <ellipse cx={0} cy={-12} rx={0.7} ry={2.4} fill="#3a3640" />
        <path
          d={`M9 -300 C10 -200 6 -120 4 -70 C3 -40 2 -20 0 -12`}
          fill="none"
          stroke={threadColour}
          strokeWidth={1.2}
        />
      </g>
      <path
        d="M-30 -7 L22 -7 C30 -7 36 -3 36 3 L36 9 L-28 9 C-34 9 -38 5 -36 0 Z"
        fill={`url(#${id}-foot)`}
        stroke="#6f6b78"
        strokeWidth={0.8}
      />
      <rect x={-12} y={-4} width={24} height={4} rx={2} fill="#3a3640" opacity={0.85} />
      <path d="M-30 -2 L34 -2" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={0.8} />
    </g>
  );
}
