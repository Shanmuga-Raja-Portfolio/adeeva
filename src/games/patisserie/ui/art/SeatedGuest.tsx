import type { AvatarLook } from "../../../../engine/avatar";
import { AvatarFigure } from "../../../../ui/art/avatar/Avatar";
import { GUEST_POSES, type RoomLayout, type Seat } from "./cometRoomLayout";

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

export function SeatClip({ id }: { readonly id: string }) {
  return (
    <clipPath id={id}>
      <rect x={-200} y={-400} width={800} height={722} />
    </clipPath>
  );
}

export interface GuestSeat {
  readonly look: AvatarLook;
  readonly seat: Seat;
  readonly index: number;
}

export function guestSeats(looks: readonly AvatarLook[], room: RoomLayout): GuestSeat[] {
  return looks.slice(0, room.seats.length).flatMap((look, index) => {
    const seat = room.seats[index];
    return seat === undefined ? [] : [{ look, seat, index }];
  });
}

export interface SeatedGuestProps extends GuestSeat {
  readonly scale: number;
  readonly clipId: string;
}

export function SeatedGuest({ look, seat, index, scale, clipId }: SeatedGuestProps) {
  const left = seat.x - 200 * scale * seat.facing;
  return (
    <g
      transform={`translate(${left} ${seat.line - 318 * scale}) scale(${scale * seat.facing} ${scale})`}
      clipPath={`url(#${clipId})`}
    >
      {seat.back ? <ChairBack /> : null}
      <AvatarFigure
        look={look}
        mood="delighted"
        pose={GUEST_POSES[index % GUEST_POSES.length] ?? "graceful"}
      />
    </g>
  );
}
