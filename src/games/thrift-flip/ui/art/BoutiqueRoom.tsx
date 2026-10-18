import { memo } from "react";
import { useSvgId } from "../../../../ui/art/useSvgId";

export interface BoutiqueRoomProps {
  readonly width: number;
  readonly height: number;
  readonly floorY: number;
}

const LAMPS: readonly (readonly [number, number])[] = [
  [330, 92],
  [560, 70],
  [790, 92],
];

const STACKS: readonly (readonly string[])[] = [
  ["#e57a8f", "#f6d36b", "#8fcfb2"],
  ["#7b7fd1", "#fff4e2", "#f08a3c"],
  ["#3f5d84", "#e8c7a0", "#e57a8f", "#8fcfb2"],
  ["#f6d36b", "#b9a7dc"],
];

const JARS = ["#f08a3c", "#7b7fd1", "#e57a8f"];

function Plank({ x1, x2, y }: { readonly x1: number; readonly x2: number; readonly y: number }) {
  return <path d={`M${x1} ${y} H${x2}`} stroke="#8a5c33" strokeOpacity={0.35} strokeWidth={1.5} />;
}

function Stack({
  x,
  y,
  colours,
}: {
  readonly x: number;
  readonly y: number;
  readonly colours: readonly string[];
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {colours.map((colour, index) => (
        <g key={`${colour}-${index}`} transform={`translate(${index % 2 === 0 ? 0 : 3} ${-index * 10})`}>
          <rect x={-24} y={-10} width={48} height={11} rx={4} fill={colour} />
          <rect x={-24} y={-10} width={48} height={3.5} rx={1.75} fill="#ffffff" opacity={0.35} />
          <rect x={-24} y={-1} width={48} height={2} fill="#3b2a1c" opacity={0.18} />
        </g>
      ))}
    </g>
  );
}

function Shelves({ id }: { readonly id: string }) {
  const shelves = [150, 214, 278];
  return (
    <g>
      <rect x={436} y={104} width={268} height={196} rx={6} fill={`url(#${id}-nook)`} />
      <rect x={436} y={104} width={268} height={196} rx={6} fill="none" stroke="#8a5c33" strokeWidth={8} />
      {shelves.map((y) => (
        <g key={y}>
          <rect x={440} y={y} width={260} height={9} fill="#b98451" />
          <rect x={440} y={y + 9} width={260} height={5} fill="#3b2a1c" opacity={0.22} />
        </g>
      ))}
      <Stack x={478} y={150} colours={STACKS[0] ?? []} />
      <Stack x={540} y={150} colours={STACKS[1] ?? []} />
      <g transform="translate(620 150)">
        <path d="M-20 0 L-16 -30 L16 -30 L20 0 Z" fill="#c99f72" />
        <path d="M-16 -30 Q0 -36 16 -30" fill="none" stroke="#8a5c33" strokeWidth={2} />
        <path d="M-18 -14 H18 M-17 -22 H17" stroke="#8a5c33" strokeWidth={1.5} opacity={0.6} />
        <circle cx={-6} cy={-34} r={6} fill="#f6d36b" />
        <circle cx={6} cy={-36} r={6} fill="#e57a8f" />
      </g>
      <g transform="translate(670 150)">
        <path d="M-12 0 L-10 -18 L10 -18 L12 0 Z" fill="#b86b46" />
        <path
          d="M0 -18 Q-14 -34 -18 -46 M0 -18 Q2 -40 4 -52 M0 -18 Q14 -32 20 -42"
          stroke="#4f7a4a"
          strokeWidth={3}
          fill="none"
        />
        <circle cx={-18} cy={-46} r={6} fill="#5f8f56" />
        <circle cx={4} cy={-52} r={7} fill="#6fa565" />
        <circle cx={20} cy={-42} r={6} fill="#5f8f56" />
      </g>
      {JARS.map((colour, index) => (
        <g key={colour} transform={`translate(${470 + index * 34} 214)`}>
          <rect x={-12} y={-30} width={24} height={30} rx={5} fill="#e9f2f2" opacity={0.85} />
          <rect x={-10} y={-18} width={20} height={16} rx={3} fill={colour} opacity={0.75} />
          <circle cx={-4} cy={-12} r={2.5} fill="#ffffff" opacity={0.7} />
          <circle cx={4} cy={-8} r={2.5} fill="#ffffff" opacity={0.5} />
          <rect x={-13} y={-34} width={26} height={6} rx={2} fill="#a07a52" />
          <rect x={-9} y={-28} width={4} height={24} rx={2} fill="#ffffff" opacity={0.5} />
        </g>
      ))}
      <Stack x={612} y={214} colours={STACKS[2] ?? []} />
      <Stack x={668} y={214} colours={STACKS[3] ?? []} />
      <g transform="translate(500 278)">
        <path d="M-34 0 L-30 -34 L30 -34 L34 0 Z" fill="#d9b183" />
        <path d="M-30 -34 L30 -34 M-32 -22 L32 -22 M-33 -10 L33 -10" stroke="#a07a52" strokeWidth={2} />
        <path d="M-24 -34 Q-12 -46 0 -36 Q12 -48 24 -34" fill="#e57a8f" />
      </g>
      <g transform="translate(600 278)">
        <path d="M-30 0 L-27 -30 L27 -30 L30 0 Z" fill="#c99f72" />
        <path d="M-27 -30 L27 -30 M-29 -16 L29 -16" stroke="#8a5c33" strokeWidth={2} />
        <path d="M-22 -30 Q-8 -42 6 -32 Q16 -40 24 -30" fill="#8fcfb2" />
      </g>
      <Stack x={672} y={278} colours={STACKS[1] ?? []} />
    </g>
  );
}

