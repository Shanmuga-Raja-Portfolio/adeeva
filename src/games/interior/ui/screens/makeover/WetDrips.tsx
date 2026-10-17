import { darken, lighten } from "../../../../../ui/art/colourMix";

interface WetDripsProps {
  readonly cells: readonly { readonly x: number; readonly y: number; readonly colour: string }[];
  readonly size: number;
}

const SPOTS = [0.16, 0.47, 0.78] as const;

function Drip({
  x,
  y,
  long,
  wide,
  colour,
}: {
  x: number;
  y: number;
  long: number;
  wide: number;
  colour: string;
}) {
  const bulb = wide * 0.95;
  return (
    <g>
      <path
        d={`M${x - wide} ${y - 3} C${x - wide * 0.6} ${y + long * 0.35} ${x - wide * 0.35} ${y + long * 0.7} ${x - bulb} ${y + long} A${bulb} ${bulb} 0 1 0 ${x + bulb} ${y + long} C${x + wide * 0.35} ${y + long * 0.7} ${x + wide * 0.6} ${y + long * 0.35} ${x + wide} ${y - 3} Z`}
        fill={colour}
        stroke={darken(colour, 0.25)}
        strokeWidth={1}
      />
      <ellipse
        cx={x - bulb * 0.35}
        cy={y + long - bulb * 0.1}
        rx={bulb * 0.28}
        ry={bulb * 0.45}
        fill={lighten(colour, 0.65)}
        opacity={0.8}
      />
    </g>
  );
}

export function WetDrips({ cells, size }: WetDripsProps) {
  return (
    <g pointerEvents="none">
      {cells.map((cell, index) => {
        const spot = SPOTS[index % SPOTS.length] ?? 0.5;
        const step = (index * 7 + Math.round(cell.x / size)) % 4;
        return (
          <Drip
            key={`${cell.x}-${cell.y}`}
            x={cell.x + size * spot + (step - 1.5) * 3}
            y={cell.y + size}
            long={10 + step * 7}
            wide={4 + (step % 3) * 1.5}
            colour={cell.colour}
          />
        );
      })}
    </g>
  );
}
