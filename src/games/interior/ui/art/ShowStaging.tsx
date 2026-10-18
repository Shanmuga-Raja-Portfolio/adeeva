import type { Point } from "../../../../engine/geometry/point";
import { darken, lighten, luminance, mixHex } from "../../../../ui/art/colourMix";
import type { RoomTemplate } from "../../content/roomTemplate";
import { pieceCells, type PlacedPiece } from "../../core";
import { floorPoint, floorQuad, lifted, pointsAttr, type CutawayFrame } from "./cutawayFrame";

interface ShowStagingProps {
  readonly frame: CutawayFrame;
  readonly room: RoomTemplate;
  readonly pieces: readonly PlacedPiece[];
  readonly palette: readonly string[];
  readonly id: string;
  readonly extras?: boolean | undefined;
}

const INK = "#3b2a33";

function occupied(pieces: readonly PlacedPiece[]): Set<string> {
  return new Set(pieces.flatMap((piece) => pieceCells(piece).map(([col, row]) => `${col},${row}`)));
}

function Rug({
  frame,
  room,
  colour,
  id,
}: {
  frame: CutawayFrame;
  room: RoomTemplate;
  colour: string;
  id: string;
}) {
  const width = Math.max(2, room.cols - 2.2);
  const depth = Math.max(1.4, room.rows - 2.1);
  const col = (room.cols - width) / 2;
  const row = Math.max(0.9, (room.rows - depth) / 2 + 0.2);
  const outer = floorQuad(frame, col, row, width, depth);
  const border = floorQuad(frame, col + 0.14, row + 0.14, width - 0.28, depth - 0.28);
  const field = floorQuad(frame, col + 0.3, row + 0.3, width - 0.6, depth - 0.6);
  const centre = floorPoint(frame, col + width / 2, row + depth / 2);
  const reachX = (width / 2 - 0.55) * frame.cell;
  const reachY = (depth / 2 - 0.5) * frame.depth;
  const fringe = Array.from(
    { length: Math.round(width * 7) },
    (_, index) => col + 0.06 + (index * (width - 0.12)) / Math.round(width * 7),
  );
  return (
    <g>
      <polygon
        points={pointsAttr(outer.map(([x, y]) => [x + 2, y + 3] as Point))}
        fill="#2b2230"
        opacity={0.12}
      />
      <polygon
        points={pointsAttr(outer)}
        fill={darken(colour, 0.12)}
        stroke={INK}
        strokeOpacity={0.45}
        strokeWidth={1}
      />
      <polygon points={pointsAttr(border)} fill={lighten(colour, 0.32)} />
      <polygon points={pointsAttr(field)} fill={colour} />
      <polygon points={pointsAttr(field)} fill={`url(#${id}-weave)`} />
      <polygon
        points={pointsAttr([
          [centre[0], centre[1] - reachY],
          [centre[0] + reachX, centre[1]],
          [centre[0], centre[1] + reachY],
          [centre[0] - reachX, centre[1]],
        ])}
        fill="none"
        stroke={lighten(colour, 0.6)}
        strokeWidth={Math.max(1.4, frame.scale * 3)}
      />
      <polygon
        points={pointsAttr([
          [centre[0], centre[1] - reachY * 0.45],
          [centre[0] + reachX * 0.45, centre[1]],
          [centre[0], centre[1] + reachY * 0.45],
          [centre[0] - reachX * 0.45, centre[1]],
        ])}
        fill={lighten(colour, 0.4)}
        stroke={darken(colour, 0.25)}
        strokeWidth={Math.max(0.8, frame.scale * 1.4)}
      />
      <g stroke={lighten(colour, 0.6)} strokeWidth={Math.max(0.8, frame.scale * 1.2)}>
        {fringe.map((at) => {
          const [x, y] = floorPoint(frame, at, row + depth);
          return <line key={at} x1={x} y1={y} x2={x - frame.shift * 0.12} y2={y + frame.depth * 0.14} />;
        })}
      </g>
    </g>
  );
}

