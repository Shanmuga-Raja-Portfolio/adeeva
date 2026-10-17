import { useSvgId } from "../../../../ui/art/useSvgId";

export interface ServingTableProps {
  readonly className?: string | undefined;
}

const SCALLOPS = Array.from({ length: 20 }, (_, index) => index);
const FOLDS = [70, 140, 210, 390, 460, 530];
const VALANCE = Array.from({ length: 24 }, (_, index) => {
  const x = 594 - index * 24.5;
  return `Q${x - 12.25} 112 ${x - 24.5} 96`;
}).join(" ");
const LACE_HOLES = Array.from({ length: 24 }, (_, index) => 18 + index * 24.5);
const DOTS: readonly (readonly [number, number])[] = Array.from({ length: 36 }, (_, index) => [
  40 + (index % 12) * 46 + (Math.floor(index / 12) % 2) * 23,
  128 + Math.floor(index / 12) * 26,
]);
const BLOOMS: readonly (readonly [number, number, string])[] = [
  [-12, -52, "#f2a7bd"],
  [0, -60, "#fff1cf"],
  [12, -50, "#b9a7dc"],
  [-4, -44, "#f7c548"],
  [8, -42, "#f2a7bd"],
];

function hem(): string {
  return SCALLOPS.map((index) => {
    const x = 14 + index * 28.6;
    return `Q${x + 14.3} ${index % 2 === 0 ? 212 : 204} ${x + 28.6} 196`;
  }).join(" ");
}

function Cup({ x, tint }: { readonly x: number; readonly tint: string }) {
  return (
    <g transform={`translate(${x} 60)`}>
      <ellipse cx={0} cy={4} rx={20} ry={5} fill="#3b2620" opacity={0.16} />
      <ellipse cx={0} cy={2} rx={18} ry={4.5} fill="#ffffff" stroke="#e0d4c2" strokeWidth={1.2} />
      <path d="M-11 0 Q-12 -18 0 -18 Q12 -18 11 0 Z" fill="#ffffff" stroke="#e0d4c2" strokeWidth={1.2} />
      <path d="M-11 -9 H11" stroke={tint} strokeWidth={2.4} />
      <path d="M11 -13 Q19 -12 17 -5 Q15 -1 10 -3" fill="none" stroke="#e0d4c2" strokeWidth={2} />
      <ellipse cx={0} cy={-17} rx={9} ry={2.4} fill="#b9773a" />
      <path
        className="pa-steam"
        d="M-3 -24 Q-8 -34 -2 -42 Q4 -50 -1 -60"
        fill="none"
        stroke="#ffffff"
        strokeWidth={3}
        strokeLinecap="round"
        opacity={0.7}
      />
    </g>
  );
}

