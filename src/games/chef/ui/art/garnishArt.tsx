import { darken, lighten } from "../../../../ui/art/colourMix";
import type { PieceArtProps } from "./heroArt";
import { scatterInEllipse } from "./scatter";

function Swoosh({ w, h, c1, c2 }: PieceArtProps) {
  return (
    <>
      <path
        d={`M4 ${h * 0.62} C${w * 0.25} ${h * 0.05} ${w * 0.6} ${h * 0.05} ${w - 4} ${h * 0.4} C${w * 0.6} ${h * 0.3} ${w * 0.3} ${h * 0.5} 4 ${h * 0.62} Z`}
        fill={c1}
      />
      <path
        d={`M${w * 0.2} ${h * 0.44} C${w * 0.4} ${h * 0.24} ${w * 0.62} ${h * 0.22} ${w * 0.84} ${h * 0.34}`}
        stroke={c2}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        opacity={0.8}
      />
      <circle cx={w - 10} cy={h * 0.56} r={4} fill={c1} />
    </>
  );
}

function Dots({ w, h, c1, c2 }: PieceArtProps) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((index) => (
        <g key={index}>
          <circle cx={10 + (index * (w - 20)) / 4} cy={h / 2} r={9 - index * 1.2} fill={c1} />
          <circle cx={7 + (index * (w - 20)) / 4} cy={h / 2 - 3} r={2} fill={c2} />
        </g>
      ))}
    </>
  );
}

