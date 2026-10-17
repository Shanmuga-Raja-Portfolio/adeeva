import { useSvgId } from "../../../../ui/art/useSvgId";

export interface MenuChalkboardProps {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly menu: readonly string[];
  readonly lit: boolean;
}

const ROW = 28;
const SHOWN = 6;

function fontSize(names: readonly string[], width: number): number {
  const longest = Math.max(8, ...names.map((name) => name.length));
  return Math.min(22, Math.floor((width - 64) / (longest * 0.6)));
}

export function MenuChalkboard({ x, y, width, menu, lit }: MenuChalkboardProps) {
  const id = useSvgId("ck-chalk");
  const shown = menu.slice(0, SHOWN);
  const extra = menu.length - shown.length;
  const height = 84 + Math.max(3, shown.length) * ROW + (extra > 0 ? 26 : 0);
  const size = fontSize(shown, width);
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={`${id}-wash`} cx="0.5" cy="0" r="0.9">
          <stop offset="0" stopColor="#fff0c4" stopOpacity={lit ? 0.32 : 0.14} />
          <stop offset="1" stopColor="#fff0c4" stopOpacity={0} />
        </radialGradient>
        <filter id={`${id}-dust`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.2" numOctaves={3} seed={4} />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.14 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <rect x={8} y={12} width={width} height={height} rx={10} fill="#1a0c06" opacity={0.45} />
      <rect width={width} height={height} rx={10} fill="#a3651f" />
      <rect width={width} height={height} rx={10} fill="none" stroke="#6a3a12" strokeWidth={3} />
      <rect x={4} y={4} width={width - 8} height={4} rx={2} fill="#f2c46b" opacity={0.6} />
      <rect x={12} y={12} width={width - 24} height={height - 30} rx={6} fill="#26302f" />
      <rect
        x={12}
        y={12}
        width={width - 24}
        height={height - 30}
        rx={6}
        fill="#ffffff"
        filter={`url(#${id}-dust)`}
      />
      <rect x={12} y={12} width={width - 24} height={height - 30} rx={6} fill={`url(#${id}-wash)`} />
      <text
        x={width / 2}
        y={46}
        textAnchor="middle"
        fontSize={26}
        fill="#ffd387"
        className="ck-scene-label ck-scene-label--hand"
      >
        Tonight's menu
      </text>
      <path
        d={`M${width / 2 - 86} 58 H${width / 2 + 86}`}
        stroke="#ffd387"
        strokeWidth={2.5}
        opacity={0.7}
        strokeDasharray="6 5"
      />
      {shown.map((name, index) => (
        <g key={name}>
          <circle cx={32} cy={83 + index * ROW} r={4} fill={index % 2 === 0 ? "#ffd387" : "#9fdc85"} />
          <text
            x={44}
            y={90 + index * ROW}
            fontSize={size}
            fill="#f6f1e4"
            className="ck-scene-label ck-scene-label--hand"
          >
            {name}
          </text>
        </g>
      ))}
      {extra > 0 ? (
        <text
          x={44}
          y={90 + shown.length * ROW}
          fontSize={size - 2}
          fill="#ffe2a8"
          className="ck-scene-label ck-scene-label--hand"
        >
          and {extra} more
        </text>
      ) : null}
      <rect x={6} y={height - 20} width={width - 12} height={12} rx={3} fill="#7a4618" />
      <rect x={6} y={height - 20} width={width - 12} height={3} rx={1.5} fill="#e0a868" opacity={0.6} />
      <rect x={width - 80} y={height - 31} width={46} height={11} rx={3} fill="#e9e2d2" />
      <rect x={width - 80} y={height - 31} width={46} height={4} rx={2} fill="#8a6a4a" />
      <rect x={width - 124} y={height - 26} width={26} height={6} rx={3} fill="#fbf6ea" />
      <g transform={`translate(${width / 2} -6)`}>
        <path d="M-6 0 v10 M6 0 v10" stroke="#5a3a1a" strokeWidth={3} />
        <path d="M-64 10 h128 q6 0 6 6 v4 q0 6 -6 6 h-128 q-6 0 -6 -6 v-4 q0 -6 6 -6 Z" fill="#c9962e" />
        <path d="M-62 12 h124" stroke="#ffe7a8" strokeWidth={2} opacity={0.8} />
        {lit ? <ellipse cy={24} rx={66} ry={5} fill="#fff0c4" opacity={0.3} /> : null}
      </g>
    </g>
  );
}
