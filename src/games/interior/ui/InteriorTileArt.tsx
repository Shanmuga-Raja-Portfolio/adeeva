import type { TileArtProps } from "../../../ui/art/tiles/TileBackdrop";
import { TILE_VIEWBOX } from "../../../ui/art/tiles/TileBackdrop";
import { useSvgId } from "../../../ui/art/useSvgId";

const GRID = [20, 40, 60, 80, 100, 120, 140];

export function InteriorTileArt({ className }: TileArtProps) {
  const id = useSvgId("is-tile");
  return (
    <svg className={className} viewBox={TILE_VIEWBOX} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-print`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5a86c2" />
          <stop offset="1" stopColor="#2f5690" />
        </linearGradient>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bcd3b8" />
          <stop offset="1" stopColor="#93b190" />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2b77e" />
          <stop offset="1" stopColor="#c68e52" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff1b0" stopOpacity={0.95} />
          <stop offset="0.5" stopColor="#f6d77a" stopOpacity={0.45} />
          <stop offset="1" stopColor="#f6d77a" stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${id}-print-clip`}>
          <path d="M0 0 L132 0 L96 160 L0 160 Z" />
        </clipPath>
      </defs>
      <rect width={240} height={160} fill={`url(#${id}-wall)`} />
      <path d="M0 116 L240 116 L240 160 L0 160 Z" fill={`url(#${id}-floor)`} />
      <g stroke="#a8743f" strokeOpacity={0.5} strokeWidth={1.2}>
        <path d="M0 128 L240 128 M0 142 L240 142" />
        <path d="M60 116 L60 128 M150 128 L150 142 M210 116 L210 128 M100 142 L100 160" />
      </g>
      <path d="M0 112 L240 112 L240 118 L0 118 Z" fill="#fffaf2" opacity={0.9} />
      <rect x={150} y={18} width={58} height={50} rx={3} fill="#cfe7f7" stroke="#fffaf2" strokeWidth={4} />
      <path d="M179 18 L179 68 M150 43 L208 43" stroke="#fffaf2" strokeWidth={2.4} />
      <circle cx={196} cy={30} r={5} fill="#fff4c2" />
      <path d="M150 68 L208 68 L232 116 L170 116 Z" fill="#f6d77a" opacity={0.22} />
      <circle cx={92} cy={66} r={46} fill={`url(#${id}-glow)`} />
      <g clipPath={`url(#${id}-print-clip)`}>
        <rect width={240} height={160} fill={`url(#${id}-print)`} />
        <g stroke="#ffffff" strokeOpacity={0.22} strokeWidth={1}>
          {GRID.map((step) => (
            <path key={`v${step}`} d={`M${step} 0 L${step} 160`} />
          ))}
          {GRID.map((step) => (
            <path key={`h${step}`} d={`M0 ${step} L240 ${step}`} />
          ))}
        </g>
        <g fill="none" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <rect x={16} y={26} width={58} height={34} rx={6} />
          <rect x={22} y={30} width={18} height={10} rx={4} />
          <path d="M16 96 A26 26 0 0 1 42 70" strokeDasharray="4 4" />
          <path d="M16 96 L42 96" />
        </g>
        <g fill="#ffffff">
          <path
            d="M60 86 c4 -6 10 -6 10 1 c0 6 -6 9 -10 13 c-4 -4 -10 -7 -10 -13 c0 -7 6 -7 10 -1 z"
            opacity={0.85}
          />
        </g>
        <path d="M6 12 L80 12" stroke="#ffffff" strokeWidth={1.2} strokeDasharray="2 3" />
        <path d="M6 9 L6 15 M80 9 L80 15" stroke="#ffffff" strokeWidth={1.2} />
      </g>
      <path d="M132 0 L96 160" stroke="#fffaf2" strokeWidth={3} />
      <path d="M126 0 L132 0 L96 160 L90 160 Z" fill="#7fb1e6" opacity={0.7} />
      <path
        d="M212 26 L238 26 L238 74 Q232 80 226 74 Q220 68 214 76 Q212 78 212 74 Z"
        fill="#c8664a"
        opacity={0.92}
      />
      <path d="M212 26 L238 26" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={3} />
      <g transform="translate(222 20) scale(0.8)">
        <rect x={-21} y={-9} width={42} height={18} rx={8} fill="#c8664a" stroke="#3b2a33" strokeWidth={2} />
        <rect x={-21} y={-9} width={42} height={6} rx={3} fill="#e98a6c" />
        <path
          d="M21 0 L30 0 L30 -22 L44 -30"
          fill="none"
          stroke="#3b2a33"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x={38}
          y={-46}
          width={10}
          height={22}
          rx={4}
          transform="rotate(30 43 -35)"
          fill="#3c6aa8"
          stroke="#3b2a33"
          strokeWidth={2}
        />
      </g>
      <g transform="translate(92 66)">
        <path
          d="M0 50 L0 -18 Q0 -34 16 -34"
          fill="none"
          stroke="#7a5236"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <path d="M6 -40 Q18 -56 30 -40 Z" fill="#f2c86a" stroke="#3b2a33" strokeWidth={1.8} />
        <ellipse cx={0} cy={50} rx={10} ry={3} fill="#7a5236" />
      </g>
      <g transform="translate(176 118)">
        <ellipse cx={0} cy={2} rx={40} ry={5} fill="#2b2230" opacity={0.18} />
        <rect
          x={-34}
          y={-30}
          width={68}
          height={22}
          rx={10}
          fill="#e98a6c"
          stroke="#3b2a33"
          strokeWidth={2}
        />
        <rect x={-40} y={-16} width={14} height={18} rx={6} fill="#d97558" stroke="#3b2a33" strokeWidth={2} />
        <rect x={26} y={-16} width={14} height={18} rx={6} fill="#d97558" stroke="#3b2a33" strokeWidth={2} />
        <rect x={-28} y={-12} width={56} height={14} rx={6} fill="#f4a588" stroke="#3b2a33" strokeWidth={2} />
        <rect
          x={-14}
          y={-38}
          width={18}
          height={14}
          rx={5}
          fill="#f6d77a"
          stroke="#3b2a33"
          strokeWidth={1.4}
        />
      </g>
      <g transform="translate(36 122)">
        <path d="M-14 -16 L14 -16 L12 14 L-12 14 Z" fill="#e9c7b8" stroke="#3b2a33" strokeWidth={2} />
        <ellipse cx={0} cy={-16} rx={14} ry={4} fill="#c8664a" stroke="#3b2a33" strokeWidth={2} />
        <path d="M-10 -2 L10 -2" stroke="#c8664a" strokeWidth={4} />
      </g>
      <g fill="#ffffff" opacity={0.85}>
        <path d="M210 88 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" />
        <path d="M144 96 l1.5 3.5 l3.5 1.5 l-3.5 1.5 l-1.5 3.5 l-1.5 -3.5 l-3.5 -1.5 l3.5 -1.5 z" />
      </g>
    </svg>
  );
}
