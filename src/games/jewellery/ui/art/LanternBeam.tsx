import { useSvgId } from "../../../../ui/art/useSvgId";

interface LanternBeamProps {
  readonly sweep: number;
  readonly glow: string;
}

export function LanternBeam({ sweep, glow }: LanternBeamProps) {
  const id = useSvgId("jb-beam");
  if (sweep <= 0 || sweep >= 1) return null;
  const tipX = 180 + 840 * sweep;
  return (
    <g opacity={0.5 * Math.sin(Math.PI * sweep)} data-testid="lantern-beam">
      <defs>
        <linearGradient id={`${id}-fade`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={glow} stopOpacity={0} />
          <stop offset="0.45" stopColor={glow} stopOpacity={0.35} />
          <stop offset="1" stopColor="#fff8e6" stopOpacity={0.75} />
        </linearGradient>
        <filter id={`${id}-soft`} x="-30%" y="-10%" width="160%" height="120%">
          <feGaussianBlur stdDeviation={14} />
        </filter>
      </defs>
      <path
        d={`M600 560 L${tipX - 110} 150 Q${tipX} 130 ${tipX + 110} 150 Z`}
        fill={`url(#${id}-fade)`}
        filter={`url(#${id}-soft)`}
      />
      <ellipse cx={tipX} cy={160} rx={90} ry={26} fill="#fff8e6" opacity={0.35} filter={`url(#${id}-soft)`} />
    </g>
  );
}
