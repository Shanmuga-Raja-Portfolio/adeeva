import { darken, lighten, mixHex } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";
import type { PieceKind } from "../../content/dish";

const RAW: Readonly<Record<PieceKind, string>> = {
  chicken: "#f0c4a4",
  plantain: "#f4c95a",
  gnocchi: "#f3e3bd",
  egg: "#fbe9a0",
  bread: "#f2deb4",
  seeds: "#c9a77a",
  corn: "#f6dc6a",
  onion: "#f3e3c4",
  tortilla: "#f3dca0",
};

const GOLDEN = "#d99a3a";
const DEEP = "#9a5a22";
export function pieceColour(kind: PieceKind, cook: number): string {
  if (cook < 0.9) return mixHex(RAW[kind], GOLDEN, Math.max(0, cook / 0.9) * 0.55);
  if (cook <= 1.1) return mixHex(RAW[kind], GOLDEN, 0.75);
  return mixHex(GOLDEN, DEEP, Math.min(1, (cook - 1.1) / 0.5));
}

const SPICE: readonly (readonly [number, number, number])[] = [
  [-9, -6, 1.4],
  [7, -8, 1.1],
  [10, 4, 1.5],
  [-4, 7, 1.2],
  [2, -1, 0.9],
  [-12, 3, 1],
];

function PlantainChunk({ fill }: { readonly fill: string }) {
  const id = useSvgId("ck-chunk");
  const crust = darken(fill, 0.28);
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-face`} cx="0.4" cy="0.36" r="0.7">
          <stop offset="0" stopColor={lighten(fill, 0.32)} />
          <stop offset="0.55" stopColor={fill} />
          <stop offset="1" stopColor={mixHex(fill, "#b8601e", 0.35)} />
        </radialGradient>
      </defs>
      <path
        d="M-19 -9 Q-20 -16 -12 -16 L11 -17 Q20 -16 20 -8 L19 9 Q18 16 10 16 L-11 16 Q-19 15 -19 8 Z"
        fill={crust}
        transform="translate(1.5 2.5)"
      />
      <path
        d="M-19 -9 Q-20 -16 -12 -16 L11 -17 Q20 -16 20 -8 L19 9 Q18 16 10 16 L-11 16 Q-19 15 -19 8 Z"
        fill={`url(#${id}-face)`}
        stroke={crust}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d="M-15 -12 Q-4 -15 14 -13"
        stroke={lighten(fill, 0.5)}
        strokeWidth={2}
        fill="none"
        opacity={0.7}
        strokeLinecap="round"
      />
      <path
        d="M17 -5 L16 9 Q15 13 9 13"
        stroke={darken(fill, 0.35)}
        strokeWidth={2.2}
        fill="none"
        opacity={0.6}
        strokeLinecap="round"
      />
      {SPICE.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={x > 0 ? "#9a2a14" : "#6a3a12"} opacity={0.75} />
      ))}
    </g>
  );
}

export function PieceShape({ kind, fill }: { readonly kind: PieceKind; readonly fill: string }) {
  const edge = darken(fill, 0.3);
  switch (kind) {
    case "seeds":
      return (
        <g>
          {[-10, 0, 10, -5, 5].map((x, index) => (
            <ellipse
              key={index}
              cx={x}
              cy={index > 2 ? 8 : -4}
              rx={5}
              ry={3}
              fill={fill}
              stroke={edge}
              strokeWidth={1.5}
            />
          ))}
        </g>
      );
    case "corn":
      return (
        <rect x={-30} y={-14} width={60} height={28} rx={14} fill={fill} stroke={edge} strokeWidth={2.5} />
      );
    case "bread":
      return (
        <rect x={-24} y={-22} width={48} height={44} rx={10} fill={fill} stroke={edge} strokeWidth={2.5} />
      );
    case "onion":
      return (
        <g>
          <circle r={20} fill="none" stroke={fill} strokeWidth={7} />
          <circle r={11} fill="none" stroke={lighten(fill, 0.1)} strokeWidth={5} />
        </g>
      );
    case "egg":
    case "tortilla":
      return <circle r={30} fill={fill} stroke={edge} strokeWidth={2.5} />;
    case "chicken":
      return (
        <path
          d="M-22 -10 C-18 -24 12 -24 22 -12 C28 0 20 20 2 20 C-16 22 -28 6 -22 -10 Z"
          fill={fill}
          stroke={edge}
          strokeWidth={2.5}
        />
      );
    case "gnocchi":
      return (
        <g>
          <ellipse rx={20} ry={13} fill={fill} stroke={edge} strokeWidth={2} />
          <path
            d="M-10 -9 V9 M-3 -12 V12 M4 -12 V12 M11 -9 V9"
            stroke={edge}
            strokeWidth={1.5}
            opacity={0.6}
          />
        </g>
      );
    case "plantain":
      return <PlantainChunk fill={fill} />;
  }
}

export const PIECE_REACH: Readonly<Record<PieceKind, number>> = {
  chicken: 28,
  plantain: 21,
  gnocchi: 20,
  egg: 30,
  bread: 31,
  seeds: 16,
  corn: 32,
  onion: 24,
  tortilla: 30,
};

export function pieceScale(kind: PieceKind): number {
  return Math.min(1.4, 33 / PIECE_REACH[kind]);
}

export function Gloss() {
  return <ellipse cx={-7} cy={-7} rx={7} ry={4} fill="#ffffff" opacity={0.32} transform="rotate(-25)" />;
}
