import type { AvatarLook } from "../../../../engine/avatar";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { CometRoomBack } from "./CometRoomBack";
import { CometRoomDefs } from "./CometRoomDefs";
import { CometRoomFront } from "./CometRoomFront";
import { LAYOUTS } from "./cometRoomLayout";
import { GuestLayer } from "./GuestLayer";
import { guestSeats } from "./SeatedGuest";

export interface CometRoomSceneProps {
  readonly className?: string | undefined;
  readonly glow: number;
  readonly daylight: boolean;
  readonly guests: readonly AvatarLook[];
}

export function CometRoomScene({ className, glow, daylight, guests }: CometRoomSceneProps) {
  const backId = useSvgId("comet-room");
  const frontId = useSvgId("comet-room-front");
  const room = LAYOUTS.hub;
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice" focusable="false">
        <CometRoomDefs id={backId} daylight={daylight} />
        <CometRoomBack id={backId} room={room} daylight={daylight} />
      </svg>
      {guestSeats(guests, room).map((guest) => (
        <GuestLayer key={guest.index} {...guest} scale={room.guestScale} />
      ))}
      <svg viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice" focusable="false">
        <CometRoomDefs id={frontId} daylight={daylight} />
        <CometRoomFront id={frontId} room={room} glow={glow} layout="hub" guestCount={guests.length} />
      </svg>
    </div>
  );
}
