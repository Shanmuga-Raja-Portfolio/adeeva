import { darken, lighten } from "../../../../../ui/art/colourMix";
import type { Point } from "../../../../../engine/geometry/point";
import { floorPoint, lifted, type CutawayFrame } from "../../art/cutawayFrame";

interface PartyBuntingProps {
  readonly frame: CutawayFrame;
  readonly colours: readonly string[];
  readonly shown: number;
}

const INK = "#3b2a33";
const HANG = 0.88;

function sag(from: Point, to: Point, depth: number, share: number): Point {
  const x = from[0] + (to[0] - from[0]) * share;
  const y = from[1] + (to[1] - from[1]) * share + Math.sin(share * Math.PI) * depth;
  return [x, y];
}

function Garland({
  from,
  to,
  depth,
  flags,
  size,
  colours,
  offset,
}: {
  from: Point;
  to: Point;
  depth: number;
  flags: number;
  size: number;
  colours: readonly string[];
  offset: number;
}) {
  const mid = sag(from, to, depth * 2, 0.5);
  return (
    <g>
      <path
        d={`M${from[0]} ${from[1]} Q${mid[0]} ${mid[1]} ${to[0]} ${to[1]}`}
        fill="none"
        stroke={INK}
        strokeOpacity={0.6}
        strokeWidth={1.2}
      />
      {Array.from({ length: flags }, (_, index) => {
        const share = (index + 0.5) / flags;
        const [x, y] = sag(from, to, depth, share);
        const colour = colours[(index + offset) % colours.length] ?? "#e86a7a";
        return (
          <path
            key={index}
            d={`M${x - size * 0.5} ${y} L${x + size * 0.5} ${y} L${x} ${y + size * 1.1} Z`}
            fill={colour}
            stroke={darken(colour, 0.35)}
            strokeWidth={0.9}
            strokeLinejoin="round"
          />
        );
      })}
    </g>
  );
}

function Balloon({
  x,
  y,
  r,
  colour,
  knot,
}: {
  x: number;
  y: number;
  r: number;
  colour: string;
  knot: Point;
}) {
  return (
    <g>
      <path
        d={`M${x} ${y + r * 1.15} Q${(x + knot[0]) / 2 + r * 0.6} ${(y + knot[1]) / 2} ${knot[0]} ${knot[1]}`}
        fill="none"
        stroke={INK}
        strokeOpacity={0.55}
        strokeWidth={1}
      />
      <ellipse
        cx={x}
        cy={y}
        rx={r}
        ry={r * 1.18}
        fill={colour}
        stroke={darken(colour, 0.35)}
        strokeWidth={1.2}
      />
      <ellipse
        cx={x - r * 0.35}
        cy={y - r * 0.45}
        rx={r * 0.22}
        ry={r * 0.32}
        fill={lighten(colour, 0.7)}
        opacity={0.75}
      />
      <path
        d={`M${x - r * 0.15} ${y + r * 1.25} L${x + r * 0.15} ${y + r * 1.25} L${x} ${y + r * 1.1} Z`}
        fill={darken(colour, 0.2)}
      />
    </g>
  );
}

export function PartyBunting({ frame, colours, shown }: PartyBuntingProps) {
  const top = (col: number, row: number) => lifted(floorPoint(frame, col, row), frame.wall * HANG);
  const size = Math.max(9, frame.cell * 0.26);
  const knot = floorPoint(frame, frame.cols - 0.3, 0.45);
  const r = Math.max(10, frame.cell * 0.26);
  const tied = lifted(knot, r * 0.55);
  const heads: readonly [number, number][] = [
    [-r * 1.1, -frame.wall * 0.62],
    [r * 0.9, -frame.wall * 0.7],
    [-r * 0.05, -frame.wall * 0.8],
  ];
  return (
    <g pointerEvents="none" opacity={shown} data-testid="party-bunting">
      <Garland
        from={top(0, 0)}
        to={top(frame.cols, 0)}
        depth={frame.wall * 0.06}
        flags={Math.max(7, frame.cols * 2)}
        size={size}
        colours={colours}
        offset={0}
      />
      <Garland
        from={top(0, frame.rows)}
        to={top(0, 0)}
        depth={frame.wall * 0.05}
        flags={Math.max(5, frame.rows + 2)}
        size={size * 0.9}
        colours={colours}
        offset={2}
      />
      <rect
        x={tied[0] - r * 0.3}
        y={tied[1]}
        width={r * 0.6}
        height={r * 0.55}
        rx={r * 0.12}
        fill={colours[0] ?? "#e86a7a"}
        stroke={INK}
        strokeOpacity={0.6}
        strokeWidth={1}
      />
      {heads.map(([dx, dy], index) => (
        <Balloon
          key={index}
          x={knot[0] + dx}
          y={knot[1] + dy}
          r={r}
          colour={colours[(index + 1) % colours.length] ?? "#e86a7a"}
          knot={tied}
        />
      ))}
    </g>
  );
}
