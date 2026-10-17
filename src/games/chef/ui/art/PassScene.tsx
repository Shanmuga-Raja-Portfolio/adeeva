import { useSvgId } from "../../../../ui/art/useSvgId";

const LAMPS = [
  { x: 380, drop: 104 },
  { x: 650, drop: 70 },
  { x: 960, drop: 112 },
] as const;

const TICKETS = [
  { x: 30, turn: -4, table: "Table 2", lines: ["2 x soup", "1 x rice"] },
  { x: 172, turn: 3, table: "Table 5", lines: ["1 x salad", "no onion"] },
  { x: 770, turn: -2, table: "Table 7", lines: ["3 x stew", "+ bread"] },
] as const;

const LIP = 240;

function PlateStack({ x, y }: { readonly x: number; readonly y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={6} cy={34} rx={84} ry={20} fill="#1f262a" opacity={0.25} />
      {[24, 16, 8, 0].map((lift) => (
        <g key={lift} transform={`translate(0 ${lift})`}>
          <ellipse rx={76} ry={22} fill="#e9e4da" />
          <ellipse cy={-3} rx={76} ry={21} fill="#fbf8f1" stroke="#d6cfc2" strokeWidth={1.5} />
        </g>
      ))}
      <ellipse cy={-3} rx={44} ry={12} fill="#f1ece2" stroke="#e1dace" strokeWidth={1.5} />
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
          <ellipse cx={3} cy={16} rx={30} ry={9} fill="#1f262a" opacity={0.22} />
          <path d="M-26 0 L-22 16 Q0 22 22 16 L26 0 Z" fill="#f4efe4" stroke="#c9bca5" strokeWidth={1.5} />
          <ellipse rx={26} ry={8} fill="#fbf8f1" stroke="#c9bca5" strokeWidth={1.5} />
          <ellipse cy={1} rx={20} ry={5.5} fill={String(fill)} />
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
          <stop offset="0" stopColor="#2c3438" />
          <stop offset="1" stopColor="#3d4549" />
        </linearGradient>
        <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9eef0" />
          <stop offset="0.12" stopColor="#c3ccd0" />
          <stop offset="0.6" stopColor="#9aa6ac" />
          <stop offset="1" stopColor="#6f7c83" />
        </linearGradient>
        <linearGradient id={`${id}-cone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd58a" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffb347" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={`${id}-lip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#d5dde0" />
          <stop offset="1" stopColor="#8c989e" />
        </linearGradient>
        <radialGradient id={`${id}-pool`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe2a8" stopOpacity={0.7} />
          <stop offset="1" stopColor="#ffe2a8" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1200} height={560} fill={`url(#${id}-wall)`} />
      {Array.from({ length: 12 }, (_, row) => (
        <path key={row} d={`M0 ${row * 34} H1200`} stroke="#1f262a" strokeWidth={2} opacity={0.5} />
      ))}
      {Array.from({ length: 12 }, (_, row) =>
        Array.from({ length: 18 }, (__, column) => (
          <path
            key={`${row}-${column}`}
            d={`M${column * 70 + (row % 2 === 0 ? 0 : 35)} ${row * 34} v34`}
            stroke="#1f262a"
            strokeWidth={2}
            opacity={0.4}
          />
        )),
      )}
      <rect x={0} y={56} width={1200} height={10} fill="#8c989e" />
      <rect x={0} y={64} width={1200} height={4} fill="#5f6c73" />
      {[...TICKETS, { x: 1056, turn: 4, table: "Order up", lines: [dishName, "x 1"] }].map((ticket) => (
        <g key={ticket.x} transform={`translate(${ticket.x} 62) rotate(${ticket.turn})`}>
          <rect x={3} y={5} width={128} height={140} rx={3} fill="#0d1215" opacity={0.3} />
          <rect width={128} height={140} rx={3} fill="#fffdf6" />
          <rect width={128} height={28} fill={ticket.table === "Order up" ? "#d9472b" : "#f2a93b"} />
          <circle cx={64} cy={-2} r={6} fill="#c9563a" stroke="#8f2a14" strokeWidth={1.5} />
          <text x={64} y={21} textAnchor="middle" className="ck-pass__ticket-head">
            {ticket.table}
          </text>
          {ticket.lines.map((line, index) => (
            <text key={line} x={10} y={60 + index * 30} className="ck-pass__ticket-line">
              {line.length > 11 ? `${line.slice(0, 10)}…` : line}
            </text>
          ))}
          <path
            d="M10 118 h56 M10 130 h36"
            stroke="#2e3a40"
            strokeWidth={2.5}
            opacity={0.25}
            strokeLinecap="round"
          />
        </g>
      ))}
      {LAMPS.map(({ x, drop }) => (
        <g key={x}>
          <path
            d={`M${x - 60} ${drop} L${x + 60} ${drop} L${x + 150} ${LIP + 40} L${x - 150} ${LIP + 40} Z`}
            fill={`url(#${id}-cone)`}
          />
          <rect x={x - 3} y={0} width={6} height={drop - 38} fill="#5f6c73" />
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
          <ellipse cx={x} cy={drop + 1} rx={70} ry={16} fill="#ffd58a" opacity={0.35} />
        </g>
      ))}
      <rect x={0} y={LIP} width={1200} height={560 - LIP} fill={`url(#${id}-steel)`} />
      {Array.from({ length: 40 }, (_, row) => (
        <path
          key={row}
          d={`M0 ${LIP + 10 + row * 8} H1200`}
          stroke={row % 3 === 0 ? "#ffffff" : "#4f5b61"}
          strokeWidth={0.8}
          opacity={row % 3 === 0 ? 0.16 : 0.1}
        />
      ))}
      {[-200, 300, 900, 1400].map((x) => (
        <path
          key={x}
          d={`M${600 + (x - 600) * 0.7} ${LIP + 6} L${x} 560`}
          stroke="#5f6c73"
          strokeWidth={2}
          opacity={0.3}
        />
      ))}
      {LAMPS.map(({ x }) => (
        <ellipse
          key={`pool-${x}`}
          cx={x}
          cy={LIP + 70}
          rx={210}
          ry={56}
          fill={`url(#${id}-pool)`}
          opacity={0.75}
        />
      ))}
      <rect x={0} y={LIP - 8} width={1200} height={14} rx={5} fill={`url(#${id}-lip)`} />
      <path d={`M0 ${LIP - 6} H1200`} stroke="#ffffff" strokeWidth={2.5} opacity={0.9} />
      <rect x={0} y={LIP + 6} width={1200} height={18} fill="#1f262a" opacity={0.18} />
      <PlateStack x={140} y={380} />
      <Ramekins x={250} y={470} />
    </svg>
  );
}
