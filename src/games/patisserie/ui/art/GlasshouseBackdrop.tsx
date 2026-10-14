import { useSvgId } from "../../../../ui/art/useSvgId";

export interface GlasshouseBackdropProps {
  readonly className?: string | undefined;
  readonly lights?: number | undefined;
  readonly cloth?: string | undefined;
}

const ARCHES = [0, 1, 2, 3, 4, 5];
const BULBS = Array.from({ length: 26 }, (_, index) => index);
const PALMS: readonly [number, number, number][] = [
  [70, 470, 1.1],
  [1130, 470, 1.2],
  [250, 440, 0.8],
  [960, 440, 0.85],
];
const STALLS: readonly [number, string][] = [
  [150, "#f2c4c9"],
  [1050, "#c8d6ee"],
];

function Palm({ x, y, scale }: { readonly x: number; readonly y: number; readonly scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-26 70 L-18 20 H18 L26 70 Z" fill="#b8653a" stroke="#8e4a28" strokeWidth={2} />
      <path d="M0 20 Q-4 -40 4 -90" stroke="#7a5a3a" strokeWidth={8} fill="none" />
      {[-70, -35, 0, 35, 70, 110, -110].map((angle) => (
        <path
          key={angle}
          d="M4 -90 Q40 -110 86 -84 Q40 -92 4 -90 Z"
          fill="#4f8f5b"
          stroke="#3a6f45"
          strokeWidth={1.4}
          transform={`rotate(${angle} 4 -90)`}
        />
      ))}
    </g>
  );
}

export function GlasshouseBackdrop({ className, lights = 0.5, cloth = "#efe6d2" }: GlasshouseBackdropProps) {
  const id = useSvgId("glasshouse");
  return (
    <svg
      className={className}
      viewBox="0 0 1200 640"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7b98a" />
          <stop offset="0.55" stopColor="#fbd9a8" />
          <stop offset="1" stopColor="#fdf0d6" />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor="#fff3c4" stopOpacity={0.95} />
          <stop offset="1" stopColor="#fff3c4" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-bulb`}>
          <stop offset="0" stopColor="#fff7d6" stopOpacity={1} />
          <stop offset="1" stopColor="#ffd98a" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9c7a8" />
          <stop offset="1" stopColor="#bfa983" />
        </linearGradient>
      </defs>
      <rect width={1200} height={640} fill={`url(#${id}-sky)`} />
      <circle cx={940} cy={200} r={240} fill={`url(#${id}-sun)`} />
      <path d="M0 330 Q200 300 400 330 T800 320 T1200 330 V460 H0 Z" fill="#cfe3bb" opacity={0.7} />
      <g stroke="#f7f4ee" strokeWidth={10} fill="none">
        {ARCHES.map((index) => (
          <path key={index} d={`M${index * 200} 460 V170 A100 110 0 0 1 ${index * 200 + 200} 170 V460`} />
        ))}
        <path d="M0 270 H1200" strokeWidth={6} />
        <path d="M0 60 Q600 -60 1200 60" strokeWidth={14} />
      </g>
      <g stroke="#f7f4ee" strokeWidth={3} opacity={0.8}>
        {ARCHES.flatMap((index) =>
          [50, 100, 150].map((dx) => (
            <path
              key={`${index}-${dx}`}
              d={`M${index * 200 + dx} 460 V${index * 200 + dx === 0 ? 170 : 120}`}
            />
          )),
        )}
      </g>
      <path
        d="M0 90 Q150 130 300 96 Q450 130 600 96 Q750 130 900 96 Q1050 130 1200 90"
        stroke="#5b4a3a"
        strokeWidth={2}
        fill="none"
      />
      {BULBS.map((index) => {
        const x = index * 48 + 4;
        const sway = Math.sin((index / 25) * Math.PI * 8);
        const y = 104 + 14 * Math.abs(sway);
        return (
          <g key={index}>
            <circle cx={x} cy={y + 8} r={22} fill={`url(#${id}-bulb)`} opacity={0.15 + 0.85 * lights} />
            <circle
              cx={x}
              cy={y + 8}
              r={6}
              fill={lights > 0.3 ? "#fff3c4" : "#e8dcc0"}
              stroke="#a58b5e"
              strokeWidth={1.2}
            />
          </g>
        );
      })}
      {PALMS.map(([x, y, scale]) => (
        <Palm key={x} x={x} y={y} scale={scale} />
      ))}
      {STALLS.map(([x, colour]) => (
        <g key={x} transform={`translate(${x} 400)`}>
          <path d="M-70 0 H70 L80 24 H-80 Z" fill={colour} />
          {[-60, -30, 0, 30, 60].map((dx, index) => (
            <path
              key={dx}
              d={`M${dx - 10} 24 h20 l-2 10 h-16 Z`}
              fill={index % 2 === 0 ? "#fffaf2" : colour}
            />
          ))}
          <path d="M-66 24 V90 M66 24 V90" stroke="#8e6a45" strokeWidth={6} />
        </g>
      ))}
      <rect x={0} y={460} width={1200} height={180} fill={`url(#${id}-floor)`} />
      {Array.from({ length: 13 }, (_, index) => (
        <path
          key={index}
          d={`M${index * 100} 460 L${index * 100 - 140} 640`}
          stroke="#ad9672"
          strokeWidth={2}
          opacity={0.5}
        />
      ))}
      <g>
        <ellipse cx={600} cy={590} rx={520} ry={20} fill="#3b2620" opacity={0.12} />
        <path d="M110 500 H1090 L1110 586 H90 Z" fill={cloth} />
        <path d="M110 500 H1090" stroke="#ffffff" strokeOpacity={0.4} strokeWidth={6} />
        <path d="M100 540 H1100" stroke="#000000" strokeOpacity={0.05} strokeWidth={40} />
        <rect x={100} y={490} width={1000} height={16} rx={8} fill="#a87452" />
      </g>
    </svg>
  );
}