export function ServingTable({ className }: ServingTableProps) {
  const id = useSvgId("serving");
  return (
    <svg className={className} viewBox="0 0 600 230" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-cloth`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#dccdb0" />
          <stop offset="0.3" stopColor="#fffbf2" />
          <stop offset="0.65" stopColor="#f8f0e0" />
          <stop offset="1" stopColor="#cdb994" />
        </linearGradient>
        <linearGradient id={`${id}-drop`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b2620" stopOpacity={0.22} />
          <stop offset="0.25" stopColor="#3b2620" stopOpacity={0} />
          <stop offset="1" stopColor="#3b2620" stopOpacity={0.12} />
        </linearGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdfa" />
          <stop offset="1" stopColor="#f4ecdc" />
        </linearGradient>
        <radialGradient id={`${id}-floor`}>
          <stop offset="0" stopColor="#2a1a14" stopOpacity={0.55} />
          <stop offset="1" stopColor="#2a1a14" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbe6a6" />
          <stop offset="0.5" stopColor="#e2bd5c" />
          <stop offset="1" stopColor="#b8902f" />
        </linearGradient>
      </defs>
      <ellipse cx={300} cy={216} rx={310} ry={16} fill={`url(#${id}-floor)`} />
      <path d="M26 48 H574 L594 74 H6 Z" fill={`url(#${id}-top)`} stroke="#e0d3b8" strokeWidth={2} />
      <path d={`M6 74 H594 Q596 140 586 196 L14 196 Q4 140 6 74 Z`} fill={`url(#${id}-cloth)`} />
      <path d={`M14 196 ${hem()}`} fill={`url(#${id}-cloth)`} />
      <path d={`M14 196 ${hem()}`} fill="none" stroke="#7fa363" strokeWidth={3} />
      <path d={`M6 74 H594 Q596 140 586 196 L14 196 Q4 140 6 74 Z`} fill={`url(#${id}-drop)`} />
      {FOLDS.map((x) => (
        <path
          key={x}
          d={`M${x} 80 Q${x - 6} 140 ${x + 2} 198`}
          stroke="#b59f78"
          strokeOpacity={0.3}
          strokeWidth={2.4}
          fill="none"
        />
      ))}
      {SCALLOPS.map((index) => (
        <circle
          key={index}
          cx={28.3 + index * 28.6}
          cy={index % 2 === 0 ? 205 : 200}
          r={3}
          fill="#f4faef"
          stroke="#7fa363"
          strokeWidth={1.2}
        />
      ))}
      <path d={`M6 74 H594 V96 ${VALANCE} Z`} fill="#fffaf6" />
      <path d={`M594 96 ${VALANCE}`} fill="none" stroke="#b9cfa2" strokeWidth={2} />
      {LACE_HOLES.map((x) => (
        <circle key={x} cx={x} cy={88} r={2.6} fill="#d6e4c6" />
      ))}
      {DOTS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={3.2} fill="#ffffff" opacity={0.55} />
      ))}
      <path d="M6 74 H594" stroke="#ffffff" strokeWidth={3} strokeOpacity={0.85} />
      <path d="M232 74 H368 V196 L300 210 L232 196 Z" fill="#a9c98b" opacity={0.55} />
      <path
        d="M232 74 V196 L300 210 L368 196 V74"
        fill="none"
        stroke="#6f9152"
        strokeWidth={2}
        opacity={0.6}
      />
      <g transform="translate(300 150)">
        <ellipse cx={0} cy={3} rx={74} ry={22} fill="#3b2620" opacity={0.16} />
        <ellipse cx={0} cy={0} rx={72} ry={21} fill={`url(#${id}-brass)`} stroke="#8a6a2a" strokeWidth={2} />
        <ellipse cx={0} cy={0} rx={64} ry={15} fill="none" stroke="#fff4cf" strokeWidth={1.4} opacity={0.8} />
        <text
          x={0}
          y={5}
          textAnchor="middle"
          fontSize={14}
          fontWeight={700}
          fontFamily="var(--font-display)"
          fill="#4a2c1e"
        >
          Comet Room
        </text>
      </g>
      <path d="M40 54 H300" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      <Cup x={168} tint="#f2c4c9" />
      <Cup x={206} tint="#b9a7dc" />
      <g transform="translate(520 62)">
        <ellipse cx={0} cy={2} rx={26} ry={5} fill="#3b2620" opacity={0.14} />
        <path
          d="M-12 0 Q-16 -26 -6 -34 H6 Q16 -26 12 0 Z"
          fill="#e8f2fb"
          stroke="#b9cbe0"
          strokeWidth={1.4}
        />
        {BLOOMS.map(([dx, dy, fill]) => (
          <g key={`${dx}-${dy}`}>
            <path
              d={`M0 -32 Q${dx / 2} ${dy / 2 - 10} ${dx} ${dy}`}
              stroke="#6f9152"
              strokeWidth={2}
              fill="none"
            />
            <circle cx={dx} cy={dy} r={7} fill={fill} stroke="#ffffff" strokeWidth={1.2} />
            <circle cx={dx} cy={dy} r={2.4} fill="#f7c548" />
          </g>
        ))}
      </g>
    </svg>
  );
}
