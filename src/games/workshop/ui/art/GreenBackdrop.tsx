import { useSvgId } from "../../../../ui/art/useSvgId";
import type { BoothBackdropId } from "../../content/boothBackdrop";

interface GreenBackdropProps {
  readonly className?: string | undefined;
  readonly backdrop: BoothBackdropId;
  readonly sky: string;
  readonly awning: boolean;
  readonly glow: number;
}

const OUTLINE = "#2f2622";
const FLAGS = ["#d0587e", "#f2c230", "#4a6378", "#3f6b4f", "#f07f63", "#9fd0ee"];

function Bunting({ y, from, to }: { y: number; from: number; to: number }) {
  const count = 12;
  const step = (to - from) / count;
  return (
    <g className="ww-bunting">
      <path
        d={`M${from} ${y} Q${(from + to) / 2} ${y + 34} ${to} ${y}`}
        fill="none"
        stroke={OUTLINE}
        strokeWidth={3}
      />
      {Array.from({ length: count }, (_, index) => {
        const x = from + step * (index + 0.5);
        const sag = 34 * (1 - ((2 * (x - from)) / (to - from) - 1) ** 2);
        return (
          <path
            key={index}
            className="ww-bunting__flag"
            style={{ animationDelay: `${index * 90}ms` }}
            d={`M${x - 16} ${y + sag - 2} L${x + 16} ${y + sag - 2} L${x} ${y + sag + 34} Z`}
            fill={FLAGS[index % FLAGS.length]}
            stroke={OUTLINE}
            strokeWidth={2}
          />
        );
      })}
    </g>
  );
}

function Lanterns({ glow }: { glow: number }) {
  return (
    <g>
      <path d="M300 168 Q600 214 900 168" fill="none" stroke={OUTLINE} strokeWidth={3} />
      {[340, 420, 500, 580, 660, 740, 820].map((x, index) => {
        const y = 168 + 46 * (1 - ((2 * (x - 300)) / 600 - 1) ** 2);
        return (
          <g key={x} transform={`translate(${x} ${y})`}>
            <circle r={26} fill="#ffe8a8" opacity={0.25 * glow} />
            <path d="M0 0 v8" stroke={OUTLINE} strokeWidth={2} />
            <rect
              x={-14}
              y={8}
              width={28}
              height={30}
              rx={12}
              fill={index % 2 === 0 ? "#f07f63" : "#f2c230"}
              stroke={OUTLINE}
              strokeWidth={2}
            />
            <path d="M-10 18 h20 M-10 28 h20" stroke={OUTLINE} strokeOpacity={0.4} strokeWidth={1.5} />
            <circle cy={23} r={4} fill="#fff6d0" opacity={0.6 + 0.4 * glow} />
          </g>
        );
      })}
    </g>
  );
}

function Drape() {
  return (
    <g stroke={OUTLINE} strokeWidth={2.5}>
      <path d="M310 170 Q360 260 330 500 H870 Q840 260 890 170 Z" fill="#f6efe0" />
      <g fill="none" stroke="#d9c9a6" strokeWidth={3}>
        <path d="M400 180 Q420 330 400 500 M500 180 Q480 330 500 500 M600 180 Q620 330 600 500 M700 180 Q680 330 700 500 M800 180 Q820 330 800 500" />
      </g>
    </g>
  );
}

function SmallStall({ x, colour }: { x: number; colour: string }) {
  return (
    <g transform={`translate(${x} 300)`} stroke={OUTLINE} strokeWidth={2.5} opacity={0.85}>
      <path d="M-70 40 L0 -10 L70 40 Z" fill={colour} />
      <path d="M-35 40 L0 -10 L35 40 Z" fill="#fffaf0" />
      <rect x={-60} y={40} width={8} height={110} fill="#8f5a26" />
      <rect x={52} y={40} width={8} height={110} fill="#8f5a26" />
      <rect x={-64} y={110} width={128} height={40} fill="#c99662" />
    </g>
  );
}

export function GreenBackdrop({ className, backdrop, sky, awning, glow }: GreenBackdropProps) {
  const id = useSvgId("ww-green");
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
          <stop offset="0" stopColor={sky} />
          <stop offset="1" stopColor="#fff8ea" />
        </linearGradient>
        <pattern id={`${id}-stripes`} patternUnits="userSpaceOnUse" width={60} height={60}>
          <rect width={30} height={60} fill={awning ? "#c0574a" : "#4a6378"} />
          <rect x={30} width={30} height={60} fill="#fffaf0" />
        </pattern>
      </defs>
      <rect width={1200} height={640} fill={`url(#${id}-sky)`} />
      <circle cx={1040} cy={90} r={46} fill="#fff3b0" opacity={0.9} />
      <path d="M0 330 Q200 260 420 320 T840 300 T1200 310 V640 H0 Z" fill="#9cc98a" />
      <path d="M0 380 Q300 330 600 370 T1200 360 V640 H0 Z" fill="#7fb36e" />
      <SmallStall x={110} colour="#f2c230" />
      <SmallStall x={1090} colour="#9fd0ee" />
      <g stroke={OUTLINE} strokeWidth={4} strokeLinejoin="round">
        <rect x={290} y={170} width={16} height={350} fill="#8f5a26" />
        <rect x={894} y={170} width={16} height={350} fill="#8f5a26" />
      </g>
      {backdrop === "linen-drape" ? <Drape /> : null}
      <path
        d="M250 90 L950 90 L980 180 L220 180 Z"
        fill={`url(#${id}-stripes)`}
        stroke={OUTLINE}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <path
        d="M220 180 q30 30 60 0 q30 30 60 0 q30 30 60 0 q30 30 60 0 q30 30 60 0 q30 30 60 0 q30 30 60 0 q30 30 60 0 q30 30 60 0 q30 30 60 0 q30 30 60 0 q30 30 60 0 q30 30 60 0 Z"
        fill={awning ? "#c0574a" : "#4a6378"}
        stroke={OUTLINE}
        strokeWidth={3}
      />
      <text
        x={600}
        y={146}
        textAnchor="middle"
        fontSize={30}
        fontWeight={700}
        fontFamily='"Rockwell", "Roboto Slab", Georgia, serif'
        fill="#2f2622"
        stroke="#fffaf0"
        strokeWidth={6}
        paintOrder="stroke"
      >
        Larkspur Craft Fair
      </text>
      {backdrop === "bunting" ? <Bunting y={200} from={310} to={890} /> : null}
      {backdrop === "lantern-string" ? <Lanterns glow={glow} /> : null}
      <path
        d="M260 520 H940 L970 560 H230 Z"
        fill="#c99662"
        stroke={OUTLINE}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <path d="M0 560 H1200 V640 H0 Z" fill="#6aa35c" />
      <g fill="#4f8a5b">
        {[60, 180, 330, 470, 760, 880, 1020, 1140].map((x) => (
          <path key={x} d={`M${x} 600 l6 -18 l6 18 l6 -14 l6 14 Z`} />
        ))}
      </g>
      <rect width={1200} height={640} fill="#fff6d6" opacity={0.12 * glow} />
    </svg>
  );
}
