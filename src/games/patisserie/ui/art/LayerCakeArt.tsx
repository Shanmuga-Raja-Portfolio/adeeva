import { darken, lighten } from "../../../../ui/art/colourMix";
import { icingHex, spongeHex, type BakeLook } from "./bakeLook";
import { CakeBody } from "./CakeBody";
import { CakeStand } from "./CakeStand";
import { dots, rope, scallops, type Ellipse } from "./pipingMarks";

function swagJoins(ring: Ellipse, count: number): [number, number][] {
  return Array.from({ length: count + 1 }, (_, index) => {
    const theta = Math.PI - (Math.PI * index) / count;
    return [ring.cx + ring.rx * Math.cos(theta), ring.cy + ring.ry * Math.sin(theta)];
  });
}

interface SwagsProps {
  readonly ring: Ellipse;
  readonly count: number;
  readonly depth: number;
  readonly colour: string;
}

function Swags({ ring, count, depth, colour }: SwagsProps) {
  const line = scallops(ring, count, depth);
  return (
    <g>
      <g fill="none" strokeLinecap="round">
        <path
          d={line}
          stroke={darken(colour, 0.25)}
          strokeWidth={5}
          opacity={0.3}
          transform="translate(1.5 3)"
        />
        <path d={line} stroke={colour} strokeWidth={4.5} />
        <path
          d={line}
          stroke={lighten(colour, 0.6)}
          strokeWidth={1.4}
          opacity={0.85}
          transform="translate(-0.6 -1.2)"
        />
      </g>
      {swagJoins(ring, count).map(([x, y], index) => (
        <g key={index}>
          <circle cx={x} cy={y} r={5.5} fill={colour} stroke={darken(colour, 0.2)} strokeWidth={1} />
          <circle cx={x - 1.6} cy={y - 1.8} r={1.8} fill="#ffffff" opacity={0.75} />
        </g>
      ))}
    </g>
  );
}

export function LayerCakeArt({ look }: { readonly look: BakeLook }) {
  const coat = look.iced ? icingHex(look, 0) : null;
  const trim = icingHex(look, 1);
  const top = 196;
  const height = 116;
  const topRing = { cx: 200, cy: top, rx: 92, ry: 20 };
  const baseRing = { cx: 200, cy: top + height, rx: 100, ry: 23 };
  const swagRing = { cx: 200, cy: top + 34, rx: 100, ry: 23 };
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
      {look.iced ? (
        <Swags
          ring={swagRing}
          count={look.pattern === "a" ? 5 : 4}
          depth={look.pattern === "a" ? 24 : 30}
          colour={trim}
        />
      ) : null}
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
