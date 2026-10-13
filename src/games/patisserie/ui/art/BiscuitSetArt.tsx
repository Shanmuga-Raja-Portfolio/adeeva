import type { Point } from "../../../../engine/geometry/point";
import { darken, lighten } from "../../../../ui/art/colourMix";
import { PIPE_PATTERNS } from "../../content/pipePattern";
import { icingHex, spongeHex, type BakeLook } from "./bakeLook";

const SPOTS: [number, number][] = [
  [110, 190],
  [200, 180],
  [290, 190],
  [110, 290],
  [200, 300],
  [290, 290],
];

function outline(points: readonly Point[], x: number, y: number, scale: number): string {
  return `${points
    .map(
      ([px, py], index) =>
        `${index === 0 ? "M" : "L"}${(x + (px - 12) * scale).toFixed(1)} ${(y + (py - 12) * scale).toFixed(1)}`,
    )
    .join(" ")} Z`;
}

export function BiscuitSetArt({ look }: { readonly look: BakeLook }) {
  const dough = spongeHex(look, 0);
  const paths = PIPE_PATTERNS["iced-biscuits"][look.pattern].paths;
  return (
    <g>
      <rect x={40} y={110} width={320} height={250} rx={18} fill="#d9dde4" stroke="#aab1bd" strokeWidth={2} />
      <rect x={52} y={122} width={296} height={226} rx={12} fill="#eef0f4" />
      {SPOTS.map(([x, y], index) => {
        const path = paths[index % paths.length];
        if (path === undefined) return null;
        const d = outline(path.points, x, y, 3.2);
        const icing = icingHex(look, index);
        return (
          <g key={index}>
            <path d={d} transform="translate(3 5)" fill="#3b2620" opacity={0.14} />
            <path d={d} fill={dough} stroke={darken(dough, 0.25)} strokeWidth={1.6} strokeLinejoin="round" />
            {look.iced ? (
              <>
                <path d={outline(path.points, x, y, 2.9)} fill={lighten(icing, 0.55)} opacity={0.9} />
                <path
                  d={outline(path.points, x, y, 2.9)}
                  fill="none"
                  stroke={icing}
                  strokeWidth={5}
                  strokeLinejoin="round"
                />
              </>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}
