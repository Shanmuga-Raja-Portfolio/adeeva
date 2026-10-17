export interface ParlourCabinetProps {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

const SHELF_CAKES: readonly [number, number, string, string][] = [
  [38, 92, "#f2c4c9", "#fff4f6"],
  [100, 92, "#cfe3bb", "#f4faef"],
  [162, 92, "#f6df7c", "#fffaf0"],
  [52, 162, "#b9a7dc", "#f7f3ff"],
  [148, 162, "#f4c49a", "#fff4e8"],
];

function ShelfCake({
  x,
  y,
  colour,
  cream,
}: {
  readonly x: number;
  readonly y: number;
  readonly colour: string;
  readonly cream: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={24} ry={4} fill="#ffffff" stroke="#d8cbb5" />
      <rect x={-18} y={-26} width={36} height={24} rx={3} fill={colour} />
      <rect x={6} y={-26} width={12} height={24} rx={3} fill="#3b2620" opacity={0.08} />
      <ellipse cx={0} cy={-26} rx={18} ry={4.5} fill={cream} />
      <path
        d="M-18 -22 Q-13 -16 -8 -22 Q-3 -16 2 -22 Q7 -16 12 -22 Q15 -18 18 -22"
        stroke={cream}
        strokeWidth={2.4}
        fill="none"
      />
      <circle cx={0} cy={-31} r={3.4} fill="#b0213f" />
    </g>
  );
}

export function ParlourCabinet({ id, x, y }: ParlourCabinetProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a5a42" />
          <stop offset="0.5" stopColor="#a87452" />
          <stop offset="1" stopColor="#6b4232" />
        </linearGradient>
        <linearGradient id={`${id}-inside`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4dc" />
          <stop offset="1" stopColor="#f3dcc0" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.55} />
          <stop offset="0.3" stopColor="#ffffff" stopOpacity={0.05} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity={0.28} />
          <stop offset="0.62" stopColor="#ffffff" stopOpacity={0.04} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0.12} />
        </linearGradient>
      </defs>
      <ellipse cx={100} cy={262} rx={120} ry={12} fill="#3b2620" opacity={0.22} />
      <path d="M-6 30 Q100 -6 206 30 V40 H-6 Z" fill="#6b4232" />
      <rect x={0} y={36} width={200} height={226} rx={6} fill={`url(#${id}-wood)`} />
      <rect x={12} y={46} width={176} height={140} rx={4} fill={`url(#${id}-inside)`} />
      <rect x={12} y={46} width={176} height={140} rx={4} fill="#f4a259" opacity={0.08} />
      <rect x={12} y={94} width={176} height={6} fill="#c9a985" />
      <rect x={12} y={164} width={176} height={6} fill="#c9a985" />
      {SHELF_CAKES.map(([cx, cy, colour, cream]) => (
        <ShelfCake key={`${cx}-${cy}`} x={cx} y={cy} colour={colour} cream={cream} />
      ))}
      <g transform="translate(100 162)">
        <ellipse cx={0} cy={0} rx={20} ry={4} fill="#ffffff" stroke="#d8cbb5" />
        {[-12, 0, 12].map((dx) => (
          <g key={dx}>
            <ellipse cx={dx} cy={-6} rx={7} ry={4} fill={dx === 0 ? "#9fd0ee" : "#f2c4c9"} />
            <rect x={dx - 6} y={-9} width={12} height={2.4} fill="#fffaf0" />
            <ellipse cx={dx} cy={-11} rx={7} ry={3.6} fill={dx === 0 ? "#9fd0ee" : "#f2c4c9"} />
          </g>
        ))}
      </g>
      <rect x={12} y={46} width={176} height={140} rx={4} fill={`url(#${id}-glass)`} />
      <path d="M100 46 V186" stroke="#6b4232" strokeWidth={6} />
      <rect x={12} y={46} width={176} height={140} rx={4} fill="none" stroke="#5d3a2a" strokeWidth={4} />
      {[92, 108].map((kx) => (
        <circle key={kx} cx={kx} cy={120} r={3.5} fill="#c9a227" />
      ))}
      <rect x={12} y={196} width={84} height={56} rx={4} fill="#9a6544" stroke="#5d3a2a" strokeWidth={3} />
      <rect x={104} y={196} width={84} height={56} rx={4} fill="#9a6544" stroke="#5d3a2a" strokeWidth={3} />
      <rect
        x={22}
        y={206}
        width={64}
        height={36}
        rx={3}
        fill="none"
        stroke="#fff1cf"
        strokeOpacity={0.25}
        strokeWidth={2}
      />
      <rect
        x={114}
        y={206}
        width={64}
        height={36}
        rx={3}
        fill="none"
        stroke="#fff1cf"
        strokeOpacity={0.25}
        strokeWidth={2}
      />
      <circle cx={88} cy={224} r={3.5} fill="#c9a227" />
      <circle cx={112} cy={224} r={3.5} fill="#c9a227" />
      <g transform="translate(60 30)">
        <path d="M-12 0 L-9 -22 H9 L12 0 Z" fill="#c8d6ee" stroke="#8fa3c8" />
        {[
          [-12, -40, "#f2c4c9"],
          [0, -48, "#fff1cf"],
          [12, -38, "#e98aa6"],
          [-4, -30, "#b9a7dc"],
        ].map(([dx, dy, colour]) => (
          <g key={`${dx}-${dy}`}>
            <path
              d={`M0 -20 Q${Number(dx) / 2} ${Number(dy) / 2 - 6} ${dx} ${dy}`}
              stroke="#6f9152"
              strokeWidth={2}
              fill="none"
            />
            <circle
              cx={Number(dx)}
              cy={Number(dy)}
              r={7}
              fill={String(colour)}
              stroke="#ffffff"
              strokeWidth={1.2}
            />
          </g>
        ))}
      </g>
      <g transform="translate(146 30)">
        <ellipse cx={0} cy={0} rx={30} ry={5} fill="#fbf8f2" stroke="#cbbca6" />
        <rect x={-20} y={-28} width={40} height={26} rx={4} fill="#f7d8e4" />
        <ellipse cx={0} cy={-28} rx={20} ry={5} fill="#fff4f8" />
        <path
          d="M-26 -2 V-34 Q-26 -58 0 -60 Q26 -58 26 -34 V-2"
          fill={`url(#${id}-glass)`}
          stroke="#ffffff"
          strokeOpacity={0.85}
          strokeWidth={1.6}
        />
        <circle cx={0} cy={-63} r={4} fill="#c9a227" />
      </g>
    </g>
  );
}
