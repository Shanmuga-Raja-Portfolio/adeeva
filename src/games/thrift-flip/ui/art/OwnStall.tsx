export interface OwnStallProps {
  readonly id: string;
  readonly sign: string;
  readonly left: number;
  readonly right: number;
  readonly floor: number;
  readonly rail: number;
  readonly bareHooks: readonly number[];
}

const STALL_ROOF = 34;

export function OwnStallDefs({ id }: { readonly id: string }) {
  return (
    <>
      <linearGradient id={`${id}-awning`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity={0.35} />
        <stop offset="0.6" stopColor="#ffffff" stopOpacity={0} />
        <stop offset="1" stopColor="#5b3a1e" stopOpacity={0.22} />
      </linearGradient>
      <linearGradient id={`${id}-post`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#c99f72" />
        <stop offset="0.5" stopColor="#9a7048" />
        <stop offset="1" stopColor="#6b4a2b" />
      </linearGradient>
      <linearGradient id={`${id}-quiltshade`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3b2a1c" stopOpacity={0.42} />
        <stop offset="0.28" stopColor="#3b2a1c" stopOpacity={0.08} />
        <stop offset="0.7" stopColor="#fff4dc" stopOpacity={0.12} />
        <stop offset="1" stopColor="#3b2a1c" stopOpacity={0.2} />
      </linearGradient>
      <pattern id={`${id}-quilt`} width={64} height={64} patternUnits="userSpaceOnUse">
        <rect width={32} height={32} fill="#f3dcc0" />
        <rect x={32} width={32} height={32} fill="#cfe6d8" />
        <rect y={32} width={32} height={32} fill="#e9cfe0" />
        <rect x={32} y={32} width={32} height={32} fill="#f6e6b8" />
        <circle cx={16} cy={16} r={3} fill="#e8b48f" opacity={0.6} />
        <circle cx={48} cy={48} r={3} fill="#e0c06e" opacity={0.6} />
        <path d="M44 8 l8 8 M52 8 l-8 8" stroke="#9cc7b0" strokeWidth={1.4} />
        <path d="M8 40 h16 M8 46 h16 M8 52 h16" stroke="#d3a8c2" strokeWidth={1.4} />
        <path
          d="M2 0 V64 M34 0 V64 M0 2 H64 M0 34 H64"
          stroke="#a07a52"
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.45}
        />
      </pattern>
      <pattern id={`${id}-folds`} width={46} height={400} patternUnits="userSpaceOnUse">
        <rect width={20} height={400} fill="#ffffff" opacity={0.18} />
        <rect x={38} width={8} height={400} fill="#8a6a4a" opacity={0.1} />
      </pattern>
    </>
  );
}

export function OwnStall({ id, sign, left, right, floor, rail, bareHooks }: OwnStallProps) {
  const width = right - left;
  const stripes = Math.round((width + 40) / 34);
  const stripe = (width + 40) / stripes;
  const centre = (left + right) / 2;
  const top = STALL_ROOF + 46;
  return (
    <g>
      <rect x={left} y={top} width={width} height={floor - top} fill={`url(#${id}-quilt)`} />
      <rect x={left} y={top} width={width} height={floor - top} fill={`url(#${id}-folds)`} />
      <rect x={left} y={top} width={width} height={floor - top} fill={`url(#${id}-quiltshade)`} />
      <rect x={left} y={top} width={width} height={22} fill="#5b3a1e" opacity={0.16} />
      {[left - 6, right - 8].map((x) => (
        <rect
          key={x}
          x={x}
          y={STALL_ROOF}
          width={14}
          height={floor - STALL_ROOF + 4}
          rx={3}
          fill={`url(#${id}-post)`}
        />
      ))}
      <path
        d={`M${left - 20} ${top + 4} H${right + 20} V${top + 22} Q${centre} ${top + 34} ${left - 20} ${top + 22} Z`}
        fill="#5b3a1e"
        opacity={0.18}
      />
      <g>
        {Array.from({ length: stripes }, (_, index) => {
          const x = left - 20 + index * stripe;
          return (
            <path
              key={index}
              d={`M${x} ${STALL_ROOF} L${x + stripe} ${STALL_ROOF} L${x + stripe} ${top} Q${x + stripe / 2} ${top + 18} ${x} ${top} Z`}
              fill={index % 2 === 0 ? "#f08a3c" : "#fff4e2"}
            />
          );
        })}
        <rect x={left - 20} y={STALL_ROOF} width={width + 40} height={46} fill={`url(#${id}-awning)`} />
      </g>
      <path
        d={`M${left - 24} ${STALL_ROOF} H${right + 24}`}
        stroke="#b85a17"
        strokeWidth={6}
        strokeLinecap="round"
      />
      <g transform={`translate(${centre} ${top + 6})`}>
        <path d="M-62 0 L-62 14 M62 0 L62 14" stroke="#6b5235" strokeWidth={2} />
        <rect x={-92} y={14} width={184} height={34} rx={9} fill="#2f3d38" stroke="#a07a52" strokeWidth={4} />
        <rect x={-86} y={19} width={172} height={6} rx={3} fill="#ffffff" opacity={0.06} />
        <text
          x={0}
          y={38}
          textAnchor="middle"
          fontFamily="'Segoe Print', 'Bradley Hand', 'Comic Sans MS', system-ui"
          fontSize={18}
          fill="#f6f2e4"
        >
          {sign}
        </text>
      </g>
      <path
        d={`M${left + 14} ${rail} H${right - 14}`}
        stroke="#6f747e"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path
        d={`M${left + 14} ${rail - 2} H${right - 14}`}
        stroke="#d4d8de"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {bareHooks.map((x, index) => (
        <g key={x} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={`M${x} ${rail - 4} q8 0 8 7 q0 6 -8 8 v4`} stroke="#8a8f99" strokeWidth={2.5} />
          <g transform={`translate(${x} ${rail + 18}) rotate(${index % 2 === 0 ? -8 : 7})`}>
            <path d="M0 -4 V4" stroke="#a07a52" strokeWidth={1.5} />
            <path d="M-11 4 L11 4 L11 30 L0 38 L-11 30 Z" fill="#e8d9bd" stroke="#a07a52" strokeWidth={2} />
            <circle cx={0} cy={11} r={2.5} fill="#fff8ec" stroke="#a07a52" strokeWidth={1} />
            <path d="M-6 20 H6 M-5 26 H5" stroke="#f08a3c" strokeWidth={2} />
          </g>
        </g>
      ))}
    </g>
  );
}
