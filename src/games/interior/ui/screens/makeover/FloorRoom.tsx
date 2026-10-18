import { memo } from "react";
import { darken, lighten, luminance } from "../../../../../ui/art/colourMix";
import { FloorPieceArt, type PieceFinish } from "./FloorPieceArt";

export const FLOOR_VIEW = { side: 40, top: 44, bottom: 22 } as const;

interface PieceBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface FloorRoomProps {
  readonly width: number;
  readonly height: number;
  readonly margin: number;
  readonly wall: string;
  readonly fill: string;
  readonly finish: PieceFinish;
  readonly pieces: readonly PieceBox[];
  readonly id: string;
}

const INK = "#3b2a33";

function Mallet({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={2} cy={10} rx={14} ry={3.2} fill="#1c1220" opacity={0.22} />
      <g transform="rotate(-58)">
        <rect x={-1.8} y={2} width={3.6} height={24} rx={1.6} fill="#d9a066" stroke={INK} strokeWidth={0.6} />
        <rect x={-1.1} y={3} width={1} height={22} rx={0.5} fill="#ffffff" opacity={0.35} />
        <path d="M-1.2 8 L1.2 8 M-1.2 12 L1.2 12 M-1.2 16 L1.2 16" stroke="#8a5a30" strokeWidth={0.5} />
        <rect x={-7.5} y={-6} width={15} height={9} rx={2.8} fill="#3a3a44" stroke={INK} strokeWidth={0.6} />
        <rect x={-6.4} y={-5.2} width={12.8} height={2.6} rx={1.2} fill="#ffffff" opacity={0.28} />
        <rect x={-7.5} y={0.4} width={15} height={2.6} rx={1.2} fill="#1c1220" opacity={0.3} />
      </g>
    </g>
  );
}

function TapeMeasure({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={1} cy={6.5} rx={8} ry={2} fill="#1c1220" opacity={0.2} />
      <path d="M5 2 L22 4.5 L22 7 L5 5 Z" fill="#f6d77a" stroke={INK} strokeWidth={0.4} />
      <path
        d="M8 3.5 L8 5 M11 4 L11 5.5 M14 4.4 L14 6 M17 4.8 L17 6.3 M20 5.2 L20 6.6"
        stroke={INK}
        strokeWidth={0.35}
      />
      <rect x={-6} y={-6} width={12} height={12} rx={3.5} fill="#c8664a" stroke={INK} strokeWidth={0.6} />
      <circle cx={0} cy={0} r={3} fill="#fffaf2" stroke={INK} strokeWidth={0.45} />
      <rect x={-5} y={-5.2} width={10} height={2.4} rx={1.2} fill="#ffffff" opacity={0.3} />
    </g>
  );
}

function Carton({ x, y, fill, finish }: { x: number; y: number; fill: string; finish: PieceFinish }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={11} cy={17} rx={16} ry={3} fill="#1c1220" opacity={0.18} />
      <path d="M0 0 L22 0 L22 16 L0 16 Z" fill="#d6ab72" stroke={INK} strokeWidth={0.6} />
      <path d="M0 0 L-3 -5 L19 -5 L22 0 Z" fill="#e8c48e" stroke={INK} strokeWidth={0.6} />
      <path d="M22 0 L26 -4 L26 12 L22 16 Z" fill="#b98c55" stroke={INK} strokeWidth={0.6} />
      <rect x={9} y={0} width={4} height={16} fill="#c99a5e" opacity={0.8} />
      <g transform="translate(3 4)">
        <FloorPieceArt width={7} height={7} fill={fill} finish={finish} seed={31} />
      </g>
      <path d="M13.5 6 L20 6 M13.5 8.5 L19 8.5" stroke="#7a5530" strokeWidth={0.7} strokeLinecap="round" />
    </g>
  );
}

function SpareStack({ x, y, fill, finish }: { x: number; y: number; fill: string; finish: PieceFinish }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={11} cy={26} rx={15} ry={3} fill="#2b2230" opacity={0.18} />
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
  );
}

