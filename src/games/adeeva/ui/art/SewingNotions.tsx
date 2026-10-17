import { darken, lighten } from "../../../../ui/art/colourMix";
import { useSvgId } from "../../../../ui/art/useSvgId";

interface NotionProps {
  readonly x: number;
  readonly y: number;
}

const WINDINGS = [8, 12, 16, 20, 24, 28, 32, 36, 40];

export function Spool({ x, y, colour }: NotionProps & { readonly colour: string }) {
  const id = useSvgId("spool");
  const light = lighten(colour, 0.4);
  const deep = darken(colour, 0.35);
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <linearGradient id={`${id}-thread`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={deep} />
          <stop offset="0.28" stopColor={light} />
          <stop offset="0.55" stopColor={colour} />
          <stop offset="1" stopColor={darken(colour, 0.45)} />
        </linearGradient>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a8784e" />
          <stop offset="0.35" stopColor="#ecd2ae" />
          <stop offset="1" stopColor="#8f6440" />
        </linearGradient>
      </defs>
      <ellipse cx={8} cy={54} rx={34} ry={8} fill="#1c1220" opacity={0.22} />
      <rect x={-25} y={42} width={50} height={11} rx={4} fill={`url(#${id}-wood)`} />
      <ellipse cx={0} cy={53} rx={25} ry={3} fill="#7a5638" opacity={0.6} />
      <rect x={-20} y={4} width={40} height={40} rx={4} fill={`url(#${id}-thread)`} />
      {WINDINGS.map((line, index) => (
        <path
          key={line}
          d={`M-20 ${line} Q0 ${line + (index % 2 === 0 ? 2.2 : 1.4)} 20 ${line - 1}`}
          stroke={deep}
          strokeWidth={0.8}
          fill="none"
          opacity={0.4}
        />
      ))}
      <rect x={-13} y={6} width={5} height={36} rx={2.5} fill="#ffffff" opacity={0.35} />
      <rect x={-25} y={-5} width={50} height={11} rx={4} fill={`url(#${id}-wood)`} />
      <ellipse cx={0} cy={-5} rx={25} ry={4.4} fill="#f0dcc0" />
      <ellipse cx={0} cy={-5} rx={16} ry={2.8} fill="none" stroke="#c9a47a" strokeWidth={0.8} />
      <ellipse cx={0} cy={-5} rx={4.4} ry={1.8} fill="#5e3f26" />
    </g>
  );
}

const PINS = [
  { dx: -16, dy: -12, tipX: -24, tipY: -34, colour: "#f3d36b" },
  { dx: 2, dy: -18, tipX: 6, tipY: -42, colour: "#7fc3d9" },
  { dx: 16, dy: -10, tipX: 28, tipY: -30, colour: "#ffffff" },
  { dx: -4, dy: -6, tipX: -10, tipY: -28, colour: "#a78bd4" },
];

const SEGMENTS = [-24, -8, 8, 24];

export function Pincushion({ x, y }: NotionProps) {
  const id = useSvgId("cushion");
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={`${id}-cushion`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffd0dc" />
          <stop offset="0.35" stopColor="#e57f9e" />
          <stop offset="0.75" stopColor="#c44a72" />
          <stop offset="1" stopColor="#7d2546" />
        </radialGradient>
        <linearGradient id={`${id}-cup`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9c7a16" />
          <stop offset="0.3" stopColor="#f6dc86" />
          <stop offset="0.6" stopColor="#c9a227" />
          <stop offset="1" stopColor="#7d6010" />
        </linearGradient>
        <radialGradient id={`${id}-berry`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ff9d8a" />
          <stop offset="0.7" stopColor="#d9443a" />
          <stop offset="1" stopColor="#8c2020" />
        </radialGradient>
      </defs>
      <ellipse cx={6} cy={30} rx={44} ry={9} fill="#1c1220" opacity={0.24} />
      <path d="M-34 12 Q0 26 34 12 L30 27 Q0 38 -30 27 Z" fill={`url(#${id}-cup)`} />
      <path d="M-32 15 Q0 28 32 15" stroke="#fff3c4" strokeWidth={1.4} fill="none" opacity={0.7} />
      <ellipse cx={0} cy={2} rx={37} ry={25} fill={`url(#${id}-cushion)`} />
      {SEGMENTS.map((dx) => (
        <path
          key={dx}
          d={`M${dx * 0.4} -22 Q${dx * 1.35} 2 ${dx * 0.9} 25`}
          stroke="#7d2546"
          strokeWidth={1.4}
          fill="none"
          opacity={0.42}
        />
      ))}
      <ellipse cx={-12} cy={-9} rx={13} ry={6} fill="#ffffff" opacity={0.32} transform="rotate(-18 -12 -9)" />
      <circle cx={0} cy={-22} r={3.4} fill="#4f8a5e" />
      {PINS.map((pin) => (
        <g key={pin.dx}>
          <path
            d={`M${pin.dx} ${pin.dy} L${pin.tipX} ${pin.tipY}`}
            stroke="#d9d6de"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
          <circle
            cx={pin.tipX}
            cy={pin.tipY}
            r={4.6}
            fill={pin.colour}
            stroke={darken(pin.colour, 0.4)}
            strokeWidth={0.7}
          />
          <circle cx={pin.tipX - 1.4} cy={pin.tipY - 1.6} r={1.5} fill="#ffffff" opacity={0.9} />
        </g>
      ))}
      <path d="M30 18 C40 26 44 34 46 40" stroke="#4f8a5e" strokeWidth={1.2} fill="none" />
      <g transform="translate(48 46)">
        <path d="M0 -8 C9 -8 11 2 6 9 C3 13 -3 13 -6 9 C-11 2 -9 -8 0 -8 Z" fill={`url(#${id}-berry)`} />
        <path d="M-5 -8 L0 -12 L5 -8 L0 -6 Z" fill="#4f8a5e" />
        {[
          [-3, -2],
          [3, -1],
          [0, 3],
          [-3, 6],
          [3, 6],
        ].map(([sx, sy]) => (
          <ellipse key={`${sx}-${sy}`} cx={sx} cy={sy} rx={0.7} ry={1.1} fill="#ffe7a6" />
        ))}
      </g>
    </g>
  );
}
