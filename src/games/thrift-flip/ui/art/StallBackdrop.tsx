import { useSvgId } from "../../../../ui/art/useSvgId";

export interface StallBackdropProps {
  readonly className?: string | undefined;
  readonly dusk?: boolean | undefined;
  readonly view?: string | undefined;
}

const LANTERNS: readonly (readonly [number, number, string])[] = [
  [90, 92, "#f6b04e"],
  [210, 110, "#f08a3c"],
  [330, 98, "#f6d36b"],
  [450, 114, "#f08a3c"],
  [570, 100, "#f6b04e"],
  [690, 112, "#f6d36b"],
  [810, 96, "#f08a3c"],
  [930, 110, "#f6b04e"],
  [1050, 98, "#f6d36b"],
  [1170, 108, "#f08a3c"],
];

const FLAGS = ["#f08a3c", "#8fcfb2", "#3f5d84", "#f6d36b", "#e57a8f", "#8fcfb2", "#f08a3c", "#3f5d84"];

const HOUSES: readonly (readonly [number, number, number, string])[] = [
  [-20, 150, 130, "#e7c9a0"],
  [100, 120, 110, "#dcbfa0"],
  [200, 170, 120, "#e9d3b0"],
  [330, 140, 100, "#d9c09c"],
  [820, 150, 110, "#e3c49b"],
  [920, 120, 130, "#ddc3a6"],
  [1040, 160, 100, "#e9d3b0"],
  [1130, 130, 170, "#dcbfa0"],
];

const TREES: readonly (readonly [number, number, number])[] = [
  [420, 268, 46],
  [500, 252, 58],
  [600, 262, 50],
  [690, 250, 60],
  [780, 266, 44],
];

const GOODS = ["#e57a8f", "#f6d36b", "#7b7fd1", "#8fcfb2", "#f08a3c"];

function House({
  x,
  top,
  width,
  colour,
  dusk,
}: {
  readonly x: number;
  readonly top: number;
  readonly width: number;
  readonly colour: string;
  readonly dusk: boolean;
}) {
  const rows = [top + 34, top + 74];
  const cols = Array.from({ length: Math.floor((width - 20) / 34) }, (_, index) => x + 18 + index * 34);
  return (
    <g>
      <rect x={x} y={top} width={width} height={330 - top} fill={dusk ? "#4a4868" : colour} />
      <path
        d={`M${x - 8} ${top + 2} L${x + width / 2} ${top - 34} L${x + width + 8} ${top + 2} Z`}
        fill={dusk ? "#3a3654" : "#b8826a"}
      />
      <rect x={x + width * 0.7} y={top - 40} width={12} height={26} fill={dusk ? "#3a3654" : "#9a6a54"} />
      {rows.flatMap((y) =>
        cols.map((cx) => (
          <rect
            key={`${cx}-${y}`}
            x={cx}
            y={y}
            width={16}
            height={22}
            rx={2}
            fill={dusk ? "#ffd98a" : "#f8f1e4"}
            stroke={dusk ? "#2c2a44" : "#b79a6e"}
            strokeWidth={2}
            opacity={dusk ? 0.9 : 0.95}
          />
        )),
      )}
    </g>
  );
}

