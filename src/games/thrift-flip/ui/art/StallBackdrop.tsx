import { useSvgId } from "../../../../ui/art/useSvgId";

export interface StallBackdropProps {
  readonly className?: string | undefined;
  readonly dusk?: boolean | undefined;
}

const LANTERNS: readonly (readonly [number, number, string])[] = [
  [90, 92, "#f6b04e"],
  [210, 110, "#f08a3c"],
  [330, 98, "#f6d36b"],
  [450, 114, "#f08a3c"],
  [570, 100, "#f6b04e"],
  [690, 112, "#f6d36b"],
  [810, 96, "#f08a3c"],
  [930, 110, "#f6b04e"],
  [1050, 98, "#f6d36b"],
  [1170, 108, "#f08a3c"],
];

const FLAGS = ["#f08a3c", "#8fcfb2", "#3f5d84", "#f6d36b", "#e57a8f", "#8fcfb2", "#f08a3c", "#3f5d84"];

function Stall({ x, stripe, roof }: { readonly x: number; readonly stripe: string; readonly roof: number }) {
  const stripes = Array.from({ length: 8 }, (_, index) => index);
  return (
    <g transform={`translate(${x} ${roof})`} opacity={0.75}>
      <rect x={6} y={40} width={8} height={170} fill="#8a6a4a" />
      <rect x={186} y={40} width={8} height={170} fill="#8a6a4a" />
      {stripes.map((index) => (
        <path
          key={index}
          d={`M${index * 25} 0 L${index * 25 + 25} 0 L${index * 25 + 25} 40 Q${index * 25 + 12.5} 52 ${index * 25} 40 Z`}
          fill={index % 2 === 0 ? stripe : "#fff4e2"}
        />
      ))}
      <rect x={0} y={150} width={200} height={60} rx={4} fill="#b88b5e" />
      <rect x={0} y={150} width={200} height={8} fill="#9a7048" />
    </g>
  );
}

export function StallBackdrop({ className, dusk = false }: StallBackdropProps) {
  const id = useSvgId("stall-backdrop");
  return (
    <svg
      className={className ? `tf-backdrop ${className}` : "tf-backdrop"}
      viewBox="0 0 1280 720"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dusk ? "#2c4466" : "#bfe1ea"} />
          <stop offset="0.55" stopColor={dusk ? "#7b6a8e" : "#f6e7c9"} />
          <stop offset="1" stopColor={dusk ? "#e7a87a" : "#f7d9b0"} />
        </linearGradient>
        <linearGradient id={`${id}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9c29d" />
          <stop offset="1" stopColor="#c3a57a" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#fff3c4" stopOpacity={0.9} />
          <stop offset="1" stopColor="#fff3c4" stopOpacity={0} />
        </radialGradient>
        <pattern id={`${id}-cobble`} width={46} height={26} patternUnits="userSpaceOnUse">
          <rect width={46} height={26} fill="none" />
          <path d="M2 12 Q12 2 22 12 Q12 22 2 12 Z M24 25 Q34 15 44 25" fill="#b8996b" opacity={0.45} />
        </pattern>
      </defs>
      <rect width={1280} height={720} fill={`url(#${id}-sky)`} />
      <g fill={dusk ? "#3a3f5c" : "#e9d3b0"} opacity={0.8}>
        <path d="M0 300 L0 180 L60 150 L120 180 L120 140 L200 110 L280 140 L280 200 L360 170 L440 200 L440 300 Z" />
        <path d="M840 300 L840 160 L920 120 L1000 160 L1000 190 L1080 150 L1160 190 L1160 130 L1220 110 L1280 130 L1280 300 Z" />
      </g>
      <path d="M0 74 Q320 150 640 96 T1280 84" fill="none" stroke="#6b5235" strokeWidth={2} />
      {LANTERNS.map(([x, y, colour]) => (
        <g key={x}>
          <circle cx={x} cy={y + 18} r={34} fill={`url(#${id}-glow)`} />
          <path d={`M${x} ${y - 6} v8`} stroke="#6b5235" strokeWidth={2} />
          <ellipse cx={x} cy={y + 18} rx={14} ry={17} fill={colour} />
          <path d={`M${x - 14} ${y + 18} h28`} stroke="#ffffff" strokeOpacity={0.35} strokeWidth={1.5} />
          <rect x={x - 6} y={y + 1} width={12} height={4} rx={1} fill="#6b5235" />
          <rect x={x - 5} y={y + 33} width={10} height={4} rx={1} fill="#6b5235" />
        </g>
      ))}
      <path d="M-20 200 Q300 260 640 214 T1300 206" fill="none" stroke="#a07a52" strokeWidth={2} />
      {Array.from({ length: 26 }, (_, index) => {
        const x = -10 + index * 52;
        const t = (x + 20) / 1320;
        const y = 200 + Math.sin(t * Math.PI) * 30 + (t > 0.5 ? -6 : 0);
        return (
          <path
            key={x}
            d={`M${x} ${y} L${x + 36} ${y + 2} L${x + 18} ${y + 34} Z`}
            fill={FLAGS[index % FLAGS.length]}
            opacity={0.92}
          />
        );
      })}
      <Stall x={30} stripe="#8fcfb2" roof={300} />
      <Stall x={1050} stripe="#3f5d84" roof={300} />
      <rect y={500} width={1280} height={220} fill={`url(#${id}-ground)`} />
      <rect y={500} width={1280} height={220} fill={`url(#${id}-cobble)`} />
      <path d="M0 500 L1280 500" stroke="#a88a5e" strokeWidth={3} />
    </svg>
  );
}
