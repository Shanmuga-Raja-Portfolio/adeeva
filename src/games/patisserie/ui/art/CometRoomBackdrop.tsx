import type { AvatarLook } from "../../../../engine/avatar";
import { AvatarFigure } from "../../../../ui/art/avatar/Avatar";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { ParlourCabinet } from "./ParlourCabinet";
import { ParlourTable } from "./ParlourTable";
import { ParlourWindow } from "./ParlourWindow";

export interface CometRoomBackdropProps {
  readonly className?: string | undefined;
  readonly glow?: number | undefined;
  readonly daylight?: boolean | undefined;
  readonly guests?: readonly AvatarLook[] | undefined;
}

const STRIPES = Array.from({ length: 30 }, (_, index) => index);
const PANELS = Array.from({ length: 12 }, (_, index) => index);
const PLANKS = Array.from({ length: 16 }, (_, index) => index);
const LAMPS: readonly [number, number][] = [
  [400, 196],
  [650, 186],
  [990, 196],
];
const GUEST_SCALE = 0.34;
const GUEST_SPOTS: readonly [number, number][] = [
  [700, 1],
  [598, -1],
  [452, -1],
];
const PENNANTS = Array.from({ length: 25 }, (_, index) => index);
const PENNANT_COLOURS = ["#f2c4c9", "#b9a7dc", "#fff1cf", "#a9c98b", "#9fd0ee"];

function bunting(x: number): number {
  const local = (x % 400) / 400;
  return 168 + Math.sin(local * Math.PI) * 22;
}

function Pennants() {
  return (
    <g>
      {[0, 400, 800].map((start) => (
        <path
          key={start}
          d={`M${start} 168 Q${start + 200} 212 ${start + 400} 168`}
          fill="none"
          stroke="#8a6a4a"
          strokeWidth={2}
        />
      ))}
      {PENNANTS.map((index) => {
        const x = index * 50 + 20;
        const y = bunting(x);
        return (
          <path
            key={index}
            d={`M${x - 12} ${y - 1} L${x + 12} ${y + 1} L${x} ${y + 26} Z`}
            fill={PENNANT_COLOURS[index % PENNANT_COLOURS.length]}
            stroke="#ffffff"
            strokeOpacity={0.6}
            strokeWidth={1.2}
          />
        );
      })}
    </g>
  );
}

function PottedPalm({ x, y, scale }: { readonly x: number; readonly y: number; readonly scale: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={62} rx={34} ry={7} fill="#3b2620" opacity={0.2} />
      {[-58, -30, -6, 18, 44, 70].map((angle, index) => (
        <path
          key={angle}
          d="M0 10 Q-14 -50 0 -96 Q14 -50 0 10 Z"
          fill={index % 2 === 0 ? "#6f9152" : "#8fb37a"}
          transform={`rotate(${angle} 0 10)`}
        />
      ))}
      <path d="M-24 60 L-18 14 H18 L24 60 Z" fill="#c97d4a" />
      <path d="M-20 14 H20 V22 H-20 Z" fill="#a8633a" />
      <path d="M-14 22 L-11 56" stroke="#e8a877" strokeWidth={4} strokeLinecap="round" opacity={0.6} />
    </g>
  );
}

function SeatedGuests({ id, looks }: { readonly id: string; readonly looks: readonly AvatarLook[] }) {
  return (
    <g clipPath={`url(#${id}-seat)`}>
      {looks.slice(0, GUEST_SPOTS.length).map((look, index) => {
        const [x, facing] = GUEST_SPOTS[index] ?? [600, 1];
        const left = x - 200 * GUEST_SCALE * facing;
        return (
          <g
            key={index}
            transform={`translate(${left} ${416 - 318 * GUEST_SCALE}) scale(${GUEST_SCALE * facing} ${GUEST_SCALE})`}
          >
            <AvatarFigure look={look} mood="delighted" pose={index === 0 ? "wave" : "graceful"} />
          </g>
        );
      })}
    </g>
  );
}

