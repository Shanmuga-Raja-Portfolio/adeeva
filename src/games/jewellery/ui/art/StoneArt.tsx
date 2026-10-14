import type { Point } from "../../../../engine/geometry/point";
import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { StoneCut } from "../../content/stone";
import { seatOutline } from "../../core";
import { Glint } from "./Glint";
import { outlinePath } from "./outlinePath";

interface StoneArtProps {
  readonly cut: StoneCut;
  readonly hex: string;
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly rotation?: number | undefined;
  readonly twinkle?: boolean | undefined;
}

function centred(points: readonly Point[], size: number, shrink: number): Point[] {
  return points.map(([x, y]): Point => [(x - 0.5) * size * shrink, (y - 0.5) * size * shrink]);
}

export function StoneArt({ cut, hex, x, y, size, rotation = 0, twinkle = false }: StoneArtProps) {
  const id = useSvgId("jb-stone");
  const outline = centred(seatOutline(cut).points, size, 0.92);
  const table = centred(seatOutline(cut).points, size, 0.5);
  const step = Math.max(1, Math.floor(outline.length / 8));
  const facets = outline.filter((_, index) => index % step === 0);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      <defs>
        <radialGradient id={`${id}-body`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor={lighten(hex, 0.55)} />
          <stop offset="0.55" stopColor={hex} />
          <stop offset="1" stopColor={darken(hex, 0.35)} />
        </radialGradient>
      </defs>
      <path d={outlinePath(outline)} fill={`url(#${id}-body)`} stroke={darken(hex, 0.5)} strokeWidth={1.2} />
      <g stroke={lighten(hex, 0.7)} strokeOpacity={0.55} strokeWidth={0.8}>
        {facets.map(([fx, fy], index) => {
          const inner = table[(index * step) % table.length] ?? [0, 0];
          return <line key={index} x1={fx} y1={fy} x2={inner[0]} y2={inner[1]} />;
        })}
      </g>
      <path
        d={outlinePath(table)}
        fill={lighten(hex, 0.35)}
        fillOpacity={0.75}
        stroke={lighten(hex, 0.7)}
        strokeWidth={0.8}
      />
      <path
        d={outlinePath(centred(seatOutline(cut).points, size, 0.5), 1, size * 0.08, size * 0.1)}
        fill={darken(hex, 0.25)}
        fillOpacity={0.25}
      />
      <Glint x={-size * 0.16} y={-size * 0.16} size={size * 0.14} twinkle={twinkle} />
    </g>
  );
}
