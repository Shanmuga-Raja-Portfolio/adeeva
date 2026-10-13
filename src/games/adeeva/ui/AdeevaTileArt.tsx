import { TILE_VIEWBOX, TileBackdrop, type TileArtProps } from "../../../ui/art/tiles/TileBackdrop";
import { DressFormArt } from "./art/DressFormArt";

export function AdeevaTileArt({ className }: TileArtProps) {
  return (
    <svg className={className} viewBox={TILE_VIEWBOX} aria-hidden="true" focusable="false">
      <TileBackdrop tint="#efb3c4" floor="#e3cdb6" />
      <DressFormArt x={120} y={34} scale={0.32} drape="#d0587e" gown="gown" />
      <path
        d="M30 96 C52 84 64 112 86 98 C102 88 104 70 92 66"
        stroke="#c9a227"
        strokeWidth={1.6}
        fill="none"
        strokeDasharray="3 3"
      />
      <g transform="translate(178 104)">
        <ellipse cx={0} cy={22} rx={18} ry={4} fill="#2b2230" opacity={0.1} />
        <rect x={-14} y={-10} width={28} height={6} rx={2} fill="#a07c58" />
        <rect x={-14} y={16} width={28} height={6} rx={2} fill="#a07c58" />
        <rect x={-10} y={-4} width={20} height={20} fill="#7fa58a" />
        <path d="M-10 0 L10 0 M-10 5 L10 5 M-10 10 L10 10" stroke="#557a61" strokeWidth={0.8} />
      </g>
      <g transform="translate(62 116) rotate(-18)">
        <path d="M0 0 L40 0" stroke="#9aa3ad" strokeWidth={2} strokeLinecap="round" />
        <ellipse cx={36} cy={0} rx={3} ry={1.2} fill="none" stroke="#9aa3ad" strokeWidth={1} />
      </g>
      <g fill="#c9a227">
        <path d="M196 40 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" />
        <path d="M44 42 l1.4 3.4 l3.4 1.4 l-3.4 1.4 l-1.4 3.4 l-1.4 -3.4 l-3.4 -1.4 l3.4 -1.4 Z" />
      </g>
    </svg>
  );
}