const FLAGS = ["#f08a3c", "#8fcfb2", "#e57a8f", "#f6d36b", "#7b7fd1"];

function Garland() {
  const flags = Array.from({ length: 13 }, (_, index) => 372 + index * 40);
  return (
    <g>
      <path d="M360 40 Q620 92 900 40" fill="none" stroke="#7a5634" strokeWidth={2} />
      {flags.map((x, index) => {
        const t = (x - 360) / 540;
        const y = 40 + Math.sin(t * Math.PI) * 26;
        return (
          <g key={x}>
            <path
              d={`M${x - 13} ${y} L${x + 13} ${y + 1} L${x} ${y + 26} Z`}
              fill={FLAGS[index % FLAGS.length]}
            />
            <path d={`M${x} ${y + 1} L${x + 13} ${y + 1} L${x} ${y + 26} Z`} fill="#2a1b10" opacity={0.12} />
          </g>
        );
      })}
    </g>
  );
}

function HangingPlant({ x }: { readonly x: number }) {
  return (
    <g>
      <path
        d={`M${x} 0 V70 M${x - 22} 96 L${x} 70 L${x + 22} 96`}
        stroke="#8a6a4a"
        strokeWidth={2}
        fill="none"
      />
      <path d={`M${x - 26} 96 H${x + 26} L${x + 20} 122 H${x - 20} Z`} fill="#c06b44" />
      <path d={`M${x + 4} 96 H${x + 26} L${x + 20} 122 H${x + 6} Z`} fill="#8f4a2c" opacity={0.5} />
      {[-30, -16, 0, 14, 28].map((dx, index) => (
        <path
          key={dx}
          d={`M${x + dx * 0.6} 98 Q${x + dx} ${130 + index * 8} ${x + dx * 1.3} ${150 + (index % 2) * 26}`}
          stroke="#4f8a4a"
          strokeWidth={3}
          fill="none"
        />
      ))}
      {[-28, -12, 6, 22, 34].map((dx, index) => (
        <ellipse
          key={dx}
          cx={x + dx * 1.2}
          cy={124 + index * 9 + (index % 2) * 14}
          rx={7}
          ry={4}
          fill={index % 2 === 0 ? "#6fa565" : "#8cc47e"}
          transform={`rotate(${dx} ${x + dx * 1.2} ${124 + index * 9 + (index % 2) * 14})`}
        />
      ))}
    </g>
  );
}

const HATS: readonly (readonly [number, string, string])[] = [
  [1000, "#e9c27a", "#c8604a"],
  [1080, "#7b7fd1", "#f6d36b"],
  [1160, "#e57a8f", "#fff4e2"],
];

