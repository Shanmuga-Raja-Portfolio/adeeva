import { TILE_VIEWBOX, TileBackdrop, type TileArtProps } from "../../../ui/art/tiles/TileBackdrop";

const OUTLINE = "#2f2622";

export function WorkshopTileArt({ className }: TileArtProps) {
  return (
    <svg className={className} viewBox={TILE_VIEWBOX} aria-hidden="true" focusable="false">
      <TileBackdrop tint="#e9c896" floor="#b9875a" />
      <g opacity={0.5}>
        {Array.from({ length: 9 }, (_, column) =>
          Array.from({ length: 3 }, (_, row) => (
            <circle
              key={`${column}-${row}`}
              cx={24 + column * 24}
              cy={18 + row * 18}
              r={1.8}
              fill="#8a6a45"
            />
          )),
        )}
      </g>
      <ellipse cx={122} cy={138} rx={86} ry={8} fill={OUTLINE} opacity={0.16} />
      <g stroke={OUTLINE} strokeWidth={2.4} strokeLinejoin="round">
        <rect x={60} y={98} width={124} height={14} rx={3} fill="#c58a4a" />
        <path
          d="M66 103 C90 100 108 107 130 103 C150 100 164 106 178 104"
          fill="none"
          strokeWidth={1}
          stroke="#8f5a26"
        />
        <rect x={68} y={112} width={11} height={26} rx={2} fill="#a8703e" />
        <rect x={166} y={112} width={11} height={26} rx={2} fill="#a8703e" />
        <rect x={84} y={74} width={52} height={24} rx={3} fill="#4a8a94" />
        <path d="M84 74 L110 52 L136 74 Z" fill="#e7b777" />
        <circle cx={110} cy={86} r={6} fill="#3b2a20" strokeWidth={1.6} />
        <path
          d="M110 59 l2 4 l4.5 0.6 l-3.3 3 l0.8 4.5 l-4 -2.2 l-4 2.2 l0.8 -4.5 l-3.3 -3 l4.5 -0.6 Z"
          fill="#f2c230"
          strokeWidth={1}
        />
      </g>
      <g transform="translate(176 54) rotate(28)" stroke={OUTLINE} strokeWidth={2.4} strokeLinejoin="round">
        <rect x={-4} y={-2} width={8} height={44} rx={3} fill="#c58a4a" />
        <rect x={-18} y={-22} width={36} height={22} rx={5} fill="#f2c230" />
        <rect x={-18} y={-22} width={9} height={22} rx={3} fill="#c99a12" />
      </g>
      <g transform="translate(150 96) rotate(-8)" stroke={OUTLINE} strokeWidth={2}>
        <rect x={0} y={0} width={30} height={8} rx={2} fill="#f2c230" />
        <path d="M4 0 v3 M9 0 v5 M14 0 v3 M19 0 v5 M24 0 v3" strokeWidth={1.2} />
      </g>
      <g fill="#f0d9ad">
        <path d="M44 130 l6 -3 l5 4 l-6 3 Z" />
        <path d="M196 128 l5 -2 l4 3 l-5 2 Z" />
        <path d="M58 140 l4 -2 l3 3 l-4 2 Z" />
        <circle cx={188} cy={140} r={2} />
        <circle cx={40} cy={120} r={1.6} />
      </g>
      <g fill="#ffffff">
        <path d="M44 40 l2 -6 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 Z" opacity={0.9} />
        <path d="M206 30 l1.4 -4 l1.4 4 l4 1.4 l-4 1.4 l-1.4 4 l-1.4 -4 l-4 -1.4 Z" opacity={0.8} />
      </g>
    </svg>
  );
}
