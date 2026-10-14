import { useSvgId } from "../../../../ui/art/useSvgId";

interface ArcadeBackdropProps {
  readonly className?: string | undefined;
  readonly evening?: boolean | undefined;
  readonly lanterns?: number | undefined;
}

const LANTERN_HUES = ["#f2b35a", "#e8763d", "#f2c86a", "#e8a33d", "#f08a55", "#f6d27a"] as const;

export function ArcadeBackdrop({ className, evening = false, lanterns = 9 }: ArcadeBackdropProps) {
  const id = useSvgId("jb-arcade");
  const sky = evening ? ["#2b1f3f", "#5a3a5e", "#a8625a"] : ["#4b3a6a", "#8a5a78", "#e2a070"];
  return (
    <svg className={className} viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="0.55" stopColor={sky[1]} />
          <stop offset="1" stopColor={sky[2]} />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a5236" />
          <stop offset="1" stopColor="#3e2716" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd27a" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffd27a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1200} height={420} fill={`url(#${id}-sky)`} />
      <g fill="#2a1c30" opacity={0.85}>
        {Array.from({ length: 7 }, (_, index) => {
          const x = index * 180 - 20;
          return (
            <g key={index}>
              <path d={`M${x} 420 L${x} 200 Q${x + 80} 120 ${x + 160} 200 L${x + 160} 420 Z`} />
              <path
                d={`M${x + 18} 420 L${x + 18} 214 Q${x + 80} 152 ${x + 142} 214 L${x + 142} 420 Z`}
                fill="#3b2740"
              />
            </g>
          );
        })}
      </g>
      <g opacity={0.9}>
        {Array.from({ length: 6 }, (_, index) => {
          const x = index * 200 + 40;
          return (
            <g key={index} transform={`translate(${x} 250)`}>
              <rect width={120} height={70} rx={6} fill="#4a2f3e" />
              <rect x={8} y={8} width={104} height={40} rx={4} fill="#f2c86a" opacity={0.18} />
              <path d="M0 0 L60 -26 L120 0 Z" fill={index % 2 === 0 ? "#1f4e5a" : "#4b2a4f"} />
              <path
                d="M0 0 Q15 10 30 0 Q45 10 60 0 Q75 10 90 0 Q105 10 120 0"
                fill="none"
                stroke="#e8a33d"
                strokeOpacity={0.6}
                strokeWidth={2}
              />
            </g>
          );
        })}
      </g>
      <path d="M0 340 L1200 340 L1200 420 L0 420 Z" fill={`url(#${id}-floor)`} />
      <path d="M0 340 L1200 340" stroke="#e8a33d" strokeOpacity={0.25} strokeWidth={2} />
      <path
        d={`M-20 40 Q300 ${evening ? 120 : 110} 600 96 Q900 ${evening ? 120 : 110} 1220 40`}
        fill="none"
        stroke="#2a1c30"
        strokeWidth={2}
      />
      {Array.from({ length: lanterns }, (_, index) => {
        const t = (index + 0.5) / lanterns;
        const x = t * 1200;
        const y = 40 + Math.sin(Math.PI * t) * 64;
        const hue = LANTERN_HUES[index % LANTERN_HUES.length] ?? "#f2b35a";
        return (
          <g key={index} transform={`translate(${x} ${y})`}>
            <circle r={46} fill={`url(#${id}-glow)`} />
            <g className="jb-sway" style={{ animationDelay: `${(index % 4) * 0.7}s` }}>
              <path d="M0 -8 L0 0" stroke="#2a1c30" strokeWidth={2} />
              <path
                d="M-12 2 Q0 -4 12 2 L14 26 Q0 34 -14 26 Z"
                fill={hue}
                stroke="#5a2f17"
                strokeWidth={1.5}
              />
              <path
                d="M-12 12 L12 12 M-13 20 L13 20"
                stroke="#5a2f17"
                strokeOpacity={0.45}
                strokeWidth={1.2}
              />
              <rect x={-5} y={28} width={10} height={4} rx={1} fill="#5a2f17" />
            </g>
          </g>
        );
      })}
      <g fill="#fff3d0">
        {[
          [120, 160],
          [460, 150],
          [820, 170],
          [1060, 150],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={2} className="jb-twinkle" />
        ))}
      </g>
    </svg>
  );
}
