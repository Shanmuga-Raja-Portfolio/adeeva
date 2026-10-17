import type { AvatarLook } from "../../../../engine/avatar";
import { AvatarFigure } from "../../../../ui/art/avatar/Avatar";
import { useSvgId } from "../../../../ui/art/useSvgId";

export type HarbourSky = "day" | "dusk" | "night";

export interface HarbourWindowProps {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly sky: HarbourSky;
  readonly sign: string;
  readonly open: boolean;
  readonly waiting: readonly AvatarLook[];
}

const SKIES: Readonly<Record<HarbourSky, readonly [string, string, string]>> = {
  day: ["#8fc4e8", "#cfe6f2", "#fbe9c4"],
  dusk: ["#24345e", "#c86b5a", "#f2a93b"],
  night: ["#0f1630", "#1f2c55", "#3a3f6a"],
};

interface Boat {
  readonly share: number;
  readonly size: number;
  readonly hull: string;
  readonly sail: string | null;
  readonly cabin: boolean;
}

const BOATS: readonly Boat[] = [
  { share: 0.13, size: 0.62, hull: "#f3f0e8", sail: "#fbe6c2", cabin: false },
  { share: 0.36, size: 1, hull: "#c4502e", sail: null, cabin: true },
  { share: 0.57, size: 0.78, hull: "#2e5a7a", sail: "#f6efe0", cabin: false },
  { share: 0.73, size: 0.5, hull: "#f3f0e8", sail: "#e8826a", cabin: false },
];

function BoatShape({ x, sea, boat, night }: { x: number; sea: number; boat: Boat; night: boolean }) {
  const s = boat.size;
  return (
    <g transform={`translate(${x} ${sea}) scale(${s})`}>
      <path d="M-34 0 h68 l-12 15 h-44 Z" fill={boat.hull} />
      <path d="M-34 0 h68 l-2 3 h-64 Z" fill="#ffffff" opacity={0.35} />
      {boat.cabin ? (
        <>
          <rect x={-14} y={-18} width={26} height={18} rx={3} fill="#f3f0e8" />
          <rect x={-9} y={-14} width={7} height={7} rx={1} fill={night ? "#ffd387" : "#8fb8d0"} />
          <rect x={2} y={-14} width={7} height={7} rx={1} fill={night ? "#ffd387" : "#8fb8d0"} />
          <path d="M8 -18 V-40 M8 -36 L28 -6" stroke="#e8e2d4" strokeWidth={2.5} />
        </>
      ) : (
        <>
          <path d="M0 0 V-58" stroke="#efe6d4" strokeWidth={2.5} />
          <path d="M2 -56 Q26 -30 24 -4 H2 Z" fill={boat.sail ?? "#ffffff"} />
          <path d="M-2 -46 Q-18 -24 -16 -4 H-2 Z" fill={boat.sail ?? "#ffffff"} opacity={0.8} />
        </>
      )}
      <path
        d="M-30 20 h60 M-20 26 h40"
        stroke={night ? "#ffd27a" : "#ffffff"}
        strokeWidth={3}
        opacity={0.3}
      />
    </g>
  );
}

