import { darken, lighten } from "../../../../ui/art/colourMix";
import type { DecorId } from "../../content/decor";

interface DecorArtProps {
  readonly decorId: DecorId;
  readonly soft: string;
}

const INK = "#3b2a33";

export function DecorArt({ decorId, soft }: DecorArtProps) {
  switch (decorId) {
    case "cushion-pile":
      return (
        <g>
          <ellipse cx={0} cy={18} rx={28} ry={6} fill="#2b2230" opacity={0.15} />
          <rect x={-26} y={-2} width={34} height={22} rx={9} fill={soft} stroke={INK} strokeWidth={2} />
          <rect
            x={-6}
            y={-10}
            width={32}
            height={28}
            rx={10}
            fill={lighten(soft, 0.3)}
            stroke={INK}
            strokeWidth={2}
          />
          <circle cx={10} cy={4} r={3} fill={darken(soft, 0.2)} />
        </g>
      );
    case "potted-fern":
      return (
        <g>
          <ellipse cx={0} cy={26} rx={20} ry={5} fill="#2b2230" opacity={0.15} />
          <path d="M-14 6 L14 6 L10 26 L-10 26 Z" fill="#c8664a" stroke={INK} strokeWidth={2} />
          <g fill="#3d9a68" stroke="#1f7a55" strokeWidth={1.5}>
            <path d="M0 6 C-24 -6 -28 -22 -22 -28 C-14 -16 -6 -6 0 6 Z" />
            <path d="M0 6 C22 -4 28 -20 24 -28 C14 -18 6 -6 0 6 Z" />
            <path d="M0 6 C-4 -14 -2 -30 4 -36 C8 -22 6 -8 0 6 Z" />
          </g>
        </g>
      );
    case "framed-print":
      return (
        <g>
          <rect x={-24} y={-20} width={48} height={40} rx={3} fill="#22305a" stroke={INK} strokeWidth={2} />
          <rect x={-18} y={-14} width={36} height={28} fill="#f4ecd8" />
          <path d="M-18 10 L-6 -2 L2 6 L8 0 L18 10 Z" fill="#9cb59a" />
          <circle cx={8} cy={-6} r={4} fill="#f6d77a" />
        </g>
      );
    case "woven-basket":
      return (
        <g>
          <ellipse cx={0} cy={18} rx={24} ry={5} fill="#2b2230" opacity={0.15} />
          <path d="M-20 -6 L20 -6 L16 18 L-16 18 Z" fill="#c8914f" stroke={INK} strokeWidth={2} />
          <path d="M-18 2 L18 2 M-17 10 L17 10" stroke="#8a5a30" strokeWidth={2} />
          <path d="M-12 -6 Q0 -22 12 -6" fill="none" stroke="#8a5a30" strokeWidth={3} />
        </g>
      );
    case "round-rug":
      return (
        <g>
          <ellipse cx={0} cy={0} rx={34} ry={14} fill={soft} stroke={INK} strokeWidth={2} />
          <ellipse cx={0} cy={0} rx={24} ry={9} fill="none" stroke={lighten(soft, 0.45)} strokeWidth={3} />
          <ellipse cx={0} cy={0} rx={12} ry={4.5} fill={lighten(soft, 0.25)} />
        </g>
      );
    case "star-garland":
      return (
        <g>
          <path d="M-32 -8 Q0 14 32 -8" fill="none" stroke="#5b4f60" strokeWidth={1.5} />
          {[-22, -8, 8, 22].map((x, index) => (
            <path
              key={x}
              transform={`translate(${x} ${index === 0 || index === 3 ? 0 : 4})`}
              d="M0 -7 L2 -2 L7 -2 L3 1.5 L4.5 7 L0 3.5 L-4.5 7 L-3 1.5 L-7 -2 L-2 -2 Z"
              fill="#f2c94c"
              stroke="#9a7a14"
              strokeWidth={1}
            />
          ))}
        </g>
      );
    case "paper-bunting":
      return (
        <g>
          <path d="M-32 -10 Q0 4 32 -10" fill="none" stroke="#5b4f60" strokeWidth={1.5} />
          {[-24, -12, 0, 12, 24].map((x, index) => (
            <path
              key={x}
              d={`M${x - 5} ${-8 + Math.abs(x) * -0.15 + 6} L${x + 5} ${-8 + Math.abs(x) * -0.15 + 6} L${x} ${6 + Math.abs(x) * -0.15 + 6} Z`}
              fill={["#f07f63", "#f2c94c", "#9fd0ee", "#9cb59a", "#f2c4c9"][index]}
              stroke={INK}
              strokeWidth={1}
            />
          ))}
        </g>
      );
    case "wall-clock":
      return (
        <g>
          <circle r={18} fill="#3a3a40" stroke={INK} strokeWidth={2} />
          <circle r={14} fill="#fffaf2" />
          <path d="M0 0 L0 -9 M0 0 L7 3" stroke={INK} strokeWidth={2} strokeLinecap="round" />
          <circle r={1.6} fill="#c8664a" />
        </g>
      );
  }
}
