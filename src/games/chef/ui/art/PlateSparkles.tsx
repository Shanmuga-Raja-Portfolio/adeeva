import { useSvgId } from "../../../../ui/art/useSvgId";

const GLINTS = [
  { x: 92, y: 96, r: 26, delay: 0 },
  { x: 138, y: 58, r: 11, delay: 0.5 },
  { x: 58, y: 146, r: 9, delay: 0.9 },
  { x: 322, y: 124, r: 14, delay: 0.3 },
  { x: 346, y: 296, r: 8, delay: 1.1 },
] as const;

const MOTES = [
  { x: 176, y: 30, r: 2.6 },
  { x: 214, y: 58, r: 3.4 },
  { x: 248, y: 18, r: 2 },
  { x: 160, y: 84, r: 1.8 },
  { x: 270, y: 76, r: 2.4 },
  { x: 196, y: 10, r: 1.6 },
  { x: 120, y: 26, r: 2.2 },
] as const;

const STEAM = [150, 200, 250] as const;

function starPath(r: number): string {
  const k = r * 0.07;
  return `M0 ${-r} Q${k} ${-k} ${r} 0 Q${k} ${k} 0 ${r} Q${-k} ${k} ${-r} 0 Q${-k} ${-k} 0 ${-r} Z`;
}

export function PlateSparkles({ className }: { readonly className?: string | undefined }) {
  const id = useSvgId("ck-glint");
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-halo`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6d8" stopOpacity={0.9} />
          <stop offset="0.35" stopColor="#ffd86b" stopOpacity={0.35} />
          <stop offset="1" stopColor="#ffd86b" stopOpacity={0} />
        </radialGradient>
      </defs>
      {STEAM.map((x, index) => (
        <path
          key={x}
          d={`M${x} 150 c-14 -18 14 -30 0 -50 c-12 -16 12 -28 0 -46`}
          stroke="#ffffff"
          strokeWidth={9}
          strokeLinecap="round"
          fill="none"
          opacity={0.42}
          className="ck-glory__steam"
          style={{ animationDelay: `${index * 0.5}s` }}
        />
      ))}
      {MOTES.map((mote, index) => (
        <circle
          key={`${mote.x}-${mote.y}`}
          cx={mote.x}
          cy={mote.y}
          r={mote.r}
          fill={index % 2 === 0 ? "#ffe39a" : "#fff6dc"}
          opacity={0.55 + (index % 3) * 0.12}
        />
      ))}
      {GLINTS.map((spark) => (
        <g key={`${spark.x}-${spark.y}`} transform={`translate(${spark.x} ${spark.y})`}>
          <g className="ck-glory__spark" style={{ animationDelay: `${spark.delay}s` }}>
            <circle r={spark.r * 1.3} fill={`url(#${id}-halo)`} />
            <path d={starPath(spark.r * 1.5)} fill="#fff4cc" />
            <path d={starPath(spark.r * 0.55)} fill="#ffffff" transform="rotate(45)" opacity={0.7} />
            <circle r={spark.r * 0.24} fill="#ffffff" />
          </g>
        </g>
      ))}
    </svg>
  );
}
