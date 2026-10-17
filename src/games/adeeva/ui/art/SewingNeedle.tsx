import { useSvgId } from "../../../../ui/art/useSvgId";

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
          <stop offset="0" stopColor="#fbfafc" />
          <stop offset="0.45" stopColor="#d9d6de" />
          <stop offset="1" stopColor="#8f8b98" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3cf" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff3cf" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-screw`} cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#7d7987" />
        </radialGradient>
      </defs>
      <circle cx={0} cy={-6} r={96} fill={`url(#${id}-glow)`} />
      <ellipse cx={4} cy={16} rx={44} ry={8} fill="#1c1220" opacity={0.2} />
      <rect x={14} y={-120} width={10} height={98} rx={3} fill={metal} />
      <path d="M12 -34 L26 -34 L26 -16 L12 -16 Z" fill={metal} stroke="#6f6b78" strokeWidth={0.6} />
      <circle cx={30} cy={-26} r={5} fill={`url(#${id}-screw)`} stroke="#6f6b78" strokeWidth={0.8} />
      <path d="M27 -26 L33 -26" stroke="#5a5664" strokeWidth={1.2} strokeLinecap="round" />
      <g
        className={running ? "ad-sewing-needle__bar ad-sewing-needle__bar--running" : "ad-sewing-needle__bar"}
      >
        <rect x={-5} y={-300} width={10} height={236} rx={3} fill={metal} />
        <rect x={-10} y={-74} width={20} height={18} rx={3} fill={metal} stroke="#6f6b78" strokeWidth={0.6} />
        <circle cx={12} cy={-65} r={4.4} fill={`url(#${id}-screw)`} stroke="#6f6b78" strokeWidth={0.7} />
        <path d="M9.6 -65 L14.4 -65" stroke="#5a5664" strokeWidth={1} strokeLinecap="round" />
        <path d="M-5 -120 L-12 -120 L-12 -112 L-5 -112" fill="none" stroke="#8d8a94" strokeWidth={2} />
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
        d="M-32 -8 C-38 -8 -42 -3 -40 2 C-38 8 -32 11 -26 11 L-6 11 L-6 1 L6 1 L6 11 L30 11 C36 11 40 6 40 1 C40 -4 36 -8 30 -8 Z"
        fill={`url(#${id}-foot)`}
        stroke="#5f5b69"
        strokeWidth={0.9}
      />
      <path d="M-34 -4 L34 -4" stroke="#ffffff" strokeOpacity={0.75} strokeWidth={1} strokeLinecap="round" />
      <path d="M-30 7 L-10 7 M10 7 L32 7" stroke="#6f6b78" strokeOpacity={0.5} strokeWidth={0.8} />
    </g>
  );
}
