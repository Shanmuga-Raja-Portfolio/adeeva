import type { Point } from "../../../../engine/geometry/point";
import type { OptionId } from "../../content/partOption";
import { bandOption, shapeOption, shapeOutline, seatOutline } from "../../core";
import { outlinePath } from "./outlinePath";

interface ShapeThumbProps {
  readonly optionId: OptionId;
}

function bandPoints(optionId: OptionId): Point[] {
  const wavy = bandOption({ band: optionId }) === "wavy-band";
  if (!wavy)
    return [
      [0.05, 0.38],
      [0.95, 0.38],
      [0.95, 0.62],
      [0.05, 0.62],
    ];
  const top = Array.from({ length: 21 }, (_, index): Point => [
    0.05 + index * 0.045,
    0.4 + 0.05 * Math.sin(index * 1.2),
  ]);
  const bottom = Array.from({ length: 21 }, (_, index): Point => [
    0.95 - index * 0.045,
    0.6 + 0.05 * Math.sin((20 - index) * 1.2),
  ]);
  return [...top, ...bottom];
}

function thumbPoints(optionId: OptionId): Point[][] {
  if (optionId === "smooth-band" || optionId === "wavy-band" || optionId === "hammered-band")
    return [bandPoints(optionId)];
  if (optionId === "plain")
    return [seatOutline("round").points.map(([x, y]): Point => [0.15 + x * 0.7, 0.15 + y * 0.7])];
  if (optionId === "star-window" || optionId === "dot-row")
    return [seatOutline("round").points.map(([x, y]): Point => [0.1 + x * 0.8, 0.1 + y * 0.8])];
  return [
    shapeOutline(shapeOption({ shape: optionId })).points.map(([x, y]): Point => [
      0.1 + x * 0.8,
      0.1 + y * 0.8,
    ]),
  ];
}

export function ShapeThumb({ optionId }: ShapeThumbProps) {
  const hammered = optionId === "hammered-band";
  return (
    <svg className="jb-shape-thumb" viewBox="0 0 1 1" aria-hidden="true">
      {thumbPoints(optionId).map((points, index) => (
        <path
          key={index}
          d={outlinePath(points)}
          fill="#d9b23c"
          stroke="#664e08"
          strokeWidth={0.03}
          strokeLinejoin="round"
        />
      ))}
      {optionId === "star-window" ? (
        <path
          d="M0.5 0.32 L0.55 0.45 L0.68 0.45 L0.57 0.53 L0.61 0.66 L0.5 0.58 L0.39 0.66 L0.43 0.53 L0.32 0.45 L0.45 0.45 Z"
          fill="#2a1d2c"
          opacity={0.8}
        />
      ) : null}
      {optionId === "dot-row"
        ? [0.34, 0.5, 0.66].map((x) => (
            <circle key={x} cx={x} cy={0.5} r={0.055} fill="#2a1d2c" opacity={0.8} />
          ))
        : null}
      {hammered
        ? [0.2, 0.38, 0.56, 0.74].map((x) => (
            <ellipse key={x} cx={x} cy={0.5} rx={0.05} ry={0.04} fill="#664e08" opacity={0.4} />
          ))
        : null}
    </svg>
  );
}
