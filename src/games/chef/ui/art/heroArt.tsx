import type { ReactNode } from "react";
import { darken, lighten } from "../../../../ui/art/colourMix";
import { scatterInEllipse } from "./scatter";

export interface PieceArtProps {
  readonly w: number;
  readonly h: number;
  readonly c1: string;
  readonly c2: string;
  readonly seed: number;
}

function Shadow({ w, h }: Pick<PieceArtProps, "w" | "h">) {
  return <ellipse cx={w / 2 + 3} cy={h / 2 + 6} rx={w / 2} ry={h / 2} fill="#1c1220" opacity={0.16} />;
}

function Bowl({ w, h, c1, c2 }: PieceArtProps) {
  return (
    <>
      <Shadow w={w} h={h} />
      <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill={c2} />
      <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 4} ry={h / 2 - 4} fill={darken(c2, 0.08)} />
      <ellipse cx={w / 2} cy={h / 2 + 2} rx={w / 2 - 14} ry={h / 2 - 14} fill={c1} />
      <ellipse
        cx={w / 2 - w * 0.12}
        cy={h / 2 - h * 0.14}
        rx={w * 0.18}
        ry={h * 0.07}
        fill="#ffffff"
        opacity={0.28}
      />
      <ellipse
        cx={w / 2}
        cy={h / 2 + 2}
        rx={w / 2 - 14}
        ry={h / 2 - 14}
        fill="none"
        stroke={darken(c1, 0.2)}
        strokeOpacity={0.4}
        strokeWidth={3}
      />
    </>
  );
}

function RiceBed({ w, h, c1, c2, seed }: PieceArtProps) {
  return (
    <>
      <Shadow w={w} h={h} />
      <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill={c1} />
      {scatterInEllipse(seed, 70, w, h, 0.9).map((grain, index) => (
        <ellipse
          key={index}
          cx={grain.x}
          cy={grain.y}
          rx={4.5}
          ry={1.8}
          transform={`rotate(${grain.turn} ${grain.x} ${grain.y})`}
          fill={grain.pick > 0.5 ? c2 : lighten(c1, 0.5)}
        />
      ))}
    </>
  );
}

function Twirl({ w, h, c1, c2 }: PieceArtProps) {
  const rings = [0.92, 0.76, 0.6, 0.44, 0.3];
  return (
    <>
      <Shadow w={w} h={h} />
      {rings.map((ring, index) => (
        <ellipse
          key={ring}
          cx={w / 2 + (index % 2) * 3}
          cy={h / 2 + index}
          rx={(w / 2) * ring}
          ry={(h / 2) * ring}
          fill="none"
          stroke={index % 2 === 0 ? c1 : darken(c1, 0.12)}
          strokeWidth={7}
        />
      ))}
      <path
        d={`M${w * 0.32} ${h * 0.42} C${w * 0.38} ${h * 0.28} ${w * 0.66} ${h * 0.26} ${w * 0.7} ${h * 0.44} C${w * 0.74} ${h * 0.6} ${w * 0.4} ${h * 0.66} ${w * 0.32} ${h * 0.42} Z`}
        fill={c2}
      />
      <ellipse cx={w * 0.46} cy={h * 0.38} rx={w * 0.08} ry={h * 0.04} fill="#ffffff" opacity={0.45} />
    </>
  );
}

function Medley({ w, h, c1, c2, seed }: PieceArtProps) {
  const palette = [c1, c2, "#f3d23f", "#4f8a3c", "#f4ecdc"];
  return (
    <>
      {scatterInEllipse(seed, 16, w, h, 0.85).map((piece, index) => (
        <rect
          key={index}
          x={piece.x - 8 * piece.size}
          y={piece.y - 8 * piece.size}
          width={16 * piece.size}
          height={14 * piece.size}
          rx={4}
          transform={`rotate(${piece.turn} ${piece.x} ${piece.y})`}
          fill={palette[index % palette.length]}
          stroke={darken(palette[index % palette.length] ?? c1, 0.25)}
          strokeWidth={1.5}
        />
      ))}
    </>
  );
}

function Dumplings({ w, h, c1, c2, seed }: PieceArtProps) {
  return (
    <>
      <Shadow w={w} h={h} />
      <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 4} ry={h / 2 - 4} fill={c2} opacity={0.85} />
      {scatterInEllipse(seed, 9, w, h, 0.62).map((piece, index) => (
        <g key={index} transform={`translate(${piece.x} ${piece.y}) rotate(${piece.turn})`}>
          <ellipse rx={15} ry={10} fill={c1} stroke={darken(c1, 0.3)} strokeWidth={1.5} />
          <path
            d="M-9 -4 L-9 4 M-3 -6 L-3 6 M3 -6 L3 6 M9 -4 L9 4"
            stroke={darken(c1, 0.25)}
            strokeWidth={1.4}
          />
          <ellipse cx={-4} cy={-4} rx={6} ry={2.5} fill="#ffffff" opacity={0.4} />
        </g>
      ))}
    </>
  );
}