export function HarbourWindow({ x, y, width, height, sky, sign, open, waiting }: HarbourWindowProps) {
  const id = useSvgId("ck-harbour");
  const [top, middle, low] = SKIES[sky];
  const sea = y + height * 0.72;
  const night = sky === "night";
  const signWidth = Math.max(84, sign.length * 10 + 24);
  const towerX = x + width * 0.9;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.65" stopColor={middle} />
          <stop offset="1" stopColor={low} />
        </linearGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={night ? "#1d2a52" : "#3d6a8e"} />
          <stop offset="1" stopColor={night ? "#0b1128" : "#24456a"} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.2} />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="0.8" stopColor="#ffffff" stopOpacity={0.06} />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fff4d0" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff4d0" stopOpacity={0} />
        </linearGradient>
        <clipPath id={`${id}-pane`}>
          <rect x={x} y={y} width={width} height={height} rx={12} />
        </clipPath>
      </defs>
      <rect
        x={x - 14}
        y={y - 14}
        width={width + 28}
        height={height + 28}
        rx={18}
        fill="#2a140c"
        opacity={0.4}
      />
      <g clipPath={`url(#${id}-pane)`}>
        <rect x={x} y={y} width={width} height={height} fill={`url(#${id}-sky)`} />
        {night ? (
          <>
            <circle cx={x + width * 0.62} cy={y + height * 0.24} r={18} fill="#fff4d0" />
            <circle cx={x + width * 0.62} cy={y + height * 0.24} r={42} fill="#fff4d0" opacity={0.12} />
            {[0.08, 0.2, 0.34, 0.46, 0.76, 0.84].map((share, index) => (
              <circle
                key={share}
                cx={x + width * share}
                cy={y + 16 + ((index * 23) % 46)}
                r={index % 2 === 0 ? 2.2 : 1.5}
                fill="#ffe8b0"
                className="ck-twinkle"
              />
            ))}
          </>
        ) : (
          <circle cx={x + width * 0.6} cy={sea - 8} r={30} fill="#ffd27a" opacity={sky === "day" ? 0 : 0.9} />
        )}
        <path
          d={`M${x} ${sea - 22} q${width * 0.12} -22 ${width * 0.24} -6 t${width * 0.22} -2 q${width * 0.14} -18 ${width * 0.24} -4 L${x + width} ${sea - 40} V${sea} H${x} Z`}
          fill={night ? "#141a33" : "#5a4a6a"}
          opacity={0.9}
        />
        {[0.1, 0.18, 0.27, 0.44, 0.52].map((share, index) => (
          <rect
            key={share}
            x={x + width * share}
            y={sea - 14 - (index % 3) * 4}
            width={10}
            height={14 + (index % 3) * 4}
            fill={night ? "#1f2748" : "#6a5a78"}
          />
        ))}
        {night
          ? [0.1, 0.27, 0.52].map((share) => (
              <rect key={share} x={x + width * share + 3} y={sea - 9} width={4} height={4} fill="#ffd387" />
            ))
          : null}
        <g>
          <path
            d={`M${towerX - 9} ${sea - 6} L${towerX - 6} ${sea - 62} H${towerX + 6} L${towerX + 9} ${sea - 6} Z`}
            fill="#f3f0e8"
          />
          <path
            d={`M${towerX - 8} ${sea - 26} H${towerX + 8} M${towerX - 7} ${sea - 44} H${towerX + 7}`}
            stroke="#c4502e"
            strokeWidth={7}
          />
          <rect
            x={towerX - 8}
            y={sea - 74}
            width={16}
            height={12}
            rx={2}
            fill={night ? "#ffd387" : "#e8e2d4"}
          />
          <path
            d={`M${towerX - 10} ${sea - 74} L${towerX} ${sea - 84} L${towerX + 10} ${sea - 74} Z`}
            fill="#2e3a40"
          />
          {night ? (
            <path
              d={`M${towerX} ${sea - 68} L${x + width * 0.45} ${sea - 96} V${sea - 44} Z`}
              fill={`url(#${id}-beam)`}
              className="ck-twinkle"
            />
          ) : null}
        </g>
        <rect x={x} y={sea} width={width} height={height} fill={`url(#${id}-sea)`} />
        {[0.08, 0.3, 0.5, 0.66, 0.86].map((share, index) => (
          <path
            key={share}
            d={`M${x + width * share - 22} ${sea + 10 + (index % 3) * 9} h${30 + (index % 2) * 18}`}
            stroke={night ? "#ffd27a" : "#fbe6c2"}
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.4}
          />
        ))}
        {BOATS.map((boat) => (
          <BoatShape key={boat.share} x={x + width * boat.share} sea={sea + 4} boat={boat} night={night} />
        ))}
        {waiting.slice(0, 3).map((look, index) => {
          const gx = x + width * (0.2 + index * 0.13);
          const scale = 0.26;
          return (
            <g key={index} transform={`translate(${gx - 200 * scale} ${y + height - 132}) scale(${scale})`}>
              <AvatarFigure look={look} mood="delighted" pose={index === 1 ? "wave" : "rest"} />
            </g>
          );
        })}
        <rect x={x} y={y} width={width} height={height} fill={`url(#${id}-glass)`} />
        <path
          d={`M${x + width * 0.08} ${y + height} L${x + width * 0.3} ${y} M${x + width * 0.16} ${y + height} L${x + width * 0.38} ${y}`}
          stroke="#ffffff"
          strokeWidth={10}
          opacity={0.06}
        />
      </g>
      <path
        d={`M${x + width / 2} ${y} V${y + height} M${x} ${y + height * 0.42} H${x + width}`}
        stroke="#3a2016"
        strokeWidth={10}
      />
      <rect x={x} y={y} width={width} height={height} rx={12} fill="none" stroke="#3a2016" strokeWidth={16} />
      <rect x={x} y={y} width={width} height={height} rx={12} fill="none" stroke="#7a4a2e" strokeWidth={3} />
      <rect x={x - 16} y={y + height - 4} width={width + 32} height={18} rx={4} fill="#4a2516" />
      <rect x={x - 16} y={y + height - 4} width={width + 32} height={4} rx={2} fill="#a0603f" opacity={0.6} />
      <g transform={`translate(${x + width * 0.25} ${y + 4}) rotate(-3)`}>
        <path
          d={`M${-signWidth / 2 + 12} 10 L0 -6 L${signWidth / 2 - 12} 10`}
          stroke="#5a3a22"
          strokeWidth={2}
          fill="none"
        />
        <circle cy={-6} r={3.5} fill="#c9a77a" />
        <rect
          x={-signWidth / 2 + 3}
          y={13}
          width={signWidth}
          height={32}
          rx={3}
          fill="#1a0c06"
          opacity={0.3}
        />
        <rect
          x={-signWidth / 2}
          y={10}
          width={signWidth}
          height={32}
          rx={3}
          fill={open ? "#2f4a2a" : "#2a2420"}
        />
        <rect
          x={-signWidth / 2}
          y={10}
          width={signWidth}
          height={32}
          rx={3}
          fill="none"
          stroke={open ? "#8cc46a" : "#b98a5a"}
          strokeWidth={2.5}
        />
        <text
          y={32}
          textAnchor="middle"
          fontSize={17}
          fill="#fff6dc"
          className="ck-scene-label ck-scene-label--hand"
        >
          {sign}
        </text>
      </g>
    </g>
  );
}
