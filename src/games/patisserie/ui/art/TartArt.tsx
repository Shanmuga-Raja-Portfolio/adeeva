import { darken, lighten } from "../../../../ui/art/colourMix";
import { icingHex, spongeHex, type BakeLook } from "./bakeLook";
import { CakeStand } from "./CakeStand";
import { dots, scallops } from "./pipingMarks";

const FRUIT: [number, number, string][] = [
  [-60, -6, "#b0213f"],
  [-30, -16, "#3d3f8f"],
  [0, -4, "#e4572e"],
  [32, -14, "#b0213f"],
  [62, -4, "#3d3f8f"],
  [-40, 12, "#e4572e"],
  [-6, 16, "#3d3f8f"],
  [30, 12, "#b0213f"],
];

export function TartArt({ look }: { readonly look: BakeLook }) {
  const crust = spongeHex(look, 0);
  const cream = look.fillingColour ?? "#fbf1d6";
  const trim = icingHex(look, 0);
  const glaze = icingHex(look, 1);
  const cy = 262;
  const rim = { cx: 200, cy, rx: 128, ry: 40 };
  const flutes = Array.from({ length: 22 }, (_, index) => index);
  return (
    <g>
      <CakeStand width={300} y={cy + 52} />
      <path
        d={`M72 ${cy} V${cy + 34} A128 40 0 0 0 328 ${cy + 34} V${cy} Z`}
        fill={crust}
        stroke={darken(crust, 0.25)}
        strokeWidth={1.4}
      />
      {flutes.map((index) => {
        const x = 76 + index * 11.6;
        return (
          <path
            key={index}
            d={`M${x} ${cy + 6} V${cy + 40}`}
            stroke={darken(crust, 0.18)}
            strokeWidth={1.6}
            opacity={0.55}
          />
        );
      })}
      <ellipse cx={200} cy={cy} rx={128} ry={40} fill={lighten(crust, 0.2)} stroke={darken(crust, 0.25)} />
      <ellipse cx={200} cy={cy + 2} rx={112} ry={32} fill={cream} />
      {look.iced
        ? FRUIT.map(([x, y, colour], index) => (
            <g key={index}>
              <circle cx={200 + x} cy={cy + y} r={11} fill={colour} />
              <circle cx={200 + x - 3} cy={cy + y - 4} r={3} fill="#ffffff" opacity={0.55} />
            </g>
          ))
        : null}
      {look.iced && look.pattern === "a" ? (
        <g>
          {dots(rim, 18).map(([x, y], index) => (
            <circle key={index} cx={x} cy={y - 2} r={6} fill={trim} stroke={darken(trim, 0.2)} />
          ))}
          <path
            d={`M140 ${cy - 10} L160 ${cy + 12} L180 ${cy - 10} L200 ${cy + 12} L220 ${cy - 10} L240 ${cy + 12} L260 ${cy - 10}`}
            fill="none"
            stroke={glaze}
            strokeWidth={4}
            strokeLinejoin="round"
            opacity={0.85}
          />
        </g>
      ) : null}
      {look.iced && look.pattern === "b" ? (
        <g>
          <path d={scallops(rim, 14, 7)} fill="none" stroke={trim} strokeWidth={6} strokeLinecap="round" />
          <path
            d={`M130 ${cy} Q165 ${cy - 26} 200 ${cy} T270 ${cy}`}
            fill="none"
            stroke={glaze}
            strokeWidth={4}
            opacity={0.85}
          />
        </g>
      ) : null}
      <ellipse cx={170} cy={cy - 10} rx={40} ry={8} fill="#ffffff" opacity={look.iced ? 0.22 : 0} />
    </g>
  );
}
