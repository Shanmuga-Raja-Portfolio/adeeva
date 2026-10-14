import { darken, lighten } from "../../../../ui/art/colourMix";
import { icingHex, spongeHex, type BakeLook } from "./bakeLook";
import { CakeStand } from "./CakeStand";

const SPOTS: readonly [number, number][] = [
  [132, 268],
  [200, 262],
  [268, 268],
  [124, 312],
  [200, 320],
  [276, 312],
];

function PetitFour({ x, y, look, index }: { x: number; y: number; look: BakeLook; index: number }) {
  const sponge = spongeHex(look, 0);
  const coat = look.iced ? icingHex(look, index) : lighten(sponge, 0.1);
  const trim = icingHex(look, index + 1);
  const size = 46;
  const half = size / 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={half + 6} rx={half + 6} ry={6} fill="#3b2620" opacity={0.14} />
      <path
        d={`M${-half} ${-half + 10} L0 ${-half} L${half} ${-half + 10} L${half} ${half - 4} L0 ${half + 6} L${-half} ${half - 4} Z`}
        fill={darken(coat, 0.08)}
        stroke={darken(coat, 0.28)}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path
        d={`M${-half} ${-half + 10} L0 ${-half} L${half} ${-half + 10} L0 ${-half + 20} Z`}
        fill={lighten(coat, 0.14)}
        stroke={darken(coat, 0.22)}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <path d={`M0 ${-half + 20} V${half + 6}`} stroke={darken(coat, 0.18)} strokeWidth={1} />
      {look.iced && look.pattern === "a"
        ? [-12, -4, 4, 12].map((dx) => (
            <circle
              key={dx}
              cx={dx}
              cy={-half + 10 + Math.abs(dx) * 0.4}
              r={2.6}
              fill={trim}
              stroke={darken(trim, 0.2)}
              strokeWidth={0.6}
            />
          ))
        : null}
      {look.iced && look.pattern === "b" ? (
        <path
          d={`M${-half + 6} ${-half + 10} L-6 ${-half + 4} L0 ${-half + 14} L6 ${-half + 4} L${half - 6} ${-half + 10}`}
          fill="none"
          stroke={trim}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      {look.fillingColour !== null ? (
        <path
          d={`M${-half} ${4} L0 ${14} L${half} ${4}`}
          fill="none"
          stroke={look.fillingColour}
          strokeWidth={3}
        />
      ) : null}
      <path
        d={`M${-half + 4} ${-half + 14} V${half - 8}`}
        stroke={lighten(coat, 0.5)}
        strokeWidth={3}
        opacity={0.5}
        strokeLinecap="round"
      />
    </g>
  );
}

export function PetitFoursArt({ look }: { readonly look: BakeLook }) {
  return (
    <g>
      <CakeStand width={320} y={326} />
      {SPOTS.map(([x, y], index) => (
        <PetitFour key={index} x={x} y={y} look={look} index={index} />
      ))}
    </g>
  );
}
