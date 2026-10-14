import { darken } from "../../../../ui/art/colourMix";
import { icingHex, spongeHex, type BakeLook } from "./bakeLook";
import { CakeBody } from "./CakeBody";
import { CakeStand } from "./CakeStand";
import { dots, scallops } from "./pipingMarks";

export interface ThreeTierArtProps {
  readonly look: BakeLook;
  readonly shown?: number | undefined;
}

const TIERS = [
  { top: 262, width: 230, height: 70 },
  { top: 194, width: 160, height: 68 },
  { top: 130, width: 100, height: 64 },
] as const;

export function ThreeTierArt({ look, shown = 3 }: ThreeTierArtProps) {
  const coat = look.iced ? icingHex(look, 0) : null;
  const trim = icingHex(look, 1);
  const garland = icingHex(look, 2);
  return (
    <g>
      <CakeStand width={280} y={340} />
      {TIERS.slice(0, shown).map((tier, index) => (
        <CakeBody
          key={index}
          cx={200}
          top={tier.top}
          width={tier.width}
          height={tier.height}
          sponge={spongeHex(look, index)}
          coat={coat}
          fillingColour={look.fillingColour}
          layered
        />
      ))}
      {look.iced
        ? TIERS.slice(0, shown).map((tier, index) => {
            const ring = { cx: 200, cy: tier.top + tier.height, rx: tier.width / 2, ry: tier.width * 0.11 };
            const top = { cx: 200, cy: tier.top + 20, rx: tier.width / 2 - 2, ry: tier.width * 0.1 };
            return look.pattern === "a" ? (
              <g key={index} fill="none" strokeLinecap="round">
                <path d={scallops(ring, 8 - index * 2, 8)} stroke={trim} strokeWidth={5} />
                {index === 0 ? <path d={scallops(top, 6, 14)} stroke={garland} strokeWidth={4} /> : null}
              </g>
            ) : (
              <g key={index}>
                {dots(ring, 18 - index * 4).map(([x, y], at) => (
                  <circle
                    key={at}
                    cx={x}
                    cy={y}
                    r={4.4 - index * 0.6}
                    fill={trim}
                    stroke={darken(trim, 0.2)}
                    strokeWidth={0.8}
                  />
                ))}
                {index === 0 ? (
                  <path d={scallops(top, 5, 18)} fill="none" stroke={garland} strokeWidth={4} />
                ) : null}
              </g>
            );
          })
        : null}
    </g>
  );
}