function WallNook() {
  return (
    <g>
      <rect x={968} y={120} width={232} height={8} rx={3} fill="#8a5c33" />
      <rect x={968} y={128} width={232} height={4} fill="#3b2a1c" opacity={0.2} />
      {HATS.map(([x, crown, band]) => (
        <g key={x}>
          <circle cx={x} cy={124} r={4} fill="#c9a227" />
          <ellipse cx={x} cy={170} rx={34} ry={9} fill={crown} />
          <path d={`M${x - 20} 170 Q${x - 20} 136 ${x} 136 Q${x + 20} 136 ${x + 20} 170 Z`} fill={crown} />
          <path
            d={`M${x + 4} 137 Q${x + 20} 140 ${x + 20} 170 L${x + 8} 170 Z`}
            fill="#3b2a1c"
            opacity={0.14}
          />
          <rect x={x - 20} y={158} width={40} height={7} fill={band} />
          <path
            d={`M${x - 14} 142 Q${x - 8} 138 ${x - 2} 139`}
            stroke="#ffffff"
            strokeOpacity={0.5}
            strokeWidth={2.5}
            fill="none"
          />
        </g>
      ))}
      <ellipse cx={1084} cy={262} rx={58} ry={74} fill="#c9a227" />
      <ellipse cx={1084} cy={262} rx={50} ry={66} fill="#d8ecf0" />
      <path d="M1052 300 L1110 214" stroke="#ffffff" strokeWidth={14} opacity={0.4} />
      <path d="M1066 316 L1120 238" stroke="#ffffff" strokeWidth={5} opacity={0.4} />
      <ellipse cx={1084} cy={262} rx={50} ry={66} fill="none" stroke="#8a6a1c" strokeWidth={2} />
    </g>
  );
}

function Window({ id, x }: { readonly id: string; readonly x: number }) {
  return (
    <g>
      <path d={`M${x} 300 V140 A90 90 0 0 1 ${x + 180} 140 V300 Z`} fill="#a87c50" />
      <path d={`M${x + 10} 292 V142 A80 80 0 0 1 ${x + 170} 142 V292 Z`} fill={`url(#${id}-street)`} />
      <g fill="#c6b6d6" opacity={0.85}>
        <path
          d={`M${x + 10} 250 L${x + 40} 220 L${x + 70} 236 L${x + 100} 206 L${x + 140} 230 L${x + 170} 214 V292 H${x + 10} Z`}
        />
      </g>
      <g fill="#e9d6b6">
        <rect x={x + 10} y={258} width={160} height={34} />
      </g>
      <path d={`M${x + 90} 62 V292 M${x + 10} 200 H${x + 170}`} stroke="#a87c50" strokeWidth={8} />
      <path d={`M${x + 22} 280 L${x + 70} 150`} stroke="#ffffff" strokeWidth={10} opacity={0.18} />
      <path d={`M${x + 40} 286 L${x + 84} 166`} stroke="#ffffff" strokeWidth={4} opacity={0.2} />
      <rect x={x - 8} y={296} width={196} height={12} rx={3} fill="#c99f72" />
      <rect x={x - 8} y={306} width={196} height={4} fill="#3b2a1c" opacity={0.25} />
    </g>
  );
}

