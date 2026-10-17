import { darken, lighten } from "../../../../../ui/art/colourMix";
import type { Point } from "../../../../../engine/geometry/point";
import type { EdgePath } from "../../../core";
import { BARE_WALL } from "../../art/roomHex";

interface EdgeSceneProps {
  readonly path: EdgePath;
  readonly done: boolean;
  readonly colour: string;
  readonly id: string;
}

const INK = "#3b2a33";
const TAPE = "#7fb1e6";
const BAND = 2.6;

function tapeLine(points: readonly Point[], closed: boolean): string {
  return `${points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ")}${closed ? " Z" : ""}`;
}

function Plaster({ id, width, height }: { id: string; width: number; height: number }) {
  return (
    <>
      <defs>
        <pattern id={`${id}-plaster`} width={6} height={6} patternUnits="userSpaceOnUse">
          <rect width={6} height={6} fill={BARE_WALL} />
          <circle cx={1.4} cy={1.8} r={0.3} fill="#a39b97" />
          <circle cx={4.3} cy={4} r={0.25} fill="#cbc5c1" />
        </pattern>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.35} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="1" stopColor="#000000" stopOpacity={0.1} />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${id}-plaster)`} />
    </>
  );
}

function Wall({
  done,
  colour,
  id,
  x,
  y,
  width,
  height,
}: {
  done: boolean;
  colour: string;
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  if (!done) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={colour} />
      <rect x={x} y={y} width={width} height={height} fill={`url(#${id}-sheen)`} />
    </g>
  );
}

function Tape({ path, done }: { path: EdgePath; done: boolean }) {
  const d = tapeLine(path.points, path.closed);
  const last = path.points[path.points.length - 1] ?? [0, 0];
  return (
    <g pointerEvents="none">
      <path d={d} fill="none" stroke={darken(TAPE, 0.25)} strokeWidth={BAND + 0.5} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={TAPE} strokeWidth={BAND} strokeLinejoin="round" />
      <path
        d={d}
        fill="none"
        stroke="#ffffff"
        strokeWidth={0.3}
        strokeDasharray="0.6 1.4"
        strokeOpacity={0.7}
        strokeLinejoin="round"
      />
      {done && !path.closed ? (
        <path
          d={`M${last[0] - 2} ${last[1] - BAND / 2} q3 -1 3.6 -4.4 q-2.4 1 -3.6 4.4 Z`}
          fill={lighten(TAPE, 0.35)}
          stroke={darken(TAPE, 0.3)}
          strokeWidth={0.3}
        />
      ) : null}
    </g>
  );
}

export function EdgeSceneBack({ path, done, colour, id }: EdgeSceneProps) {
  const { width, height } = path;
  const lineY = path.points[0]?.[1] ?? height / 2;
  if (path.kind === "frame") {
    const xs = path.points.map(([x]) => x);
    const ys = path.points.map(([, y]) => y);
    const left = Math.min(...xs);
    const right = Math.max(...xs);
    const top = Math.min(...ys);
    const bottom = Math.max(...ys);
    const midX = (left + right) / 2;
    const midY = (top + bottom) / 2;
    return (
      <g pointerEvents="none">
        <Plaster id={id} width={width} height={height} />
        <Wall done={done} colour={colour} id={id} x={0} y={0} width={width} height={height} />
        <rect
          x={left}
          y={top}
          width={right - left}
          height={bottom - top}
          fill="#fffaf2"
          stroke={INK}
          strokeWidth={0.4}
        />
        <rect
          x={left + 2.4}
          y={top + 2.4}
          width={right - left - 4.8}
          height={bottom - top - 4.8}
          fill="#bfe3f6"
        />
        <rect
          x={left + 2.4}
          y={top + 2.4}
          width={right - left - 4.8}
          height={(bottom - top) * 0.4}
          fill="#9fd0f0"
        />
        <circle cx={right - 9} cy={top + 9} r={3} fill="#fff4c2" />
        <path
          d={`M${midX} ${top + 2.4} L${midX} ${bottom - 2.4} M${left + 2.4} ${midY} L${right - 2.4} ${midY}`}
          stroke="#fffaf2"
          strokeWidth={1.6}
        />
        <rect
          x={left - 2}
          y={bottom}
          width={right - left + 4}
          height={2.4}
          rx={0.8}
          fill="#fffaf2"
          stroke={INK}
          strokeWidth={0.3}
        />
      </g>
    );
  }
  if (path.kind === "ceiling")
    return (
      <g pointerEvents="none">
        <Plaster id={id} width={width} height={height} />
        <Wall done={done} colour={colour} id={id} x={0} y={lineY} width={width} height={height - lineY} />
        <rect width={width} height={lineY} fill="#fbf7f0" />
        <rect y={lineY - 3.4} width={width} height={1.6} fill="#f1e8dc" />
        <path
          d={`M0 ${lineY - 3.4} L${width} ${lineY - 3.4}`}
          stroke={INK}
          strokeWidth={0.2}
          strokeOpacity={0.35}
        />
        <path d={`M0 ${lineY} L${width} ${lineY}`} stroke={INK} strokeWidth={0.25} strokeOpacity={0.4} />
      </g>
    );
  if (path.kind === "skirting")
    return (
      <g pointerEvents="none">
        <Plaster id={id} width={width} height={height} />
        <Wall done={done} colour={colour} id={id} x={0} y={0} width={width} height={lineY} />
        <rect y={lineY} width={width} height={height - lineY - 3} fill="#fffaf2" />
        <path
          d={`M0 ${lineY + 1.6} L${width} ${lineY + 1.6}`}
          stroke={INK}
          strokeWidth={0.2}
          strokeOpacity={0.3}
        />
        <rect y={height - 3} width={width} height={3} fill="#c99a6c" />
        <path d={`M0 ${lineY} L${width} ${lineY}`} stroke={INK} strokeWidth={0.25} strokeOpacity={0.4} />
      </g>
    );
  return (
    <g pointerEvents="none">
      <Plaster id={id} width={width} height={height} />
      <Wall done={done} colour={colour} id={id} x={0} y={0} width={width} height={lineY} />
      <path d={`M0 ${lineY} L${width} ${lineY}`} stroke={INK} strokeWidth={0.25} strokeOpacity={0.4} />
    </g>
  );
}

export function EdgeSceneTape({ path, done }: Pick<EdgeSceneProps, "path" | "done">) {
  return <Tape path={path} done={done} />;
}
