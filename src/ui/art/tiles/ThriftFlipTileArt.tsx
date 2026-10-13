import { TILE_VIEWBOX, TileBackdrop, type TileArtProps } from "./TileBackdrop";

export function ThriftFlipTileArt({ className }: TileArtProps) {
  return (
    <svg className={className} viewBox={TILE_VIEWBOX} aria-hidden="true" focusable="false">
      <TileBackdrop tint="#9cc7b4" floor="#d9c3a3" />
      <ellipse cx={120} cy={134} rx={86} ry={7} fill="#2b2230" opacity={0.1} />
      <path d="M44 132 L44 30 M196 132 L196 30" stroke="#6d5a4a" strokeWidth={4} strokeLinecap="round" />
      <path d="M38 132 L52 132 M190 132 L204 132" stroke="#6d5a4a" strokeWidth={4} strokeLinecap="round" />
      <path d="M40 32 L200 32" stroke="#8a7464" strokeWidth={5} strokeLinecap="round" />
      <g stroke="#7d6f78" strokeWidth={1.6} fill="none" strokeLinecap="round">
        <path d="M78 32 C78 26 86 26 86 32 L66 46 L98 46 Z" />
        <path d="M122 32 C122 26 130 26 130 32 L110 46 L142 46 Z" />
        <path d="M164 32 C164 26 172 26 172 32 L152 46 L184 46 Z" />
      </g>
      <path
        d="M68 46 L96 46 L106 64 L98 68 L96 60 L96 104 L68 104 L68 60 L66 68 L58 64 Z"
        fill="#e9a5b8"
        stroke="#b4687f"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path d="M82 50 L82 100" stroke="#b4687f" strokeWidth={1} strokeDasharray="3 3" />
      <path
        d="M110 46 L142 46 L150 108 L102 108 Z"
        fill="#3f5f8a"
        stroke="#2c4466"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path d="M110 46 L126 70 L142 46" fill="#f4ecd8" stroke="#2c4466" strokeWidth={1.2} />
      <g stroke="#f4ecd8" strokeWidth={1} strokeDasharray="2.5 2.5" opacity={0.8}>
        <path d="M106 88 L146 88" />
        <path d="M126 74 L126 106" />
      </g>
      <path
        d="M154 46 L182 46 L190 82 L178 82 L178 112 L158 112 L158 82 L146 82 Z"
        fill="#f2c14e"
        stroke="#b88a1c"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <g fill="#b88a1c">
        <circle cx={168} cy={62} r={1.8} />
        <circle cx={168} cy={74} r={1.8} />
        <circle cx={168} cy={86} r={1.8} />
      </g>
      <g transform="translate(176 92) rotate(14)">
        <path d="M0 0 L22 0 L28 8 L22 16 L0 16 Z" fill="#fffaf2" stroke="#9a7a5a" strokeWidth={1.2} />
        <circle cx={22} cy={8} r={1.8} fill="#9a7a5a" />
        <path d="M5 6 L15 6 M5 10 L12 10" stroke="#c9a227" strokeWidth={1.6} strokeLinecap="round" />
      </g>
      <path d="M150 112 C156 104 168 104 172 98" stroke="#9a7a5a" strokeWidth={1} fill="none" />
    </svg>
  );
}
