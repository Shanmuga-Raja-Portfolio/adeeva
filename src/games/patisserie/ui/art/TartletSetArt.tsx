import { darken, lighten } from "../../../../ui/art/colourMix";
import { icingHex, spongeHex, type BakeLook } from "./bakeLook";
import { CakeStand } from "./CakeStand";

const SPOTS: readonly [number, number][] = [
  [128, 276],
  [200, 270],
  [272, 276],
  [118, 312],
  [200, 320],
  [282, 312],
];

function Tartlet({ x, y, look, index }: { x: number; y: number; look: BakeLook; index: number }) {
  const crust = spongeHex(look, 0);
  const cream = look.fillingColour ?? "#fbf1d6";
  const trim = icingHex(look, index);
  const flutes = Array.from({ length: 9 }, (_, at) => at);
  return (
    <g transform={`translate(${x} ${y}) scale(1.12)`}>
      <ellipse cx={0} cy={22} rx={34} ry={6} fill="#3b2620" opacity={0.14} />
      <path
        d="M-30 0 L-24 18 Q0 26 24 18 L30 0 Z"
        fill={crust}
        stroke={darken(crust, 0.25)}
        strokeWidth={1.4}
      />
      {flutes.map((at) => (
        <path
          key={at}
          d={`M${-24 + at * 6} 4 L${-21 + at * 5.3} 20`}
          stroke={darken(crust, 0.18)}
          strokeWidth={1.2}
          opacity={0.6}
        />
      ))}
      <ellipse
        cx={0}
        cy={0}
        rx={30}
        ry={10}
        fill={lighten(crust, 0.2)}
        stroke={darken(crust, 0.25)}
        strokeWidth={1.2}
      />
      <ellipse cx={0} cy={1} rx={25} ry={7.5} fill={cream} />
      {look.iced && look.pattern === "a"
        ? [-16, -8, 0, 8, 16].map((dx) => (
            <circle
              key={dx}
              cx={dx}
              cy={-1 + Math.abs(dx) * 0.12}
              r={3}
              fill={trim}
              stroke={darken(trim, 0.2)}
              strokeWidth={0.6}
            />
          ))
        : null}
      {look.iced && look.pattern === "b" ? (
        <path
          d="M-14 1 Q-8 -6 0 0 Q8 6 14 -1"
          fill="none"
          stroke={trim}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      ) : null}
      <ellipse cx={-10} cy={-3} rx={6} ry={1.6} fill="#ffffff" opacity={0.35} />
    </g>
  );
}

export function TartletSetArt({ look }: { readonly look: BakeLook }) {
  return (
    <g>
      <CakeStand width={320} y={326} />
      {SPOTS.map(([x, y], index) => (
        <Tartlet key={index} x={x} y={y} look={look} index={index} />
      ))}
    </g>
  );
}