function BackWall({
  left,
  top,
  full,
  skirtTop,
  id,
}: {
  left: number;
  top: number;
  full: number;
  skirtTop: number;
  id: string;
}) {
  const winX = left + full * 0.2;
  const winW = full * 0.3;
  const winTop = top + 5;
  const winBottom = skirtTop - 6;
  const picX = left + full * 0.68;
  return (
    <g>
      <rect x={left} y={top} width={full} height={skirtTop - top} fill={`url(#${id}-wall)`} />
      <rect x={left} y={top} width={full} height={skirtTop - top} fill={`url(#${id}-paper)`} />
      <rect
        x={winX - 2}
        y={winTop - 2}
        width={winW + 4}
        height={winBottom - winTop + 4}
        rx={1.5}
        fill="#fffaf2"
        stroke={INK}
        strokeWidth={0.5}
      />
      <rect x={winX} y={winTop} width={winW} height={winBottom - winTop} fill={`url(#${id}-sky)`} />
      <circle cx={winX + winW * 0.74} cy={winTop + 6} r={3.4} fill="#fff4c2" />
      <path d={`M${winX + 4} ${winBottom - 4} q6 -5 12 0 Z`} fill="#ffffff" opacity={0.85} />
      <path
        d={`M${winX + winW / 2} ${winTop} L${winX + winW / 2} ${winBottom} M${winX} ${(winTop + winBottom) / 2} L${winX + winW} ${(winTop + winBottom) / 2}`}
        stroke="#fffaf2"
        strokeWidth={1.4}
      />
      <rect
        x={winX - 4}
        y={winBottom + 1}
        width={winW + 8}
        height={2.4}
        rx={1}
        fill="#fffaf2"
        stroke={INK}
        strokeWidth={0.4}
      />
      {[winX - 6, winX + winW + 1].map((x) => (
        <g key={x}>
          <path
            d={`M${x} ${winTop - 3} L${x + 5} ${winTop - 3} L${x + 6} ${winBottom + 2} Q${x + 2.5} ${winBottom + 4} ${x - 1} ${winBottom + 2} Z`}
            fill="#e9d8c3"
            stroke={INK}
            strokeWidth={0.45}
          />
          <path
            d={`M${x + 1.8} ${winTop} L${x + 1.5} ${winBottom} M${x + 3.8} ${winTop} L${x + 4.2} ${winBottom}`}
            stroke="#c9b293"
            strokeWidth={0.5}
          />
        </g>
      ))}
      <path
        d={`M${winX - 8} ${winTop - 3.5} L${winX + winW + 8} ${winTop - 3.5}`}
        stroke="#8a6a4a"
        strokeWidth={1}
        strokeLinecap="round"
      />
      <rect
        x={picX}
        y={top + 8}
        width={18}
        height={13}
        rx={0.8}
        fill="#c8914f"
        stroke={INK}
        strokeWidth={0.5}
      />
      <rect x={picX + 2} y={top + 10} width={14} height={9} fill="#f4ecd8" />
      <path
        d={`M${picX + 2} ${top + 19} L${picX + 7} ${top + 13.5} L${picX + 10} ${top + 16.5} L${picX + 13} ${top + 14} L${picX + 16} ${top + 19} Z`}
        fill="#7d8a4a"
      />
      <circle cx={picX + 12.5} cy={top + 12.2} r={1.3} fill="#e0b23e" />
      <rect x={left} y={top} width={full} height={skirtTop - top} fill={`url(#${id}-shade)`} />
    </g>
  );
}

function CoveredChair({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={14} cy={1} rx={19} ry={3} fill="#1c1220" opacity={0.2} />
      <path
        d="M-4 0 L-3 -14 Q-4 -24 4 -25 Q14 -30 24 -25 Q32 -24 31 -14 L32 0 Q14 3 -4 0 Z"
        fill="#f2ece2"
        stroke={INK}
        strokeWidth={0.6}
        strokeLinejoin="round"
      />
      <path
        d="M2 -22 Q6 -10 4 0 M14 -27 Q12 -12 14 1 M26 -22 Q23 -10 25 0"
        stroke="#cfc3b2"
        strokeWidth={0.7}
        fill="none"
      />
      <path d="M-3 -14 Q14 -9 31 -14" stroke="#d9cebf" strokeWidth={1.2} fill="none" />
      <path
        d="M0 -21 Q8 -25 16 -24"
        stroke="#ffffff"
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
        opacity={0.8}
      />
    </g>
  );
}

function Bookcase({ x, y }: { x: number; y: number }) {
  const spines = ["#c8664a", "#3c6aa8", "#e0b23e", "#7d8a4a", "#8c5a9a", "#c8664a"];
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={8} cy={1} rx={11} ry={2.2} fill="#1c1220" opacity={0.2} />
      <rect x={0} y={-34} width={16} height={34} rx={1} fill="#9a6a42" stroke={INK} strokeWidth={0.6} />
      <rect x={1.6} y={-32} width={12.8} height={30} fill="#6e4a2e" />
      {[-22, -12].map((shelf) => (
        <rect key={shelf} x={1.6} y={shelf} width={12.8} height={1.6} fill="#9a6a42" />
      ))}
      {spines.map((colour, index) => (
        <rect
          key={index}
          x={2.2 + (index % 3) * 4}
          y={index < 3 ? -31 : -20.5}
          width={3.2}
          height={index % 2 === 0 ? 8.6 : 7.6}
          fill={colour}
        />
      ))}
      <rect x={1} y={-33.5} width={4} height={33} fill="#ffffff" opacity={0.12} />
    </g>
  );
}

