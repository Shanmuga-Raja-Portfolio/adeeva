import { darken, lighten } from "../../../../ui/art/colourMix";
import { floorPoint, lifted, pointsAttr, type CutawayFrame } from "./cutawayFrame";

interface ShellProps {
  readonly frame: CutawayFrame;
  readonly back: string;
  readonly side: string;
  readonly id: string;
}

const THICK = 0.2;
const INK = "#3b2a33";

export function ShellDefs({ id }: { readonly id: string }) {
  return (
    <>
      <linearGradient id={`${id}-corner`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#2b2230" stopOpacity={0.22} />
        <stop offset="1" stopColor="#2b2230" stopOpacity={0} />
      </linearGradient>
      <linearGradient id={`${id}-base`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#2b2230" stopOpacity={0.2} />
        <stop offset="1" stopColor="#2b2230" stopOpacity={0} />
      </linearGradient>
      <linearGradient id={`${id}-floorshade`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2b2230" stopOpacity={0.2} />
        <stop offset="0.45" stopColor="#2b2230" stopOpacity={0.04} />
        <stop offset="1" stopColor="#ffffff" stopOpacity={0.1} />
      </linearGradient>
      <radialGradient id={`${id}-contact`}>
        <stop offset="0" stopColor="#2b2230" stopOpacity={0.34} />
        <stop offset="0.7" stopColor="#2b2230" stopOpacity={0.12} />
        <stop offset="1" stopColor="#2b2230" stopOpacity={0} />
      </radialGradient>
    </>
  );
}

export function WallShading({ frame, id }: { readonly frame: CutawayFrame; readonly id: string }) {
  const corner = floorPoint(frame, 0, 0);
  const reach = frame.cell * 0.9;
  const baseBand = frame.wall * 0.22;
  const right = floorPoint(frame, frame.cols, 0);
  return (
    <g pointerEvents="none">
      <polygon
        points={pointsAttr([
          lifted(corner, frame.wall),
          [corner[0] + reach, corner[1] - frame.wall],
          [corner[0] + reach, corner[1]],
          corner,
        ])}
        fill={`url(#${id}-corner)`}
      />
      <polygon
        points={pointsAttr([lifted(corner, baseBand), lifted(right, baseBand), right, corner])}
        fill={`url(#${id}-base)`}
      />
    </g>
  );
}

export function FloorShading({ frame, id }: { readonly frame: CutawayFrame; readonly id: string }) {
  return (
    <polygon
      pointerEvents="none"
      points={pointsAttr([
        floorPoint(frame, 0, 0),
        floorPoint(frame, frame.cols, 0),
        floorPoint(frame, frame.cols, frame.rows),
        floorPoint(frame, 0, frame.rows),
      ])}
      fill={`url(#${id}-floorshade)`}
    />
  );
}

export function WallCaps({ frame, back, side }: ShellProps) {
  const top = (col: number, row: number) => lifted(floorPoint(frame, col, row), frame.wall);
  const line = Math.max(1, frame.scale * 1.4);
  const cap = lighten(back, 0.7);
  return (
    <g pointerEvents="none">
      <polygon
        points={pointsAttr([
          floorPoint(frame, -THICK, frame.rows),
          floorPoint(frame, 0, frame.rows),
          top(0, frame.rows),
          top(-THICK, frame.rows),
        ])}
        fill={darken(side, 0.32)}
        stroke={INK}
        strokeWidth={line}
        strokeLinejoin="round"
      />
      <polygon
        points={pointsAttr([
          floorPoint(frame, frame.cols, 0),
          floorPoint(frame, frame.cols, -THICK),
          top(frame.cols, -THICK),
          top(frame.cols, 0),
        ])}
        fill={darken(back, 0.3)}
        stroke={INK}
        strokeWidth={line}
        strokeLinejoin="round"
      />
      <polygon
        points={pointsAttr([
          top(-THICK, -THICK),
          top(frame.cols, -THICK),
          top(frame.cols, 0),
          top(0, 0),
          top(0, frame.rows),
          top(-THICK, frame.rows),
        ])}
        fill={cap}
        stroke={INK}
        strokeWidth={line}
        strokeLinejoin="round"
      />
    </g>
  );
}

export function Cornice({ frame, back, side }: ShellProps) {
  const band = frame.wall * 0.045;
  const top = (col: number, row: number) => lifted(floorPoint(frame, col, row), frame.wall);
  const below = (col: number, row: number) => lifted(floorPoint(frame, col, row), frame.wall - band);
  return (
    <g pointerEvents="none">
      <polygon
        points={pointsAttr([top(0, 0), top(frame.cols, 0), below(frame.cols, 0), below(0, 0)])}
        fill={lighten(back, 0.6)}
        stroke={darken(back, 0.3)}
        strokeWidth={0.8}
      />
      <polygon
        points={pointsAttr([top(0, frame.rows), top(0, 0), below(0, 0), below(0, frame.rows)])}
        fill={lighten(side, 0.5)}
        stroke={darken(side, 0.3)}
        strokeWidth={0.8}
      />
    </g>
  );
}

export function WallSocket({ frame }: { readonly frame: CutawayFrame }) {
  const [x, y] = lifted(floorPoint(frame, frame.cols - 0.55, 0), frame.wall * 0.16);
  const size = frame.cell * 0.16;
  return (
    <g pointerEvents="none">
      <rect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        rx={size * 0.18}
        fill="#fffaf2"
        stroke={INK}
        strokeOpacity={0.55}
        strokeWidth={0.8}
      />
      <circle cx={x - size * 0.18} cy={y} r={size * 0.08} fill={INK} opacity={0.6} />
      <circle cx={x + size * 0.18} cy={y} r={size * 0.08} fill={INK} opacity={0.6} />
    </g>
  );
}
