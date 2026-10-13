import { TILE_VIEWBOX, TileBackdrop, type TileArtProps } from "./TileBackdrop";

export function InteriorTileArt({ className }: TileArtProps) {
  return (
    <svg className={className} viewBox={TILE_VIEWBOX} aria-hidden="true" focusable="false">
      <TileBackdrop tint="#a9c4dd" floor="#d8c2a6" />
      <rect x={88} y={22} width={46} height={34} rx={2} fill="#fffaf2" stroke="#b49a7c" strokeWidth={3} />
      <path d="M92 50 L104 36 L114 46 L120 40 L130 50 Z" fill="#7fa58a" />
      <circle cx={122} cy={31} r={4} fill="#f2c14e" />
      <ellipse cx={116} cy={134} rx={80} ry={7} fill="#2b2230" opacity={0.12} />
      <rect x={54} y={84} width={120} height={36} rx={12} fill="#d0587e" stroke="#a93d63" strokeWidth={1.4} />
      <rect x={60} y={66} width={108} height={30} rx={12} fill="#e07494" stroke="#a93d63" strokeWidth={1.4} />
      <rect x={46} y={80} width={20} height={42} rx={9} fill="#c34c72" stroke="#a93d63" strokeWidth={1.4} />
      <rect x={162} y={80} width={20} height={42} rx={9} fill="#c34c72" stroke="#a93d63" strokeWidth={1.4} />
      <rect x={72} y={70} width={26} height={22} rx={7} fill="#f6ecc8" stroke="#c9a227" strokeWidth={1.2} />
      <rect x={130} y={70} width={26} height={22} rx={7} fill="#e2eee5" stroke="#7fa58a" strokeWidth={1.2} />
      <path d="M58 122 L58 132 M170 122 L170 132" stroke="#8a6a4a" strokeWidth={4} strokeLinecap="round" />
      <path d="M200 132 L200 52" stroke="#5b4f60" strokeWidth={2.4} />
      <path d="M190 132 L210 132" stroke="#5b4f60" strokeWidth={3} strokeLinecap="round" />
      <path d="M186 52 L214 52 L208 34 L192 34 Z" fill="#f6ecc8" stroke="#c9a227" strokeWidth={1.2} />
      <ellipse cx={200} cy={60} rx={20} ry={8} fill="#fff2b8" opacity={0.45} />
      <path d="M26 132 L40 132 L37 112 L29 112 Z" fill="#c8925c" stroke="#8a5a30" strokeWidth={1.2} />
      <g fill="#7fa58a" stroke="#557a61" strokeWidth={1}>
        <path d="M33 112 C24 100 22 90 26 84 C32 92 34 102 33 112 Z" />
        <path d="M33 112 C38 98 44 92 48 92 C46 102 40 108 33 112 Z" />
        <path d="M33 112 C30 96 32 84 36 78 C40 90 38 102 33 112 Z" />
      </g>
    </svg>
  );
}
