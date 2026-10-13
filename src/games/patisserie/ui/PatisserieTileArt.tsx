import { TILE_VIEWBOX, TileBackdrop, type TileArtProps } from "../../../ui/art/tiles/TileBackdrop";
import { useSvgId } from "../../../ui/art/useSvgId";

export function PatisserieTileArt({ className }: TileArtProps) {
  const id = useSvgId("pa-tile");
  return (
    <svg className={className} viewBox={TILE_VIEWBOX} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-tier`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f2d9a6" />
          <stop offset="0.45" stopColor="#fff4dc" />
          <stop offset="1" stopColor="#e9c98c" />
        </linearGradient>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9fb1e6" />
          <stop offset="0.5" stopColor="#c9d3f4" />
          <stop offset="1" stopColor="#8a9ddb" />
        </linearGradient>
      </defs>
      <TileBackdrop tint="#f7c58d" floor="#e9d3b6" />
      <g stroke="#ffffff" strokeOpacity={0.35} strokeWidth={0.8}>
        {[18, 36, 54, 72, 90].map((y) => (
          <line key={y} x1={0} y1={y} x2={240} y2={y} />
        ))}
      </g>
      <path
        d="M0 0 H240 V16 Q228 26 216 16 Q204 26 192 16 Q180 26 168 16 Q156 26 144 16 Q132 26 120 16 Q108 26 96 16 Q84 26 72 16 Q60 26 48 16 Q36 26 24 16 Q12 26 0 16 Z"
        fill="#a9c98b"
      />
      <path d="M24 0 V16 M72 0 V16 M120 0 V16 M168 0 V16 M216 0 V16" stroke="#fff1cf" strokeWidth={10} />
      <ellipse cx={120} cy={138} rx={62} ry={6} fill="#3b2620" opacity={0.14} />
      <path d="M104 136 L136 136 L128 126 L112 126 Z" fill="#f4ede0" stroke="#c9b9a2" strokeWidth={1} />
      <ellipse cx={120} cy={124} rx={50} ry={6} fill="#fbf7ef" stroke="#c9b9a2" strokeWidth={1} />
      <path d="M78 92 V118 Q120 128 162 118 V92 Z" fill={`url(#${id}-tier)`} />
      <ellipse cx={120} cy={92} rx={42} ry={8} fill="#fff6e3" />
      <path
        d="M78 116 q5 5 10 0 q5 5 10 0 q5 5 10 0 q5 5 10 0 q5 5 10 0 q5 5 10 0 q5 5 10 0 q5 5 10 0 q4 4 4 0"
        fill="none"
        stroke="#4b5aa6"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <path
        d="M78 101 Q92 110 106 101 Q120 110 134 101 Q148 110 162 101"
        fill="none"
        stroke="#c9a227"
        strokeWidth={1.6}
      />
      <path d="M96 62 V88 Q120 96 144 88 V62 Z" fill={`url(#${id}-top)`} />
      <ellipse cx={120} cy={62} rx={24} ry={5} fill="#d9e0f8" />
      <path
        d="M96 86 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0"
        fill="none"
        stroke="#fff6e3"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <g fill="#e2b93b" stroke="#a8841a" strokeWidth={0.6}>
        <path d="M120 44 l2.6 5.4 5.9 0.8 -4.3 4.1 1 5.8 -5.2 -2.8 -5.2 2.8 1 -5.8 -4.3 -4.1 5.9 -0.8 Z" />
        <path d="M104 56 l1.6 3.2 3.5 0.5 -2.5 2.4 0.6 3.4 -3.2 -1.7 -3.1 1.7 0.6 -3.4 -2.5 -2.4 3.5 -0.5 Z" />
        <path d="M137 55 l1.6 3.2 3.5 0.5 -2.5 2.4 0.6 3.4 -3.2 -1.7 -3.1 1.7 0.6 -3.4 -2.5 -2.4 3.5 -0.5 Z" />
      </g>
      <g transform="translate(190 108)">
        <ellipse cx={0} cy={30} rx={18} ry={3} fill="#3b2620" opacity={0.15} />
        <path d="M-14 10 L-10 30 H10 L14 10 Z" fill="#f4a259" stroke="#c86a24" strokeWidth={1} />
        <path d="M-9 12 L-7 29 M-3 12 L-2 29 M3 12 L2 29 M9 12 L7 29" stroke="#c86a24" strokeWidth={0.8} />
        <path d="M-16 10 Q-16 -2 0 -4 Q16 -2 16 10 Z" fill="#f7d8e4" />
        <path d="M-12 4 Q0 -10 12 4 M-8 -1 Q0 -12 8 -1" stroke="#ffffff" strokeWidth={1.4} fill="none" />
        <rect x={-1.6} y={-20} width={3.2} height={14} rx={1.2} fill="#4b5aa6" />
        <path d="M-1.6 -16 L1.6 -14 M-1.6 -11 L1.6 -9" stroke="#fff1cf" strokeWidth={1} />
        <g fill="#e04f5f">
          <circle cx={-8} cy={4} r={1.2} />
          <circle cx={6} cy={1} r={1.2} fill="#4b5aa6" />
          <circle cx={9} cy={6} r={1.2} fill="#6f9152" />
          <circle cx={-3} cy={-1} r={1.2} fill="#e2b93b" />
        </g>
      </g>
      <g transform="translate(46 112) rotate(-14)">
        <rect x={-3} y={6} width={6} height={22} rx={3} fill="#6b4232" />
        <path
          d="M0 6 C-12 0 -12 -22 0 -26 C12 -22 12 0 0 6 Z"
          fill="none"
          stroke="#b9c0c9"
          strokeWidth={1.5}
        />
        <path d="M0 6 C-6 -2 -6 -18 0 -26 C6 -18 6 -2 0 6" fill="none" stroke="#b9c0c9" strokeWidth={1.2} />
      </g>
      <g transform="translate(206 44)">
        <path d="M0 -12 A12 12 0 1 0 8 9 A9 9 0 1 1 0 -12 Z" fill="#fff1cf" opacity={0.95} />
        <path
          d="M12 -12 l1.4 3 3.2 0.4 -2.3 2.2 0.6 3.2 -2.9 -1.6 -2.9 1.6 0.6 -3.2 -2.3 -2.2 3.2 -0.4 Z"
          fill="#fff1cf"
        />
      </g>
    </svg>
  );
}
