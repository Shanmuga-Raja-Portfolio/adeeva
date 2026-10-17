import { ParlourCat } from "./ParlourCat";
import { ParlourTable } from "./ParlourTable";
import type { RoomLayout } from "./cometRoomLayout";

const MOTES: readonly (readonly [number, number, number])[] = [
  [520, 380, 3],
  [566, 452, 2.2],
  [610, 400, 2.6],
  [652, 488, 1.8],
  [700, 420, 2.4],
  [548, 520, 2],
  [676, 352, 1.6],
];

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

export interface CometRoomFrontProps {
  readonly id: string;
  readonly room: RoomLayout;
  readonly glow: number;
  readonly layout: "room" | "hub";
  readonly guestCount: number;
}

export function CometRoomFront({ id, room, glow, layout, guestCount }: CometRoomFrontProps) {
  return (
    <>
      {room.tables.map((table) => (
        <ParlourTable key={table.x} {...table} reserved={layout === "hub" && guestCount > 0} />
      ))}
      {room.cat === null ? null : <ParlourCat x={room.cat[0]} y={room.cat[1]} />}
      {room.lamps.map(([x, y]) => (
        <PendantLamp key={x} id={id} x={x} y={y} glow={glow} />
      ))}
      {layout === "hub" ? <Motes /> : null}
      {layout === "hub" && guestCount > 1 ? (
        <g>
          <Chatter x={640} y={316} flip shape={HEART} tint="#e07a9b" />
          <Chatter x={848} y={306} flip={false} shape={STAR} tint="#e9b949" />
        </g>
      ) : null}
      <rect width={1200} height={640} fill={`url(#${id}-vignette)`} />
    </>
  );
}