function PendantLamp({
  id,
  x,
  y,
  glow,
}: {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly glow: number;
}) {
  return (
    <g>
      <circle cx={x} cy={y + 30} r={150} fill={`url(#${id}-lamp)`} opacity={glow} />
      <path d={`M${x} 0 V${y}`} stroke="#8a6a4a" strokeWidth={3} />
      <path
        d={`M${x - 36} ${y + 36} Q${x} ${y - 10} ${x + 36} ${y + 36} Z`}
        fill="#f4a259"
        stroke="#c86a24"
        strokeWidth={2}
      />
      <path
        d={`M${x - 22} ${y + 22} Q${x - 10} ${y + 4} ${x + 2} ${y + 2}`}
        stroke="#ffd2a3"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx={x} cy={y + 40} rx={14} ry={8} fill="#fff4cf" opacity={0.6 + 0.4 * glow} />
      <path d={`M${x - 36} ${y + 36} H${x + 36}`} stroke="#c9a227" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

export function CometRoomBackdrop({
  className,
  glow = 0.7,
  daylight = false,
  guests = [],
}: CometRoomBackdropProps) {
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
        <radialGradient id={`${id}-lamp`}>
          <stop offset="0" stopColor="#fff2c9" stopOpacity={0.85} />
          <stop offset="0.5" stopColor="#ffe3a8" stopOpacity={0.3} />
          <stop offset="1" stopColor="#fff2c9" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3e3ee" />
          <stop offset="1" stopColor="#fbf1f6" />
        </linearGradient>
        <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8714b" />
          <stop offset="1" stopColor="#7d5133" />
        </linearGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffbe8" stopOpacity={daylight ? 0.5 : 0.18} />
          <stop offset="1" stopColor="#fffbe8" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-vignette`} cx="0.45" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#3b2620" stopOpacity={0} />
          <stop offset="1" stopColor="#3b2620" stopOpacity={0.28} />
        </radialGradient>
        <clipPath id={`${id}-seat`}>
          <rect x={0} y={0} width={1200} height={418} />
        </clipPath>
        <pattern id={`${id}-rug`} width="40" height="20" patternUnits="userSpaceOnUse">
          <rect width="40" height="20" fill="#c86f8f" />
          <path d="M0 10 L10 0 L20 10 L10 20 Z M20 10 L30 0 L40 10 L30 20 Z" fill="#d98aa6" />
        </pattern>
      </defs>
      <rect width={1200} height={640} fill={`url(#${id}-wall)`} />
      {STRIPES.map((index) => (
        <rect key={index} x={index * 40} y={0} width={20} height={420} fill="#e9d3e3" opacity={0.7} />
      ))}
      <rect x={0} y={322} width={1200} height={108} fill="#d9c7e6" />
      <rect x={0} y={316} width={1200} height={10} fill="#b9a7dc" />
      <rect x={0} y={326} width={1200} height={4} fill="#ffffff" opacity={0.5} />
      {PANELS.map((index) => (
        <g key={index}>
          <rect x={20 + index * 100} y={344} width={70} height={66} rx={6} fill="#cfbbe0" />
          <rect
            x={20 + index * 100}
            y={344}
            width={70}
            height={66}
            rx={6}
            fill="none"
            stroke="#efe6f7"
            strokeWidth={2}
          />
          <rect
            x={22 + index * 100}
            y={346}
            width={66}
            height={62}
            rx={5}
            fill="none"
            stroke="#b39fcf"
            strokeWidth={2}
          />
        </g>
      ))}
      <ParlourWindow id={id} daylight={daylight} />
      <path d="M470 330 L730 330 L900 640 L330 640 Z" fill={`url(#${id}-beam)`} />
      <rect x={0} y={430} width={1200} height={210} fill={`url(#${id}-floor)`} />
      <rect x={0} y={428} width={1200} height={6} fill="#5d3a2a" opacity={0.5} />
      {PLANKS.map((index) => (
        <path
          key={index}
          d={`M${index * 80} 434 L${index * 80 - 60} 640`}
          stroke="#5d3a2a"
          strokeWidth={2}
          opacity={0.3}
        />
      ))}
      <ellipse cx={540} cy={520} rx={330} ry={52} fill={`url(#${id}-rug)`} />
      <ellipse
        cx={540}
        cy={520}
        rx={330}
        ry={52}
        fill="none"
        stroke="#fff1cf"
        strokeWidth={6}
        opacity={0.7}
      />
      <path d="M470 434 L730 434 L900 640 L330 640 Z" fill={`url(#${id}-beam)`} />
      <Pennants />
      <ParlourCabinet id={`${id}-cabinet`} x={30} y={168} />
      <PottedPalm x={760} y={372} scale={1.1} />
      <PottedPalm x={1150} y={372} scale={1} />
      <SeatedGuests id={id} looks={guests} />
      <ParlourTable x={400} y={414} scale={0.8} cloth="#e7f1dc" clothShade="#b9d3a0" teapot="#a9c98b" />
      <ParlourTable x={650} y={418} scale={0.8} cloth="#fde6cf" clothShade="#f0c49c" teapot="#9fd0ee" />
      <ParlourTable x={990} y={414} scale={0.8} cloth="#f7dbe6" clothShade="#e4a9bf" teapot="#b9a7dc" />
      {LAMPS.map(([x, y]) => (
        <PendantLamp key={x} id={id} x={x} y={y} glow={glow} />
      ))}
      <rect width={1200} height={640} fill={`url(#${id}-vignette)`} />
    </svg>
  );
}
