import { useSvgId } from "../../../../ui/art/useSvgId";

const LAMPS = [
  { x: 300, drop: 96, glow: 0.55 },
  { x: 600, drop: 74, glow: 1 },
  { x: 860, drop: 96, glow: 0.45 },
] as const;

const LIP = 250;

const BRICKS: readonly (readonly [number, number, number])[] = Array.from({ length: 56 }, (_, index) => {
  const row = index % 8;
  const column = (index * 7) % 18;
  const tone = ((index * 37) % 11) / 10 - 0.5;
  return [row, column, tone * 0.36] as const;
});

function PlateStack({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={6} cy={34} rx={84} ry={20} fill="#2a1a10" opacity={0.3} />
      {[24, 16, 8, 0].map((lift) => (
        <g key={lift} transform={`translate(0 ${lift})`}>
          <ellipse rx={76} ry={22} fill="#e9e1d2" />
          <ellipse cy={-3} rx={76} ry={21} fill="#fdf9f0" stroke="#d6cbb6" strokeWidth={1.5} />
        </g>
      ))}
      <ellipse cy={-3} rx={44} ry={12} fill="#f3ecdf" stroke="#e1d6c2" strokeWidth={1.5} />
      <ellipse cx={-30} cy={-8} rx={26} ry={5} fill="#ffffff" opacity={0.7} />
    </g>
  );
}

function Ramekins({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[
        [0, 0, "#4f8a3c"],
        [58, 10, "#d9472b"],
        [26, 34, "#f2a93b"],
      ].map(([dx = 0, dy = 0, fill = "#4f8a3c"]) => (
        <g key={`${dx}-${dy}`} transform={`translate(${dx} ${dy})`}>
          <ellipse cx={4} cy={18} rx={32} ry={9} fill="#2a1a10" opacity={0.28} />
          <path d="M-26 0 L-22 16 Q0 22 22 16 L26 0 Z" fill="#f4efe4" stroke="#c9bca5" strokeWidth={1.5} />
          <ellipse rx={26} ry={8} fill="#fbf8f1" stroke="#c9bca5" strokeWidth={1.5} />
          <ellipse cy={1} rx={20} ry={5.5} fill={String(fill)} />
          <ellipse cx={-6} cy={-1} rx={7} ry={1.6} fill="#ffffff" opacity={0.55} />
        </g>
      ))}
    </g>
  );
}

export interface PassSceneProps {
  readonly dishName: string;
  readonly className?: string | undefined;
}

