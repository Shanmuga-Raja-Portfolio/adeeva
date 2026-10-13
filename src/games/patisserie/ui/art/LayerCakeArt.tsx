import { darken } from "../../../../ui/art/colourMix";
import { icingHex, spongeHex, type BakeLook } from "./bakeLook";
import { CakeBody } from "./CakeBody";
import { CakeStand } from "./CakeStand";
import { dots, rope, scallops } from "./pipingMarks";

export function LayerCakeArt({ look }: { readonly look: BakeLook }) {
  const coat = look.iced ? icingHex(look, 0) : null;
  const trim = icingHex(look, 1);
  const top = 196;
  const height = 116;
  const topRing = { cx: 200, cy: top, rx: 92, ry: 20 };
  const baseRing = { cx: 200, cy: top + height, rx: 100, ry: 23 };
  return (
    <g>
      <CakeStand width={250} y={top + height + 8} />
      <CakeBody
        cx={200}
        top={top}
        width={200}
        height={height}
        sponge={spongeHex(look, 0)}
        coat={coat}
        fillingColour={look.fillingColour}
        layered
      />
      {look.iced && look.pattern === "a" ? (
        <g>
          <path
            d={scallops(topRing, 9, 12)}
            fill="none"
            stroke={trim}
            strokeWidth={6}
            strokeLinecap="round"
          />
          {dots(baseRing, 16).map(([x, y], index) => (
            <circle key={index} cx={x} cy={y} r={6} fill={trim} stroke={darken(trim, 0.2)} strokeWidth={1} />
          ))}
        </g>
      ) : null}
      {look.iced && look.pattern === "b" ? (
        <g>
          <path d={rope(topRing, 14, 6)} fill="none" stroke={trim} strokeWidth={5} strokeLinecap="round" />
          {dots(baseRing, 22).map(([x, y], index) => (
            <circle key={index} cx={x} cy={y} r={4} fill={trim} />
          ))}
        </g>
      ) : null}
    </g>
  );
}
