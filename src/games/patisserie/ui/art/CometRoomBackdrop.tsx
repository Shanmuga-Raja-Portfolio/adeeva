import { useSvgId } from "../../../../ui/art/useSvgId";

export interface CometRoomBackdropProps {
  readonly className?: string | undefined;
  readonly glow?: number | undefined;
}

const STRIPES = Array.from({ length: 30 }, (_, index) => index);
const LAMPS = [240, 600, 960];
const STARS: readonly [number, number, number][] = [
  [520, 150, 2.4],
  [560, 210, 1.6],
  [640, 132, 2],
  [700, 196, 1.4],
  [668, 236, 2.2],
  [590, 252, 1.2],
];

function TableWithStand({ x, cloth }: { readonly x: number; readonly cloth: string }) {
  return (
    <g transform={`translate(${x} 470)`}>
      <ellipse cx={0} cy={86} rx={120} ry={16} fill="#3b2620" opacity={0.14} />
      <path d="M-110 0 Q-118 60 -96 84 H96 Q118 60 110 0 Z" fill={cloth} />
      <path d="M-110 0 Q-118 60 -96 84" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={6} fill="none" />
      <ellipse cx={0} cy={0} rx={112} ry={22} fill="#fffaf2" stroke="#e8dccb" strokeWidth={2} />
      <g transform="translate(-26 -10)">
        <path d="M0 0 V-92" stroke="#c9b48a" strokeWidth={3} />
        <ellipse cx={0} cy={0} rx={34} ry={6} fill="#f1ebe0" stroke="#c9b48a" strokeWidth={1.6} />
        <ellipse cx={0} cy={-40} rx={26} ry={5} fill="#f1ebe0" stroke="#c9b48a" strokeWidth={1.6} />
        <ellipse cx={0} cy={-76} rx={18} ry={4} fill="#f1ebe0" stroke="#c9b48a" strokeWidth={1.6} />
        {[-20, -7, 6, 19].map((dx) => (
          <rect key={dx} x={dx - 5} y={-12} width={10} height={9} rx={2} fill="#f2c4c9" />
        ))}
        {[-14, 0, 14].map((dx) => (
          <ellipse
            key={dx}
            cx={dx}
            cy={-47}
            rx={6}
            ry={4.5}
            fill="#e9c27f"
            stroke="#a9772f"
            strokeWidth={0.8}
          />
        ))}
        {[-8, 8].map((dx) => (
          <circle key={dx} cx={dx} cy={-82} r={5.5} fill="#b9a7dc" stroke="#8f78c2" strokeWidth={0.8} />
        ))}
        <circle cx={0} cy={-96} r={4} fill="#c9b48a" />
      </g>
      <g transform="translate(46 -14)">
        <ellipse cx={0} cy={10} rx={22} ry={4} fill="#3b2620" opacity={0.12} />
        <path d="M-18 8 Q-24 -16 0 -18 Q24 -16 18 8 Z" fill="#a9c98b" stroke="#6f9152" strokeWidth={1.6} />
        <path d="M18 -6 Q34 -8 30 -22" fill="none" stroke="#6f9152" strokeWidth={3} strokeLinecap="round" />
        <path d="M-18 -4 Q-30 -2 -28 6" fill="none" stroke="#6f9152" strokeWidth={4} strokeLinecap="round" />
        <ellipse cx={0} cy={-18} rx={8} ry={3} fill="#cfe3bb" stroke="#6f9152" strokeWidth={1.2} />
        <circle cx={0} cy={-23} r={3} fill="#6f9152" />
      </g>
      {[-70, 82].map((dx) => (
        <g key={dx} transform={`translate(${dx} 4)`}>
          <ellipse cx={0} cy={0} rx={14} ry={4} fill="#ffffff" stroke="#e0d4c2" strokeWidth={1.2} />
          <path d="M-8 -2 Q-8 -14 0 -14 Q8 -14 8 -2 Z" fill="#ffffff" stroke="#e0d4c2" strokeWidth={1.2} />
        </g>
      ))}
    </g>
  );
}

