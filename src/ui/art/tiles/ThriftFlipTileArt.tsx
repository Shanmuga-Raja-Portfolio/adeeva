import { TILE_VIEWBOX, TileBackdrop, type TileArtProps } from "./TileBackdrop";

const STRIPES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const FLAGS = ["#f08a3c", "#8fcfb2", "#3f5d84", "#f6d36b", "#e57a8f", "#8fcfb2", "#f08a3c"];

export function ThriftFlipTileArt({ className }: TileArtProps) {
  return (
    <svg className={className} viewBox={TILE_VIEWBOX} aria-hidden="true" focusable="false">
      <TileBackdrop tint="#9cc7b4" floor="#d9c3a3" />
      {STRIPES.map((index) => (
        <path
          key={index}
          d={`M${index * 20} 0 L${index * 20 + 20} 0 L${index * 20 + 20} 18 Q${index * 20 + 10} 27 ${index * 20} 18 Z`}
          fill={index % 2 === 0 ? "#f08a3c" : "#fff4e2"}
        />
      ))}
      <path d="M0 2 H240" stroke="#b85a17" strokeOpacity={0.35} strokeWidth={2} />
      <path d="M8 34 Q120 50 232 34" fill="none" stroke="#a07a52" strokeWidth={1} />
      {FLAGS.map((colour, index) => {
        const x = 20 + index * 31;
        const y = 34 + Math.sin(((x - 8) / 224) * Math.PI) * 8;
        return <path key={x} d={`M${x} ${y} L${x + 16} ${y + 1} L${x + 8} ${y + 13} Z`} fill={colour} />;
      })}
      <ellipse cx={120} cy={138} rx={92} ry={7} fill="#2b2230" opacity={0.1} />
      <path d="M40 136 L40 54 M200 136 L200 54" stroke="#8a6a4a" strokeWidth={4} strokeLinecap="round" />
      <path d="M34 136 L46 136 M194 136 L206 136" stroke="#8a6a4a" strokeWidth={4} strokeLinecap="round" />
      <path d="M36 56 L204 56" stroke="#9aa0aa" strokeWidth={5} strokeLinecap="round" />
      <path d="M36 55 L204 55" stroke="#d4d8de" strokeWidth={1.4} strokeLinecap="round" />
      <g stroke="#8a8f99" strokeWidth={1.5} fill="none" strokeLinecap="round">
        <path d="M76 56 q5 0 5 4 q0 3 -5 5 v3" />
        <path d="M120 56 q5 0 5 4 q0 3 -5 5 v3" />
        <path d="M164 56 q5 0 5 4 q0 3 -5 5 v3" />
      </g>
      <g stroke="#a07a52" strokeWidth={2.4} strokeLinecap="round">
        <path d="M60 74 L76 66 L92 74" />
        <path d="M104 74 L120 66 L136 74" />
        <path d="M148 74 L164 66 L180 74" />
      </g>
      <path
        d="M62 74 L90 74 L100 92 L92 96 L90 88 L90 124 L62 124 L62 88 L60 96 L52 92 Z"
        fill="#9fd0ee"
        stroke="#5c8fb0"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <g stroke="#5c8fb0" strokeWidth={0.8} opacity={0.6}>
        <path d="M66 74 L66 124 M72 74 L72 124 M78 74 L78 124 M84 74 L84 124" />
        <path d="M62 82 L90 82 M62 92 L90 92 M62 102 L90 102 M62 112 L90 112" />
      </g>
      <path d="M76 76 L76 122" stroke="#f4ecd8" strokeWidth={1} strokeDasharray="2 2" />
      <path
        d="M106 74 L134 74 L140 98 L154 128 L86 128 L100 98 Z"
        fill="#f2c4c9"
        stroke="#c07a86"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <g fill="#d0587e">
        <circle cx={110} cy={104} r={2.6} />
        <circle cx={124} cy={114} r={2.6} />
        <circle cx={136} cy={102} r={2.6} />
        <circle cx={118} cy={88} r={2.2} />
        <circle cx={100} cy={120} r={2.2} />
        <circle cx={142} cy={122} r={2.2} />
      </g>
      <path d="M100 98 Q120 103 140 98" fill="none" stroke="#c07a86" strokeWidth={1} strokeDasharray="2 2" />
      <path
        d="M150 74 L178 74 L182 132 L166 132 L164 96 L162 132 L146 132 Z"
        fill="#3f5d84"
        stroke="#2c4466"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <path d="M146 82 L182 82" stroke="#f4ecd8" strokeWidth={1} strokeDasharray="2.5 2" opacity={0.8} />
      <g transform="translate(184 96) rotate(16)">
        <path d="M0 0 L22 0 L28 8 L22 16 L0 16 Z" fill="#e8d9bd" stroke="#a07a52" strokeWidth={1.2} />
        <circle cx={21} cy={8} r={1.8} fill="#fff8ec" stroke="#a07a52" strokeWidth={0.8} />
        <path d="M4 6 L14 6 M4 10 L11 10" stroke="#f08a3c" strokeWidth={1.8} strokeLinecap="round" />
      </g>
      <path d="M182 132 C186 122 196 116 200 104" stroke="#a07a52" strokeWidth={1} fill="none" />
      <g transform="translate(26 112) rotate(-24)">
        <circle cx={0} cy={10} r={4} fill="none" stroke="#f08a3c" strokeWidth={2} />
        <circle cx={8} cy={10} r={4} fill="none" stroke="#f08a3c" strokeWidth={2} />
        <path d="M2 7 L16 -10 M6 7 L-6 -10" stroke="#9aa3ad" strokeWidth={2} strokeLinecap="round" />
      </g>
      <g fill="#ffffff">
        <path d="M212 84 l1.6 4 l4 1.6 l-4 1.6 l-1.6 4 l-1.6 -4 l-4 -1.6 l4 -1.6 Z" />
        <path d="M24 70 l1.2 3 l3 1.2 l-3 1.2 l-1.2 3 l-1.2 -3 l-3 -1.2 l3 -1.2 Z" />
      </g>
    </svg>
  );
}
