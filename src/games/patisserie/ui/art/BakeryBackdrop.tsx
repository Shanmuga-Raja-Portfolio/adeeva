import { useSvgId } from "../../../../ui/art/useSvgId";
import { ShopSign } from "./ShopSign";

export interface BakeryBackdropProps {
  readonly className?: string | undefined;
  readonly evening?: boolean | undefined;
  readonly sign?: boolean | undefined;
}

const AWNING_STRIPES = Array.from({ length: 16 }, (_, index) => index);
const TILE_ROWS = Array.from({ length: 13 }, (_, index) => index);
const BULBS = Array.from({ length: 21 }, (_, index) => index);
const CLOUDS: readonly [number, number, number][] = [
  [520, 196, 1],
  [700, 176, 0.8],
];
const TREES: readonly [number, number][] = [
  [516, 330],
  [734, 336],
];
const HOUSES: [number, number, number, string][] = [
  [452, 250, 70, "#f2c7a5"],
  [528, 228, 64, "#c8d6ee"],
  [598, 262, 58, "#f6e1a8"],
  [662, 236, 72, "#cfe3bb"],
  [740, 256, 60, "#f3c3c9"],
];

export function BakeryBackdrop({ className, evening = false, sign = true }: BakeryBackdropProps) {
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
        <radialGradient id={`${id}-copper`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#f0a874" />
          <stop offset="0.55" stopColor="#c97d4a" />
          <stop offset="1" stopColor="#8f4f28" />
        </radialGradient>
        <radialGradient id={`${id}-bulb`}>
          <stop offset="0" stopColor="#fff3c4" stopOpacity={0.95} />
          <stop offset="1" stopColor="#ffd98a" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-dome`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.55} />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity={0.12} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0.35} />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffbe8" stopOpacity={evening ? 0.25 : 0.55} />
          <stop offset="1" stopColor="#fffbe8" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-sunglow`}>
          <stop offset="0" stopColor={evening ? "#ffd27a" : "#fffbe6"} stopOpacity={0.95} />
          <stop offset="1" stopColor={evening ? "#ffd27a" : "#fffbe6"} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-wallglow`}>
          <stop offset="0" stopColor="#fff3cf" stopOpacity={evening ? 0.4 : 0.75} />
          <stop offset="1" stopColor="#fff3cf" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#5a3220" stopOpacity={0} />
          <stop offset="1" stopColor="#5a3220" stopOpacity={0.22} />
        </radialGradient>
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
      <ellipse cx={600} cy={280} rx={360} ry={230} fill={`url(#${id}-wallglow)`} />
      <rect x={420} y={150} width={360} height={250} rx={14} fill={`url(#${id}-sky)`} />
      <circle cx={evening ? 720 : 470} cy={evening ? 300 : 200} r={110} fill={`url(#${id}-sunglow)`} />
      <circle
        cx={evening ? 720 : 470}
        cy={evening ? 300 : 200}
        r={26}
        fill={evening ? "#ffd27a" : "#fff6cf"}
      />
      {CLOUDS.map(([x, y, scale]) => (
        <g
          key={x}
          transform={`translate(${x} ${y}) scale(${scale})`}
          fill="#ffffff"
          opacity={evening ? 0.5 : 0.85}
        >
          <ellipse cx={0} cy={0} rx={30} ry={12} />
          <ellipse cx={18} cy={-8} rx={20} ry={14} />
          <ellipse cx={-14} cy={-6} rx={16} ry={11} />
        </g>
      ))}
      {HOUSES.map(([x, y, w, colour]) => (
        <g key={x}>
          <rect x={x} y={y} width={w} height={400 - y} fill={colour} />
          <rect x={x + w * 0.72} y={y} width={w * 0.28} height={400 - y} fill="#3b2620" opacity={0.08} />
          <rect x={x + w - 18} y={y - 30} width={10} height={20} fill="#8a5a42" />
          <path d={`M${x - 6} ${y} L${x + w / 2} ${y - 26} L${x + w + 6} ${y} Z`} fill="#9b6b54" />
          <path d={`M${x - 6} ${y} L${x + w / 2} ${y - 26}`} stroke="#c4917a" strokeWidth={3} />
          {[0.3, 0.7].map((share) => (
            <g key={share}>
              <rect
                x={x + w * share - 8}
                y={y + 20}
                width={16}
                height={20}
                rx={2}
                fill={evening ? "#ffe3a3" : "#fffaf0"}
                stroke="#ffffff"
                strokeWidth={2}
              />
              <path d={`M${x + w * share} ${y + 20} V${y + 40}`} stroke="#c7b9a3" strokeWidth={1.5} />
            </g>
          ))}
          <rect x={x + w / 2 - 8} y={y + 58} width={16} height={26} rx={7} fill="#8a5a42" opacity={0.75} />
        </g>
      ))}
      {TREES.map(([x, y]) => (
        <g key={x}>
          <rect x={x - 3} y={y} width={6} height={30} fill="#7d5a43" />
          <circle cx={x} cy={y - 6} r={20} fill="#7fa87a" />
          <circle cx={x - 7} cy={y - 12} r={9} fill="#a9c98b" opacity={0.7} />
        </g>
      ))}
      <rect x={420} y={360} width={360} height={40} fill="#c7b9a3" />
      <g fill="#fffbe8" opacity={evening ? 0.12 : 0.22}>
        <path
          d={evening ? "M760 160 L720 160 L520 400 L600 400 Z" : "M440 160 L500 160 L700 400 L610 400 Z"}
        />
        <path
          d={evening ? "M700 160 L680 160 L460 400 L500 400 Z" : "M520 160 L545 160 L770 400 L730 400 Z"}
        />
      </g>
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
      <path
        d="M0 26 Q300 76 600 30 Q900 76 1200 26"
        fill="none"
        stroke="#6b4232"
        strokeWidth={2}
        opacity={0.6}
      />
      {BULBS.map((index) => {
        const x = index * 60;
        const local = (index % 10) / 10;
        const y = 26 + Math.sin(local * Math.PI) * 26;
        return (
          <g key={index}>
            <circle
              cx={x}
              cy={y + 8}
              r={18}
              fill={`url(#${id}-bulb)`}
              opacity={evening ? 1 : 0.7}
              className="pa-bulb-glow"
              style={{ animationDelay: `${(index % 5) * -0.55}s` }}
            />
            <circle cx={x} cy={y + 8} r={5} fill="#fff1c2" stroke="#d9a441" strokeWidth={1.4} />
          </g>
        );
      })}
      {sign ? <ShopSign x={600} y={70} scale={0.9} /> : null}
      <g transform="translate(110 150)">
        <rect x={4} y={6} width={220} height={8} rx={4} fill="#5a3220" opacity={0.14} />
        <rect x={0} y={0} width={220} height={8} rx={4} fill="#b7794f" />
        <rect x={0} y={0} width={220} height={3} rx={1.5} fill="#e0a77a" opacity={0.7} />
        {[24, 84, 150].map((x, index) => (
          <g key={x} transform={`translate(${x} 8)`}>
            <ellipse
              cx={7}
              cy={40 + index * 4}
              rx={19 + index * 4}
              ry={17 + index * 4}
              fill="#5a3220"
              opacity={0.16}
            />
            <path d="M0 0 V14" stroke="#7d5a43" strokeWidth={2} />
            <circle
              cx={0}
              cy={30 + index * 4}
              r={18 + index * 4}
              fill={`url(#${id}-copper)`}
              stroke="#8a4f2a"
              strokeWidth={3}
            />
            <circle
              cx={0}
              cy={30 + index * 4}
              r={11 + index * 3}
              fill="none"
              stroke="#e8a877"
              strokeWidth={1.5}
              opacity={0.45}
            />
            <ellipse
              cx={-6}
              cy={22 + index * 4}
              rx={6 + index}
              ry={4 + index}
              fill="#ffe0c0"
              opacity={0.75}
            />
          </g>
        ))}
      </g>
      <g transform="translate(880 180)">
        <rect x={4} y={10} width={210} height={14} rx={4} fill="#5a3220" opacity={0.14} />
        <rect x={4} y={106} width={210} height={14} rx={4} fill="#5a3220" opacity={0.14} />
        <rect x={0} y={0} width={210} height={12} rx={4} fill="#b7794f" />
        <rect x={0} y={96} width={210} height={12} rx={4} fill="#b7794f" />
        <rect x={0} y={0} width={210} height={4} rx={2} fill="#e0a77a" opacity={0.7} />
        <rect x={0} y={96} width={210} height={4} rx={2} fill="#e0a77a" opacity={0.7} />
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
        {[
          [30, "#f7d8e4"],
          [104, "#f6df7c"],
          [174, "#cfe3bb"],
        ].map(([x, colour]) => (
          <g key={x} transform={`translate(${x} 96)`}>
            <ellipse cx={0} cy={0} rx={28} ry={6} fill="#fbf8f2" stroke="#cbbca6" />
            <rect x={-16} y={-24} width={32} height={22} rx={4} fill={String(colour)} />
            <ellipse cx={0} cy={-24} rx={16} ry={4} fill="#fffaf0" />
            <path
              d="M-24 -2 V-28 Q-24 -50 0 -51 Q24 -50 24 -28 V-2"
              fill={`url(#${id}-dome)`}
              stroke="#ffffff"
              strokeOpacity={0.8}
              strokeWidth={1.5}
            />
            <circle cx={0} cy={-54} r={3.5} fill="#c9b48a" />
          </g>
        ))}
      </g>
      <rect x={0} y={470} width={1200} height={170} fill={`url(#${id}-floor)`} />
      <rect x={0} y={420} width={1200} height={70} fill={`url(#${id}-counter)`} />
      <rect x={0} y={414} width={1200} height={14} rx={4} fill="#a87452" />
      <path d="M0 470 H1200" stroke="#3b2620" strokeOpacity={0.3} strokeWidth={4} />
      <path d="M420 400 L780 400 L920 640 L280 640 Z" fill={`url(#${id}-beam)`} />
      <rect width={1200} height={640} fill={`url(#${id}-vignette)`} />
    </svg>
  );
}
