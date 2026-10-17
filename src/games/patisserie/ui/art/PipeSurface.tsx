import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";
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

function Frosting({ coat, radius }: { readonly coat: string; readonly radius: number }) {
  const id = useSvgId("frosting");
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-sheen`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.7} />
          <stop offset="0.4" stopColor="#ffffff" stopOpacity={0.1} />
          <stop offset="0.8" stopColor={darken(coat, 0.2)} stopOpacity={0.25} />
          <stop offset="1" stopColor={darken(coat, 0.35)} stopOpacity={0.55} />
        </radialGradient>
      </defs>
      <g fill="none" strokeLinecap="round">
        {[0.3, 0.52, 0.74, 0.92].map((share, index) => (
          <path
            key={share}
            d={`M${(12 - radius * share).toFixed(2)} 12 A${(radius * share).toFixed(2)} ${(radius * share).toFixed(2)} 0 1 1 ${(12 + radius * share * 0.7).toFixed(2)} ${(12 + radius * share * 0.7).toFixed(2)}`}
            stroke={index % 2 === 0 ? lighten(coat, 0.6) : darken(coat, 0.2)}
            strokeWidth={0.5}
            opacity={0.9}
          />
        ))}
      </g>
      <circle cx={12} cy={12} r={radius} fill={`url(#${id}-sheen)`} />
      <path
        d={`M${(12 - radius * 0.86).toFixed(2)} ${(12 - radius * 0.3).toFixed(2)} A${radius} ${radius} 0 0 1 ${(12 - radius * 0.2).toFixed(2)} ${(12 - radius * 0.97).toFixed(2)}`}
        fill="none"
        stroke="#ffffff"
        strokeWidth={0.4}
        strokeLinecap="round"
        opacity={0.7}
      />
    </g>
  );
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
          <circle cx={12.35} cy={12.6} r={11.7} fill="#3b2620" opacity={0.2} />
          <circle cx={12} cy={12} r={11.6} fill={darken(coat, 0.16)} />
          <circle cx={12} cy={12} r={11} fill={coat} />
          <Frosting coat={coat} radius={11} />
        </g>
      );
    case "tier":
      return (
        <g>
          <circle cx={12.35} cy={12.6} r={11.7} fill="#3b2620" opacity={0.2} />
          <circle cx={12} cy={12} r={11.6} fill={darken(coat, 0.14)} />
          <circle cx={12} cy={12} r={11} fill={coat} />
          <Frosting coat={coat} radius={11} />
          <circle cx={12} cy={12} r={6.4} fill={darken(coat, 0.06)} />
          <circle cx={12} cy={12} r={6} fill={lighten(coat, 0.08)} />
          <Frosting coat={coat} radius={6} />
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
    case "grand":
      return (
        <g>
          <circle cx={12} cy={12} r={11.6} fill={darken(coat, 0.12)} />
          <circle cx={12} cy={12} r={11.2} fill={coat} />
          <circle cx={12} cy={12} r={8} fill={darken(coat, 0.08)} />
          <circle cx={12} cy={12} r={7.6} fill={lighten(coat, 0.05)} />
          <circle cx={12} cy={12} r={4.6} fill={darken(coat, 0.06)} />
          <circle cx={12} cy={12} r={4.2} fill={lighten(coat, 0.12)} />
        </g>
      );
    case "petit":
      return (
        <g>
          <rect x={5.4} y={5.4} width={13.2} height={13.2} rx={1.4} fill={darken(coat, 0.12)} />
          <rect x={6} y={6} width={12} height={12} rx={1} fill={coat} />
          <rect x={7} y={7} width={4} height={2} rx={1} fill="#ffffff" opacity={0.3} />
        </g>
      );
    case "tartlet":
      return (
        <g>
          <circle cx={12} cy={12} r={7.4} fill={sponge} stroke={darken(sponge, 0.25)} strokeWidth={0.2} />
          <circle cx={12} cy={12} r={6.4} fill="#fbf1d6" />
          <circle cx={10} cy={10} r={1.6} fill="#ffffff" opacity={0.4} />
        </g>
      );
    case "roll":
      return (
        <g>
          <rect x={2.4} y={7} width={19.2} height={10} rx={5} fill={darken(coat, 0.1)} />
          <rect x={2.8} y={7.4} width={18.4} height={9.2} rx={4.6} fill={coat} />
          <path d="M4 9 H20" stroke="#ffffff" strokeWidth={0.6} opacity={0.4} />
        </g>
      );
    case "wreath":
      return (
        <g>
          <circle cx={12} cy={12} r={11} fill="none" stroke={darken(sponge, 0.08)} strokeWidth={4} />
          <circle
            cx={12}
            cy={12}
            r={11}
            fill="none"
            stroke={sponge}
            strokeWidth={3.2}
            strokeDasharray="2.6 0.8"
          />
          <circle cx={12} cy={12} r={8.6} fill="#f6efe2" />
        </g>
      );
    case "plaque":
      return (
        <g>
          <rect x={3.4} y={4.4} width={17.2} height={15.2} rx={2.4} fill="#3b2018" />
          <rect x={4} y={5} width={16} height={14} rx={2} fill="#5a3324" />
          <path d="M5 6.4 H12" stroke="#a46f55" strokeWidth={0.5} opacity={0.7} />
        </g>
      );
  }
}
