import { TILE_VIEWBOX, TileBackdrop, type TileArtProps } from "./TileBackdrop";

export function WoodTileArt({ className }: TileArtProps) {
  return (
    <svg className={className} viewBox={TILE_VIEWBOX} aria-hidden="true" focusable="false">
      <TileBackdrop tint="#e6c59a" floor="#c9a27a" />
      <ellipse cx={112} cy={136} rx={74} ry={7} fill="#2b2230" opacity={0.14} />
      <rect x={52} y={94} width={128} height={14} rx={3} fill="#c8925c" stroke="#8a5a30" strokeWidth={1.4} />
      <path
        d="M58 98 C80 96 96 104 120 100 C140 97 156 104 174 100 M60 104 C84 102 100 108 128 104 C148 101 160 106 172 105"
        stroke="#9a6638"
        strokeWidth={0.9}
        fill="none"
        opacity={0.7}
      />
      <rect x={62} y={108} width={10} height={28} rx={2} fill="#b47d48" stroke="#8a5a30" strokeWidth={1.2} />
      <rect x={160} y={108} width={10} height={28} rx={2} fill="#b47d48" stroke="#8a5a30" strokeWidth={1.2} />
      <rect x={76} y={110} width={80} height={6} rx={2} fill="#a8703e" />
      <g transform="translate(70 40) rotate(-8)">
        <rect x={0} y={0} width={104} height={16} rx={2} fill="#e3b77f" stroke="#a8703e" strokeWidth={1.2} />
        <path
          d="M6 6 C30 2 50 12 74 6 C86 3 94 8 100 6 M6 11 C26 9 48 15 70 11"
          stroke="#b98549"
          strokeWidth={0.9}
          fill="none"
        />
        <ellipse cx={64} cy={8} rx={4} ry={2.4} fill="none" stroke="#a8703e" strokeWidth={0.9} />
      </g>
      <g transform="translate(150 22) rotate(32)">
        <path d="M0 0 L58 0 L58 14 L6 22 Z" fill="#cfd6dc" stroke="#7d8790" strokeWidth={1.2} />
        <path
          d="M8 22 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4 l3 4 l3 -4"
          stroke="#7d8790"
          strokeWidth={1}
          fill="none"
        />
        <path
          d="M58 -4 L80 -4 C86 -4 88 2 88 8 L88 18 L58 18 Z"
          fill="#c0392b"
          stroke="#8e2a20"
          strokeWidth={1.2}
        />
        <rect x={66} y={2} width={14} height={9} rx={3} fill="#fbf6ef" />
      </g>
      <g fill="#e9c896">
        <path d="M188 128 l6 -3 l5 4 l-6 3 Z" />
        <path d="M44 130 l5 -2 l4 3 l-5 2 Z" />
        <path d="M200 120 l4 -2 l3 3 l-4 2 Z" />
      </g>
    </svg>
  );
}