function Stall({
  x,
  stripe,
  roof,
  dusk,
}: {
  readonly x: number;
  readonly stripe: string;
  readonly roof: number;
  readonly dusk: boolean;
}) {
  const stripes = Array.from({ length: 9 }, (_, index) => index);
  return (
    <g transform={`translate(${x} ${roof})`}>
      <ellipse cx={110} cy={214} rx={130} ry={14} fill="#3b2a1c" opacity={0.2} />
      <rect x={10} y={46} width={200} height={110} fill={dusk ? "#5d4a52" : "#f1dfc0"} />
      <rect x={10} y={46} width={200} height={16} fill="#3b2a1c" opacity={0.16} />
      <path d="M24 74 H196" stroke="#7d828c" strokeWidth={4} strokeLinecap="round" />
      {GOODS.map((colour, index) => {
        const cx = 40 + index * 36;
        return (
          <g key={colour}>
            <path d={`M${cx} 74 l0 6`} stroke="#8a8f99" strokeWidth={1.5} />
            <path
              d={`M${cx - 14} 92 L${cx - 5} 82 Q${cx} 86 ${cx + 5} 82 L${cx + 14} 92 L${cx + 10} 98 L${cx + 10} ${index % 2 === 0 ? 132 : 122} L${cx - 10} ${index % 2 === 0 ? 132 : 122} L${cx - 10} 98 Z`}
              fill={colour}
              stroke="#00000022"
              strokeWidth={1.5}
            />
          </g>
        );
      })}
      <rect x={4} y={14} width={10} height={196} rx={2} fill="#8a6a4a" />
      <rect x={206} y={14} width={10} height={196} rx={2} fill="#8a6a4a" />
      <rect x={4} y={14} width={3} height={196} fill="#c99f72" />
      {stripes.map((index) => (
        <path
          key={index}
          d={`M${-6 + index * 26} 0 L${20 + index * 26} 0 L${20 + index * 26} 44 Q${7 + index * 26} 58 ${-6 + index * 26} 44 Z`}
          fill={index % 2 === 0 ? stripe : "#fff4e2"}
        />
      ))}
      <rect x={-6} y={0} width={234} height={44} fill="#ffffff" opacity={0.12} />
      <path d="M-8 0 H230" stroke="#6b5235" strokeWidth={4} strokeLinecap="round" />
      <rect x={0} y={150} width={220} height={60} rx={4} fill="#b88b5e" />
      <rect x={0} y={150} width={220} height={8} fill="#9a7048" />
      {[36, 96, 160].map((cx, index) => (
        <g key={cx}>
          <rect x={cx - 22} y={136} width={44} height={14} rx={3} fill={GOODS[index] ?? "#e57a8f"} />
          <rect x={cx - 19} y={124} width={38} height={12} rx={3} fill={GOODS[index + 2] ?? "#8fcfb2"} />
        </g>
      ))}
    </g>
  );
}

function Passerby({
  x,
  y,
  scale,
  body,
  hair,
}: {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly body: string;
  readonly hair: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={0.82}>
      <ellipse cx={0} cy={2} rx={22} ry={5} fill="#3b2a1c" opacity={0.2} />
      <path d="M-9 0 L-7 -40 M9 0 L7 -40" stroke="#4b3d4f" strokeWidth={7} strokeLinecap="round" />
      <path d="M-18 -36 Q-18 -78 0 -80 Q18 -78 18 -36 Z" fill={body} />
      <circle cx={0} cy={-92} r={13} fill="#d9a77e" />
      <path d="M-13 -94 Q-12 -108 0 -108 Q12 -108 13 -94 Q6 -100 0 -99 Q-6 -100 -13 -94 Z" fill={hair} />
    </g>
  );
}

