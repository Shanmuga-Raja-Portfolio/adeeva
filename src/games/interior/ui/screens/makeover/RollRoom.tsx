import { darken, lighten } from "../../../../../ui/art/colourMix";

export const ROLL_ROOM = { left: 30, top: 40, bottom: 80 } as const;

interface RollRoomProps {
  readonly width: number;
  readonly height: number;
  readonly colour: string;
  readonly id: string;
}

const INK = "#3b2a33";
const SHEET = "#f3ece0";

function PaintTin({ x, y, colour }: { x: number; y: number; colour: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={30} rx={30} ry={7} fill="#2b2230" opacity={0.18} />
      <path d="M-24 0 L-24 28 Q0 36 24 28 L24 0 Z" fill="#c7ccd4" stroke={INK} strokeWidth={2.5} />
      <path d="M-24 8 Q0 15 24 8 L24 20 Q0 27 -24 20 Z" fill={colour} opacity={0.95} />
      <ellipse cx={0} cy={0} rx={24} ry={7} fill={colour} stroke={INK} strokeWidth={2.5} />
      <ellipse cx={-6} cy={-1} rx={10} ry={2.4} fill="#ffffff" opacity={0.35} />
      <path d="M-22 1 Q-26 10 -23 16" fill="none" stroke={colour} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}

export function RollRoomBack({ width, height, colour, id }: RollRoomProps) {
  const { left, top, bottom } = ROLL_ROOM;
  const skirt = 16;
  const floorTop = height + skirt;
  const floorBottom = height + bottom;
  const boards = Array.from({ length: 9 }, (_, index) => index);
  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-ceiling`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf8" />
          <stop offset="1" stopColor="#efe6da" />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a87b55" />
          <stop offset="1" stopColor="#c99a6c" />
        </linearGradient>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#cdbfb4" />
          <stop offset="1" stopColor="#e2d7cd" />
        </linearGradient>
      </defs>
      <rect x={-left} y={-top} width={width + left * 2} height={height + top + bottom} fill="#e9dfd5" />
      <polygon
        points={`${-left},${-top} 0,${-top + 26} 0,${floorTop} ${-left},${floorBottom}`}
        fill={`url(#${id}-side)`}
      />
      <polygon
        points={`${width + left},${-top} ${width},${-top + 26} ${width},${floorTop} ${width + left},${floorBottom}`}
        fill={`url(#${id}-side)`}
      />
      <polygon
        points={`${-left},${-top} ${width + left},${-top} ${width},${-top + 26} 0,${-top + 26}`}
        fill={`url(#${id}-ceiling)`}
      />
      <rect
        x={0}
        y={-top + 26}
        width={width}
        height={top - 26}
        fill="#fbf6ee"
        stroke={INK}
        strokeOpacity={0.25}
      />
      <path
        d={`M0 ${-top + 31} L${width} ${-top + 31} M0 ${-4} L${width} ${-4}`}
        stroke={INK}
        strokeOpacity={0.18}
        strokeWidth={1.5}
      />
      <polygon
        points={`0,${floorTop} ${width},${floorTop} ${width + left},${floorBottom} ${-left},${floorBottom}`}
        fill={`url(#${id}-floor)`}
      />
      <g stroke={darken("#b98a5f", 0.25)} strokeOpacity={0.55} strokeWidth={1.4}>
        {boards.map((index) => {
          const share = index / (boards.length - 1);
          const x1 = share * width;
          const x2 = -left + share * (width + left * 2);
          return <line key={index} x1={x1} y1={floorTop} x2={x2} y2={floorBottom} />;
        })}
      </g>
      <path
        d={`M${width * 0.08} ${floorTop + 8} Q${width * 0.3} ${floorTop + 2} ${width * 0.55} ${floorTop + 9} T${width * 0.97} ${floorTop + 6} L${width + left * 0.8} ${floorBottom} L${-left * 0.4} ${floorBottom} Z`}
        fill={SHEET}
        stroke={darken(SHEET, 0.2)}
        strokeWidth={1.5}
      />
      <path
        d={`M${width * 0.2} ${floorTop + 10} q20 22 4 ${bottom - 28} M${width * 0.46} ${floorTop + 10} q-16 24 6 ${bottom - 30} M${width * 0.7} ${floorTop + 9} q18 20 -2 ${bottom - 30}`}
        fill="none"
        stroke={darken(SHEET, 0.12)}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {[0.14, 0.33, 0.58, 0.63, 0.81].map((share, index) => (
        <ellipse
          key={share}
          cx={width * share}
          cy={floorTop + 22 + (index % 3) * 12}
          rx={4 + (index % 2) * 3}
          ry={2 + (index % 2)}
          fill={colour}
          opacity={0.85}
        />
      ))}
      <rect
        x={-2}
        y={height}
        width={width + 4}
        height={skirt}
        fill="#fffaf2"
        stroke={INK}
        strokeWidth={1.5}
      />
      <path
        d={`M0 ${height + 4} L${width} ${height + 4}`}
        stroke={INK}
        strokeOpacity={0.2}
        strokeWidth={1.2}
      />
      <polygon
        points={`${-left},${floorBottom - 6} 0,${floorTop} 0,${height} ${-left},${floorBottom - 22}`}
        fill={lighten("#e9dfd5", 0.4)}
        stroke={INK}
        strokeOpacity={0.4}
      />
      <polygon
        points={`${width + left},${floorBottom - 6} ${width},${floorTop} ${width},${height} ${width + left},${floorBottom - 22}`}
        fill={lighten("#e9dfd5", 0.4)}
        stroke={INK}
        strokeOpacity={0.4}
      />
      <PaintTin x={width * 0.88} y={floorTop + 26} colour={colour} />
    </g>
  );
}

export function RollWindowLight({ width, height, id }: Omit<RollRoomProps, "colour">) {
  return (
    <g pointerEvents="none" style={{ mixBlendMode: "screen" }}>
      <defs>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff6d6" stopOpacity={0.55} />
          <stop offset="0.6" stopColor="#fff6d6" stopOpacity={0.18} />
          <stop offset="1" stopColor="#fff6d6" stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={`${width * 0.02},0 ${width * 0.3},0 ${width * 0.7},${height} ${width * 0.36},${height}`}
        fill={`url(#${id}-beam)`}
      />
      <polygon
        points={`${width * 0.34},0 ${width * 0.42},0 ${width * 0.84},${height} ${width * 0.74},${height}`}
        fill={`url(#${id}-beam)`}
        opacity={0.6}
      />
    </g>
  );
}
