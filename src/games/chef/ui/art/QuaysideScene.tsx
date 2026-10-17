import { useSvgId } from "../../../../ui/art/useSvgId";
import type { SceneIds } from "./kitchenFixtures";

export interface QuaysideSceneProps {
  readonly ids: SceneIds;
  readonly sign: string;
  readonly menu: readonly string[];
}

interface TableSpot {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

const TABLES: readonly TableSpot[] = [
  { x: 200, y: 456, scale: 0.92 },
  { x: 560, y: 480, scale: 1 },
  { x: 1010, y: 452, scale: 0.86 },
];

const VANISH_X = 600;

const FLOOR_TOP = 384;

function plankEnd(x: number): number {
  return VANISH_X + (x - VANISH_X) * 0.42;
}

function menuSize(name: string): number {
  return Math.min(25, Math.floor(196 / Math.max(1, name.length * 0.5)));
}

function Chair({ x, y, flip }: { readonly x: number; readonly y: number; readonly flip: boolean }) {
  const dir = flip ? -1 : 1;
  return (
    <g>
      <path
        d={`M${x} ${y} v-74 q0 -10 ${dir * 10} -10 h${dir * 34} q${dir * 10} 0 ${dir * 10} 10 v74`}
        fill="none"
        stroke="#4a2516"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path
        d={`M${x + dir * 6} ${y - 52} h${dir * 42} M${x + dir * 6} ${y - 30} h${dir * 42}`}
        stroke="#6a3a22"
        strokeWidth={5}
      />
    </g>
  );
}

function Table({ spot, shadow }: { readonly spot: TableSpot; readonly shadow: string }) {
  const { x, y, scale } = spot;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={108} rx={150} ry={20} fill={`url(#${shadow})`} />
      <Chair x={-112} y={70} flip={false} />
      <Chair x={112} y={70} flip />
      <path
        d="M-70 40 L-74 104 M70 40 L74 104 M0 44 V102"
        stroke="#3a1d10"
        strokeWidth={9}
        strokeLinecap="round"
      />
      <ellipse cx={-74} cy={106} rx={12} ry={3.5} fill="#1a0c06" opacity={0.6} />
      <ellipse cx={74} cy={106} rx={12} ry={3.5} fill="#1a0c06" opacity={0.6} />
      <path d="M-104 0 H104 L96 50 Q0 62 -96 50 Z" fill="#efe6d4" />
      <path d="M-96 50 Q0 62 96 50" fill="none" stroke="#d9cdb4" strokeWidth={3} />
      <path d="M-60 6 L-66 50 M-20 8 L-22 56 M20 8 L22 56 M60 6 L66 50" stroke="#e1d6c0" strokeWidth={3} />
      <ellipse cx={0} cy={0} rx={104} ry={20} fill="#fffdf6" />
      <ellipse cx={0} cy={-2} rx={70} ry={10} fill="#ffeec8" opacity={0.6} />
      <ellipse cx={-52} cy={2} rx={22} ry={6} fill="#ffffff" stroke="#aeb9bf" strokeWidth={2} />
      <ellipse cx={52} cy={2} rx={22} ry={6} fill="#ffffff" stroke="#aeb9bf" strokeWidth={2} />
      <path d="M-24 -2 h-6 M30 -2 h6" stroke="#8a949a" strokeWidth={2.5} strokeLinecap="round" />
      <rect x={-4} y={-30} width={8} height={24} rx={3} fill="#f3f0e8" />
      <ellipse cx={0} cy={-36} rx={14} ry={18} fill="#ffd387" opacity={0.25} />
      <ellipse cx={0} cy={-34} rx={5} ry={8} fill="#ffd387" className="ck-flicker" />
    </g>
  );
}

