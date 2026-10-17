import { colourById } from "../../../../../engine/palette";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Icon } from "../../../../../ui/kit/IconSet";
import { MENU_TIERS } from "../../../content/menuTier";
import { clientById, salonDayOf, seasonBegun, type Booking, type GameState } from "../../../core";
import { TreatIcon } from "../../art/TreatIcon";
import { daysAway } from "../season/daysAway";
import "./bookingBoard.css";

export interface BookingBoardProps {
  readonly state: GameState;
}

function emptyNote(state: GameState): string {
  const { fair, salon } = state;
  if (fair === null || salon === null) return "The parlour opens soon.";
  if (!seasonBegun(fair, state.calendar.day)) return `Fair Season opens on day ${fair.seasonStartDay}.`;
  if (salon.parlour === "resting") return "The parlour is resting this season.";
  if (salon.menu === null) return "Set a menu and the bookings roll in.";
  return "No tables booked yet.";
}

function Wishes({ state, booking }: { readonly state: GameState; readonly booking: Booking }) {
  const menu = state.salon?.menu ?? null;
  return (
    <span className="pa-easel-row__wishes">
      {MENU_TIERS.map((tier) => {
        const colour = colourById(booking.colours[tier.id]);
        const label = `${tier.name}: ${colour.name}`;
        return menu === null ? (
          <span
            key={tier.id}
            className="pa-easel-row__dot"
            title={label}
            style={{ background: colour.hex }}
          />
        ) : (
          <span key={tier.id} className="pa-easel-row__treat" title={label}>
            <TreatIcon productId={menu[tier.id].productId} colour={colour.hex} size={40} />
          </span>
        );
      })}
    </span>
  );
}

export function BookingBoard({ state }: BookingBoardProps) {
  const { fair, salon } = state;
  const bookings = salon?.bookings ?? [];
  const when = fair === null ? null : daysAway(state.calendar.day, salonDayOf(fair));
  return (
    <section className="pa-easel" aria-labelledby="pa-easel-title" data-testid="booking-board">
      <div className="pa-easel__board">
        <header className="pa-easel__head">
          <h2 id="pa-easel-title">Salon Day bookings</h2>
          {fair !== null && bookings.length > 0 && when !== null ? (
            <span className="pa-easel__when">
              Day {salonDayOf(fair)} · {when}
            </span>
          ) : null}
        </header>
        {bookings.length === 0 ? (
          <p className="pa-easel__empty">{emptyNote(state)}</p>
        ) : (
          <>
            <ul className={bookings.length > 4 ? "pa-easel-list pa-easel-list--many" : "pa-easel-list"}>
              {bookings.map((booking, index) => {
                const guest = clientById(booking.guestId);
                const wishes = MENU_TIERS.map(
                  (tier) => `${colourById(booking.colours[tier.id]).name} ${tier.name.toLowerCase()}`,
                ).join(", ");
                return (
                  <li
                    key={booking.guestId}
                    className="pa-easel-row"
                    aria-label={`Table ${index + 1}: ${guest?.guestName ?? "Guests"}. Wishes: ${wishes}.${booking.occasion ? " Celebrating!" : ""}`}
                  >
                    <span className="pa-easel-row__face">
                      {guest !== undefined ? (
                        <Avatar look={guest.look} size={46} title={guest.guestName} frameColour="#efdcea" />
                      ) : null}
                      <span className="pa-easel-row__table" aria-hidden="true">
                        {index + 1}
                      </span>
                      {booking.occasion ? (
                        <span className="pa-easel-row__party" title="Celebrating!">
                          <Icon name="heart" size={12} />
                        </span>
                      ) : null}
                    </span>
                    <span className="pa-easel-row__who">
                      <strong>{guest?.guestName ?? "Guests"}</strong>
                      <Wishes state={state} booking={booking} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        <span className="pa-easel__ledge" aria-hidden="true">
          <span />
          <span />
        </span>
      </div>
      <span className="pa-easel__legs" aria-hidden="true" />
    </section>
  );
}
