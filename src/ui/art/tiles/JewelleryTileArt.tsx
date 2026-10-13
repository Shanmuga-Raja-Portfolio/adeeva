import { useSvgId } from "../useSvgId";
import { TILE_VIEWBOX, TileBackdrop, type TileArtProps } from "./TileBackdrop";

export function JewelleryTileArt({ className }: TileArtProps) {
  const id = useSvgId("jewel");
  return (
    <svg className={className} viewBox={TILE_VIEWBOX} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff2b8" />
          <stop offset="0.5" stopColor="#d9b23c" />
          <stop offset="1" stopColor="#9a7a14" />
        </linearGradient>
        <linearGradient id={`${id}-gem`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9d5ea" />
          <stop offset="0.5" stopColor="#5e7fc4" />
          <stop offset="1" stopColor="#2b3f78" />
        </linearGradient>
      </defs>
      <TileBackdrop tint="#b9a7dc" floor="#5e2a5a" />
      <ellipse cx={120} cy={134} rx={70} ry={7} fill="#1c1220" opacity={0.2} />
      <rect x={64} y={108} width={112} height={24} rx={8} fill="#7a3a6e" stroke="#4a1f44" strokeWidth={1.4} />
      <path d="M70 114 L170 114" stroke="#a45a95" strokeWidth={1.2} />
      <ellipse cx={98} cy={102} rx={20} ry={18} fill="none" stroke={`url(#${id}-gold)`} strokeWidth={7} />
      <path d="M90 82 L98 72 L106 82 L98 90 Z" fill={`url(#${id}-gem)`} stroke="#2b3f78" strokeWidth={1} />
      <path d="M94 80 L98 75" stroke="#ffffff" strokeWidth={1.2} strokeLinecap="round" />
      <path
        d="M140 30 C136 54 140 72 150 82 C160 72 164 54 160 30"
        fill="none"
        stroke={`url(#${id}-gold)`}
        strokeWidth={1.6}
      />
      <circle cx={150} cy={90} r={9} fill={`url(#${id}-gold)`} />
      <circle cx={150} cy={90} r={5} fill="#d0587e" stroke="#a93d63" strokeWidth={0.8} />
      <circle cx={148.4} cy={88.4} r={1.4} fill="#ffffff" opacity={0.8} />
      <g fill="#fff6d0">
        <path d="M60 46 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 Z" />
        <path d="M188 58 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 Z" />
        <path d="M118 40 l1.2 3 l3 1.2 l-3 1.2 l-1.2 3 l-1.2 -3 l-3 -1.2 l3 -1.2 Z" />
      </g>
    </svg>
  );
}
