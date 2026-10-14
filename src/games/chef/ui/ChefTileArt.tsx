import { TILE_VIEWBOX, TileBackdrop, type TileArtProps } from "../../../ui/art/tiles/TileBackdrop";
import { useSvgId } from "../../../ui/art/useSvgId";

const TICKETS = [
  { x: 30, turn: -6 },
  { x: 74, turn: 4 },
  { x: 168, turn: -3 },
  { x: 206, turn: 6 },
] as const;

export function ChefTileArt({ className }: TileArtProps) {
  const id = useSvgId("ck-tile");
  return (
    <svg className={className} viewBox={TILE_VIEWBOX} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-lamp`} cx="0.5" cy="0" r="1">
          <stop offset="0" stopColor="#ffd88a" stopOpacity={0.85} />
          <stop offset="1" stopColor="#f2a93b" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe5e8" />
          <stop offset="1" stopColor="#7d8a91" />
        </linearGradient>
        <radialGradient id={`${id}-pan`} cx="0.45" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#56636a" />
          <stop offset="1" stopColor="#1f272b" />
        </radialGradient>
      </defs>
      <TileBackdrop tint="#2e3a40" floor="#5f6c73" />
      <rect x={0} y={14} width={240} height={4} fill="#aeb9bf" />
      {TICKETS.map((ticket) => (
        <g key={ticket.x} transform={`translate(${ticket.x} 16) rotate(${ticket.turn})`}>
          <rect width={26} height={36} rx={2} fill="#fbf7ee" />
          <path d="M5 9 h16 M5 16 h12 M5 23 h14" stroke="#2e3a40" strokeWidth={1.6} opacity={0.6} />
          <rect x={0} y={30} width={26} height={6} fill="#d9472b" opacity={0.75} />
        </g>
      ))}
      <path d="M104 18 L136 18 L146 40 L94 40 Z" fill="#2e3a40" />
      <ellipse cx={120} cy={40} rx={26} ry={4} fill="#ffd88a" />
      <path d="M94 40 L52 140 L188 140 L146 40 Z" fill={`url(#${id}-lamp)`} />
      <rect x={20} y={118} width={200} height={10} rx={3} fill={`url(#${id}-steel)`} />
      <ellipse cx={120} cy={116} rx={58} ry={14} fill="#0d1215" opacity={0.3} />
      <ellipse cx={120} cy={110} rx={56} ry={13} fill="#f7f4ee" />
      <ellipse cx={120} cy={110} rx={42} ry={9} fill="#ece6da" />
      <path d="M96 108 Q120 92 144 106 Q132 116 108 116 Z" fill="#e0612a" />
      <g fill="#f6b84a">
        <circle cx={108} cy={104} r={2} />
        <circle cx={118} cy={100} r={2} />
        <circle cx={130} cy={104} r={2} />
      </g>
      <path d="M100 106 q6 -6 12 0" stroke="#e0442a" strokeWidth={3} fill="none" />
      <path d="M128 102 q5 -5 10 0" stroke="#4f8a3c" strokeWidth={3} fill="none" />
      <path
        d="M110 92 q-4 -10 2 -18 M124 90 q-4 -10 2 -18 M138 94 q-4 -10 2 -18"
        stroke="#ffffff"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
        opacity={0.7}
      />
      <g transform="translate(40 92)">
        <ellipse cx={0} cy={8} rx={26} ry={8} fill="#0d1215" opacity={0.3} />
        <circle r={22} fill={`url(#${id}-pan)`} />
        <path d="M20 -6 L52 -18" stroke="#2e3a40" strokeWidth={6} strokeLinecap="round" />
        <circle cx={-6} cy={-4} r={6} fill="#f1b83a" />
        <circle cx={6} cy={4} r={6} fill="#e9862a" />
        <circle cx={-2} cy={8} r={5} fill="#f1b83a" />
      </g>
      <g transform="translate(200 98)">
        <path d="M-18 12 Q-18 -12 0 -14 Q18 -12 18 12 Z" fill="#d9b23c" stroke="#8f6e10" strokeWidth={1.5} />
        <rect x={-22} y={12} width={44} height={5} rx={2} fill="#5f6c73" />
        <circle cx={0} cy={-17} r={3.5} fill="#8f6e10" />
        <path d="M-10 -6 q4 -4 8 -4" stroke="#fff6d8" strokeWidth={2} fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