export function StallBackdrop({ className, dusk = false, view = "0 0 1280 720" }: StallBackdropProps) {
  const id = useSvgId("stall-backdrop");
  return (
    <svg
      className={className ? `tf-backdrop ${className}` : "tf-backdrop"}
      viewBox={view}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dusk ? "#2c4466" : "#a9d8e6"} />
          <stop offset="0.5" stopColor={dusk ? "#7b6a8e" : "#f3ead2"} />
          <stop offset="1" stopColor={dusk ? "#e7a87a" : "#f8d8a8"} />
        </linearGradient>
        <linearGradient id={`${id}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dusk ? "#a88d76" : "#e2c9a0"} />
          <stop offset="1" stopColor={dusk ? "#7d6352" : "#c09f72"} />
        </linearGradient>
        <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4dc" stopOpacity={0} />
          <stop offset="1" stopColor={dusk ? "#e7a87a" : "#fff1d6"} stopOpacity={0.6} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#fff3c4" stopOpacity={0.9} />
          <stop offset="1" stopColor="#fff3c4" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-sun`} cx="0.82" cy="0.08" r="0.6">
          <stop offset="0" stopColor={dusk ? "#ffcf9a" : "#fffbe8"} stopOpacity={0.95} />
          <stop offset="0.35" stopColor={dusk ? "#ffb37a" : "#fff0c2"} stopOpacity={0.45} />
          <stop offset="1" stopColor="#fff0c2" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-pool`} cx="0.5" cy="0.2" r="0.6">
          <stop offset="0" stopColor="#fff6dc" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff6dc" stopOpacity={0} />
        </radialGradient>
        <pattern id={`${id}-cobble`} width={46} height={26} patternUnits="userSpaceOnUse">
          <path d="M2 12 Q12 2 22 12 Q12 22 2 12 Z M24 25 Q34 15 44 25" fill="#a88a5e" opacity={0.4} />
          <path d="M26 6 Q34 0 42 6" fill="none" stroke="#fff4dc" strokeWidth={1.5} opacity={0.35} />
        </pattern>
      </defs>
      <rect width={1280} height={720} fill={`url(#${id}-sky)`} />
      <rect width={1280} height={720} fill={`url(#${id}-sun)`} />
      <g fill="#ffffff" opacity={dusk ? 0.12 : 0.55}>
        <ellipse cx={240} cy={60} rx={70} ry={16} />
        <ellipse cx={290} cy={52} rx={44} ry={18} />
        <ellipse cx={760} cy={40} rx={80} ry={14} />
      </g>
      {HOUSES.map(([x, top, width, colour]) => (
        <House key={x} x={x} top={top} width={width} colour={colour} dusk={dusk} />
      ))}
      <g>
        <rect x={590} y={70} width={100} height={260} fill={dusk ? "#43405f" : "#d9b98e"} />
        <path d="M580 72 L640 20 L700 72 Z" fill={dusk ? "#34304e" : "#a8705a"} />
        <circle cx={640} cy={120} r={30} fill="#fff8ea" stroke="#8a6a4a" strokeWidth={5} />
        <path d="M640 120 V100 M640 120 L654 128" stroke="#3b2a1c" strokeWidth={4} strokeLinecap="round" />
      </g>
      {TREES.map(([x, y, r]) => (
        <g key={x}>
          <rect x={x - 5} y={y + r * 0.4} width={10} height={60} fill="#8a6a4a" />
          <circle cx={x} cy={y} r={r} fill={dusk ? "#3f5a4e" : "#8fbf8a"} />
          <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.55} fill={dusk ? "#4c6b5c" : "#a8d3a0"} />
        </g>
      ))}
      <rect y={0} width={1280} height={340} fill={`url(#${id}-haze)`} />
      <path d="M0 74 Q320 150 640 96 T1280 84" fill="none" stroke="#6b5235" strokeWidth={2} />
      {LANTERNS.map(([x, y, colour]) => (
        <g key={x}>
          <circle cx={x} cy={y + 18} r={40} fill={`url(#${id}-glow)`} />
          <path d={`M${x} ${y - 6} v8`} stroke="#6b5235" strokeWidth={2} />
          <ellipse cx={x} cy={y + 18} rx={14} ry={17} fill={colour} />
          <ellipse cx={x - 4} cy={y + 12} rx={4} ry={7} fill="#ffffff" opacity={0.35} />
          <path d={`M${x - 14} ${y + 18} h28`} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={1.5} />
          <rect x={x - 6} y={y + 1} width={12} height={4} rx={1} fill="#6b5235" />
          <rect x={x - 5} y={y + 33} width={10} height={4} rx={1} fill="#6b5235" />
        </g>
      ))}
      <rect y={500} width={1280} height={220} fill={`url(#${id}-ground)`} />
      <rect y={500} width={1280} height={220} fill={`url(#${id}-cobble)`} />
      <ellipse cx={640} cy={560} rx={560} ry={110} fill={`url(#${id}-pool)`} />
      <path d="M0 500 L1280 500" stroke="#a88a5e" strokeWidth={3} />
      <Passerby x={300} y={512} scale={0.9} body="#9bb7a2" hair="#3d2516" />
      <Passerby x={372} y={508} scale={0.8} body="#d9a28b" hair="#a0522d" />
      <Passerby x={900} y={510} scale={0.86} body="#b7a8cf" hair="#1f1a1a" />
      <Passerby x={980} y={514} scale={0.92} body="#7a8fb0" hair="#d9a441" />
      <path d="M-20 200 Q300 260 640 214 T1300 206" fill="none" stroke="#a07a52" strokeWidth={2} />
      {Array.from({ length: 26 }, (_, index) => {
        const x = -10 + index * 52;
        const t = (x + 20) / 1320;
        const y = 200 + Math.sin(t * Math.PI) * 30 + (t > 0.5 ? -6 : 0);
        return (
          <path
            key={x}
            d={`M${x} ${y} L${x + 36} ${y + 2} L${x + 18} ${y + 34} Z`}
            fill={FLAGS[index % FLAGS.length]}
            opacity={0.95}
          />
        );
      })}
      <Stall x={20} stripe="#8fcfb2" roof={300} dusk={dusk} />
      <Stall x={1040} stripe="#7b7fd1" roof={300} dusk={dusk} />
    </svg>
  );
}
