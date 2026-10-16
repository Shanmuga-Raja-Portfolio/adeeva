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
    case "shell-jar":
      return (
        <g>
          <ellipse cx={0} cy={22} rx={16} ry={4} fill="#2b2230" opacity={0.15} />
          <rect
            x={-13}
            y={-14}
            width={26}
            height={36}
            rx={7}
            fill="#e6f4fa"
            stroke={INK}
            strokeWidth={2}
            opacity={0.95}
          />
          <rect x={-10} y={-20} width={20} height={7} rx={2} fill="#c8914f" stroke={INK} strokeWidth={1.5} />
          <path d="M-8 16 q4 -9 8 0 Z" fill="#f2c4c9" stroke={INK} strokeWidth={1} />
          <path d="M1 18 q5 -11 10 -2 Z" fill="#f4ecd8" stroke={INK} strokeWidth={1} />
          <circle cx={-3} cy={6} r={3} fill="#f07f63" stroke={INK} strokeWidth={0.8} />
          <path d="M3 3 l4 -2 l-1 5 Z" fill="#9fd0ee" stroke={INK} strokeWidth={0.8} />
        </g>
      );
    case "boat-print":
      return (
        <g>
          <rect x={-24} y={-20} width={48} height={40} rx={3} fill="#9fd0ee" stroke={INK} strokeWidth={2} />
          <rect x={-18} y={-14} width={36} height={28} fill="#e6f4fa" />
          <path d="M-18 8 Q-9 4 0 8 T18 8 L18 14 L-18 14 Z" fill="#2a8c91" />
          <path d="M-8 6 L8 6 L5 10 L-5 10 Z" fill="#c8664a" stroke={INK} strokeWidth={1} />
          <path d="M0 6 L0 -10 L9 4 Z" fill="#fffaf2" stroke={INK} strokeWidth={1} />
        </g>
      );
    case "herb-pots":
      return (
        <g>
          <ellipse cx={0} cy={20} rx={28} ry={5} fill="#2b2230" opacity={0.15} />
          {[-16, 0, 16].map((x, index) => (
            <g key={x} transform={`translate(${x} 0)`}>
              <path d="M-7 6 L7 6 L5 20 L-5 20 Z" fill="#c8664a" stroke={INK} strokeWidth={1.5} />
              <g fill={["#3d9a68", "#7d8a4a", "#1f7a55"][index]} stroke="#1f5c3d" strokeWidth={1}>
                <ellipse cx={-3} cy={0} rx={3} ry={5} />
                <ellipse cx={3} cy={-1} rx={3} ry={6} />
                <ellipse cx={0} cy={-4} rx={2.5} ry={5} />
              </g>
            </g>
          ))}
        </g>
      );
    case "record-frame":
      return (
        <g>
          <rect x={-28} y={-18} width={56} height={36} rx={3} fill="#3a3a40" stroke={INK} strokeWidth={2} />
          {[-13, 13].map((x) => (
            <g key={x}>
              <circle cx={x} cy={0} r={11} fill="#141216" />
              <circle cx={x} cy={0} r={7} fill="none" stroke="#5b4f60" strokeWidth={1} />
              <circle cx={x} cy={0} r={3.5} fill={x < 0 ? "#d9a42b" : "#d0587e"} />
            </g>
          ))}
        </g>
      );
    case "book-stack":
      return (
        <g>
          <ellipse cx={0} cy={16} rx={24} ry={4} fill="#2b2230" opacity={0.15} />
          <rect x={-20} y={6} width={40} height={9} rx={2} fill="#9b1b30" stroke={INK} strokeWidth={1.5} />
          <rect x={-17} y={-3} width={34} height={9} rx={2} fill="#9cb59a" stroke={INK} strokeWidth={1.5} />
          <rect x={-21} y={-12} width={38} height={9} rx={2} fill="#22305a" stroke={INK} strokeWidth={1.5} />
          <path
            d="M-14 -16 q6 -6 12 0 q6 -6 12 0 L10 -12 L-14 -12 Z"
            fill="#fffaf2"
            stroke={INK}
            strokeWidth={1.2}
          />
        </g>
      );
    case "map-poster":
      return (
        <g>
          <rect x={-24} y={-20} width={48} height={40} rx={2} fill="#f2d79a" stroke={INK} strokeWidth={2} />
          <path
            d="M-16 -8 Q-6 -16 2 -6 T16 -2 L12 12 Q0 4 -14 10 Z"
            fill="#9cb59a"
            stroke="#7d8a4a"
            strokeWidth={1}
          />
          <path d="M-14 12 Q-4 2 6 6" fill="none" stroke="#c8664a" strokeWidth={1.5} strokeDasharray="3 2" />
          <path d="M4 2 l5 5 M9 2 l-5 5" stroke="#9b1b30" strokeWidth={2} strokeLinecap="round" />
        </g>
      );
    case "clay-vase":
      return (
        <g>
          <ellipse cx={0} cy={22} rx={14} ry={4} fill="#2b2230" opacity={0.15} />
          <path
            d="M-6 -16 L6 -16 L5 -10 Q16 0 10 16 Q8 22 0 22 Q-8 22 -10 16 Q-16 0 -5 -10 Z"
            fill="#f07f63"
            stroke={INK}
            strokeWidth={2}
          />
          <path d="M-9 4 Q0 9 9 4" fill="none" stroke="#c8664a" strokeWidth={2} />
          <path
            d="M0 -16 Q-4 -28 -10 -32 M0 -16 Q4 -26 9 -30"
            fill="none"
            stroke="#7d8a4a"
            strokeWidth={1.5}
          />
        </g>
      );
    case "planet-mobile":
      return (
        <g>
          <path
            d="M-26 -18 L26 -18 M-18 -18 L-18 -4 M0 -18 L0 4 M18 -18 L18 -6"
            stroke="#5b4f60"
            strokeWidth={1.2}
          />
          <circle cx={-18} cy={0} r={6} fill="#f07f63" stroke={INK} strokeWidth={1.2} />
          <circle cx={0} cy={10} r={8} fill="#22305a" stroke={INK} strokeWidth={1.2} />
          <ellipse cx={0} cy={10} rx={13} ry={3} fill="none" stroke="#f2c94c" strokeWidth={1.5} />
          <circle cx={18} cy={-1} r={5} fill="#9fd0ee" stroke={INK} strokeWidth={1.2} />
        </g>
      );
  }
}