export function QuaysideScene({ ids, sign, menu }: QuaysideSceneProps) {
  const base = useSvgId("ck-quay");
  const dusk = `${base}-dusk`;
  const wall = `${base}-wall`;
  const floor = `${base}-floor`;
  const pool = `${base}-pool`;
  const shadow = `${base}-shadow`;
  const glass = `${base}-glass`;
  const shown = menu.slice(0, 3);
  return (
    <g>
      <defs>
        <linearGradient id={dusk} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24345e" />
          <stop offset="0.6" stopColor="#c86b5a" />
          <stop offset="1" stopColor="#f2a93b" />
        </linearGradient>
        <linearGradient id={glass} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.16} />
          <stop offset="0.4" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={wall} cx="0.5" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#94573b" />
          <stop offset="0.6" stopColor="#7b4430" />
          <stop offset="1" stopColor="#5a2f22" />
        </radialGradient>
        <linearGradient id={floor} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a3c22" />
          <stop offset="1" stopColor="#9a6236" />
        </linearGradient>
        <radialGradient id={pool} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd88a" stopOpacity={0.5} />
          <stop offset="1" stopColor="#ffd88a" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={shadow} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#1a0c06" stopOpacity={0.6} />
          <stop offset="0.6" stopColor="#1a0c06" stopOpacity={0.28} />
          <stop offset="1" stopColor="#1a0c06" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect y={-150} width={1200} height={150} fill="#4a2618" />
      {[-120, -80, -40].map((y) => (
        <path key={y} d={`M0 ${y} H1200`} stroke="#3a1d10" strokeWidth={4} opacity={0.6} />
      ))}
      <rect width={1200} height={FLOOR_TOP} fill={`url(#${wall})`} />
      <rect y={-14} width={1200} height={16} fill="#3a1d10" />
      {Array.from({ length: 16 }, (_, index) => (
        <g key={`panel-${index}`}>
          <rect x={index * 80 + 6} y={262} width={68} height={112} rx={4} fill="#6a3a28" />
          <path d={`M${index * 80 + 8} 264 h64`} stroke="#a0603f" strokeWidth={2} opacity={0.6} />
        </g>
      ))}
      <rect y={252} width={1200} height={10} fill="#4a2516" />
      <rect y={374} width={1200} height={14} fill="#3a1d10" />
      <g transform="translate(90 30) scale(0.85)">
        <rect x={300} y={40} width={600} height={210} rx={14} fill={`url(#${dusk})`} />
        <path d="M307 210 Q450 196 600 206 T893 202 V243 H307 Z" fill="#1d3550" />
        {[380, 520, 700, 820].map((x, index) => (
          <g key={`boat-${x}`}>
            <path d={`M${x - 30} 210 h60 l-10 14 h-40 Z`} fill="#f3f0e8" />
            <path d={`M${x} 210 V${170 - index * 6}`} stroke="#f3f0e8" strokeWidth={2} />
            <path d={`M${x} ${172 - index * 6} L${x + 22} 204 H${x} Z`} fill="#fbe6c2" />
            <circle cx={x + 26} cy={220} r={3} fill="#ffd387" />
          </g>
        ))}
        {[340, 460, 740, 860].map((x) => (
          <circle
            key={`star-${x}`}
            cx={x}
            cy={140 + (x % 3) * 10}
            r={2}
            fill="#ffe2a8"
            className="ck-twinkle"
          />
        ))}
        <rect x={300} y={40} width={600} height={210} rx={14} fill={`url(#${glass})`} />
        <path d="M600 150 V250 M300 150 H900" stroke="#3a2016" strokeWidth={10} />
        <rect x={300} y={40} width={600} height={210} rx={14} fill="none" stroke="#3a2016" strokeWidth={16} />
        <rect x={286} y={246} width={628} height={16} rx={4} fill="#4a2516" />
        <text
          x={600}
          y={112}
          textAnchor="middle"
          fontSize={46}
          fill="#ffd387"
          stroke="#2a1a3a"
          strokeWidth={6}
          paintOrder="stroke"
          className="ck-scene-label"
        >
          {sign}
        </text>
        <path d="M430 128 H770" stroke="#ffd387" strokeWidth={3} strokeLinecap="round" opacity={0.75} />
      </g>
      <g transform="translate(118 64)">
        <rect x={6} y={8} width={222} height={196} rx={8} fill="#1a0c06" opacity={0.35} />
        <rect width={222} height={196} rx={8} fill="#2e3a40" stroke="#a3651f" strokeWidth={8} />
        <rect x={8} y={8} width={206} height={180} rx={4} fill="#ffffff" opacity={0.05} />
        <text x={111} y={42} textAnchor="middle" fontSize={30} fill="#ffd387" className="ck-scene-label">
          Tonight
        </text>
        <path d="M46 56 H176" stroke="#ffd387" strokeWidth={2.5} opacity={0.7} strokeDasharray="6 5" />
        {shown.map((name, index) => (
          <text
            key={name}
            x={111}
            y={92 + index * 32}
            textAnchor="middle"
            fontSize={menuSize(name)}
            fill="#fffaf0"
            className="ck-scene-label"
          >
            {name}
          </text>
        ))}
        {menu.length > shown.length ? (
          <text x={111} y={182} textAnchor="middle" fontSize={20} fill="#ffe2a8" className="ck-scene-label">
            + {menu.length - shown.length} more
          </text>
        ) : null}
      </g>
      <g transform="translate(872 70)">
        <rect width={196} height={176} rx={6} fill="#3a2016" />
        <rect x={10} y={10} width={176} height={156} rx={4} fill="#f3e6cf" />
        {[0, 1, 2].map((row) => (
          <path key={`shelf-${row}`} d={`M10 ${58 + row * 48} H186`} stroke="#a3651f" strokeWidth={6} />
        ))}
        {[30, 62, 98, 134, 164].map((x, index) => (
          <g key={`bowl-${x}`}>
            <path
              d={`M${x - 13} ${44 + (index % 3) * 48} q13 14 26 0 Z`}
              fill={["#d9472b", "#4f8a3c", "#f2a93b"][index % 3]}
            />
            <ellipse cx={x} cy={44 + (index % 3) * 48} rx={13} ry={3} fill="#fffaf0" opacity={0.7} />
          </g>
        ))}
      </g>
      <rect y={FLOOR_TOP} width={1200} height={600 - FLOOR_TOP} fill={`url(#${floor})`} />
      <rect y={FLOOR_TOP} width={1200} height={600 - FLOOR_TOP} fill={`url(#${ids.floor})`} opacity={0.25} />
      {Array.from({ length: 19 }, (_, index) => {
        const x = -480 + index * 120;
        return (
          <path
            key={`plank-${index}`}
            d={`M${x} 600 L${plankEnd(x)} ${FLOOR_TOP}`}
            stroke="#4a2516"
            strokeWidth={2.5}
            opacity={0.45}
          />
        );
      })}
      {[404, 432, 470, 524].map((y) => (
        <path key={`seam-${y}`} d={`M0 ${y} H1200`} stroke="#4a2516" strokeWidth={2} opacity={0.25} />
      ))}
      <rect y={FLOOR_TOP} width={1200} height={30} fill="#1a0c06" opacity={0.25} />
      {TABLES.map((table) => (
        <ellipse
          key={`pool-${table.x}`}
          cx={table.x}
          cy={table.y + 70}
          rx={230 * table.scale}
          ry={60 * table.scale}
          fill={`url(#${pool})`}
        />
      ))}
      {TABLES.map(({ x }) => (
        <g key={`lamp-${x}`}>
          <path d={`M${x} -150 V28`} stroke="#1d2528" strokeWidth={3} />
          <path d={`M${x - 28} 52 Q${x} 14 ${x + 28} 52 Z`} fill="#c47f1a" />
          <ellipse cx={x} cy={53} rx={22} ry={6} fill="#ffe2a8" />
          <path
            d={`M${x - 22} 55 L${x - 140} 452 H${x + 140} L${x + 22} 55 Z`}
            fill={`url(#${ids.lamp})`}
            opacity={0.38}
          />
        </g>
      ))}
      {TABLES.map((table) => (
        <Table key={`table-${table.x}`} spot={table} shadow={shadow} />
      ))}
    </g>
  );
}
