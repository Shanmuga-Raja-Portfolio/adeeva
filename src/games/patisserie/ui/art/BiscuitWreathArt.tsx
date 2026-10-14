import type { Point } from "../../../../engine/geometry/point";
import { darken, lighten } from "../../../../ui/art/colourMix";
import { PIPE_PATTERNS } from "../../content/pipePattern";
import { icingHex, spongeHex, type BakeLook } from "./bakeLook";

const RING = 12;
const CX = 200;
const CY = 238;

function outline(points: readonly Point[], x: number, y: number, scale: number): string {
  return `${points
    .map(
      ([px, py], index) =>
        `${index === 0 ? "M" : "L"}${(x + (px - 12) * scale).toFixed(1)} ${(y + (py - 12) * scale).toFixed(1)}`,
    )
    .join(" ")} Z`;
}

export function BiscuitWreathArt({ look }: { readonly look: BakeLook }) {
  const shapes = PIPE_PATTERNS["biscuit-wreath"][look.pattern].paths.filter(
    (path) => path.surface === "biscuit",
  );
  const trim = icingHex(look, 1);
  return (
    <g>
      <ellipse cx={CX} cy={CY + 10} rx={160} ry={130} fill="#3b2620" opacity={0.1} />
      <ellipse cx={CX} cy={CY} rx={158} ry={126} fill="#f6efe2" stroke="#d6c8b0" strokeWidth={2} />
      <ellipse
        cx={CX}
        cy={CY}
        rx={146}
        ry={116}
        fill="none"
        stroke="#e7dcc6"
        strokeWidth={2}
        strokeDasharray="3 6"
      />
      {look.iced && look.pattern === "b" ? (
        <ellipse
          cx={CX}
          cy={CY}
          rx={92}
          ry={74}
          fill="none"
          stroke={trim}
          strokeWidth={5}
          strokeDasharray="10 8"
          strokeLinecap="round"
        />
      ) : null}
      {Array.from({ length: RING }, (_, index) => {
        const angle = -Math.PI / 2 + (index / RING) * Math.PI * 2;
        const x = CX + 112 * Math.cos(angle);
        const y = CY + 90 * Math.sin(angle);
        const shape = shapes[index % Math.max(1, shapes.length)];
        if (shape === undefined) return null;
        const dough = spongeHex(look, index % 2);
        const icing = icingHex(look, index);
        return (
          <g key={index}>
            <path d={outline(shape.points, x, y + 3, 2.6)} fill="#3b2620" opacity={0.12} />
            <path
              d={outline(shape.points, x, y, 2.6)}
              fill={dough}
              stroke={darken(dough, 0.25)}
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
            {look.iced ? (
              <>
                <path d={outline(shape.points, x, y, 2.3)} fill={lighten(icing, 0.55)} opacity={0.9} />
                <path
                  d={outline(shape.points, x, y, 2.3)}
                  fill="none"
                  stroke={icing}
                  strokeWidth={3.4}
                  strokeLinejoin="round"
                />
              </>
            ) : null}
          </g>
        );
      })}
      {look.iced && look.pattern === "a" ? (
        <g transform={`translate(${CX} ${CY + 92})`}>
          <path
            d="M0 0 C-30 -26 -46 6 0 0 C46 6 30 -26 0 0 Z"
            fill={trim}
            stroke={darken(trim, 0.25)}
            strokeWidth={1.4}
          />
          <path d="M0 0 L-16 28 M0 0 L16 28" stroke={trim} strokeWidth={6} strokeLinecap="round" />
          <circle r={6} fill={lighten(trim, 0.2)} stroke={darken(trim, 0.25)} strokeWidth={1.2} />
        </g>
      ) : null}
    </g>
  );
}
