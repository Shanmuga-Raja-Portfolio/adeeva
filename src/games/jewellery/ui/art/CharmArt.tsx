import type { Point } from "../../../../engine/geometry/point";
import type { CharmId } from "../../content/extra";
import type { ShapeId } from "../../content/partOption";
import { shapeOutline } from "../../core";
import { Glint } from "./Glint";
import { outlinePath } from "./outlinePath";

interface CharmArtProps {
  readonly charmId: CharmId;
  readonly shape?: ShapeId | null | undefined;
  readonly size?: number | undefined;
}

function motifPoints(shape: ShapeId): Point[] {
  return shapeOutline(shape).points.map(([x, y]): Point => [(x - 0.5) * 22, (y - 0.5) * 22]);
}

export function CharmArt({ charmId, shape = null, size = 1 }: CharmArtProps) {
  return (
    <g transform={`scale(${size})`}>
      <circle cx={0} cy={-15} r={3} fill="none" stroke="#9a7a14" strokeWidth={1.4} />
      {charmId === "star-charm" ? (
        <g>
          <path
            d="M0 -11 L3.2 -3.6 L11 -3.2 L5 1.8 L7 9.6 L0 5.4 L-7 9.6 L-5 1.8 L-11 -3.2 L-3.2 -3.6 Z"
            fill="#f2c94c"
            stroke="#8f6e10"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          <Glint x={-2.5} y={-3} size={2.6} />
        </g>
      ) : null}
      {charmId === "leaf-charm" ? (
        <g>
          <path
            d="M0 -12 C9 -6 9 6 0 12 C-9 6 -9 -6 0 -12 Z"
            fill="#9cb59a"
            stroke="#4f6f4d"
            strokeWidth={1.2}
          />
          <path d="M0 -10 L0 10 M0 -2 L4 -6 M0 4 L-4 0" stroke="#4f6f4d" strokeWidth={0.9} fill="none" />
        </g>
      ) : null}
      {charmId === "motif-charm" ? (
        <g>
          <path
            d={outlinePath(motifPoints(shape ?? "circle"))}
            fill="#e9cf6a"
            stroke="#8f6e10"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          <path
            d={outlinePath(motifPoints(shape ?? "circle"))}
            fill="#fff6c8"
            opacity={0.45}
            transform="translate(-1.2 -1.4) scale(0.72)"
          />
          <Glint x={-3} y={-4} size={2.4} />
        </g>
      ) : null}
      {charmId === "moon-charm" ? (
        <g>
          <path
            d="M3 -11 A11 11 0 1 0 3 11 A8 8 0 1 1 3 -11 Z"
            fill="#f3ead2"
            stroke="#a8936a"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          <circle cx={-5} cy={-3} r={1.4} fill="#d9c79f" />
          <circle cx={-3} cy={5} r={1} fill="#d9c79f" />
        </g>
      ) : null}
      {charmId === "shell-charm" ? (
        <g>
          <path
            d="M0 -10 C8 -10 12 -2 11 6 L0 11 L-11 6 C-12 -2 -8 -10 0 -10 Z"
            fill="#f2c4c0"
            stroke="#a86a64"
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          <path
            d="M0 10 L0 -8 M0 10 L-6 -6 M0 10 L6 -6 M0 10 L-10 2 M0 10 L10 2"
            stroke="#a86a64"
            strokeWidth={0.8}
            fill="none"
          />
        </g>
      ) : null}
      {charmId === "pearl-drop" ? (
        <g>
          <circle cx={0} cy={0} r={9} fill="#f6efe0" stroke="#b9ab90" strokeWidth={1.2} />
          <circle cx={-3} cy={-3} r={3.2} fill="#ffffff" opacity={0.9} />
          <circle cx={3} cy={4} r={4} fill="#e6dcc6" opacity={0.5} />
        </g>
      ) : null}
    </g>
  );
}
