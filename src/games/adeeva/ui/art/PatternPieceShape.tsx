import type { PieceOutline } from "../../content/garmentPart";
import type { Cloth } from "../../../../ui/art/cloth/Cloth";
import { FabricPattern, fabricFill, fabricSheenFill } from "../../../../ui/art/cloth/FabricPattern";
import { fabricLook } from "../../../../ui/art/cloth/fabricLook";
import { useSvgId } from "../../../../ui/art/useSvgId";

export type PatternPieceState = "idle" | "selected" | "invalid" | "cut";

export interface PatternPieceShapeProps {
  piece: PieceOutline;
  x?: number | undefined;
  y?: number | undefined;
  rotation?: number | undefined;
  scale?: number | undefined;
  fabric?: Cloth | undefined;
  state?: PatternPieceState | undefined;
  mirrored?: boolean | undefined;
  showLabel?: boolean | undefined;
  cutCount?: number | undefined;
}

type Vec = [number, number];

function bounds(points: readonly Vec[]) {
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function centroid(points: readonly Vec[]): Vec {
  const sum = points.reduce<Vec>((acc, point) => [acc[0] + point[0], acc[1] + point[1]], [0, 0]);
  return [sum[0] / points.length, sum[1] / points.length];
}

function toPath(points: readonly Vec[]): string {
  return `${points.map((point, index) => `${index === 0 ? "M" : "L"}${point[0].toFixed(2)} ${point[1].toFixed(2)}`).join(" ")} Z`;
}

function notchMarks(points: readonly Vec[], centre: Vec, length: number, minEdge: number): string {
  const marks: string[] = [];
  points.forEach((start, index) => {
    const end = points[(index + 1) % points.length] ?? start;
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const edge = Math.hypot(dx, dy);
    if (edge < minEdge) return;
    const mid: Vec = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
    let nx = -dy / edge;
    let ny = dx / edge;
    if ((centre[0] - mid[0]) * nx + (centre[1] - mid[1]) * ny < 0) {
      nx = -nx;
      ny = -ny;
    }
    const half = length * 0.35;
    const tx = (dx / edge) * half;
    const ty = (dy / edge) * half;
    marks.push(
      `M${(mid[0] - tx).toFixed(2)} ${(mid[1] - ty).toFixed(2)} L${(mid[0] + nx * length).toFixed(2)} ${(mid[1] + ny * length).toFixed(2)} L${(mid[0] + tx).toFixed(2)} ${(mid[1] + ty).toFixed(2)}`,
    );
  });
  return marks.join(" ");
}

function arrow(x1: number, y1: number, x2: number, y2: number, head: number): string {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const wing = (tipX: number, tipY: number, direction: number) => {
    const a1 = angle + direction * Math.PI + Math.PI / 7;
    const a2 = angle + direction * Math.PI - Math.PI / 7;
    return `M${(tipX + Math.cos(a1) * head).toFixed(2)} ${(tipY + Math.sin(a1) * head).toFixed(2)} L${tipX.toFixed(2)} ${tipY.toFixed(2)} L${(tipX + Math.cos(a2) * head).toFixed(2)} ${(tipY + Math.sin(a2) * head).toFixed(2)}`;
  };
  return `M${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)} ${wing(x2, y2, 1)} ${wing(x1, y1, 0)}`;
}

const stateInk = {
  idle: "#5b4f60",
  selected: "#b23f66",
  invalid: "#c0392b",
  cut: "#2b2230",
} as const;

export function PatternPieceShape({
  piece,
  x = 0,
  y = 0,
  rotation = 0,
  scale = 1,
  fabric,
  state = "idle",
  mirrored = false,
  showLabel = true,
  cutCount,
}: PatternPieceShapeProps) {
  const id = useSvgId("piece");
  const raw = bounds(piece.shape.map(([px, py]) => [px, py] as Vec));
  const points: Vec[] = piece.shape.map(([px, py]) => [
    (mirrored ? raw.maxX - (px - raw.minX) : px) * scale,
    py * scale,
  ]);
  const box = bounds(points);
  const centre = centroid(points);
  const cx = box.minX + box.width / 2;
  const cy = box.minY + box.height / 2;
  const d = toPath(points);
  const inset = points.map(([px, py]): Vec => [
    px + (centre[0] - px) * Math.min(0.25, (1.2 * scale) / Math.max(1, box.width / 2)),
    py + (centre[1] - py) * Math.min(0.25, (1.2 * scale) / Math.max(1, box.height / 2)),
  ]);
  const short = Math.min(box.width, box.height);
  const fontSize = Math.max(1.6 * scale, Math.min(4 * scale, short * 0.12));
  const ink = stateInk[state];
  const look = fabric ? fabricLook(fabric) : undefined;
  const grainX = box.width > 7 * fontSize ? cx - box.width * 0.26 : cx;
  const grainLength = box.height * 0.6;
  const head = scale * 1.6;
  const labelColour = look && look.dark ? "#fffaf3" : "#2b2230";
  const haloColour = look && look.dark ? "#1c1220" : "#fffaf3";
  return (
    <g
      transform={`translate(${x * scale} ${y * scale}) rotate(${rotation} ${cx} ${cy})`}
      className={`ad-pattern-piece ad-pattern-piece--${state}`}
    >
      <defs>
        {fabric ? <FabricPattern id={`${id}-fabric`} fabric={fabric} tile={Math.max(10, scale * 6)} /> : null}
        <pattern id={`${id}-paper`} patternUnits="userSpaceOnUse" width={scale * 2} height={scale * 2}>
          <rect width={scale * 2} height={scale * 2} fill="#f8f0de" />
          <circle cx={scale} cy={scale} r={Math.max(0.5, scale * 0.08)} fill="#b7a27c" opacity={0.55} />
        </pattern>
      </defs>
      {state === "cut" ? (
        <path d={d} fill="#1c1220" opacity={0.22} transform={`translate(${scale * 0.5} ${scale * 0.8})`} />
      ) : null}
      {state === "selected" ? (
        <path
          d={d}
          fill="none"
          stroke="#d0587e"
          strokeOpacity={0.35}
          strokeWidth={10}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      ) : null}
      {state === "invalid" ? (
        <path
          d={d}
          fill="none"
          stroke="#c0392b"
          strokeOpacity={0.25}
          strokeWidth={10}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      ) : null}
      <path
        d={d}
        fill={fabric ? fabricFill(`${id}-fabric`) : `url(#${id}-paper)`}
        fillOpacity={fabric ? 1 : 0.88}
      />
      {fabric ? <path d={d} fill={fabricSheenFill(`${id}-fabric`)} /> : null}
      {state === "invalid" ? <path d={d} fill="#c0392b" opacity={0.16} /> : null}
      <path
        d={toPath(inset)}
        fill="none"
        stroke={look ? look.stitch : "#8a7a64"}
        strokeOpacity={0.7}
        strokeWidth={0.9}
        vectorEffect="non-scaling-stroke"
        strokeDasharray={state === "cut" ? "3 2" : undefined}
      />
      <path
        d={notchMarks(points, centre, scale * 1.3, 6 * scale)}
        fill="none"
        stroke={ink}
        strokeWidth={1.2}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
      <path
        d={arrow(grainX, cy - grainLength / 2, grainX, cy + grainLength / 2, head)}
        fill="none"
        stroke={look && look.dark ? "#fffaf3" : ink}
        strokeOpacity={0.85}
        strokeWidth={1.3}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {piece.grain === "bias-friendly" ? (
        <path
          d={arrow(
            grainX - grainLength * 0.2,
            cy + grainLength * 0.2,
            grainX + grainLength * 0.2,
            cy - grainLength * 0.2,
            head * 0.8,
          )}
          fill="none"
          stroke={look && look.dark ? "#fffaf3" : ink}
          strokeOpacity={0.6}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          strokeDasharray="3 2"
          strokeLinecap="round"
        />
      ) : null}
      {showLabel ? (
        <text
          x={grainX === cx ? cx : cx + box.width * 0.08}
          y={grainX === cx ? cy + grainLength / 2 + fontSize * 1.2 : cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily='"Playfair Display", Georgia, serif'
          fontSize={fontSize}
          fill={labelColour}
          stroke={haloColour}
          strokeWidth={fontSize * 0.28}
          strokeOpacity={0.65}
          paintOrder="stroke"
        >
          {piece.name}
          {cutCount !== undefined ? (
            <tspan
              x={grainX === cx ? cx : cx + box.width * 0.08}
              dy={fontSize * 1.2}
              fontSize={fontSize * 0.75}
            >
              {`Cut ${cutCount}`}
            </tspan>
          ) : null}
        </text>
      ) : null}
      <path
        d={d}
        fill="none"
        stroke={ink}
        strokeWidth={state === "cut" ? 1.4 : 1.6}
        vectorEffect="non-scaling-stroke"
        strokeDasharray={state === "cut" ? undefined : "7 4"}
        strokeLinejoin="round"
      />
    </g>
  );
}