function Mound({ w, h, c1, c2, seed }: PieceArtProps) {
  return (
    <>
      <Shadow w={w} h={h} />
      <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill={darken(c1, 0.08)} />
      <ellipse cx={w / 2} cy={h / 2 - 4} rx={w / 2 - 6} ry={h / 2 - 8} fill={c1} />
      {scatterInEllipse(seed, 46, w, h, 0.86).map((grain, index) => (
        <ellipse
          key={index}
          cx={grain.x}
          cy={grain.y - 3}
          rx={grain.pick > 0.82 ? 5 : 4}
          ry={grain.pick > 0.82 ? 4 : 1.6}
          transform={`rotate(${grain.turn} ${grain.x} ${grain.y})`}
          fill={grain.pick > 0.82 ? c2 : lighten(c1, 0.35)}
        />
      ))}
      <ellipse cx={w * 0.4} cy={h * 0.3} rx={w * 0.16} ry={h * 0.07} fill="#ffffff" opacity={0.22} />
    </>
  );
}

function Swirl({ w, h, c1, c2, seed }: PieceArtProps) {
  return (
    <>
      <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 2} ry={h / 2 - 2} fill={c1} />
      <path
        d={`M${w / 2} ${h / 2} m-10 0 a10 8 0 1 1 20 0 a20 16 0 1 1 -40 0 a30 24 0 1 1 60 0 a40 32 0 1 1 -80 0`}
        fill="none"
        stroke={lighten(c1, 0.35)}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <path
        d={`M${w * 0.24} ${h * 0.36} C${w * 0.4} ${h * 0.2} ${w * 0.62} ${h * 0.5} ${w * 0.78} ${h * 0.32}`}
        fill="none"
        stroke={c2}
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.85}
      />
      {scatterInEllipse(seed, 12, w, h, 0.6).map((seedDot, index) => (
        <ellipse
          key={index}
          cx={seedDot.x}
          cy={seedDot.y}
          rx={2.6}
          ry={1.2}
          transform={`rotate(${seedDot.turn} ${seedDot.x} ${seedDot.y})`}
          fill="#5a3a1c"
        />
      ))}
    </>
  );
}

function Beads({ w, h, c1, c2, seed }: PieceArtProps) {
  return (
    <>
      <Shadow w={w} h={h} />
      <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 2} ry={h / 2 - 2} fill={c2} />
      {scatterInEllipse(seed, 30, w, h, 0.8).map((bead, index) => (
        <g key={index}>
          <circle
            cx={bead.x}
            cy={bead.y}
            r={6.5 * bead.size}
            fill={c1}
            stroke={darken(c1, 0.3)}
            strokeWidth={1.2}
          />
          <circle cx={bead.x - 2} cy={bead.y - 2} r={2} fill="#ffffff" opacity={0.45} />
        </g>
      ))}
    </>
  );
}

function Cubes({ w, h, c1, c2, seed }: PieceArtProps) {
  return (
    <>
      {scatterInEllipse(seed, 10, w, h, 0.7).map((cube, index) => (
        <g key={index} transform={`translate(${cube.x} ${cube.y}) rotate(${cube.turn % 40})`}>
          <rect
            x={-12}
            y={-12}
            width={24}
            height={24}
            rx={4}
            fill={c1}
            stroke={darken(c1, 0.3)}
            strokeWidth={1.5}
          />
          <path d="M-12 4 L12 4 L12 12 L-12 12 Z" fill={c2} opacity={0.6} />
          <rect x={-8} y={-9} width={9} height={4} rx={2} fill="#ffffff" opacity={0.45} />
        </g>
      ))}
    </>
  );
}

function RiceBalls({ w, h, c1, c2 }: PieceArtProps) {
  const ball = (cx: number) => (
    <g transform={`translate(${cx} ${h / 2})`}>
      <path
        d="M0 -40 C14 -40 36 18 34 30 C32 40 -32 40 -34 30 C-36 18 -14 -40 0 -40 Z"
        fill={c1}
        stroke={darken(c1, 0.2)}
        strokeWidth={2}
      />
      <rect x={-22} y={12} width={44} height={22} rx={3} fill={c2} />
      <circle cx={0} cy={-6} r={6} fill="#f08a6a" opacity={0.85} />
      <path
        d="M-14 -20 C-10 -28 -4 -32 2 -32"
        stroke="#ffffff"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.6}
        fill="none"
      />
    </g>
  );
  return (
    <>
      <Shadow w={w} h={h} />
      {ball(w * 0.28)}
      {ball(w * 0.72)}
    </>
  );
}

