import { darken } from "../../../../ui/art/colourMix";
import { icingHex, spongeHex, type BakeLook } from "./bakeLook";
import { CakeBody } from "./CakeBody";
import { CakeStand } from "./CakeStand";
import { dots, scallops } from "./pipingMarks";

export interface TierCakeArtProps {
  readonly look: BakeLook;
  readonly showUpper?: boolean | undefined;
  readonly showLower?: boolean | undefined;
}

export function TierCakeArt({ look, showUpper = true, showLower = true }: TierCakeArtProps) {
  const coat = look.iced ? icingHex(look, 0) : null;
  const trim = icingHex(look, 1);
  const garland = icingHex(look, 2);
  const lowerTop = 236;
  const upperTop = 150;
  const lowerRing = { cx: 200, cy: lowerTop + 84, rx: 110, ry: 25 };
  const upperRing = { cx: 200, cy: upperTop + 82, rx: 62, ry: 15 };
  const garlandRing = { cx: 200, cy: lowerTop + 26, rx: 108, ry: 25 };
  return (
    <g>
      <CakeStand width={270} y={lowerTop + 92} />
      {showLower ? (
        <CakeBody
          cx={200}
          top={lowerTop}
          width={220}
          height={84}
          sponge={spongeHex(look, 0)}
          coat={coat}
          fillingColour={look.fillingColour}
          layered
        />
      ) : null}
      {showUpper ? (
        <CakeBody
          cx={200}
          top={upperTop}
          width={124}
          height={82}
          sponge={spongeHex(look, 1)}
          coat={coat}
          fillingColour={look.fillingColour}
          layered
        />
      ) : null}
      {look.iced && look.pattern === "a" ? (
        <g fill="none" strokeLinecap="round">
          <path d={scallops(lowerRing, 10, 10)} stroke={trim} strokeWidth={6} />
          <path d={scallops(upperRing, 7, 8)} stroke={trim} strokeWidth={5} />
          <path d={scallops(garlandRing, 5, 18)} stroke={garland} strokeWidth={4} />
        </g>
      ) : null}
      {look.iced && look.pattern === "b" ? (
        <g>
          {[...dots(lowerRing, 20), ...dots(upperRing, 13)].map(([x, y], index) => (
            <circle key={index} cx={x} cy={y} r={5} fill={trim} stroke={darken(trim, 0.2)} strokeWidth={1} />
          ))}
          <path
            d={scallops(garlandRing, 6, 26)}
            fill="none"
            stroke={garland}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </g>
      ) : null}
    </g>
  );
}