function Plant({ x, y, u, leaf, pot }: { x: number; y: number; u: number; leaf: string; pot: string }) {
  const line = Math.max(0.8, u * 0.03);
  const leaves = [-62, -38, -14, 10, 34, 58];
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
      <ellipse cx={0} cy={0} rx={u * 0.3} ry={u * 0.08} fill="#2b2230" opacity={0.22} />
      {leaves.map((angle, index) => (
        <g key={angle} transform={`translate(0 ${-u * 0.42}) rotate(${angle})`}>
          <path
            d={`M0 0 Q${u * 0.16} ${-u * 0.4} 0 ${-u * (0.78 + (index % 2) * 0.16)} Q${-u * 0.16} ${-u * 0.4} 0 0 Z`}
            fill={index % 2 === 0 ? leaf : lighten(leaf, 0.16)}
            stroke={INK}
            strokeWidth={line}
          />
          <path d={`M0 ${-u * 0.06} L0 ${-u * 0.6}`} stroke={darken(leaf, 0.3)} strokeWidth={line * 0.7} />
        </g>
      ))}
      <path
        d={`M${-u * 0.2} ${-u * 0.44} L${u * 0.2} ${-u * 0.44} L${u * 0.15} 0 L${-u * 0.15} 0 Z`}
        fill={pot}
        stroke={INK}
        strokeWidth={line}
        strokeLinejoin="round"
      />
      <rect
        x={-u * 0.23}
        y={-u * 0.5}
        width={u * 0.46}
        height={u * 0.09}
        rx={u * 0.03}
        fill={lighten(pot, 0.2)}
        stroke={INK}
        strokeWidth={line}
      />
      <path
        d={`M${-u * 0.12} ${-u * 0.36} L${-u * 0.09} ${-u * 0.06}`}
        stroke="#ffffff"
        strokeWidth={line * 1.6}
        opacity={0.35}
        strokeLinecap="round"
      />
    </g>
  );
}

function SideFrame({
  frame,
  from,
  to,
  colour,
  accent,
}: {
  frame: CutawayFrame;
  from: number;
  to: number;
  colour: string;
  accent: string;
}) {
  const at = (row: number, share: number) => lifted(floorPoint(frame, 0, row), frame.wall * share);
  const outer = [at(to, 0.5), at(from, 0.5), at(from, 0.82), at(to, 0.82)];
  const inner = [at(to - 0.07, 0.53), at(from + 0.07, 0.53), at(from + 0.07, 0.79), at(to - 0.07, 0.79)];
  const hill = [
    at(to - 0.07, 0.53),
    at(from + 0.07, 0.53),
    at(from + 0.07, 0.62),
    at((from + to) / 2, 0.68),
    at(to - 0.07, 0.6),
  ];
  const line = Math.max(0.8, frame.scale * 1.2);
  return (
    <g>
      <polygon
        points={pointsAttr(outer.map(([x, y]) => [x + 2, y + 2] as Point))}
        fill="#2b2230"
        opacity={0.15}
      />
      <polygon points={pointsAttr(outer)} fill="#c8914f" stroke={INK} strokeWidth={line} />
      <polygon points={pointsAttr(inner)} fill={lighten(colour, 0.6)} />
      <polygon points={pointsAttr(hill)} fill={colour} />
      <circle
        cx={at((from + to) / 2 + 0.12, 0.74)[0]}
        cy={at((from + to) / 2 + 0.12, 0.74)[1]}
        r={frame.cell * 0.05}
        fill={accent}
      />
    </g>
  );
}

function FairyLights({ frame, room, id }: { frame: CutawayFrame; room: RoomTemplate; id: string }) {
  const from = lifted(floorPoint(frame, 0.15, 0), frame.wall * 0.93);
  const to = lifted(floorPoint(frame, room.cols - 0.15, 0), frame.wall * 0.93);
  const count = Math.round(room.cols * 3);
  const loops = Math.max(2, Math.round(room.cols / 2.5));
  const sagDepth = frame.wall * 0.07;
  const point = (share: number): Point => {
    const loop = (share * loops) % 1;
    return [from[0] + (to[0] - from[0]) * share, from[1] + Math.sin(loop * Math.PI) * sagDepth];
  };
  const steps = Array.from({ length: 60 }, (_, index) => point(index / 59));
  const bulbs = Array.from({ length: count }, (_, index) => point((index + 0.5) / count));
  const colours = ["#ffe39c", "#ffc98a", "#fff4c2"];
  return (
    <g>
      <polyline
        points={pointsAttr(steps)}
        fill="none"
        stroke="#5a4a3a"
        strokeWidth={Math.max(0.8, frame.scale * 1.2)}
      />
      {bulbs.map(([x, y], index) => (
        <g key={index}>
          <circle cx={x} cy={y + frame.cell * 0.05} r={frame.cell * 0.2} fill={`url(#${id}-twinkle)`} />
          <ellipse
            cx={x}
            cy={y + frame.cell * 0.05}
            rx={frame.cell * 0.04}
            ry={frame.cell * 0.055}
            fill={colours[index % 3]}
            stroke="#b07f12"
            strokeWidth={0.6}
          />
        </g>
      ))}
    </g>
  );
}

