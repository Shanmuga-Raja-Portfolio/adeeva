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

const FLAKES: readonly (readonly [number, number, number])[] = [
  [-11, -5, 20],
  [9, 6, -30],
  [12, -6, 60],
];

function PlantainChunk({ fill }: { readonly fill: string }) {
  const id = useSvgId("ck-chunk");
  const crust = mixHex(darken(fill, 0.32), "#8a3a12", 0.35);
  return (
    <g transform="rotate(-18)">
      <defs>
        <radialGradient id={`${id}-face`} cx="0.42" cy="0.38" r="0.65">
          <stop offset="0" stopColor={lighten(fill, 0.38)} />
          <stop offset="0.6" stopColor={fill} />
          <stop offset="1" stopColor={mixHex(fill, "#c0601e", 0.45)} />
        </radialGradient>
      </defs>
      <ellipse cx={1.5} cy={3} rx={21} ry={16} fill={darken(crust, 0.25)} />
      <ellipse rx={21} ry={16} fill={crust} />
      <ellipse rx={17.5} ry={13} fill={`url(#${id}-face)`} />
      <ellipse rx={8} ry={6} fill={lighten(fill, 0.2)} opacity={0.6} />
      {[0, 120, 240].map((turn) => (
        <g key={turn} transform={`rotate(${turn})`}>
          <path d="M0 0 L0 -6" stroke={darken(fill, 0.25)} strokeWidth={1} opacity={0.55} />
          <circle cy={-3.5} r={1.1} fill="#5a3010" opacity={0.75} />
        </g>
      ))}
      <path
        d="M-14 -6 Q-6 -13 8 -12"
        stroke="#ffffff"
        strokeWidth={2.4}
        fill="none"
        opacity={0.55}
        strokeLinecap="round"
      />
      {FLAKES.map(([x, y, turn]) => (
        <rect
          key={`${x}-${y}`}
          x={x - 2}
          y={y - 1}
          width={4}
          height={2}
          rx={1}
          fill="#b8261a"
          transform={`rotate(${turn} ${x} ${y})`}
        />
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