function Roll({ w, h, c1, c2 }: PieceArtProps) {
  return (
    <>
      <Shadow w={w} h={h} />
      <rect
        x={4}
        y={h * 0.14}
        width={w - 8}
        height={h * 0.72}
        rx={h * 0.3}
        fill={c1}
        stroke={darken(c1, 0.25)}
        strokeWidth={2}
      />
      {[0.3, 0.5, 0.7].map((share) => (
        <path
          key={share}
          d={`M${w * share} ${h * 0.16} C${w * share - 8} ${h * 0.4} ${w * share - 8} ${h * 0.6} ${w * share} ${h * 0.84}`}
          stroke={darken(c1, 0.15)}
          strokeWidth={3}
          fill="none"
        />
      ))}
      <path
        d={`M${w * 0.1} ${h * 0.36} C${w * 0.3} ${h * 0.24} ${w * 0.7} ${h * 0.24} ${w * 0.9} ${h * 0.36}`}
        stroke={c2}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
        opacity={0.9}
      />
      <path
        d={`M${w * 0.18} ${h * 0.24} L${w * 0.5} ${h * 0.22}`}
        stroke="#ffffff"
        strokeWidth={4}
        strokeLinecap="round"
        opacity={0.4}
      />
    </>
  );
}

function Topping({ w, h, c1, c2, seed }: PieceArtProps) {
  return (
    <>
      <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 4} ry={h / 2 - 4} fill={c1} />
      {scatterInEllipse(seed, 9, w, h, 0.7).map((piece, index) => (
        <rect
          key={index}
          x={piece.x - 9}
          y={piece.y - 7}
          width={18}
          height={14}
          rx={5}
          transform={`rotate(${piece.turn} ${piece.x} ${piece.y})`}
          fill={c2}
          stroke={darken(c2, 0.3)}
          strokeWidth={1.2}
        />
      ))}
      <ellipse cx={w * 0.55} cy={h * 0.45} rx={w * 0.12} ry={h * 0.1} fill="#fff7d6" />
      <circle cx={w * 0.55} cy={h * 0.45} r={h * 0.06} fill="#f2a93b" />
    </>
  );
}

function Dip({ w, h, c1, c2, seed }: PieceArtProps) {
  return (
    <>
      <Shadow w={w} h={h} />
      <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill="#e8e1d4" />
      <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 10} ry={h / 2 - 10} fill={c1} />
      {scatterInEllipse(seed, 18, w, h, 0.66).map((chunk, index) => (
        <circle
          key={index}
          cx={chunk.x}
          cy={chunk.y}
          r={4 * chunk.size}
          fill={chunk.pick > 0.6 ? c2 : chunk.pick > 0.3 ? "#f4ecdc" : "#d9472b"}
        />
      ))}
    </>
  );
}

function Cob({ w, h, c1, c2 }: PieceArtProps) {
  const kernels: ReactNode[] = [];
  for (let column = 0; column < 11; column += 1)
    for (let row = 0; row < 4; row += 1)
      kernels.push(
        <ellipse
          key={`${column}-${row}`}
          cx={w * 0.14 + column * (w * 0.068)}
          cy={h * 0.28 + row * (h * 0.15)}
          rx={4.6}
          ry={5.2}
          fill={(column + row) % 5 === 0 ? c2 : c1}
          stroke={darken(c1, 0.25)}
          strokeWidth={0.8}
        />,
      );
  return (
    <>
      <Shadow w={w} h={h} />
      <rect x={2} y={h * 0.16} width={w - 4} height={h * 0.68} rx={h * 0.34} fill={darken(c1, 0.1)} />
      {kernels}
      <path
        d={`M${w * 0.9} ${h * 0.3} C${w} ${h * 0.4} ${w} ${h * 0.6} ${w * 0.9} ${h * 0.7}`}
        stroke="#8fb04a"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}

function Spiral({ w, h, c1, c2 }: PieceArtProps) {
  const colours = [c1, c2, "#4f8a3c", "#f3d23f"];
  const slices: ReactNode[] = [];
  [0.82, 0.56, 0.3].forEach((ring, ringIndex) => {
    const count = Math.round(14 * ring);
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const x = w / 2 + Math.cos(angle) * (w / 2) * ring;
      const y = h / 2 + Math.sin(angle) * (h / 2) * ring;
      slices.push(
        <ellipse
          key={`${ringIndex}-${index}`}
          cx={x}
          cy={y}
          rx={10}
          ry={6}
          transform={`rotate(${(angle * 180) / Math.PI + 90} ${x} ${y})`}
          fill={colours[(index + ringIndex) % colours.length]}
          stroke={darken(colours[(index + ringIndex) % colours.length] ?? c1, 0.3)}
          strokeWidth={1.2}
        />,
      );
    }
  });
  return (
    <>
      <Shadow w={w} h={h} />
      <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill={darken(c2, 0.2)} />
      {slices}
    </>
  );
}

