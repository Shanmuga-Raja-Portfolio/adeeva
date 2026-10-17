import type { Point } from "../../../../engine/geometry/point";
import { darken, lighten } from "../../../../ui/art/colourMix";
import type { RoomTemplate } from "../../content/roomTemplate";
import { floorPoint, lifted, pointsAttr, type CutawayFrame } from "./cutawayFrame";

interface RoomDressingProps {
  readonly frame: CutawayFrame;
  readonly room: RoomTemplate;
  readonly back: string;
  readonly side: string;
  readonly panelled: boolean;
  readonly id: string;
}

const RAIL = 0.33;
const PANEL_LOW = 0.085;
const PANEL_HIGH = 0.27;
const SILL = 0.36;
const DOOR_SPAN = 1.15;
const INK = "#3b2a33";

function backAt(frame: CutawayFrame, col: number, share: number): Point {
  return lifted(floorPoint(frame, col, 0), frame.wall * share);
}

function sideAt(frame: CutawayFrame, row: number, share: number): Point {
  return lifted(floorPoint(frame, 0, row), frame.wall * share);
}

function spans(length: number, gaps: readonly (readonly [number, number])[]): [number, number][] {
  const count = Math.max(1, Math.round(length / 1.25));
  const cuts = Array.from({ length: count }, (_, index): [number, number] => [
    (index * length) / count + 0.14,
    ((index + 1) * length) / count - 0.14,
  ]);
  return cuts.filter(([a, b]) => gaps.every(([from, to]) => b <= from || a >= to));
}

function doorRows(room: RoomTemplate): readonly [number, number] | null {
  const windows = room.windows.filter((window) => window.wall === "side");
  for (let start = room.rows - DOOR_SPAN - 0.55; start >= 0.3; start -= 0.25) {
    const end = start + DOOR_SPAN;
    if (windows.every((window) => end + 0.2 <= window.from || start - 0.2 >= window.to)) return [start, end];
  }
  return null;
}

function Radiator({ frame, from, to }: { frame: CutawayFrame; from: number; to: number }) {
  const mid = (from + to) / 2;
  const half = Math.min(0.7, (to - from) * 0.34);
  const [x1, y1] = backAt(frame, mid - half, 0.26);
  const [x2, y2] = backAt(frame, mid + half, 0.1);
  const fins = Math.max(4, Math.round(half * 9));
  const line = Math.max(0.8, frame.scale * 1.1);
  return (
    <g>
      <rect
        x={x1}
        y={y1}
        width={x2 - x1}
        height={y2 - y1}
        rx={frame.cell * 0.04}
        fill="#f6f1ea"
        stroke={INK}
        strokeOpacity={0.55}
        strokeWidth={line}
      />
      {Array.from({ length: fins - 1 }, (_, index) => {
        const x = x1 + ((index + 1) * (x2 - x1)) / fins;
        return (
          <line
            key={index}
            x1={x}
            y1={y1 + (y2 - y1) * 0.12}
            x2={x}
            y2={y2 - (y2 - y1) * 0.12}
            stroke="#c9bfb4"
            strokeWidth={line}
          />
        );
      })}
      <rect x={x1} y={y2} width={x2 - x1} height={(y2 - y1) * 0.12} fill="#2b2230" opacity={0.12} />
    </g>
  );
}

function SideDoor({
  frame,
  rows,
  side,
}: {
  frame: CutawayFrame;
  rows: readonly [number, number];
  side: string;
}) {
  const [a, b] = rows;
  const leaf = darken(side, 0.18);
  const trim = lighten(side, 0.55);
  const line = Math.max(0.8, frame.scale * 1.2);
  const outer = [sideAt(frame, b, 0), sideAt(frame, a, 0), sideAt(frame, a, 0.74), sideAt(frame, b, 0.74)];
  const inner = [
    sideAt(frame, b - 0.1, 0.02),
    sideAt(frame, a + 0.1, 0.02),
    sideAt(frame, a + 0.1, 0.69),
    sideAt(frame, b - 0.1, 0.69),
  ];
  const panel = (low: number, high: number) => [
    sideAt(frame, b - 0.24, low),
    sideAt(frame, a + 0.24, low),
    sideAt(frame, a + 0.24, high),
    sideAt(frame, b - 0.24, high),
  ];
  const [kx, ky] = sideAt(frame, a + 0.22, 0.34);
  return (
    <g>
      <polygon points={pointsAttr(outer)} fill={trim} stroke={INK} strokeOpacity={0.5} strokeWidth={line} />
      <polygon points={pointsAttr(inner)} fill={leaf} stroke={INK} strokeOpacity={0.45} strokeWidth={line} />
      <polygon
        points={pointsAttr(panel(0.4, 0.62))}
        fill="none"
        stroke={lighten(leaf, 0.25)}
        strokeWidth={line}
      />
      <polygon
        points={pointsAttr(panel(0.08, 0.32))}
        fill="none"
        stroke={lighten(leaf, 0.25)}
        strokeWidth={line}
      />
      <circle
        cx={kx}
        cy={ky}
        r={Math.max(1.6, frame.cell * 0.045)}
        fill="#d9a93a"
        stroke={INK}
        strokeWidth={line * 0.6}
      />
    </g>
  );
}