function SillFlowers({
  frame,
  to,
  colours,
}: {
  frame: CutawayFrame;
  to: number;
  colours: readonly string[];
}) {
  const [x, y] = lifted(floorPoint(frame, to - 0.45, 0), frame.wall * 0.36);
  const u = frame.cell;
  const line = Math.max(0.8, u * 0.03);
  return (
    <g>
      {[-0.12, 0, 0.12].map((dx, index) => (
        <g key={dx}>
          <path
            d={`M${x} ${y - u * 0.16} Q${x + dx * u} ${y - u * 0.3} ${x + dx * u * 1.6} ${y - u * 0.42}`}
            stroke="#5f7f4a"
            strokeWidth={line * 1.2}
            fill="none"
          />
          <circle
            cx={x + dx * u * 1.6}
            cy={y - u * 0.44}
            r={u * 0.07}
            fill={colours[index % colours.length] ?? "#e8546a"}
            stroke={INK}
            strokeWidth={line * 0.6}
          />
        </g>
      ))}
      <path
        d={`M${x - u * 0.09} ${y - u * 0.2} L${x + u * 0.09} ${y - u * 0.2} L${x + u * 0.07} ${y} L${x - u * 0.07} ${y} Z`}
        fill="#dfe9f2"
        stroke={INK}
        strokeWidth={line}
      />
    </g>
  );
}

export function StagingDefs({ id }: { readonly id: string }) {
  return (
    <>
      <radialGradient id={`${id}-twinkle`}>
        <stop offset="0" stopColor="#ffe39c" stopOpacity={0.75} />
        <stop offset="1" stopColor="#ffe39c" stopOpacity={0} />
      </radialGradient>
      <pattern id={`${id}-weave`} width={6} height={6} patternUnits="userSpaceOnUse">
        <path d="M0 3 L6 3 M3 0 L3 6" stroke="#ffffff" strokeOpacity={0.14} strokeWidth={1} />
      </pattern>
    </>
  );
}

export function ShowStaging({ frame, room, pieces, palette, id, extras = true }: ShowStagingProps) {
  const taken = occupied(pieces);
  const rug =
    [...palette].sort((a, b) => Math.abs(luminance(a) - 0.22) - Math.abs(luminance(b) - 0.22))[0] ??
    "#c8664a";
  const accent = palette[0] ?? "#e8546a";
  const sideWindows = room.windows.filter((window) => window.wall === "side");
  const frames = [
    [0.35, 1.0],
    [1.2, 1.75],
  ].filter(
    ([from = 0, to = 0]) =>
      to < room.rows - 1.9 && sideWindows.every((window) => to <= window.from || from >= window.to),
  );
  const corners: Point[] = [
    [room.cols - 0.5, 0.55],
    [0.5, 0.55],
  ];
  const plants = corners
    .filter(([col, row]) => !taken.has(`${Math.floor(col)},${Math.floor(row)}`))
    .slice(0, 2);
  return (
    <g pointerEvents="none" data-testid="show-staging">
      {extras ? (
        <g>
          <FairyLights frame={frame} room={room} id={id} />
          {frames.map(([from = 0, to = 0]) => (
            <SideFrame
              key={from}
              frame={frame}
              from={from}
              to={to}
              colour={mixHex(rug, "#7d8a4a", 0.4)}
              accent={accent}
            />
          ))}
          {room.windows
            .filter((window) => window.wall === "back")
            .map((window) => (
              <SillFlowers key={window.from} frame={frame} to={window.to} colours={palette} />
            ))}
        </g>
      ) : null}
      <Rug frame={frame} room={room} colour={rug} id={id} />
      {extras
        ? plants.map(([col, row]) => {
            const [x, y] = floorPoint(frame, col, row);
            return <Plant key={col} x={x} y={y} u={frame.cell} leaf="#5f8f5a" pot={accent} />;
          })
        : null}
    </g>
  );
}
