import { memo, type ReactNode } from "react";
import { seededUnit } from "../../../../ui/art/seedFromText";

export interface RunwayAudienceProps {
  rim: string;
  layer: "back" | "front";
}

const COATS = [
  "#1c1424",
  "#2e1b33",
  "#1a2130",
  "#3a2030",
  "#22202a",
  "#2a1a46",
  "#1d2e30",
  "#3b2a1e",
  "#302838",
] as const;

const HAIR_STYLES = 8;

function hairFor(style: number): ReactNode {
  switch (style) {
    case 0:
      return <circle cx={7} cy={-52} r={7} />;
    case 1:
      return <path d="M-15 -40 C-17 -58 17 -58 15 -40 L16 -18 L-16 -18 Z" />;
    case 2:
      return (
        <>
          <ellipse cx={0} cy={-47} rx={20} ry={4} />
          <rect x={-10} y={-60} width={20} height={14} rx={4} />
        </>
      );
    case 3:
      return <path d="M-14 -38 C-20 -62 20 -62 14 -38 Q20 -50 12 -54 Q0 -60 -12 -54 Q-20 -50 -14 -38 Z" />;
    case 4:
      return (
        <>
          <circle cx={-10} cy={-46} r={8} />
          <circle cx={10} cy={-46} r={8} />
          <circle cx={0} cy={-52} r={9} />
          <circle cx={-13} cy={-36} r={6} />
          <circle cx={13} cy={-36} r={6} />
        </>
      );
    case 5:
      return (
        <path d="M-13 -44 C-12 -56 12 -56 13 -44 C16 -36 20 -28 22 -20 L10 -24 L-10 -24 L-22 -20 C-20 -28 -16 -36 -13 -44 Z" />
      );
    case 6:
      return <path d="M-14 -46 C-12 -58 14 -60 16 -46 C18 -44 20 -42 18 -40 L-16 -42 Z" />;
    default:
      return null;
  }
}

function Person({
  x,
  y,
  scale,
  variant,
  style,
  breadth,
  rim,
  wave = false,
}: {
  x: number;
  y: number;
  scale: number;
  variant: number;
  style: number;
  breadth: number;
  rim: string;
  wave?: boolean;
}) {
  const coat = COATS[variant % COATS.length] ?? "#1c1424";
  const hair = hairFor(style);
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(3)})`}>
      <g fill="#120d16">
        {hair}
        <circle cx={0} cy={-38} r={12.5} />
      </g>
      {wave ? (
        <g>
          <path
            d="M18 -18 C26 -34 30 -52 26 -72"
            fill="none"
            stroke={coat}
            strokeWidth={11}
            strokeLinecap="round"
          />
          <circle cx={26} cy={-76} r={6.5} fill="#120d16" />
          <path
            d="M30 -30 C33 -46 33 -60 30 -70"
            fill="none"
            stroke={rim}
            strokeOpacity={0.5}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      ) : null}
      <path
        d="M-32 6 C-32 -16 -20 -24 0 -24 C20 -24 32 -16 32 6 Z"
        fill={coat}
        transform={`scale(${breadth.toFixed(3)} 1)`}
      />
      <path
        d="M-26 -14 C-18 -21 -8 -24 0 -24 C8 -24 18 -21 26 -14"
        fill="none"
        stroke={rim}
        strokeOpacity={0.55}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <path
        d="M-11 -46 C-7 -51 0 -52 6 -50"
        fill="none"
        stroke={rim}
        strokeOpacity={0.65}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </g>
  );
}

export const RunwayAudience = memo(function RunwayAudience({ rim, layer }: RunwayAudienceProps) {
  if (layer === "front") {
    return (
      <g aria-hidden="true" opacity={0.95}>
        <Person x={120} y={940} scale={3.2} variant={1} style={1} breadth={1.05} rim={rim} />
        <Person x={330} y={960} scale={2.8} variant={0} style={4} breadth={0.94} rim={rim} wave />
        <Person x={1290} y={960} scale={2.8} variant={3} style={5} breadth={0.96} rim={rim} />
        <Person x={1490} y={940} scale={3.2} variant={2} style={2} breadth={1.08} rim={rim} />
      </g>
    );
  }
  const people: ReactNode[] = [];
  for (let row = 0; row < 6; row += 1) {
    const y = 470 + row * 78;
    const scale = 0.55 + row * 0.24;
    const halfWidth = 64 + ((y - 400) / 500) * 346;
    for (const side of [-1, 1]) {
      let offset = halfWidth + 40 * scale;
      let seat = 0;
      while (offset < 820) {
        const index = row * 40 + seat * 2 + (side > 0 ? 1 : 0);
        const jitter = (seededUnit(23, index) - 0.5) * 18 * scale;
        people.push(
          <Person
            key={index}
            x={800 + side * (offset + jitter)}
            y={y + (seededUnit(29, index) - 0.5) * 8}
            scale={scale * (0.92 + seededUnit(31, index) * 0.16)}
            variant={Math.floor(seededUnit(37, index) * COATS.length)}
            style={Math.floor(seededUnit(43, index) * HAIR_STYLES)}
            breadth={0.86 + seededUnit(47, index) * 0.28}
            rim={rim}
            wave={seededUnit(41, index) < 0.14}
          />,
        );
        offset += 68 * scale;
        seat += 1;
      }
    }
  }
  return (
    <g aria-hidden="true" className="ad-runway-audience">
      {people}
    </g>
  );
});
