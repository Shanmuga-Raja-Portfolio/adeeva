import type { AvatarLook } from "../../../../engine/avatar";
import { AvatarFigure } from "../../../../ui/art/avatar/Avatar";
import type { AvatarPose } from "../../../../ui/art/avatar/ArmPose";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { ParlourCabinet } from "./ParlourCabinet";
import { ParlourCat } from "./ParlourCat";
import { ParlourTable } from "./ParlourTable";
import { ParlourWindow } from "./ParlourWindow";

export interface CometRoomBackdropProps {
  readonly className?: string | undefined;
  readonly glow?: number | undefined;
  readonly daylight?: boolean | undefined;
  readonly guests?: readonly AvatarLook[] | undefined;
  readonly layout?: "room" | "hub" | undefined;
}

interface TableSpot {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly cloth: string;
  readonly clothShade: string;
  readonly teapot: string;
}

interface Seat {
  readonly x: number;
  readonly facing: 1 | -1;
  readonly line: number;
  readonly back: boolean;
}

interface RoomLayout {
  readonly tables: readonly TableSpot[];
  readonly seats: readonly Seat[];
  readonly guestScale: number;
  readonly cat: readonly [number, number] | null;
  readonly lamps: readonly (readonly [number, number])[];
  readonly palms: readonly (readonly [number, number, number])[];
}

const MINT_TABLE = { cloth: "#e7f1dc", clothShade: "#b9d3a0", teapot: "#a9c98b" };
const PEACH_TABLE = { cloth: "#fde6cf", clothShade: "#f0c49c", teapot: "#9fd0ee" };
const ROSE_TABLE = { cloth: "#f7dbe6", clothShade: "#e4a9bf", teapot: "#b9a7dc" };

const LAYOUTS: Readonly<Record<"room" | "hub", RoomLayout>> = {
  room: {
    tables: [
      { x: 400, y: 414, scale: 0.8, ...MINT_TABLE },
      { x: 650, y: 418, scale: 0.8, ...PEACH_TABLE },
      { x: 990, y: 414, scale: 0.8, ...ROSE_TABLE },
    ],
    seats: [
      { x: 700, facing: 1, line: 416, back: true },
      { x: 598, facing: -1, line: 416, back: true },
      { x: 452, facing: -1, line: 416, back: true },
    ],
    guestScale: 0.34,
    cat: null,
    lamps: [
      [400, 196],
      [650, 186],
      [990, 196],
    ],
    palms: [
      [760, 372, 1.1],
      [1150, 372, 1],
    ],
  },
  hub: {
    tables: [{ x: 742, y: 468, scale: 0.95, ...PEACH_TABLE }],
    seats: [
      { x: 796, facing: 1, line: 466, back: true },
      { x: 688, facing: -1, line: 466, back: true },
      { x: 858, facing: -1, line: 498, back: false },
      { x: 612, facing: 1, line: 498, back: false },
    ],
    guestScale: 0.44,
    cat: [600, 600],
    lamps: [[742, 196]],
    palms: [[1160, 384, 1]],
  },
};

const STRIPES = Array.from({ length: 30 }, (_, index) => index);
const PANELS = Array.from({ length: 12 }, (_, index) => index);
const PLANKS = Array.from({ length: 16 }, (_, index) => index);
const MOTES: readonly (readonly [number, number, number])[] = [
  [520, 380, 3],
  [566, 452, 2.2],
  [610, 400, 2.6],
  [652, 488, 1.8],
  [700, 420, 2.4],
  [548, 520, 2],
  [676, 352, 1.6],
];
const RAYS: readonly (readonly [number, number, number])[] = [
  [500, 26, 250],
  [574, 40, 420],
  [664, 30, 600],
];
const GUEST_POSES: readonly AvatarPose[] = ["chat", "poised-right", "present", "poised"];
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

function ChairBack() {
  return (
    <g>
      <path
        d="M104 340 V236 Q104 160 200 158 Q296 160 296 236 V340"
        fill="none"
        stroke="#6b4232"
        strokeWidth={18}
        strokeLinecap="round"
      />
      <path
        d="M104 340 V236 Q104 160 200 158 Q296 160 296 236 V340"
        fill="none"
        stroke="#a87452"
        strokeWidth={8}
        strokeLinecap="round"
      />
      <path d="M124 236 Q124 182 200 180 Q276 182 276 236 V330 H124 Z" fill="#d58aa5" />
      <path
        d="M140 230 Q142 196 200 194"
        fill="none"
        stroke="#f3b6cb"
        strokeWidth={8}
        strokeLinecap="round"
      />
    </g>
  );
}

