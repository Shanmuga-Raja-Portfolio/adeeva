export interface ParlourWindowProps {
  readonly id: string;
  readonly daylight: boolean;
}

const STARS: readonly [number, number, number][] = [
  [520, 150, 2.4],
  [560, 210, 1.6],
  [640, 132, 2],
  [700, 196, 1.4],
  [668, 236, 2.2],
  [590, 252, 1.2],
  [496, 236, 1.6],
  [628, 176, 1.2],
  [712, 262, 1.4],
  [548, 268, 1.8],
];
const ROOFS: readonly [number, number, number, string][] = [
  [470, 270, 60, "#f2c7a5"],
  [526, 252, 52, "#c8d6ee"],
  [574, 276, 44, "#f6e1a8"],
  [624, 248, 58, "#cfe3bb"],
  [676, 266, 54, "#f3c3c9"],
];
const CLOUDS: readonly [number, number, number][] = [
  [540, 150, 1],
  [668, 196, 0.75],
];
const CURTAIN_FOLDS = [0, 14, 28];
const ARCH = "M470 330 V150 A130 130 0 0 1 730 150 V330 Z";

function NightSky({ id }: { readonly id: string }) {
  return (
    <g>
      <path d={ARCH} fill={`url(#${id}-night)`} />
      {STARS.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff6d8" />
      ))}
      <path d="M520 196 A20 20 0 1 0 540 222 A15 15 0 1 1 520 196 Z" fill="#fff1c2" />
      <path d="M555 175 L655 115" stroke="#fff6d8" strokeWidth={4} strokeLinecap="round" opacity={0.5} />
      <path d="M575 165 L655 115" stroke="#fff6d8" strokeWidth={8} strokeLinecap="round" opacity={0.25} />
      <circle cx={658} cy={113} r={8} fill="#fff6d8" />
      {ROOFS.map(([x, y, w]) => (
        <g key={x}>
          <path d={`M${x} 330 V${y} L${x + w / 2} ${y - 18} L${x + w} ${y} V330 Z`} fill="#232650" />
          <rect x={x + w / 2 - 5} y={y + 10} width={10} height={12} rx={2} fill="#ffd98a" opacity={0.85} />
        </g>
      ))}
    </g>
  );
}

function DaySky({ id }: { readonly id: string }) {
  return (
    <g>
      <path d={ARCH} fill={`url(#${id}-day)`} />
      <circle cx={666} cy={128} r={46} fill={`url(#${id}-sun)`} />
      <circle cx={666} cy={128} r={18} fill="#fff6cf" />
      {CLOUDS.map(([x, y, scale]) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${scale})`} fill="#ffffff" opacity={0.9}>
          <ellipse cx={0} cy={0} rx={32} ry={12} />
          <ellipse cx={18} cy={-9} rx={20} ry={14} />
          <ellipse cx={-14} cy={-6} rx={16} ry={11} />
        </g>
      ))}
      {ROOFS.map(([x, y, w, colour]) => (
        <g key={x}>
          <path d={`M${x} 330 V${y} L${x + w / 2} ${y - 18} L${x + w} ${y} V330 Z`} fill={colour} />
          <path
            d={`M${x - 3} ${y + 1} L${x + w / 2} ${y - 19} L${x + w + 3} ${y + 1}`}
            stroke="#9b6b54"
            strokeWidth={5}
            fill="none"
          />
          <rect x={x + w * 0.7} y={y} width={w * 0.3} height={330 - y} fill="#3b2620" opacity={0.08} />
          <rect
            x={x + w / 2 - 6}
            y={y + 12}
            width={12}
            height={14}
            rx={2}
            fill="#fffaf0"
            stroke="#ffffff"
            strokeWidth={2}
          />
        </g>
      ))}
      <g transform="translate(560 300)">
        <rect x={-3} y={0} width={6} height={30} fill="#7d5a43" />
        <circle cx={0} cy={-6} r={20} fill="#7fa87a" />
        <circle cx={-7} cy={-12} r={9} fill="#a9c98b" opacity={0.75} />
      </g>
    </g>
  );
}

export function ParlourWindow({ id, daylight }: ParlourWindowProps) {
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-night`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2f63" />
          <stop offset="1" stopColor="#6b5ea8" />
        </linearGradient>
        <linearGradient id={`${id}-day`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9d6f2" />
          <stop offset="0.7" stopColor="#e6f1f2" />
          <stop offset="1" stopColor="#fde8cf" />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor="#fff6cf" stopOpacity={0.95} />
          <stop offset="1" stopColor="#fff6cf" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-pane`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.4} />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity={0.16} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
      </defs>
      {daylight ? <DaySky id={id} /> : <NightSky id={id} />}
      <path d={ARCH} fill={`url(#${id}-pane)`} />
      <path d={ARCH} fill="none" stroke="#fffaf4" strokeWidth={14} />
      <path d="M600 22 V330 M470 220 H730" stroke="#fffaf4" strokeWidth={8} />
      <path d="M440 334 H760" stroke="#9c86c6" strokeWidth={18} strokeLinecap="round" />
      <path d="M444 328 H756" stroke="#cbbbe6" strokeWidth={6} strokeLinecap="round" />
      {[480, 530, 680, 720].map((x, index) => (
        <g key={x} transform={`translate(${x} 322)`}>
          <path d="M-9 0 L-7 -12 H7 L9 0 Z" fill={index % 2 === 0 ? "#c97d4a" : "#e8a877"} />
          <circle cx={-4} cy={-18} r={7} fill={index % 2 === 0 ? "#f2c4c9" : "#a9c98b"} />
          <circle cx={5} cy={-16} r={6} fill={index % 2 === 0 ? "#e98aa6" : "#7fa87a"} />
        </g>
      ))}
      {[440, 760].map((x) => (
        <g key={x} transform={`translate(${x} 0) scale(${x < 600 ? 1 : -1} 1)`}>
          <path d="M-20 10 H60 Q40 120 54 200 Q30 230 40 330 H-20 Z" fill="#d07a9a" />
          <path d="M-20 10 H10 Q2 120 12 200 Q0 240 4 330 H-20 Z" fill="#b8607f" opacity={0.6} />
          {CURTAIN_FOLDS.map((dx) => (
            <path
              key={dx}
              d={`M${dx} 12 Q${dx + 8} 120 ${dx + 6} 200 Q${dx - 2} 260 ${dx + 4} 328`}
              stroke="#a95377"
              strokeWidth={3}
              fill="none"
              opacity={0.55}
            />
          ))}
          <path d="M44 14 Q34 120 48 196" stroke="#f3b6cb" strokeWidth={4} fill="none" opacity={0.6} />
          <path d="M-20 10 H60" stroke="#c9a227" strokeWidth={8} strokeLinecap="round" />
          <ellipse cx={46} cy={204} rx={14} ry={8} fill="#c9a227" />
          <ellipse cx={42} cy={202} rx={5} ry={3} fill="#f3dc8a" />
        </g>
      ))}
    </g>
  );
}
