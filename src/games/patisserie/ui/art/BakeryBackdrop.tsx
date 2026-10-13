import { useSvgId } from "../../../../ui/art/useSvgId";
import { ShopSign } from "./ShopSign";

export interface BakeryBackdropProps {
  readonly className?: string | undefined;
  readonly evening?: boolean | undefined;
}

const AWNING_STRIPES = Array.from({ length: 16 }, (_, index) => index);
const TILE_ROWS = Array.from({ length: 13 }, (_, index) => index);
const HOUSES: [number, number, number, string][] = [
  [452, 250, 70, "#f2c7a5"],
  [528, 228, 64, "#c8d6ee"],
  [598, 262, 58, "#f6e1a8"],
  [662, 236, 72, "#cfe3bb"],
  [740, 256, 60, "#f3c3c9"],
];

export function BakeryBackdrop({ className, evening = false }: BakeryBackdropProps) {
  const id = useSvgId("bakery");
  return (
    <svg
      className={className}
      viewBox="0 0 1200 640"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={evening ? "#f7b98a" : "#bfe0f5"} />
          <stop offset="1" stopColor={evening ? "#fde3c4" : "#f6f0de"} />
        </linearGradient>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#f6ead6" />
        </linearGradient>
        <linearGradient id={`${id}-counter`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5a42" />
          <stop offset="1" stopColor="#5d3a2a" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.5} />
          <stop offset="0.4" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="0.6" stopColor="#ffffff" stopOpacity={0.18} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
        <pattern id={`${id}-floor`} width="80" height="40" patternUnits="userSpaceOnUse">
          <rect width="80" height="40" fill="#f1e2c9" />
          <rect width="40" height="20" fill="#d8bf98" />
          <rect x="40" y="20" width="40" height="20" fill="#d8bf98" />
        </pattern>
      </defs>
      <rect width={1200} height={640} fill={`url(#${id}-wall)`} />
      <g stroke="#e4ddd0" strokeWidth={1.5}>
        {TILE_ROWS.map((row) => (
          <line key={row} x1={0} y1={90 + row * 30} x2={1200} y2={90 + row * 30} />
        ))}
        {TILE_ROWS.flatMap((row) =>
          Array.from({ length: 21 }, (_, col) => (
            <line
              key={`${row}-${col}`}
              x1={col * 60 + (row % 2) * 30}
              y1={90 + row * 30}
              x2={col * 60 + (row % 2) * 30}
              y2={120 + row * 30}
            />
          )),
        )}
      </g>
      <rect x={420} y={150} width={360} height={250} rx={14} fill={`url(#${id}-sky)`} />
      <circle
        cx={evening ? 720 : 470}
        cy={evening ? 300 : 200}
        r={26}
        fill={evening ? "#ffd27a" : "#fff6cf"}
      />
      {HOUSES.map(([x, y, w, colour]) => (
        <g key={x}>
          <rect x={x} y={y} width={w} height={400 - y} fill={colour} />
          <path d={`M${x - 6} ${y} L${x + w / 2} ${y - 26} L${x + w + 6} ${y} Z`} fill="#9b6b54" />
          <rect x={x + w / 2 - 9} y={y + 24} width={18} height={22} rx={3} fill="#fffaf0" opacity={0.9} />
        </g>
      ))}
      <rect x={420} y={360} width={360} height={40} fill="#c7b9a3" />
      <rect x={420} y={150} width={360} height={250} rx={14} fill={`url(#${id}-glass)`} />
      <rect x={420} y={150} width={360} height={250} rx={14} fill="none" stroke="#6b4232" strokeWidth={12} />
      <line x1={600} y1={150} x2={600} y2={400} stroke="#6b4232" strokeWidth={8} />
      <g>
        <path d="M380 112 H820 L840 150 H360 Z" fill="#a9c98b" />
        {AWNING_STRIPES.map((index) => (
          <path
            key={index}
            d={`M${380 + index * 27.5} 112 h13.75 l1 38 h-15.5 Z`}
            fill="#fff1cf"
            opacity={index % 2 === 0 ? 1 : 0}
          />
        ))}
        <path
          d="M360 150 q15 18 30 0 q15 18 30 0 q15 18 30 0 q15 18 30 0 q15 18 30 0 q15 18 30 0 q15 18 30 0 q15 18 30 0 q15 18 30 0 q15 18 30 0 q15 18 30 0 q15 18 30 0 q15 18 30 0 q15 18 30 0 q15 18 30 0 q15 18 30 0"
          fill="#a9c98b"
          stroke="#6f9152"
          strokeWidth={2}
        />
      </g>
      <ShopSign x={600} y={70} scale={0.9} />
      <g transform="translate(110 150)">
        <rect x={0} y={0} width={220} height={8} rx={4} fill="#b7794f" />
        {[24, 84, 150].map((x, index) => (
          <g key={x} transform={`translate(${x} 8)`}>
            <path d="M0 0 V14" stroke="#7d5a43" strokeWidth={2} />
            <circle
              cx={0}
              cy={30 + index * 4}
              r={18 + index * 4}
              fill="#c97d4a"
              stroke="#9a5a31"
              strokeWidth={3}
            />
            <circle cx={-5} cy={24 + index * 4} r={6} fill="#e8a877" opacity={0.6} />
          </g>
        ))}
      </g>
      <g transform="translate(880 180)">
        <rect x={0} y={0} width={210} height={12} rx={4} fill="#b7794f" />
        <rect x={0} y={96} width={210} height={12} rx={4} fill="#b7794f" />
        {[18, 72, 126, 170].map((x, index) => (
          <g key={x}>
            <rect
              x={x}
              y={-40 + (index % 2) * 8}
              width={30}
              height={40 - (index % 2) * 8}
              rx={6}
              fill={["#f4a259", "#4b5aa6", "#a9c98b", "#f2c4c9"][index]}
            />
            <rect
              x={x + 4}
              y={-30 + (index % 2) * 8}
              width={22}
              height={10}
              rx={3}
              fill="#fffaf0"
              opacity={0.85}
            />
          </g>
        ))}
        {[24, 96, 160].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={90} rx={24} ry={7} fill="#fbf1d6" />
            <path d={`M${x - 20} 90 Q${x} 62 ${x + 20} 90`} fill="#f7d8e4" />
          </g>
        ))}
      </g>
      <rect x={0} y={470} width={1200} height={170} fill={`url(#${id}-floor)`} />
      <rect x={0} y={420} width={1200} height={70} fill={`url(#${id}-counter)`} />
      <rect x={0} y={414} width={1200} height={14} rx={4} fill="#a87452" />
      <path d="M0 470 H1200" stroke="#3b2620" strokeOpacity={0.3} strokeWidth={4} />
    </svg>
  );
}