function SeatedGuests({
  id,
  looks,
  room,
}: {
  readonly id: string;
  readonly looks: readonly AvatarLook[];
  readonly room: RoomLayout;
}) {
  const scale = room.guestScale;
  return (
    <g>
      {looks.slice(0, room.seats.length).map((look, index) => {
        const seat = room.seats[index];
        if (seat === undefined) return null;
        const left = seat.x - 200 * scale * seat.facing;
        return (
          <g key={index} className={index % 2 === 0 ? "pa-guest-bob" : "pa-guest-bob pa-guest-bob--late"}>
            <g
              transform={`translate(${left} ${seat.line - 318 * scale}) scale(${scale * seat.facing} ${scale})`}
              clipPath={`url(#${id}-seat)`}
            >
              {seat.back ? <ChairBack /> : null}
              <AvatarFigure
                look={look}
                mood="delighted"
                pose={GUEST_POSES[index % GUEST_POSES.length] ?? "graceful"}
              />
            </g>
          </g>
        );
      })}
    </g>
  );
}

const HEART = "M0 6 C-10 -1 -9 -10 -4 -10 C-2 -10 0 -8 0 -6 C0 -8 2 -10 4 -10 C9 -10 10 -1 0 6 Z";
const STAR = "M0 -10 L3 -3 L10 -3 L4.5 1.5 L6.5 9 L0 4.5 L-6.5 9 L-4.5 1.5 L-10 -3 L-3 -3 Z";

function Chatter({
  x,
  y,
  flip,
  shape,
  tint,
}: {
  readonly x: number;
  readonly y: number;
  readonly flip: boolean;
  readonly shape: string;
  readonly tint: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="pa-chatter">
        <path
          d={flip ? "M8 14 L18 28 L20 12 Z" : "M-8 14 L-18 28 L-20 12 Z"}
          fill="#ffffff"
          stroke="#e2d2c2"
          strokeWidth={1.4}
        />
        <rect
          x={-24}
          y={-18}
          width={48}
          height={36}
          rx={16}
          fill="#ffffff"
          stroke="#e2d2c2"
          strokeWidth={1.4}
        />
        <path d={shape} fill={tint} transform="translate(0 1) scale(1.15)" />
      </g>
    </g>
  );
}

function Motes() {
  return (
    <g className="pa-motes" fill="#fff8dc">
      {MOTES.map(([x, y, r], index) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={r}
          opacity={0.75}
          className="pa-mote"
          style={{ animationDelay: `${index * -0.9}s` }}
        />
      ))}
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
  layout = "room",
}: CometRoomBackdropProps) {
  const id = useSvgId("comet-room");
  const room = LAYOUTS[layout];
  return (
    <svg
      className={className}
      viewBox="0 0 1200 640"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-ray`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff8dc" stopOpacity={0.55} />
          <stop offset="0.6" stopColor="#fff8dc" stopOpacity={0.18} />
          <stop offset="1" stopColor="#fff8dc" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={`${id}-bulb`}>
          <stop offset="0" stopColor="#fff2b8" stopOpacity={0.95} />
          <stop offset="1" stopColor="#ffd77a" stopOpacity={0} />
        </radialGradient>
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
          <rect x={-200} y={-400} width={800} height={722} />
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
      <SeatedGuests id={id} looks={guests} room={room} />
      {room.tables.map((table) => (
        <ParlourTable key={table.x} {...table} reserved={layout === "hub" && guests.length > 0} />
      ))}
      {room.cat === null ? null : <ParlourCat x={room.cat[0]} y={room.cat[1]} />}
      {room.lamps.map(([x, y]) => (
        <PendantLamp key={x} id={id} x={x} y={y} glow={glow} />
      ))}
      {layout === "hub" ? <Motes /> : null}
      {layout === "hub" && guests.length > 1 ? (
        <g>
          <Chatter x={640} y={316} flip shape={HEART} tint="#e07a9b" />
          <Chatter x={848} y={306} flip={false} shape={STAR} tint="#e9b949" />
        </g>
      ) : null}
      <rect width={1200} height={640} fill={`url(#${id}-vignette)`} />
    </svg>
  );
}