function Ghosts({ width, height, pieces }: { width: number; height: number; pieces: readonly PieceBox[] }) {
  const shifts: [number, number][] = [];
  for (let dx = -1; dx <= 1; dx += 1)
    for (let dy = -1; dy <= 2; dy += 1) if (dx !== 0 || dy !== 0) shifts.push([dx * width, dy * height]);
  return (
    <g fill="none" stroke="#ffffff" strokeOpacity={0.4} strokeWidth={0.45} strokeDasharray="1.6 1.4">
      {shifts.flatMap(([dx, dy]) =>
        pieces.map((piece, index) => (
          <rect
            key={`${dx},${dy},${index}`}
            x={piece.x + dx + 0.6}
            y={piece.y + dy + 0.6}
            width={piece.width - 1.2}
            height={piece.height - 1.2}
            rx={1}
          />
        )),
      )}
    </g>
  );
}

export const FloorRoomBack = memo(function FloorRoomBack({
  width,
  height,
  margin,
  wall,
  fill,
  finish,
  pieces,
  id,
}: FloorRoomProps) {
  const left = -margin - FLOOR_VIEW.side;
  const top = -margin - FLOOR_VIEW.top;
  const full = width + (margin + FLOOR_VIEW.side) * 2;
  const skirtTop = -margin - 7;
  const bottom = height + margin + FLOOR_VIEW.bottom;
  const under = luminance(fill) > 0.42 ? "#9aa3a8" : "#d8d0c2";
  const floorTop = -margin;
  const floorHeight = bottom - floorTop;
  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lighten(wall, 0.2)} />
          <stop offset="1" stopColor={darken(wall, 0.1)} />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2b2230" stopOpacity={0.18} />
          <stop offset="0.25" stopColor="#2b2230" stopOpacity={0} />
          <stop offset="0.75" stopColor="#2b2230" stopOpacity={0} />
          <stop offset="1" stopColor="#2b2230" stopOpacity={0.18} />
        </linearGradient>
        <pattern id={`${id}-paper`} width={8} height={8} patternUnits="userSpaceOnUse">
          <path d="M4 0 L4 8" stroke="#ffffff" strokeOpacity={0.16} strokeWidth={1.6} />
        </pattern>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fc4ea" />
          <stop offset="1" stopColor="#dff1fb" />
        </linearGradient>
        <linearGradient id={`${id}-under`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={darken(under, 0.2)} />
          <stop offset="0.18" stopColor={under} />
          <stop offset="1" stopColor={lighten(under, 0.12)} />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6d6" stopOpacity={0.55} />
          <stop offset="1" stopColor="#fff6d6" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#2b2230" stopOpacity={0} />
          <stop offset="1" stopColor="#2b2230" stopOpacity={0.26} />
        </radialGradient>
        <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6dc8a" />
          <stop offset="1" stopColor="#b8862c" />
        </linearGradient>
      </defs>
      <BackWall left={left} top={top} full={full} skirtTop={skirtTop} id={id} />
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
      <rect x={left} y={floorTop} width={full} height={floorHeight} fill={`url(#${id}-under)`} />
      <g stroke={darken(under, 0.12)} strokeWidth={0.35} strokeOpacity={0.7} fill="none">
        {[0.22, 0.5, 0.78].map((share) => (
          <path
            key={share}
            d={`M${left} ${floorTop + share * floorHeight} q${full * 0.3} 2.5 ${full * 0.6} 0 t${full * 0.4} 1`}
          />
        ))}
      </g>
      <Ghosts width={width} height={height} pieces={pieces} />
      <polygon
        points={`${left + full * 0.2},${floorTop} ${left + full * 0.5},${floorTop} ${left + full * 0.78},${bottom} ${left + full * 0.42},${bottom}`}
        fill={`url(#${id}-beam)`}
      />
      <rect x={left} y={top} width={full} height={bottom - top} fill={`url(#${id}-vignette)`} />
      <rect
        x={-1}
        y={-1}
        width={width + 2}
        height={height + 2}
        rx={1.5}
        fill="#2b2230"
        opacity={0.1}
        stroke="#ffffff"
        strokeOpacity={0.85}
        strokeWidth={0.6}
        strokeDasharray="3 2"
      />
      <rect
        x={width * 0.12}
        y={height + margin + 3}
        width={width * 0.76}
        height={5}
        rx={1.5}
        fill={`url(#${id}-brass)`}
        stroke={INK}
        strokeWidth={0.5}
      />
      <text x={width / 2} y={height + margin + 15} textAnchor="middle" className="is-floor__door-label">
        Door strip · the way in
      </text>
      <Bookcase x={left + 6} y={floorTop + 2} />
      <CoveredChair x={left + full * 0.62} y={floorTop + 3} />
      <Mallet x={left + 16} y={height * 0.36} />
      <TapeMeasure x={left + 12} y={height * 0.86} />
      <SpareStack x={width + margin + 4} y={height * 0.06} fill={fill} finish={finish} />
      <Carton x={width + margin + 6} y={height * 0.66} fill={fill} finish={finish} />
    </g>
  );
});
