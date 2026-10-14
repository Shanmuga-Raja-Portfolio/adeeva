import { colourById, type ColourId } from "../../../../../engine/palette";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { MENU_TIERS, type MenuTierId } from "../../../content/menuTier";
import { clientById, itemName, type Booking, type SalonState, type TableState } from "../../../core";
import { ThreeTierStand } from "../../art/ThreeTierStand";
import { TreatIcon } from "../../art/TreatIcon";

export interface HeldItem {
  readonly tier: MenuTierId;
  readonly colour: ColourId;
}

export interface StandPlatingProps {
  readonly salon: SalonState;
  readonly tableIndex: number;
  readonly booking: Booking;
  readonly table: TableState;
  readonly held: HeldItem | null;
  readonly silver: boolean;
  readonly slotRef: (tier: MenuTierId) => (element: HTMLButtonElement | null) => void;
  readonly onSlot: (tier: MenuTierId) => void;
}

function bookedLeft(salon: SalonState, tier: MenuTierId, colour: ColourId): number {
  const menu = salon.menu;
  const tray = salon.shelf.find((entry) => entry.tier === tier);
  if (menu === null || tray === undefined) return 0;
  const index = menu[tier].colours.indexOf(colour);
  return tray.left[index] ?? 0;
}

export function StandPlating({
  salon,
  tableIndex,
  booking,
  table,
  held,
  silver,
  slotRef,
  onSlot,
}: StandPlatingProps) {
  const menu = salon.menu;
  const guest = clientById(booking.guestId);
  if (menu === null) return null;
  return (
    <div className="pa-stand" data-testid="stand-plating">
      <div className="pa-stand__guest">
        {guest !== undefined ? (
          <Avatar look={guest.look} mood="happy" size={64} title={guest.guestName} frameColour="#efdcea" />
        ) : null}
        <div>
          <span className="ad-eyebrow">Table {tableIndex + 1}</span>
          <strong>{guest?.guestName ?? "Guests"}</strong>
          {booking.occasion ? <TagPill tone="hot">Table {tableIndex + 1} is celebrating!</TagPill> : null}
        </div>
      </div>
      <div className="pa-stand__frame">
        <ThreeTierStand className="pa-stand__art" silver={silver} />
        {MENU_TIERS.map((tier) => {
          const plated = table.plated[tier.id];
          const booked = booking.colours[tier.id];
          const swapNeeded = plated === undefined && bookedLeft(salon, tier.id, booked) === 0;
          const productId = menu[tier.id].productId;
          return (
            <button
              key={tier.id}
              ref={slotRef(tier.id)}
              type="button"
              className={[
                "pa-stand__slot",
                `pa-stand__slot--${tier.id}`,
                plated !== undefined ? "pa-stand__slot--full" : "",
                held !== null && plated === undefined ? "pa-stand__slot--ready" : "",
              ].join(" ")}
              onClick={() => onSlot(tier.id)}
              disabled={table.served}
              aria-label={
                plated !== undefined
                  ? `${tier.name}: ${colourById(plated.colour).name} ${itemName(salon, tier.id).toLowerCase()}. Tap to take it back.`
                  : `${tier.name}, booked ${colourById(booked).name}${held !== null ? `. Place the ${colourById(held.colour).name.toLowerCase()} treat here.` : ""}`
              }
              data-testid={`stand-slot-${tier.id}`}
            >
              {plated !== undefined ? (
                <span className="pa-stand__treats">
                  <TreatIcon productId={productId} colour={colourById(plated.colour).hex} size={52} />
                  {plated.swapped ? <span className="pa-stand__surprise">Surprise colour!</span> : null}
                </span>
              ) : (
                <span className="pa-stand__want">
                  <span style={{ background: colourById(booked).hex }} aria-hidden="true" />
                  {swapNeeded ? "Swap colour" : colourById(booked).name}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {table.served ? <p className="pa-stand__served">Served! Enjoy, Table {tableIndex + 1}.</p> : null}
    </div>
  );
}