function Drizzle({ w, h, c1, c2 }: PieceArtProps) {
  return (
    <>
      <path
        d={`M6 ${h / 2} q${w / 12} ${-h / 2} ${w / 6} 0 t${w / 6} 0 t${w / 6} 0 t${w / 6} 0 t${w / 6} 0 t${w / 8} 0`}
        stroke={darken(c2, 0.1)}
        strokeWidth={7}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M6 ${h / 2} q${w / 12} ${-h / 2} ${w / 6} 0 t${w / 6} 0 t${w / 6} 0 t${w / 6} 0 t${w / 6} 0 t${w / 8} 0`}
        stroke={c1}
        strokeWidth={5}
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}

function Leaf({ w, h, c1, c2 }: PieceArtProps) {
  const leaf = (angle: number, scale: number) => (
    <g transform={`translate(${w / 2} ${h / 2}) rotate(${angle}) scale(${scale})`}>
      <path
        d="M0 0 C6 -12 18 -16 24 -14 C22 -6 12 2 0 0 Z"
        fill={c1}
        stroke={darken(c1, 0.3)}
        strokeWidth={1}
      />
      <path d="M0 0 C8 -6 16 -10 22 -13" stroke={c2} strokeWidth={1.2} fill="none" />
    </g>
  );
  return (
    <>
      {leaf(-10, 1)}
      {leaf(130, 0.9)}
      {leaf(250, 0.8)}
      <circle cx={w / 2} cy={h / 2} r={2.5} fill={darken(c1, 0.3)} />
    </>
  );
}

function Shavings({ w, h, c1, c2, seed }: PieceArtProps) {
  return (
    <>
      {scatterInEllipse(seed, 6, w, h, 0.6).map((shaving, index) => (
        <path
          key={index}
          d={`M${shaving.x - 9} ${shaving.y} q9 -8 18 0 q-9 4 -18 0 Z`}
          transform={`rotate(${shaving.turn} ${shaving.x} ${shaving.y})`}
          fill={c1}
          stroke={c2}
          strokeWidth={1}
        />
      ))}
    </>
  );
}

function Drops({ w, h, c1, c2, seed }: PieceArtProps) {
  return (
    <>
      {scatterInEllipse(seed, 7, w, h, 0.75).map((drop, index) => (
        <g key={index}>
          <circle cx={drop.x} cy={drop.y} r={4 * drop.size} fill={c1} opacity={0.85} />
          <circle cx={drop.x - 1.2} cy={drop.y - 1.2} r={1.3} fill={c2} />
        </g>
      ))}
    </>
  );
}

function Scatter({ w, h, c1, c2, seed }: PieceArtProps) {
  return (
    <>
      {scatterInEllipse(seed, 12, w, h, 0.8).map((bit, index) => (
        <rect
          key={index}
          x={bit.x - 4}
          y={bit.y - 3.5}
          width={8 * bit.size}
          height={7 * bit.size}
          rx={2.5}
          transform={`rotate(${bit.turn} ${bit.x} ${bit.y})`}
          fill={bit.pick > 0.45 ? c1 : c2}
          stroke={darken(c1, 0.25)}
          strokeWidth={0.8}
        />
      ))}
    </>
  );
}

function Rings({ w, h, c1, c2, seed }: PieceArtProps) {
  return (
    <>
      {scatterInEllipse(seed, 5, w, h, 0.55).map((ring, index) => (
        <g key={index}>
          <circle cx={ring.x} cy={ring.y} r={7 * ring.size} fill={c2} opacity={0.6} />
          <circle cx={ring.x} cy={ring.y} r={7 * ring.size} fill="none" stroke={c1} strokeWidth={3} />
        </g>
      ))}
    </>
  );
}

function Strip({ w, h, c1, c2 }: PieceArtProps) {
  return (
    <>
      <rect
        x={4}
        y={h * 0.18}
        width={w - 8}
        height={h * 0.64}
        rx={3}
        fill={c1}
        transform={`rotate(-8 ${w / 2} ${h / 2})`}
      />
      <path d={`M10 ${h / 2} L${w - 10} ${h / 2 - 4}`} stroke={c2} strokeWidth={2} />
    </>
  );
}

function Wedge({ w, h, c1, c2 }: PieceArtProps) {
  return (
    <>
      <path d={`M4 ${h * 0.7} A${w / 2 - 4} ${h * 0.6} 0 0 1 ${w - 4} ${h * 0.7} Z`} fill={c1} />
      <path d={`M10 ${h * 0.68} A${w / 2 - 10} ${h * 0.5} 0 0 1 ${w - 10} ${h * 0.68} Z`} fill={c2} />
      {[0.25, 0.5, 0.75].map((share) => (
        <path
          key={share}
          d={`M${w / 2} ${h * 0.68} L${w * share} ${h * 0.68 - Math.sin(share * Math.PI) * h * 0.46}`}
          stroke={lighten(c1, 0.2)}
          strokeWidth={1.5}
        />
      ))}
    </>
  );
}

function Fan({ w, h, c1, c2 }: PieceArtProps) {
  return (
    <>
      {[-30, -10, 10, 30].map((angle) => (
        <path
          key={angle}
          d={`M${w / 2} ${h - 6} L${w / 2 - 12} 8 L${w / 2 + 12} 8 Z`}
          transform={`rotate(${angle} ${w / 2} ${h - 6})`}
          fill={c1}
          stroke={c2}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      ))}
    </>
  );
}

function Coins({ w, h, c1, c2, seed }: PieceArtProps) {
  return (
    <>
      {scatterInEllipse(seed, 5, w, h, 0.55).map((coin, index) => (
        <g key={index}>
          <circle cx={coin.x} cy={coin.y} r={9} fill={c1} stroke={c2} strokeWidth={2} />
          <circle cx={coin.x - 2} cy={coin.y - 2} r={3} fill={lighten(c1, 0.4)} />
        </g>
      ))}
    </>
  );
}

function Sprinkle({ w, h, c1, c2, seed }: PieceArtProps) {
  return (
    <>
      {scatterInEllipse(seed, 16, w, h, 0.85).map((fleck, index) => (
        <ellipse
          key={index}
          cx={fleck.x}
          cy={fleck.y}
          rx={3.5}
          ry={1.6}
          transform={`rotate(${fleck.turn} ${fleck.x} ${fleck.y})`}
          fill={fleck.pick > 0.5 ? c1 : c2}
        />
      ))}
    </>
  );
}

export const GARNISH_ARTS = {
  swoosh: Swoosh,
  dots: Dots,
  drizzle: Drizzle,
  leaf: Leaf,
  shavings: Shavings,
  drops: Drops,
  scatter: Scatter,
  rings: Rings,
  strip: Strip,
  wedge: Wedge,
  fan: Fan,
  coins: Coins,
  sprinkle: Sprinkle,
} as const;
