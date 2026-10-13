import { useSvgId } from "../ui/art/useSvgId";

const BUNTING = ["#d0587e", "#e2b93b", "#7fa58a", "#b9a7dc", "#f07f63", "#9fd0ee"] as const;

function Window({ x, glassId }: { x: number; glassId: string }) {
  return (
    <g transform={`translate(${x} 300)`}>
      <path d="M0 220 L0 80 A70 70 0 0 1 140 80 L140 220 Z" fill="var(--st-trim)" />
      <path d="M10 214 L10 82 A60 60 0 0 1 130 82 L130 214 Z" fill={`url(#${glassId})`} />
      <path d="M70 22 L70 214 M10 120 L130 120" stroke="var(--st-trim)" strokeWidth={6} />
      <path d="M-8 220 L148 220 L144 232 L-4 232 Z" fill="var(--st-trim)" />
      <path d="M22 100 C34 70 52 54 66 48" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={4} fill="none" />
    </g>
  );
}

function Lamp({ x, length }: { x: number; length: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <path d={`M0 0 L0 ${length}`} stroke="var(--st-ink-line)" strokeWidth={2} />
      <path
        d={`M-22 ${length + 26} L-12 ${length} L12 ${length} L22 ${length + 26} Z`}
        fill="var(--st-lamp)"
      />
      <ellipse cx={0} cy={length + 30} rx={46} ry={18} fill="var(--st-glow)" opacity={0.55} />
      <circle cx={0} cy={length + 28} r={5} fill="#fff6d0" />
    </g>
  );
}

export function HallBackdrop({ className }: { readonly className?: string }) {
  const id = useSvgId("hall");
  return (
    <svg
      className={className}
      viewBox="0 0 1200 780"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--st-wall-top)" />
          <stop offset="1" stopColor="var(--st-wall)" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="var(--st-sky-top)" />
          <stop offset="1" stopColor="var(--st-sky)" />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--st-floor)" />
          <stop offset="1" stopColor="var(--st-floor-deep)" />
        </linearGradient>
      </defs>
      <rect width={1200} height={780} fill={`url(#${id}-wall)`} />
      <Window x={30} glassId={`${id}-glass`} />
      <Window x={1030} glassId={`${id}-glass`} />
      <path
        d="M0 40 Q150 92 300 46 Q450 92 600 46 Q750 92 900 46 Q1050 92 1200 40"
        stroke="var(--st-ink-line)"
        strokeWidth={1.6}
        fill="none"
      />
      {Array.from({ length: 16 }, (_, index) => {
        const x = 37 + index * 75;
        const sag = 22 * Math.sin(((index % 4) + 0.5) * (Math.PI / 4));
        return (
          <path
            key={x}
            d={`M${x - 14} ${50 + sag} L${x + 14} ${50 + sag} L${x} ${78 + sag} Z`}
            fill={BUNTING[index % BUNTING.length]}
            opacity={0.85}
          />
        );
      })}
      <Lamp x={340} length={110} />
      <Lamp x={860} length={110} />
      <rect y={640} width={1200} height={140} fill={`url(#${id}-floor)`} />
      <path d="M0 640 L1200 640" stroke="var(--st-floor-deep)" strokeWidth={6} />
      <g stroke="var(--st-floor-deep)" strokeOpacity={0.35} strokeWidth={1.4}>
        <path d="M0 676 L1200 676 M0 716 L1200 716 M0 756 L1200 756" />
        <path d="M120 640 L120 676 M420 676 L420 716 M700 640 L700 676 M980 676 L980 716 M260 716 L260 756 M860 716 L860 756 M560 756 L560 780" />
      </g>
    </svg>
  );
}
