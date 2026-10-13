import { TILE_VIEWBOX, TileBackdrop, type TileArtProps } from "./TileBackdrop";

export function PatisserieTileArt({ className }: TileArtProps) {
  return (
    <svg className={className} viewBox={TILE_VIEWBOX} aria-hidden="true" focusable="false">
      <TileBackdrop tint="#f2b8c6" floor="#e8d3bf" />
      <ellipse cx={120} cy={134} rx={64} ry={7} fill="#2b2230" opacity={0.12} />
      <path d="M100 132 L140 132 L130 124 L110 124 Z" fill="#d8c3ae" stroke="#a88f78" strokeWidth={1.2} />
      <rect x={70} y={116} width={100} height={8} rx={4} fill="#efe3d3" stroke="#b49a7c" strokeWidth={1.2} />
      <rect x={78} y={86} width={84} height={30} rx={6} fill="#fbeee6" stroke="#d29aa9" strokeWidth={1.4} />
      <path
        d="M78 96 C86 104 92 96 100 104 C108 96 114 104 120 96 C126 104 134 96 140 104 C148 96 154 104 162 96"
        fill="none"
        stroke="#e58aa5"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <rect x={90} y={60} width={60} height={26} rx={6} fill="#f7d9e1" stroke="#d29aa9" strokeWidth={1.4} />
      <g fill="#fffaf5" stroke="#e6b7c4" strokeWidth={0.8}>
        <circle cx={96} cy={86} r={3.4} />
        <circle cx={106} cy={86} r={3.4} />
        <circle cx={116} cy={86} r={3.4} />
        <circle cx={126} cy={86} r={3.4} />
        <circle cx={136} cy={86} r={3.4} />
        <circle cx={146} cy={86} r={3.4} />
      </g>
      <rect x={102} y={40} width={36} height={20} rx={5} fill="#fbeee6" stroke="#d29aa9" strokeWidth={1.4} />
      <path d="M102 48 Q120 56 138 48" stroke="#c9a227" strokeWidth={2} fill="none" />
      <circle cx={120} cy={34} r={6} fill="#c0392b" />
      <circle cx={118} cy={32} r={1.8} fill="#ffffff" opacity={0.7} />
      <path d="M120 28 C121 22 126 20 130 20" stroke="#557a61" strokeWidth={1.6} fill="none" />
      <g transform="translate(184 74) rotate(24)">
        <rect x={-3} y={20} width={6} height={30} rx={3} fill="#a07c58" />
        <path
          d="M0 20 C-12 14 -12 -8 0 -12 C12 -8 12 14 0 20 Z M0 20 L0 -12 M-7 14 C-9 2 -6 -6 0 -12 M7 14 C9 2 6 -6 0 -12"
          fill="none"
          stroke="#9aa3ad"
          strokeWidth={1.4}
        />
      </g>
      <g fill="#ffffff">
        <path d="M58 46 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" opacity={0.85} />
      </g>
    </svg>
  );
}
