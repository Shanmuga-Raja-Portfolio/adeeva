import type { AvatarLook } from "../../../../engine/avatar";
import { useSvgId } from "../../../../ui/art/useSvgId";
import { CometRoomBack } from "./CometRoomBack";
import { CometRoomDefs } from "./CometRoomDefs";
import { CometRoomFront } from "./CometRoomFront";
import { LAYOUTS } from "./cometRoomLayout";
import { guestSeats, SeatedGuest } from "./SeatedGuest";

export interface CometRoomBackdropProps {
  readonly className?: string | undefined;
  readonly glow?: number | undefined;
  readonly daylight?: boolean | undefined;
  readonly guests?: readonly AvatarLook[] | undefined;
  readonly layout?: "room" | "hub" | undefined;
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
      <CometRoomDefs id={id} daylight={daylight} />
      <CometRoomBack id={id} room={room} daylight={daylight} />
      <g>
        {guestSeats(guests, room).map((guest) => (
          <g
            key={guest.index}
            className={guest.index % 2 === 0 ? "pa-guest-bob" : "pa-guest-bob pa-guest-bob--late"}
          >
            <SeatedGuest {...guest} scale={room.guestScale} clipId={`${id}-seat`} />
          </g>
        ))}
      </g>
      <CometRoomFront id={id} room={room} glow={glow} layout={layout} guestCount={guests.length} />
    </svg>
  );
}
