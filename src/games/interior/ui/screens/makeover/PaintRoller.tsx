import { darken, lighten } from "../../../../../ui/art/colourMix";

interface PaintRollerProps {
  readonly x: number;
  readonly y: number;
  readonly colour: string;
  readonly loaded: boolean;
  readonly still: boolean;
}

const INK = "#3b2a33";
const DRY = "#f4ecd8";
const SKIN = "#c58c5c";

export function PaintRoller({ x, y, colour, loaded, still }: PaintRollerProps) {
  const cover = loaded ? colour : DRY;
  const naps = Array.from({ length: 11 }, (_, index) => -32 + index * 6.4);
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <ellipse cx={8} cy={20} rx={40} ry={9} fill="#2b2230" opacity={0.16} />
      <path
        d="M38 0 L48 0 L48 26 L10 40 L10 56"
        fill="none"
        stroke="#8e98a6"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38 0 L48 0 L48 26 L10 40 L10 56"
        fill="none"
        stroke="#e6ebf1"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x={1} y={52} width={18} height={50} rx={8} fill="#3c6aa8" stroke={INK} strokeWidth={3} />
      <path d="M4 64 L16 64 M4 72 L16 72 M4 80 L16 80 M4 88 L16 88" stroke="#2a4f82" strokeWidth={2.5} />
      <rect x={4} y={55} width={4} height={42} rx={2} fill="#ffffff" opacity={0.3} />
      <path
        d="M0 84 L24 84 L64 168 L34 178 Z"
        fill={SKIN}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <path
        d="M14 116 L40 106 L78 176 L46 190 Z"
        fill="#e98a6c"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <path d="M17 122 L42 112" stroke="#c8664a" strokeWidth={4} strokeLinecap="round" />
      <rect x={-5} y={62} width={30} height={28} rx={10} fill={SKIN} stroke={INK} strokeWidth={2.5} />
      <path
        d="M-3 69 L23 69 M-3 76 L23 76 M-3 83 L23 83"
        stroke={darken(SKIN, 0.3)}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <ellipse cx={-5} cy={74} rx={5} ry={8} fill={lighten(SKIN, 0.12)} stroke={INK} strokeWidth={2} />
      <rect x={-38} y={-15} width={76} height={30} rx={12} fill={cover} stroke={INK} strokeWidth={3} />
      <rect x={-36} y={-13} width={72} height={9} rx={5} fill={lighten(cover, 0.35)} opacity={0.75} />
      <rect x={-36} y={5} width={72} height={8} rx={4} fill={darken(cover, 0.18)} opacity={0.7} />
      <g stroke={darken(cover, 0.28)} strokeWidth={1.6} strokeLinecap="round" opacity={0.55}>
        {naps.map((nx, index) => (
          <path key={nx} d={`M${nx} ${index % 2 === 0 ? -9 : -5} L${nx + 1.5} ${index % 2 === 0 ? -1 : 4}`} />
        ))}
      </g>
      <ellipse cx={38} cy={0} rx={4} ry={14} fill="#c7ccd4" stroke={INK} strokeWidth={2} />
      {loaded ? (
        <g className={still ? undefined : "is-roller__drip"}>
          <path
            d="M-14 14 q-4 9 0 13 q4 -4 0 -13 Z"
            fill={colour}
            stroke={darken(colour, 0.3)}
            strokeWidth={1}
          />
          <path
            d="M12 14 q-3 6 0 9 q3 -3 0 -9 Z"
            fill={colour}
            stroke={darken(colour, 0.3)}
            strokeWidth={1}
          />
        </g>
      ) : null}
    </g>
  );
}
