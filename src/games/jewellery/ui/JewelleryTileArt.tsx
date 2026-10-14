import { TILE_VIEWBOX, TileBackdrop, type TileArtProps } from "../../../ui/art/tiles/TileBackdrop";
import { useSvgId } from "../../../ui/art/useSvgId";

const LANTERNS = [
  { x: 28, y: 22, hue: "#f2b35a" },
  { x: 76, y: 30, hue: "#e8763d" },
  { x: 124, y: 33, hue: "#f2c86a" },
  { x: 172, y: 30, hue: "#e8a33d" },
  { x: 218, y: 22, hue: "#f08a55" },
] as const;

export function JewelleryTileArt({ className }: TileArtProps) {
  const id = useSvgId("jb-tile");
  return (
    <svg className={className} viewBox={TILE_VIEWBOX} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset="0.5" stopColor="#d9b23c" />
          <stop offset="1" stopColor="#8f6e10" />
        </linearGradient>
        <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8e39a" />
          <stop offset="0.6" stopColor="#b88a2a" />
          <stop offset="1" stopColor="#6b4f12" />
        </linearGradient>
        <radialGradient id={`${id}-lens`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.55} />
          <stop offset="0.6" stopColor="#d9eef2" stopOpacity={0.18} />
          <stop offset="1" stopColor="#9fc7cf" stopOpacity={0.3} />
        </radialGradient>
        <radialGradient id={`${id}-velvet`} cx="0.45" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#2f6d7b" />
          <stop offset="1" stopColor="#133540" />
        </radialGradient>
        <clipPath id={`${id}-lens-clip`}>
          <circle cx={150} cy={86} r={30} />
        </clipPath>
      </defs>
      <TileBackdrop tint="#6a4a7a" floor="#7a5236" />
      <path d="M0 14 Q60 40 120 36 Q180 40 240 14" fill="none" stroke="#3a2230" strokeWidth={1.2} />
      {LANTERNS.map((lantern) => (
        <g key={lantern.x} transform={`translate(${lantern.x} ${lantern.y})`}>
          <circle r={11} fill={lantern.hue} opacity={0.25} />
          <path
            d="M-5 -6 Q0 -9 5 -6 L6 5 Q0 8 -6 5 Z"
            fill={lantern.hue}
            stroke="#5a2f17"
            strokeWidth={0.8}
          />
          <path d="M-5 -1 L5 -1 M-5.5 3 L5.5 3" stroke="#5a2f17" strokeOpacity={0.5} strokeWidth={0.6} />
        </g>
      ))}
      <ellipse cx={120} cy={136} rx={78} ry={9} fill="#1c1220" opacity={0.28} />
      <path d="M46 132 Q46 102 70 100 L170 100 Q194 102 194 132 Z" fill={`url(#${id}-velvet)`} />
      <path d="M52 104 L188 104" stroke="#e8a33d" strokeOpacity={0.4} strokeDasharray="2 3" />
      <path
        d="M70 40 C84 70 104 82 116 86"
        fill="none"
        stroke={`url(#${id}-gold)`}
        strokeWidth={1.8}
        strokeDasharray="3 1.2"
      />
      <path
        d="M170 40 C156 70 136 82 124 86"
        fill="none"
        stroke={`url(#${id}-gold)`}
        strokeWidth={1.8}
        strokeDasharray="3 1.2"
      />
      <circle cx={120} cy={90} r={4} fill="none" stroke={`url(#${id}-gold)`} strokeWidth={2.2} />
      <path
        d="M120 94 A24 24 0 1 0 140 132 A19 19 0 1 1 120 94 Z"
        fill={`url(#${id}-gold)`}
        stroke="#664e08"
        strokeWidth={1.2}
      />
      <circle cx={112} cy={116} r={5} fill="#b9a7dc" stroke="#5e2a5a" strokeWidth={0.8} />
      <circle cx={110.6} cy={114.6} r={1.4} fill="#ffffff" />
      <g clipPath={`url(#${id}-lens-clip)`}>
        <rect x={110} y={50} width={80} height={80} fill="#fbf2dc" opacity={0.18} />
        <path
          d="M150 70 l2 6 l6 2 l-6 2 l-2 6 l-2 -6 l-6 -2 l6 -2 Z"
          fill="#ffffff"
          opacity={0.9}
          transform="translate(-6 8) scale(1.2)"
        />
      </g>
      <circle cx={150} cy={86} r={30} fill={`url(#${id}-lens)`} />
      <circle cx={150} cy={86} r={30} fill="none" stroke={`url(#${id}-brass)`} strokeWidth={6} />
      <circle
        cx={150}
        cy={86}
        r={34}
        fill="none"
        stroke="#f8e39a"
        strokeOpacity={0.6}
        strokeWidth={0.8}
        strokeDasharray="1.5 2.5"
      />
      <path d="M171 107 L196 132" stroke="#553620" strokeWidth={8} strokeLinecap="round" />
      <path d="M171 107 L184 120" stroke={`url(#${id}-brass)`} strokeWidth={8} strokeLinecap="round" />
      <path
        d="M136 70 Q142 64 150 64"
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.8}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <g fill="#fff6d0">
        <path d="M44 60 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" />
        <path d="M206 64 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 Z" />
        <path d="M96 58 l1.2 3 l3 1.2 l-3 1.2 l-1.2 3 l-1.2 -3 l-3 -1.2 l3 -1.2 Z" />
      </g>
    </svg>
  );
}
