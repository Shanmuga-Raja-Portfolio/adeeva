import { darken, lighten } from "../../../../ui/art/colourMix";
import type { PipePathDef } from "../../content/pipePattern";

export interface PipeSurfaceProps {
  readonly path: PipePathDef;
  readonly coat: string;
  readonly sponge: string;
}

function outline(path: PipePathDef, scale: number): string {
  return `${path.points
    .map(
      ([x, y], index) =>
        `${index === 0 ? "M" : "L"}${(12 + (x - 12) * scale).toFixed(2)} ${(12 + (y - 12) * scale).toFixed(2)}`,
    )
    .join(" ")} Z`;
}

export function PipeSurface({ path, coat, sponge }: PipeSurfaceProps) {
  switch (path.surface) {
    case "cupcake":
      return (
        <g>
          <circle cx={12} cy={12} r={7.4} fill="#f4a259" />
          <circle cx={12} cy={12} r={6.6} fill={sponge} />
          <circle cx={12} cy={12} r={5.6} fill={lighten(coat, 0.4)} />
        </g>
      );
    case "cake":
      return (
        <g>
          <circle cx={12} cy={12} r={11.6} fill={darken(coat, 0.08)} />
          <circle cx={12} cy={12} r={11} fill={coat} />
          <circle cx={9} cy={8} r={4} fill="#ffffff" opacity={0.18} />
        </g>
      );
    case "tier":
      return (
        <g>
          <circle cx={12} cy={12} r={11.6} fill={darken(coat, 0.1)} />
          <circle cx={12} cy={12} r={11} fill={coat} />
          <circle cx={12} cy={12} r={6.4} fill={darken(coat, 0.06)} />
          <circle cx={12} cy={12} r={6} fill={lighten(coat, 0.08)} />
        </g>
      );
    case "tart":
      return (
        <g>
          <circle cx={12} cy={12} r={11.4} fill={sponge} stroke={darken(sponge, 0.25)} strokeWidth={0.2} />
          <circle cx={12} cy={12} r={10.2} fill="#fbf1d6" />
          {[
            [8, 8, "#b0213f"],
            [15, 9, "#3d3f8f"],
            [10, 15, "#e4572e"],
            [16, 15, "#b0213f"],
            [12, 12, "#3d3f8f"],
          ].map(([x, y, colour]) => (
            <circle key={`${x}-${y}`} cx={Number(x)} cy={Number(y)} r={1.1} fill={String(colour)} />
          ))}
        </g>
      );
    case "biscuit":
      return (
        <g>
          <path d={outline(path, 1.14)} fill={darken(sponge, 0.08)} />
          <path d={outline(path, 1.08)} fill={sponge} />
        </g>
      );
  }
}
