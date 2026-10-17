import type { Point } from "../../../../engine/geometry/point";
import { floorPoint, lifted, pointsAttr, type CutawayFrame } from "./cutawayFrame";

const INK = "#3b2a33";
const CARD = "#d9a86c";

function Box({
  frame,
  col,
  row,
  size,
  base,
}: {
  frame: CutawayFrame;
  col: number;
  row: number;
  size: number;
  base: number;
}) {
  const h = frame.cell * size * 0.8;
  const up = (point: Point, extra: number): Point => lifted(point, base + extra);
  const a = floorPoint(frame, col, row);
  const b = floorPoint(frame, col + size, row);
  const c = floorPoint(frame, col + size, row + size);
  const d = floorPoint(frame, col, row + size);
  const line = Math.max(1, frame.scale * 1.6);
  return (
    <g stroke={INK} strokeWidth={line} strokeLinejoin="round">
      <polygon points={pointsAttr([up(d, 0), up(c, 0), up(c, h), up(d, h)])} fill={CARD} />
      <polygon points={pointsAttr([up(c, 0), up(b, 0), up(b, h), up(c, h)])} fill="#c18d52" />
      <polygon points={pointsAttr([up(a, h), up(b, h), up(c, h), up(d, h)])} fill="#e8c08c" />
      <path
        d={`M${pointsAttr([up([(a[0] + d[0]) / 2, (a[1] + d[1]) / 2], h)])} L${pointsAttr([up([(b[0] + c[0]) / 2, (b[1] + c[1]) / 2], h)])}`}
        stroke="#c9b48e"
        strokeWidth={line * 2.6}
      />
      <path
        d={`M${pointsAttr([up([(d[0] + c[0]) / 2, (d[1] + c[1]) / 2], h)])} L${pointsAttr([up([(d[0] + c[0]) / 2, (d[1] + c[1]) / 2], h * 0.45)])}`}
        stroke="#c9b48e"
        strokeWidth={line * 2.6}
      />
    </g>
  );
}

export function MovingBoxes({ frame }: { readonly frame: CutawayFrame }) {
  const col = Math.max(0.3, frame.cols - 2.2);
  const [tx, ty] = floorPoint(frame, 1.3, frame.rows - 1.4);
  const tin = frame.cell * 0.22;
  return (
    <g pointerEvents="none">
      <ellipse
        cx={floorPoint(frame, col + 0.9, 1.1)[0]}
        cy={floorPoint(frame, col + 0.9, 1.1)[1]}
        rx={frame.cell * 1.1}
        ry={frame.depth * 0.9}
        fill="#2b2230"
        opacity={0.14}
      />
      <Box frame={frame} col={col} row={0.3} size={1.1} base={0} />
      <Box frame={frame} col={col + 0.15} row={0.4} size={0.85} base={frame.cell * 0.88} />
      <Box frame={frame} col={col - 0.9} row={0.9} size={0.8} base={0} />
      <g transform={`translate(${tx} ${ty})`}>
        <ellipse cx={0} cy={tin * 0.9} rx={tin * 1.3} ry={tin * 0.35} fill="#2b2230" opacity={0.16} />
        <rect
          x={-tin}
          y={-tin}
          width={tin * 2}
          height={tin * 1.8}
          rx={tin * 0.2}
          fill="#c7ccd4"
          stroke={INK}
        />
        <ellipse cx={0} cy={-tin} rx={tin} ry={tin * 0.3} fill="#f6d77a" stroke={INK} />
      </g>
    </g>
  );
}