export function CometRoomBackdrop({ className, glow = 0.7 }: CometRoomBackdropProps) {
  const id = useSvgId("comet-room");
  return (
    <svg
      className={className}
      viewBox="0 0 1200 640"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-night`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2f63" />
          <stop offset="1" stopColor="#6b5ea8" />
        </linearGradient>
        <radialGradient id={`${id}-lamp`}>
          <stop offset="0" stopColor="#fff2c9" stopOpacity={0.9} />
          <stop offset="1" stopColor="#fff2c9" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9825a" />
          <stop offset="1" stopColor="#8e5f3e" />
        </linearGradient>
      </defs>
      <rect width={1200} height={640} fill="#f7ecf3" />
      {STRIPES.map((index) => (
        <rect key={index} x={index * 40} y={0} width={20} height={420} fill="#efdcea" />
      ))}
      <rect x={0} y={330} width={1200} height={100} fill="#d9c7e6" />
      <rect x={0} y={326} width={1200} height={10} fill="#b9a7dc" />
      {Array.from({ length: 12 }, (_, index) => (
        <rect
          key={index}
          x={20 + index * 100}
          y={350}
          width={70}
          height={60}
          rx={6}
          fill="none"
          stroke="#c5b1d9"
          strokeWidth={3}
        />
      ))}
      <path d="M470 330 V150 A130 130 0 0 1 730 150 V330 Z" fill={`url(#${id}-night)`} />
      {STARS.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff6d8" />
      ))}
      <path d="M555 175 L655 115" stroke="#fff6d8" strokeWidth={4} strokeLinecap="round" opacity={0.5} />
      <path d="M575 165 L655 115" stroke="#fff6d8" strokeWidth={8} strokeLinecap="round" opacity={0.25} />
      <circle cx={658} cy={113} r={8} fill="#fff6d8" />
      <path d="M470 330 V150 A130 130 0 0 1 730 150 V330 Z" fill="none" stroke="#fffaf4" strokeWidth={14} />
      <path d="M600 22 V330 M470 220 H730" stroke="#fffaf4" strokeWidth={8} />
      <path d="M440 330 H760" stroke="#b9a7dc" strokeWidth={16} strokeLinecap="round" />
      <g transform="translate(150 150)">
        <rect x={-46} y={-56} width={92} height={112} rx={8} fill="#c9a227" />
        <rect x={-38} y={-48} width={76} height={96} rx={4} fill="#fbf3e2" />
        <path d="M-20 18 Q0 -36 20 18 Z" fill="#f2c4c9" />
        <circle cx={0} cy={-18} r={8} fill="#f4a259" />
      </g>
      <g transform="translate(1050 150)">
        <rect x={-50} y={-44} width={100} height={88} rx={44} fill="#c9a227" />
        <rect x={-42} y={-36} width={84} height={72} rx={36} fill="#e7f1dc" />
        <path d="M-24 18 Q0 -28 24 18" fill="none" stroke="#6f9152" strokeWidth={6} strokeLinecap="round" />
      </g>
      {LAMPS.map((x) => (
        <g key={x}>
          <circle cx={x} cy={110} r={120} fill={`url(#${id}-lamp)`} opacity={glow} />
          <path d={`M${x} 0 V60`} stroke="#8a6a4a" strokeWidth={3} />
          <path d={`M${x - 34} 96 Q${x} 50 ${x + 34} 96 Z`} fill="#f4a259" stroke="#c86a24" strokeWidth={2} />
          <ellipse cx={x} cy={102} rx={12} ry={8} fill="#fff4cf" opacity={0.6 + 0.4 * glow} />
        </g>
      ))}
      <rect x={0} y={430} width={1200} height={210} fill={`url(#${id}-floor)`} />
      {Array.from({ length: 16 }, (_, index) => (
        <path
          key={index}
          d={`M${index * 80} 430 L${index * 80 - 60} 640`}
          stroke="#7a4f33"
          strokeWidth={2}
          opacity={0.4}
        />
      ))}
      <TableWithStand x={260} cloth="#e7f1dc" />
      <TableWithStand x={940} cloth="#fde6cf" />
      <g transform="translate(60 380)">
        <path d="M-22 60 L-16 20 H16 L22 60 Z" fill="#c97d4a" />
        {[-30, -10, 10, 30].map((dx) => (
          <ellipse
            key={dx}
            cx={dx * 0.6}
            cy={-4 + Math.abs(dx) * 0.4}
            rx={10}
            ry={24}
            fill="#7fa87a"
            transform={`rotate(${dx} ${dx * 0.6} 16)`}
          />
        ))}
      </g>
      <g transform="translate(1140 380)">
        <path d="M-22 60 L-16 20 H16 L22 60 Z" fill="#c97d4a" />
        {[-30, -10, 10, 30].map((dx) => (
          <ellipse
            key={dx}
            cx={dx * 0.6}
            cy={-4 + Math.abs(dx) * 0.4}
            rx={10}
            ry={24}
            fill="#7fa87a"
            transform={`rotate(${dx} ${dx * 0.6} 16)`}
          />
        ))}
      </g>
    </svg>
  );
}