export function PassScene({ dishName, className }: PassSceneProps) {
  const id = useSvgId("ck-pass");
  return (
    <svg
      viewBox="0 0 1200 560"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a2c1e" />
          <stop offset="1" stopColor="#74452c" />
        </linearGradient>
        <radialGradient id={`${id}-backglow`} cx="0.5" cy="0.4" r="0.5">
          <stop offset="0" stopColor="#ffb85a" stopOpacity={0.45} />
          <stop offset="1" stopColor="#ffb85a" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbefdc" />
          <stop offset="0.14" stopColor="#dcc6a8" />
          <stop offset="0.6" stopColor="#b3916c" />
          <stop offset="1" stopColor="#7a5a3e" />
        </linearGradient>
        <radialGradient id={`${id}-cone`} cx="0.5" cy="0" r="1">
          <stop offset="0" stopColor="#ffe0a0" stopOpacity={0.75} />
          <stop offset="0.45" stopColor="#ffc46a" stopOpacity={0.22} />
          <stop offset="1" stopColor="#ffb347" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-lip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#ddd3c4" />
          <stop offset="1" stopColor="#8e8273" />
        </linearGradient>
        <radialGradient id={`${id}-pool`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe6b0" stopOpacity={0.9} />
          <stop offset="0.5" stopColor="#ffcf80" stopOpacity={0.3} />
          <stop offset="1" stopColor="#ffcf80" stopOpacity={0} />
        </radialGradient>
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={2} seed={5} />
          <feColorMatrix values="0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0 0.06  0 0 0 0.6 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.5" r="0.7">
          <stop offset="0.55" stopColor="#140c08" stopOpacity={0} />
          <stop offset="1" stopColor="#140c08" stopOpacity={0.55} />
        </radialGradient>
      </defs>
      <rect width={1200} height={560} fill={`url(#${id}-wall)`} />
      {Array.from({ length: 8 }, (_, row) => (
        <path key={row} d={`M0 ${row * 34} H1200`} stroke="#1c1310" strokeWidth={2} opacity={0.55} />
      ))}
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 18 }, (__, column) => (
          <path
            key={`${row}-${column}`}
            d={`M${column * 70 + (row % 2 === 0 ? 0 : 35)} ${row * 34} v34`}
            stroke="#1c1310"
            strokeWidth={2}
            opacity={0.45}
          />
        )),
      )}
      {BRICKS.map(([row, column, tone]) => (
        <rect
          key={`brick-${row}-${column}`}
          x={column * 70 + (row % 2 === 0 ? 0 : 35) + 2}
          y={row * 34 + 2}
          width={66}
          height={30}
          fill={tone > 0 ? "#c98a5c" : "#2a160c"}
          opacity={Math.abs(tone)}
        />
      ))}
      <rect width={1200} height={LIP} fill="#000000" filter={`url(#${id}-grain)`} opacity={0.5} />
      <ellipse cx={600} cy={180} rx={520} ry={220} fill={`url(#${id}-backglow)`} />
      <rect x={0} y={44} width={1200} height={10} fill="#a39686" />
      <rect x={0} y={52} width={1200} height={4} fill="#5f5448" />
      <g transform="translate(990 46) rotate(3)">
        <rect x={4} y={6} width={150} height={150} rx={3} fill="#0d0805" opacity={0.35} />
        <rect width={150} height={150} rx={3} fill="#fffdf6" />
        <rect width={150} height={32} fill="#d9472b" />
        <circle cx={75} cy={-2} r={7} fill="#c9563a" stroke="#8f2a14" strokeWidth={1.5} />
        <text x={75} y={23} textAnchor="middle" className="ck-pass__ticket-head">
          Order up!
        </text>
        <text x={12} y={70} className="ck-pass__ticket-line">
          {dishName.length > 12 ? `${dishName.slice(0, 11)}…` : dishName}
        </text>
        <text x={12} y={102} className="ck-pass__ticket-line">
          x 1
        </text>
        <path d="M12 128 h70" stroke="#2e3a40" strokeWidth={2.5} opacity={0.25} strokeLinecap="round" />
      </g>
      {LAMPS.map(({ x, drop, glow }) => (
        <g key={x}>
          <path
            d={`M${x - 56} ${drop} L${x + 56} ${drop} L${x + 210} ${LIP + 60} L${x - 210} ${LIP + 60} Z`}
            fill={`url(#${id}-cone)`}
            opacity={glow}
          />
          <rect x={x - 3} y={0} width={6} height={drop - 38} fill="#5f5448" />
          <path
            d={`M${x - 58} ${drop} Q${x} ${drop - 58} ${x + 58} ${drop} Z`}
            fill="#c9563a"
            stroke="#8f2a14"
            strokeWidth={3}
          />
          <path
            d={`M${x - 40} ${drop - 16} Q${x - 20} ${drop - 38} ${x + 6} ${drop - 42}`}
            stroke="#ffffff"
            strokeWidth={4}
            opacity={0.35}
            fill="none"
          />
          <ellipse cx={x} cy={drop + 1} rx={46} ry={8} fill="#fff3c8" />
          <ellipse cx={x} cy={drop + 4} rx={80} ry={20} fill="#ffd58a" opacity={0.3 * glow} />
        </g>
      ))}
      <rect x={0} y={LIP} width={1200} height={560 - LIP} fill={`url(#${id}-steel)`} />
      {Array.from({ length: 40 }, (_, row) => (
        <path
          key={row}
          d={`M0 ${LIP + 10 + row * 8} H1200`}
          stroke={row % 3 === 0 ? "#ffffff" : "#5a4e42"}
          strokeWidth={0.8}
          opacity={row % 3 === 0 ? 0.18 : 0.1}
        />
      ))}
      {LAMPS.map(({ x, glow }) => (
        <ellipse
          key={`pool-${x}`}
          cx={x}
          cy={LIP + 120}
          rx={300}
          ry={110}
          fill={`url(#${id}-pool)`}
          opacity={glow}
        />
      ))}
      <rect x={0} y={LIP - 8} width={1200} height={14} rx={5} fill={`url(#${id}-lip)`} />
      <path d={`M0 ${LIP - 6} H1200`} stroke="#ffffff" strokeWidth={2.5} opacity={0.9} />
      <rect x={0} y={LIP + 6} width={1200} height={18} fill="#2a1a10" opacity={0.2} />
      <PlateStack x={150} y={380} />
      <Ramekins x={210} y={468} />
      <rect width={1200} height={560} fill={`url(#${id}-vignette)`} />
    </svg>
  );
}
