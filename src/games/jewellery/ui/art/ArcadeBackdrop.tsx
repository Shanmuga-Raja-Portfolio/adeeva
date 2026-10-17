import { useSvgId } from "../../../../ui/art/useSvgId";
import { ArcadeStall } from "./ArcadeStall";

interface ArcadeBackdropProps {
  readonly className?: string | undefined;
  readonly evening?: boolean | undefined;
  readonly lanterns?: number | undefined;
}

const LANTERN_HUES = ["#f2b35a", "#e8763d", "#f2c86a", "#e8a33d", "#f08a55", "#f6d27a"] as const;
const AWNINGS = [
  ["#1f4e5a", "#3fa9a6"],
  ["#7a2f3f", "#e8a33d"],
  ["#4b2a4f", "#b9a7dc"],
] as const;
const FLAGS = ["#e8a33d", "#3fa9a6", "#d0587e", "#f6d27a", "#b9a7dc"] as const;
const WINDOWS = [
  [24, 168],
  [88, 140],
  [150, 178],
  [236, 128],
  [440, 156],
  [500, 132],
  [600, 158],
  [690, 138],
  [904, 140],
  [960, 120],
  [1100, 134],
  [1170, 166],
] as const;
const ROOFS = [
  "M0 230 L0 150 L60 150 L60 120 L130 120 L130 160 L210 160 L210 110 L260 90 L310 110 L310 230 Z",
  "M420 230 L420 140 L480 140 L480 116 L540 116 L540 140 L660 140 L660 120 L740 120 L740 230 Z",
  "M880 230 L880 130 L940 104 L1000 130 L1000 150 L1080 150 L1080 118 L1150 118 L1150 150 L1200 150 L1200 230 Z",
] as const;

export function ArcadeBackdrop({ className, evening = false, lanterns = 9 }: ArcadeBackdropProps) {
  const id = useSvgId("jb-arcade");
  const sky = evening ? ["#22183a", "#4f3360", "#a8625a"] : ["#3f3366", "#7d5278", "#e2a070"];
  const sag = evening ? 120 : 110;
  return (
    <svg className={className} viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="0.55" stopColor={sky[1]} />
          <stop offset="1" stopColor={sky[2]} />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5d3e" />
          <stop offset="1" stopColor="#3e2716" />
        </linearGradient>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a3048" />
          <stop offset="1" stopColor="#2a1c30" />
        </linearGradient>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8733f" />
          <stop offset="1" stopColor="#5e3a1f" />
        </linearGradient>
        <linearGradient id={`${id}-shop`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd98a" stopOpacity={0.75} />
          <stop offset="1" stopColor="#e8763d" stopOpacity={0.35} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd27a" stopOpacity={0.6} />
          <stop offset="1" stopColor="#ffd27a" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-pool`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity={0.45} />
          <stop offset="1" stopColor="#ffcf7a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1200} height={420} fill={`url(#${id}-sky)`} />
      <g fill="#33223f">
        {ROOFS.map((roof) => (
          <path key={roof} d={roof} />
        ))}
      </g>
      <g fill="#f6c46f" opacity={evening ? 0.75 : 0.45}>
        {WINDOWS.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={12} height={16} rx={2} />
        ))}
      </g>
      {Array.from({ length: 7 }, (_, index) => {
        const x = index * 180 - 20;
        return (
          <g key={index}>
            <path
              d={`M${x - 10} 420 L${x - 10} 196 Q${x + 80} 104 ${x + 170} 196 L${x + 170} 420 L${x + 160} 420 L${x + 160} 204 Q${x + 80} 128 ${x} 204 L${x} 420 Z`}
              fill={`url(#${id}-wall)`}
            />
            <path
              d={`M${x} 204 Q${x + 80} 128 ${x + 160} 204`}
              fill="none"
              stroke="#e8a33d"
              strokeOpacity={0.35}
              strokeWidth={2}
            />
            <path d={`M${x + 72} 124 L${x + 88} 124 L${x + 92} 146 L${x + 68} 146 Z`} fill="#6a4a5e" />
            <rect x={x - 22} y={186} width={24} height={14} rx={2} fill="#5a3d55" />
            {[230, 262, 294, 326].map((by) => (
              <path key={by} d={`M${x - 8} ${by} L${x} ${by}`} stroke="#5a3d55" strokeWidth={2} />
            ))}
          </g>
        );
      })}
      <path d="M0 336 L1200 336 L1200 420 L0 420 Z" fill={`url(#${id}-floor)`} />
      <g stroke="#2a1608" strokeOpacity={0.35} strokeWidth={1.5}>
        {[352, 372, 398].map((ly) => (
          <path key={ly} d={`M0 ${ly} L1200 ${ly}`} />
        ))}
        {Array.from({ length: 16 }, (_, index) => (
          <path key={index} d={`M${index * 80} 336 L${index * 80 + (index * 80 - 600) * 0.25} 420`} />
        ))}
      </g>
      <path d="M0 336 L1200 336" stroke="#e8a33d" strokeOpacity={0.4} strokeWidth={2} />
      {Array.from({ length: 6 }, (_, index) => {
        const look = AWNINGS[index % AWNINGS.length] ?? AWNINGS[0];
        return (
          <ArcadeStall
            key={index}
            x={index * 200 + 30}
            y={252}
            awning={look[0]}
            stripe={look[1]}
            glowId={`${id}-shop`}
            woodId={`${id}-wood`}
            goods={index}
          />
        );
      })}
      <path d="M-20 70 Q300 150 600 128 Q900 150 1220 70" fill="none" stroke="#2a1c30" strokeWidth={1.5} />
      {Array.from({ length: 24 }, (_, index) => {
        const t = (index + 0.5) / 24;
        const x = t * 1200;
        const y = 70 + Math.sin(Math.PI * t) * 66;
        return (
          <path
            key={index}
            d={`M${x - 9} ${y - 1} L${x + 9} ${y - 1} L${x} ${y + 15} Z`}
            fill={FLAGS[index % FLAGS.length]}
            opacity={0.9}
          />
        );
      })}
      <path
        d={`M-20 40 Q300 ${sag} 600 96 Q900 ${sag} 1220 40`}
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
          <g key={index}>
            <ellipse cx={x} cy={350} rx={70} ry={12} fill={`url(#${id}-pool)`} />
            <g transform={`translate(${x} ${y})`}>
              <circle r={50} fill={`url(#${id}-glow)`} />
              <g className="jb-sway" style={{ animationDelay: `${(index % 4) * 0.7}s` }}>
                <path d="M0 -8 L0 0" stroke="#2a1c30" strokeWidth={2} />
                <rect x={-7} y={-1} width={14} height={4} rx={1} fill="#5a2f17" />
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
                <path
                  d="M-7 6 Q-9 16 -6 25"
                  fill="none"
                  stroke="#fff3d0"
                  strokeOpacity={0.7}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <rect x={-5} y={28} width={10} height={4} rx={1} fill="#5a2f17" />
                <path d="M0 32 L0 40" stroke="#e8a33d" strokeWidth={1.5} />
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
