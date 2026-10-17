import { darken, lighten, luminance } from "../../../../../ui/art/colourMix";
import { FloorPieceArt, type PieceFinish } from "./FloorPieceArt";

export const FLOOR_VIEW = { side: 36, top: 34, bottom: 24 } as const;

interface FloorRoomProps {
  readonly width: number;
  readonly height: number;
  readonly margin: number;
  readonly wall: string;
  readonly fill: string;
  readonly finish: PieceFinish;
  readonly id: string;
}

const INK = "#3b2a33";

function Mallet({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={1} cy={9} rx={15} ry={3.4} fill="#1c1220" opacity={0.28} />
      <g transform="rotate(-58)">
        <rect x={-1.7} y={2} width={3.4} height={24} rx={1.5} fill="#c8914f" stroke={INK} strokeWidth={0.6} />
        <path d="M-1.2 8 L1.2 8 M-1.2 12 L1.2 12" stroke="#8a5a30" strokeWidth={0.5} />
        <rect x={-7.5} y={-6} width={15} height={9} rx={2.8} fill="#3a3a44" stroke={INK} strokeWidth={0.6} />
        <rect x={-6.4} y={-5.2} width={12.8} height={2.4} rx={1} fill="#ffffff" opacity={0.22} />
      </g>
    </g>
  );
}

export function FloorRoomBack({ width, height, margin, wall, fill, finish, id }: FloorRoomProps) {
  const left = -margin - FLOOR_VIEW.side;
  const top = -margin - FLOOR_VIEW.top;
  const full = width + (margin + FLOOR_VIEW.side) * 2;
  const skirtTop = -margin - 7;
  const bottom = height + margin + FLOOR_VIEW.bottom;
  const screws = Array.from({ length: 7 * 5 }, (_, index) => index);
  const ply = luminance(fill) > 0.42 ? "#8f989f" : "#b9c1c6";
  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lighten(wall, 0.18)} />
          <stop offset="1" stopColor={darken(wall, 0.12)} />
        </linearGradient>
        <linearGradient id={`${id}-ply`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={darken(ply, 0.18)} />
          <stop offset="0.25" stopColor={ply} />
          <stop offset="1" stopColor={lighten(ply, 0.1)} />
        </linearGradient>
        <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6dc8a" />
          <stop offset="1" stopColor="#b8862c" />
        </linearGradient>
      </defs>
      <rect x={left} y={top} width={full} height={skirtTop - top} fill={`url(#${id}-wall)`} />
      <path
        d={`M${left} ${top + 6} L${left + full} ${top + 6}`}
        stroke="#ffffff"
        strokeOpacity={0.4}
        strokeWidth={2}
      />
      <rect
        x={left}
        y={skirtTop}
        width={full}
        height={7}
        fill="#fffaf2"
        stroke={INK}
        strokeOpacity={0.35}
        strokeWidth={0.5}
      />
      <path
        d={`M${left} ${skirtTop + 2} L${left + full} ${skirtTop + 2}`}
        stroke={INK}
        strokeOpacity={0.2}
        strokeWidth={0.4}
      />
      <polygon
        points={`${left + full * 0.08},${top} ${left + full * 0.3},${top} ${left + full * 0.42},${skirtTop} ${left + full * 0.2},${skirtTop}`}
        fill="#ffffff"
        opacity={0.28}
      />
      <polygon
        points={`${left + full * 0.34},${top} ${left + full * 0.4},${top} ${left + full * 0.52},${skirtTop} ${left + full * 0.46},${skirtTop}`}
        fill="#ffffff"
        opacity={0.2}
      />
      <rect x={left} y={-margin} width={full} height={bottom + margin} fill={`url(#${id}-ply)`} />
      <g stroke={darken(ply, 0.14)} strokeWidth={0.4} strokeOpacity={0.6}>
        {[0.2, 0.45, 0.7].map((share) => (
          <path
            key={share}
            d={`M${left} ${-margin + share * (bottom + margin)} q${full * 0.3} 3 ${full * 0.6} 0 t${full * 0.4} 1`}
            fill="none"
          />
        ))}
      </g>
      <g fill={darken(ply, 0.35)} opacity={0.7}>
        {screws.map((index) => (
          <circle
            key={index}
            cx={left + 8 + (index % 7) * ((full - 16) / 6)}
            cy={-margin + 6 + Math.floor(index / 7) * ((bottom + margin - 12) / 4)}
            r={0.7}
          />
        ))}
      </g>
      <rect
        x={-1}
        y={-1}
        width={width + 2}
        height={height + 2}
        rx={1.5}
        fill="#2b2230"
        opacity={0.08}
        stroke="#ffffff"
        strokeOpacity={0.7}
        strokeWidth={0.5}
        strokeDasharray="3 2"
      />
      <rect
        x={width * 0.12}
        y={height + margin + 4}
        width={width * 0.76}
        height={5}
        rx={1.5}
        fill={`url(#${id}-brass)`}
        stroke={INK}
        strokeWidth={0.5}
      />
      <text x={width / 2} y={height + margin + 15.5} textAnchor="middle" className="is-floor__door-label">
        Door strip · the way in
      </text>
      <Mallet x={left + 18} y={height * 0.42} />
      <g transform={`translate(${width + margin + 6} ${height * 0.12})`}>
        <ellipse cx={11} cy={26} rx={15} ry={3} fill="#2b2230" opacity={0.16} />
        <g transform="translate(0 8)">
          <FloorPieceArt width={22} height={14} fill={fill} finish={finish} seed={21} />
        </g>
        <g transform="translate(2 3)">
          <FloorPieceArt width={22} height={14} fill={fill} finish={finish} seed={22} />
        </g>
        <g transform="translate(-1 -2)">
          <FloorPieceArt width={22} height={14} fill={fill} finish={finish} seed={23} />
        </g>
      </g>
    </g>
  );
}

export function FreshSparkles({ width, height }: { width: number; height: number }) {
  const star = "M0 -3 L0.8 -0.8 L3 0 L0.8 0.8 L0 3 L-0.8 0.8 L-3 0 L-0.8 -0.8 Z";
  const spots: readonly (readonly [number, number, number])[] = [
    [-1, -1, 1.1],
    [width + 1, height * 0.3, 0.8],
    [width * 0.4, height + 1.5, 0.9],
  ];
  return (
    <g pointerEvents="none">
      {spots.map(([x, y, size]) => (
        <path
          key={`${x}-${y}`}
          d={star}
          transform={`translate(${x} ${y}) scale(${size})`}
          fill="#fff6c8"
          stroke="#e0b23e"
          strokeWidth={0.35}
        />
      ))}
    </g>
  );
}