function Toast({ w, h, c1, c2, seed }: PieceArtProps) {
  return (
    <>
      <Shadow w={w} h={h} />
      <rect x={6} y={8} width={w - 12} height={h - 16} rx={16} fill={darken(c1, 0.2)} />
      <rect x={10} y={10} width={w - 20} height={h - 22} rx={14} fill={c1} />
      <path
        d={`M16 ${h * 0.32} C${w * 0.3} ${h * 0.16} ${w * 0.7} ${h * 0.5} ${w - 16} ${h * 0.3} L${w - 16} ${h * 0.7} C${w * 0.6} ${h * 0.86} ${w * 0.3} ${h * 0.6} 16 ${h * 0.78} Z`}
        fill={c2}
      />
      {scatterInEllipse(seed, 8, w, h, 0.6).map((bubble, index) => (
        <circle
          key={index}
          cx={bubble.x}
          cy={bubble.y}
          r={3 + bubble.size * 2}
          fill={darken(c2, 0.18)}
          opacity={0.7}
        />
      ))}
      <path
        d={`M${w * 0.5} 14 L${w * 0.5} ${h - 14}`}
        stroke={darken(c1, 0.25)}
        strokeWidth={2}
        strokeDasharray="4 4"
      />
    </>
  );
}

function Layers({ w, h, c1, c2 }: PieceArtProps) {
  return (
    <>
      <Shadow w={w} h={h} />
      <rect
        x={6}
        y={10}
        width={w - 12}
        height={h - 20}
        rx={10}
        fill={c1}
        stroke={darken(c1, 0.25)}
        strokeWidth={2}
      />
      {[0.38, 0.52, 0.66, 0.8].map((share) => (
        <path
          key={share}
          d={`M10 ${h * share} Q${w / 2} ${h * share - 6} ${w - 10} ${h * share}`}
          stroke={darken(c1, 0.14)}
          strokeWidth={2.5}
          fill="none"
        />
      ))}
      <path d={`M8 ${h * 0.28} Q${w / 2} ${h * 0.04} ${w - 8} ${h * 0.28} L${w - 8} 14 L8 14 Z`} fill={c2} />
      <circle cx={w * 0.3} cy={h * 0.2} r={4} fill={darken(c2, 0.2)} />
      <circle cx={w * 0.66} cy={h * 0.18} r={5} fill={darken(c2, 0.2)} />
    </>
  );
}

function Stew({ w, h, c1, c2, seed }: PieceArtProps) {
  return (
    <>
      <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 4} ry={h / 2 - 4} fill={c2} opacity={0.9} />
      {scatterInEllipse(seed, 5, w, h, 0.5).map((piece, index) => (
        <g key={index} transform={`translate(${piece.x} ${piece.y}) rotate(${piece.turn})`}>
          <ellipse rx={20} ry={13} fill={c1} stroke={darken(c1, 0.3)} strokeWidth={1.5} />
          <ellipse cx={-5} cy={-4} rx={8} ry={3} fill="#ffffff" opacity={0.3} />
        </g>
      ))}
      {scatterInEllipse(seed + 7, 9, w, h, 0.82).map((strand, index) => (
        <path
          key={index}
          d={`M${strand.x - 10} ${strand.y} q10 -8 20 0`}
          stroke="#fff6d8"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </>
  );
}

export const HERO_ARTS = {
  bowl: Bowl,
  "rice-bed": RiceBed,
  twirl: Twirl,
  medley: Medley,
  dumplings: Dumplings,
  mound: Mound,
  swirl: Swirl,
  beads: Beads,
  cubes: Cubes,
  "rice-balls": RiceBalls,
  roll: Roll,
  topping: Topping,
  dip: Dip,
  cob: Cob,
  spiral: Spiral,
  toast: Toast,
  layers: Layers,
  stew: Stew,
} as const;
