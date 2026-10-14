import { useSvgId } from "../../../../ui/art/useSvgId";
import type { SceneIds } from "./kitchenFixtures";

export interface QuaysideSceneProps {
  readonly ids: SceneIds;
  readonly sign: string;
}

const TABLES = [
  { x: 190, y: 470 },
  { x: 470, y: 500 },
  { x: 760, y: 470 },
  { x: 1030, y: 505 },
];

export function QuaysideScene({ ids, sign }: QuaysideSceneProps) {
  const dusk = useSvgId("ck-dusk");
  return (
    <g>
      <rect width={1200} height={600} fill="#5a2f22" />
      <rect width={1200} height={380} fill="#7b4430" />
      {Array.from({ length: 16 }, (_, index) => (
        <rect
          key={`panel-${index}`}
          x={index * 80 + 6}
          y={250}
          width={68}
          height={130}
          rx={4}
          fill="#6a3a28"
        />
      ))}
      <rect
        x={300}
        y={40}
        width={600}
        height={190}
        rx={14}
        fill="#1c2a4a"
        stroke="#3a2016"
        strokeWidth={14}
      />
      <rect x={300} y={40} width={600} height={190} rx={14} fill={`url(#${dusk})`} />
      <defs>
        <linearGradient id={dusk} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24345e" />
          <stop offset="0.65" stopColor="#c86b5a" />
          <stop offset="1" stopColor="#f2a93b" />
        </linearGradient>
      </defs>
      <path d="M307 190 Q450 176 600 186 T893 182 V223 H307 Z" fill="#1d3550" />
      {[380, 520, 700, 820].map((x, index) => (
        <g key={`boat-${x}`}>
          <path d={`M${x - 30} 190 h60 l-10 14 h-40 Z`} fill="#f3f0e8" />
          <path d={`M${x} 190 V${150 - index * 6}`} stroke="#f3f0e8" strokeWidth={2} />
          <path d={`M${x} ${152 - index * 6} L${x + 22} 184 H${x} Z`} fill="#fbe6c2" />
          <circle cx={x + 26} cy={200} r={3} fill="#ffd387" />
        </g>
      ))}
      {[340, 460, 600, 740, 860].map((x) => (
        <circle key={`star-${x}`} cx={x} cy={70 + (x % 3) * 12} r={2} fill="#ffe2a8" className="ck-twinkle" />
      ))}
      <path d="M600 40 V230 M300 135 H900" stroke="#3a2016" strokeWidth={10} />
      <rect x={60} y={60} width={190} height={160} rx={8} fill="#2e3a40" stroke="#a3651f" strokeWidth={8} />
      <text x={155} y={98} textAnchor="middle" fontSize={22} fill="#f3f0e8" className="ck-scene-label">
        Tonight
      </text>
      {[124, 150, 176, 202].map((y, index) => (
        <path key={y} d={`M84 ${y} H${226 - index * 14}`} stroke="#f3f0e8" strokeWidth={4} opacity={0.6} />
      ))}
      <rect x={950} y={60} width={190} height={180} rx={6} fill="#3a2016" />
      <rect x={962} y={72} width={166} height={156} rx={4} fill="#f3e6cf" />
      {[0, 1, 2].map((row) => (
        <path key={`shelf-${row}`} d={`M962 ${120 + row * 48} H1128`} stroke="#a3651f" strokeWidth={6} />
      ))}
      {[978, 1008, 1040, 1076, 1104].map((x, index) => (
        <circle
          key={`bowl-${x}`}
          cx={x}
          cy={110 + (index % 3) * 48}
          r={10}
          fill={["#d9472b", "#4f8a3c", "#f2a93b"][index % 3]}
        />
      ))}
      <rect x={450} y={8} width={300} height={30} rx={6} fill="#2e3a40" />
      <text x={600} y={30} textAnchor="middle" fontSize={20} fill="#f2a93b" className="ck-scene-label">
        {sign}
      </text>
      <rect y={380} width={1200} height={220} fill={`url(#${ids.floor})`} />
      <rect y={380} width={1200} height={220} fill="#7a4a2a" opacity={0.55} />
      {Array.from({ length: 12 }, (_, index) => (
        <path
          key={`plank-${index}`}
          d={`M${index * 110} 380 L${index * 110 - 60} 600`}
          stroke="#5a3420"
          strokeWidth={3}
          opacity={0.5}
        />
      ))}
      {[180, 470, 760, 1040].map((x) => (
        <g key={`lamp-${x}`}>
          <path d={`M${x} 0 V70`} stroke="#1d2528" strokeWidth={3} />
          <path d={`M${x - 26} 92 Q${x} 58 ${x + 26} 92 Z`} fill="#c47f1a" />
          <ellipse cx={x} cy={93} rx={20} ry={6} fill="#ffd88a" />
          <path
            d={`M${x - 20} 95 L${x - 120} 420 H${x + 120} L${x + 20} 95 Z`}
            fill={`url(#${ids.lamp})`}
            opacity={0.65}
          />
        </g>
      ))}
      {TABLES.map((table) => (
        <g key={`table-${table.x}`}>
          <ellipse cx={table.x} cy={table.y + 46} rx={110} ry={12} fill="#000" opacity={0.25} />
          <path
            d={`M${table.x - 100} ${table.y} H${table.x + 100} L${table.x + 92} ${table.y + 46} H${table.x - 92} Z`}
            fill="#fbf7ee"
          />
          <ellipse cx={table.x} cy={table.y} rx={100} ry={20} fill="#fffdf6" />
          <rect x={table.x - 4} y={table.y - 30} width={8} height={22} rx={3} fill="#f3f0e8" />
          <ellipse cx={table.x} cy={table.y - 34} rx={5} ry={8} fill="#ffd387" className="ck-flicker" />
          <ellipse
            cx={table.x - 50}
            cy={table.y + 2}
            rx={22}
            ry={6}
            fill="#ffffff"
            stroke="#aeb9bf"
            strokeWidth={2}
          />
          <ellipse
            cx={table.x + 50}
            cy={table.y + 2}
            rx={22}
            ry={6}
            fill="#ffffff"
            stroke="#aeb9bf"
            strokeWidth={2}
          />
          <path
            d={`M${table.x - 70} ${table.y + 46} V${table.y + 96} M${table.x + 70} ${table.y + 46} V${table.y + 96}`}
            stroke="#3a2016"
            strokeWidth={8}
          />
        </g>
      ))}
    </g>
  );
}
