import { darken, lighten } from "../../../../ui/art/colourMix";
import { icingHex, spongeHex, type BakeLook } from "./bakeLook";

function spiralPath(cx: number, cy: number, turns: number, radius: number): string {
  const steps = 60;
  return Array.from({ length: steps + 1 }, (_, index) => {
    const share = index / steps;
    const angle = share * turns * Math.PI * 2;
    const r = radius * share;
    return `${index === 0 ? "M" : "L"}${(cx + r * Math.cos(angle)).toFixed(1)} ${(cy + r * Math.sin(angle) * 0.92).toFixed(1)}`;
  }).join(" ");
}

export function SpiralRollArt({ look }: { readonly look: BakeLook }) {
  const sponge = spongeHex(look, 0);
  const coat = look.iced ? icingHex(look, 0) : sponge;
  const trim = icingHex(look, 1);
  const filling = look.fillingColour ?? lighten(sponge, 0.5);
  return (
    <g>
      <rect x={52} y={300} width={310} height={36} rx={16} fill="#c9935b" stroke="#8e5f32" strokeWidth={2} />
      <path d="M64 312 H350" stroke="#e0b07a" strokeWidth={3} opacity={0.7} />
      <ellipse cx={200} cy={340} rx={140} ry={8} fill="#3b2620" opacity={0.12} />
      <path
        d="M96 196 H244 A44 52 0 0 1 244 300 H96 Z"
        fill={darken(coat, 0.06)}
        stroke={darken(coat, 0.28)}
        strokeWidth={1.6}
      />
      <path
        d="M104 206 H244"
        stroke={lighten(coat, 0.5)}
        strokeWidth={6}
        opacity={0.4}
        strokeLinecap="round"
      />
      <ellipse
        cx={96}
        cy={248}
        rx={44}
        ry={52}
        fill={lighten(sponge, 0.12)}
        stroke={darken(sponge, 0.3)}
        strokeWidth={1.6}
      />
      <path
        d={spiralPath(96, 248, 3, 40)}
        fill="none"
        stroke={filling}
        strokeWidth={5.5}
        strokeLinecap="round"
      />
      <ellipse cx={96} cy={248} rx={44} ry={52} fill="none" stroke={coat} strokeWidth={4} />
      {[0, 1].map((slice) => {
        const x = 292 + slice * 46;
        return (
          <g key={slice} transform={`translate(${x} 316)`}>
            <ellipse cx={0} cy={0} rx={22} ry={8} fill="#3b2620" opacity={0.12} />
            <ellipse
              cx={0}
              cy={-18}
              rx={22}
              ry={22}
              fill={lighten(sponge, 0.14)}
              stroke={darken(sponge, 0.3)}
              strokeWidth={1.2}
            />
            <path
              d={spiralPath(0, -18, 2.5, 19)}
              fill="none"
              stroke={filling}
              strokeWidth={3.4}
              strokeLinecap="round"
            />
            <ellipse cx={0} cy={-18} rx={22} ry={22} fill="none" stroke={coat} strokeWidth={3} />
          </g>
        );
      })}
      {look.iced && look.pattern === "a" ? (
        <path
          d={Array.from(
            { length: 10 },
            (_, index) => `${index === 0 ? "M" : "L"}${110 + index * 15} ${index % 2 === 0 ? 206 : 222}`,
          ).join(" ")}
          fill="none"
          stroke={trim}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      {look.iced && look.pattern === "b"
        ? Array.from({ length: 9 }, (_, index) => (
            <circle
              key={index}
              cx={112 + index * 16}
              cy={212 + Math.sin(index) * 4}
              r={5}
              fill={trim}
              stroke={darken(trim, 0.2)}
              strokeWidth={0.8}
            />
          ))
        : null}
    </g>
  );
}