function LightSwitch({ frame, row }: { frame: CutawayFrame; row: number }) {
  const [x, y] = sideAt(frame, row, SILL);
  const size = frame.cell * 0.13;
  return (
    <rect
      x={x - size / 2}
      y={y - size * 0.65}
      width={size}
      height={size * 1.3}
      rx={size * 0.18}
      fill="#fffaf2"
      stroke={INK}
      strokeOpacity={0.5}
      strokeWidth={Math.max(0.6, frame.scale)}
    />
  );
}

export function DressingDefs({ id, back }: { readonly id: string; readonly back: string }) {
  return (
    <pattern id={`${id}-paper`} width={14} height={14} patternUnits="userSpaceOnUse">
      <path d="M7 0 L7 14" stroke={lighten(back, 0.22)} strokeWidth={3} opacity={0.35} />
      <circle cx={0} cy={7} r={1.1} fill={darken(back, 0.12)} opacity={0.35} />
      <circle cx={14} cy={7} r={1.1} fill={darken(back, 0.12)} opacity={0.35} />
    </pattern>
  );
}

export function RoomDressing({ frame, room, back, side, panelled, id }: RoomDressingProps) {
  const line = Math.max(0.8, frame.scale * 1.3);
  const backWindows = room.windows.filter((window) => window.wall === "back");
  const door = doorRows(room);
  const backGaps = backWindows.map((window) => [window.from, window.to] as const);
  const sideGaps = door === null ? [] : [door];
  const upper = [
    backAt(frame, 0, 0.955),
    backAt(frame, room.cols, 0.955),
    backAt(frame, room.cols, RAIL),
    backAt(frame, 0, RAIL),
  ];
  return (
    <g pointerEvents="none" data-testid="room-dressing">
      {panelled ? <polygon points={pointsAttr(upper)} fill={`url(#${id}-paper)`} /> : null}
      {panelled ? (
        <g>
          <path
            d={`M${pointsAttr([backAt(frame, 0, RAIL)])} L${pointsAttr([backAt(frame, room.cols, RAIL)])}`}
            stroke={lighten(back, 0.55)}
            strokeWidth={Math.max(2, frame.scale * 3.4)}
          />
          <path
            d={`M${pointsAttr([backAt(frame, 0, RAIL - 0.012)])} L${pointsAttr([backAt(frame, room.cols, RAIL - 0.012)])}`}
            stroke={darken(back, 0.25)}
            strokeOpacity={0.5}
            strokeWidth={line}
          />
          {spans(room.cols, backGaps).map(([a, b]) => (
            <polygon
              key={`bp${a}`}
              points={pointsAttr([
                backAt(frame, a, PANEL_HIGH),
                backAt(frame, b, PANEL_HIGH),
                backAt(frame, b, PANEL_LOW),
                backAt(frame, a, PANEL_LOW),
              ])}
              fill={lighten(back, 0.08)}
              stroke={darken(back, 0.2)}
              strokeOpacity={0.55}
              strokeWidth={line}
            />
          ))}
          <path
            d={`M${pointsAttr([sideAt(frame, room.rows, RAIL)])} L${pointsAttr([sideAt(frame, 0, RAIL)])}`}
            stroke={lighten(side, 0.5)}
            strokeWidth={Math.max(2, frame.scale * 3.4)}
          />
          {spans(room.rows, sideGaps).map(([a, b]) => (
            <polygon
              key={`sp${a}`}
              points={pointsAttr([
                sideAt(frame, b, PANEL_HIGH),
                sideAt(frame, a, PANEL_HIGH),
                sideAt(frame, a, PANEL_LOW),
                sideAt(frame, b, PANEL_LOW),
              ])}
              fill={darken(side, 0.04)}
              stroke={darken(side, 0.28)}
              strokeOpacity={0.5}
              strokeWidth={line}
            />
          ))}
        </g>
      ) : null}
      {backWindows.map((window) => (
        <Radiator key={`rad${window.from}`} frame={frame} from={window.from} to={window.to} />
      ))}
      {door === null ? null : <SideDoor frame={frame} rows={door} side={side} />}
      {door === null ? null : <LightSwitch frame={frame} row={door[1] + 0.22} />}
    </g>
  );
}