function Room({ width, height, floorY }: BoutiqueRoomProps) {
  const id = useSvgId("boutique-room");
  const vanishX = 560;
  const rays = Array.from({ length: 15 }, (_, index) => -360 + index * 140);
  const seams = [floorY + 22, floorY + 52, floorY + 92, floorY + 144, floorY + 210];
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3dcc0" />
          <stop offset="0.7" stopColor="#f7e7d0" />
          <stop offset="1" stopColor="#ecd2b0" />
        </linearGradient>
        <linearGradient id={`${id}-panel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5f9a92" />
          <stop offset="1" stopColor="#3f7570" />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c99a66" />
          <stop offset="1" stopColor="#8f6238" />
        </linearGradient>
        <linearGradient id={`${id}-street`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bcd6ee" />
          <stop offset="0.7" stopColor="#fdf0d8" />
          <stop offset="1" stopColor="#f6d9a6" />
        </linearGradient>
        <linearGradient id={`${id}-nook`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3c49b" />
          <stop offset="1" stopColor="#cfa877" />
        </linearGradient>
        <linearGradient id={`${id}-shaft`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3cf" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff3cf" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-lamp`}>
          <stop offset="0" stopColor="#ffe6a6" stopOpacity={0.75} />
          <stop offset="0.45" stopColor="#ffe6a6" stopOpacity={0.22} />
          <stop offset="1" stopColor="#ffe6a6" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-rug`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#e9b9a6" />
          <stop offset="0.75" stopColor="#d9907a" />
          <stop offset="1" stopColor="#b86b56" />
        </radialGradient>
      </defs>
      <rect width={width} height={floorY} fill={`url(#${id}-wall)`} />
      <g opacity={0.12}>
        {Array.from({ length: 14 }, (_, index) => (
          <path key={index} d={`M${index * 90 + 20} 16 V${floorY - 100}`} stroke="#c99f72" strokeWidth={22} />
        ))}
      </g>
      <rect width={width} height={18} fill="#c99f72" />
      <rect y={18} width={width} height={6} fill="#3b2a1c" opacity={0.15} />
      <rect y={floorY - 100} width={width} height={100} fill={`url(#${id}-panel)`} />
      <rect y={floorY - 104} width={width} height={8} fill="#2f5f5a" />
      {Array.from({ length: 10 }, (_, index) => (
        <rect
          key={index}
          x={index * 130 + 14}
          y={floorY - 86}
          width={110}
          height={70}
          rx={4}
          fill="none"
          stroke="#2f5f5a"
          strokeWidth={3}
          opacity={0.7}
        />
      ))}
      <Window id={id} x={214} />
      <WallNook />
      <Shelves id={id} />
      <Garland />
      <HangingPlant x={868} />
      <rect y={floorY} width={width} height={height - floorY} fill={`url(#${id}-floor)`} />
      {rays.map((x) => (
        <path
          key={x}
          d={`M${vanishX + (x - vanishX) * 0.22} ${floorY} L${x} ${height}`}
          stroke="#7a4f2a"
          strokeOpacity={0.28}
          strokeWidth={2}
        />
      ))}
      {seams.map((y) => (
        <Plank key={y} x1={0} x2={width} y={y} />
      ))}
      <rect y={floorY} width={width} height={6} fill="#3b2a1c" opacity={0.25} />
      <path
        d={`M226 300 L394 300 L640 ${height} L250 ${height} Z`}
        fill={`url(#${id}-shaft)`}
        opacity={0.75}
      />
      <ellipse cx={470} cy={floorY + 118} rx={300} ry={58} fill="#3b2a1c" opacity={0.12} />
      <ellipse cx={470} cy={floorY + 112} rx={290} ry={54} fill={`url(#${id}-rug)`} />
      <ellipse
        cx={470}
        cy={floorY + 112}
        rx={262}
        ry={47}
        fill="none"
        stroke="#7a3a4a"
        strokeWidth={5}
        opacity={0.35}
      />
      <ellipse
        cx={470}
        cy={floorY + 112}
        rx={240}
        ry={42}
        fill="none"
        stroke="#fff4e2"
        strokeWidth={2}
        opacity={0.35}
      />
      {LAMPS.map(([x, drop]) => (
        <g key={x}>
          <circle cx={x} cy={drop + 40} r={150} fill={`url(#${id}-lamp)`} />
          <path d={`M${x} 0 V${drop}`} stroke="#4a3a2a" strokeWidth={2} />
          <path d={`M${x - 26} ${drop + 26} Q${x} ${drop - 12} ${x + 26} ${drop + 26} Z`} fill="#2f6f6a" />
          <path
            d={`M${x - 26} ${drop + 26} Q${x} ${drop + 20} ${x + 26} ${drop + 26}`}
            fill="none"
            stroke="#c9a227"
            strokeWidth={2}
          />
          <ellipse cx={x} cy={drop + 28} rx={12} ry={6} fill="#fff6d6" />
        </g>
      ))}
    </g>
  );
}

export const BoutiqueRoom = memo(Room);
