import { colourById } from "../../../../../engine/palette";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { MENU_ITEM_NAMES, MENU_TIERS, type MenuTierId } from "../../../content/menuTier";
import {
  canOpenTables,
  clientById,
  isSalonDay,
  mixById,
  salonDayOf,
  salonTrayIssue,
  splitTally,
  teaById,
  type Action,
  type GameState,
} from "../../../core";
import type { PlayView } from "../../patisserieRoute";
import { TreatIcon } from "../../art/TreatIcon";
import { TeaTins } from "../salon/TeaTins";
import "./salonPlan.css";

export interface SalonPlanProps {
  readonly state: GameState;
  readonly dispatch: (action: Action) => boolean;
  readonly onBakeTray: (event: ClickLike, tier: MenuTierId) => void;
  readonly onOpenTables: (event: ClickLike) => void;
  readonly onOpen: (view: PlayView) => void;
}

export function SalonPlan({ state, dispatch, onBakeTray, onOpenTables, onOpen }: SalonPlanProps) {
  const { salon, fair } = state;
  const menu = salon?.menu ?? null;
  if (salon === null || fair === null || menu === null) return null;
  const salonDay = isSalonDay(state);
  const open = canOpenTables(state);
  const done = salon.doneDay >= salonDayOf(fair);
  return (
    <div className="pa-salon-plan">
      <div className="pa-salon-plan__tiers">
        {MENU_TIERS.map((tier) => {
          const entry = menu[tier.id];
          const tray = salon.shelf.find((item) => item.tier === tier.id);
          const tally = splitTally(salon.bookings, menu, tier.id);
          const issue = salonTrayIssue(state, tier.id);
          return (
            <article
              key={tier.id}
              className={tray !== undefined ? "pa-salon-tier pa-salon-tier--ready" : "pa-salon-tier"}
              data-testid={`salon-tier-${tier.id}`}
            >
              {tray !== undefined ? (
                <p className="pa-salon-tier__ready">
                  <Icon name="check" size={16} /> On the shelf
                  <span className="pa-salon-tier__quality">
                    <Icon name="star" size={14} /> quality {tray.quality}
                  </span>
                </p>
              ) : null}
              <span className="pa-salon-tier__icons" aria-hidden="true">
                <TreatIcon productId={entry.productId} colour={colourById(entry.colours[0]).hex} size={46} />
                <TreatIcon productId={entry.productId} colour={colourById(entry.colours[1]).hex} size={46} />
              </span>
              <div className="pa-salon-tier__body">
                <span className="ad-eyebrow">{tier.name}</span>
                <strong>{MENU_ITEM_NAMES[entry.productId]}</strong>
                <span className="pa-salon-tier__mix">{mixById(entry.mixId).name}</span>
              </div>
              <ul className="pa-salon-tier__tally">
                {entry.colours.map((colour, index) => (
                  <li key={colour} className="pa-salon-tier__count">
                    <span className="pa-salon-tier__swatch" style={{ background: colourById(colour).hex }} />
                    <strong className="pa-salon-tier__colour">{colourById(colour).name}</strong>
                    <span className="pa-salon-tier__numbers">
                      <span>
                        <b>{tally[index]}</b> booked
                      </span>
                      {tray !== undefined ? (
                        <span>
                          <b>{tray.left[index] ?? 0}</b> on the shelf
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
              {tray !== undefined ? null : (
                <div className="pa-salon-tier__status">
                  {done ? (
                    <TagPill>Next season</TagPill>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      block
                      onClick={(event) => onBakeTray(event, tier.id)}
                      disabledReason={issue ?? undefined}
                      data-testid={`bake-salon-${tier.id}`}
                    >
                      Bake this tray · 6 h
                    </Button>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
      <div className="pa-salon-plan__bookings">
        <h4>
          Bookings for Salon Day, day {salonDayOf(fair)}{" "}
          <span className="pa-muted">({salon.bookings.length} tables)</span>
        </h4>
        <ul className="pa-bookings">
          {salon.bookings.map((booking, index) => {
            const guest = clientById(booking.guestId);
            return (
              <li key={booking.guestId} className="pa-booking">
                {guest !== undefined ? (
                  <Avatar look={guest.look} size={40} title={guest.guestName} frameColour="#efdcea" />
                ) : null}
                <span className="pa-booking__who">
                  <strong>Table {index + 1}</strong>
                  <span className="pa-muted">{guest?.guestName ?? "Guests"}</span>
                  {booking.occasion ? <TagPill tone="hot">Celebrating!</TagPill> : null}
                </span>
                <span className="pa-booking__colours" aria-label="Booked colours, top to bottom">
                  {MENU_TIERS.map((tier) => (
                    <span
                      key={tier.id}
                      title={`${tier.name}: ${colourById(booking.colours[tier.id]).name}`}
                      style={{ background: colourById(booking.colours[tier.id]).hex }}
                    />
                  ))}
                </span>
                <span className="pa-booking__teas">
                  {booking.teas.map((tea) => teaById(tea).name).join(" & ")}
                </span>
              </li>
            );
          })}
        </ul>
        <TeaTins state={state} dispatch={dispatch} />
      </div>
      {salonDay ? (
        <div className="pa-salon-plan__open">
          {salon.session !== null ? (
            <Button size="lg" icon="heart" onClick={() => onOpen("salon")} data-testid="back-to-salon">
              Back to the Comet Room
            </Button>
          ) : (
            <Button
              size="lg"
              icon="heart"
              onClick={onOpenTables}
              disabledReason={open.ok ? undefined : open.reasons[0]}
              showReason
              data-testid="open-tables"
            >
              Open the Comet Room
            </Button>
          )}
        </div>
      ) : null}
      {salon.lastSummary !== null && done ? (
        <p className="pa-hint">
          Salon Day: {salon.lastSummary.served} of {salon.lastSummary.tables} tables served, +
          {salon.lastSummary.coins} coins. {salon.lastSummary.toCounter} treats went to the counter
          {salon.lastSummary.shared > 0
            ? ` and ${salon.lastSummary.shared} were shared with the neighbours`
            : ""}
          .
        </p>
      ) : null}
    </div>
  );
}
