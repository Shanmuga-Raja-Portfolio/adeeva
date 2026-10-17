import { ParlourCabinet } from "./ParlourCabinet";
import { ParlourWindow } from "./ParlourWindow";
import type { RoomLayout } from "./cometRoomLayout";

const STRIPES = Array.from({ length: 30 }, (_, index) => index);
const PANELS = Array.from({ length: 12 }, (_, index) => index);
const PLANKS = Array.from({ length: 16 }, (_, index) => index);
const RAYS: readonly (readonly [number, number, number])[] = [
  [500, 26, 250],
  [574, 40, 420],
  [664, 30, 600],
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

function Bulbs({ id }: { readonly id: string }) {
  return (
    <g>
      {PENNANTS.slice(0, 24).map((index) => {
        const x = index * 50 + 45;
        const y = bunting(x) + 3;
        return (
          <g key={index}>
            <circle cx={x} cy={y + 4} r={16} fill={`url(#${id}-bulb)`} />
            <path d={`M${x} ${y - 3} V${y}`} stroke="#6b4232" strokeWidth={2} />
            <circle cx={x} cy={y + 5} r={4.6} fill="#fff4c4" stroke="#e9b949" strokeWidth={1} />
          </g>
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

export interface CometRoomBackProps {
  readonly id: string;
  readonly room: RoomLayout;
  readonly daylight: boolean;
}

export function CometRoomBack({ id, room, daylight }: CometRoomBackProps) {
  return (
    <>
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
      {daylight ? (
        <g opacity={0.6}>
          {RAYS.map(([top, width, foot]) => (
            <path
              key={top}
              d={`M${top} 120 L${top + width} 120 L${foot + width * 2.4} 640 L${foot} 640 Z`}
              fill={`url(#${id}-ray)`}
            />
          ))}
        </g>
      ) : null}
      <Pennants />
      <Bulbs id={id} />
      <ParlourCabinet id={`${id}-cabinet`} x={30} y={168} />
      {room.palms.map(([x, y, scale]) => (
        <PottedPalm key={x} x={x} y={y} scale={scale} />
      ))}
    </>
  );
}
