import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { GameState, OfferView } from "../../../core";
import { OfferNote } from "./OfferNote";

export interface DoorBoardProps {
  readonly state: GameState;
  readonly offers: readonly OfferView[];
  readonly onAccept: (event: ClickLike, offerId: string, clientId: string) => void;
  readonly onDecline: (event: ClickLike, offerId: string) => void;
}

const TILTS = [-1.6, 1.4, -1, 1.8];

export function DoorBoard({ state, offers, onAccept, onDecline }: DoorBoardProps) {
  return (
    <section className="ww-door" aria-labelledby="ww-door-title">
      <header className="ww-door__header">
        <h2 id="ww-door-title">Notes on the door</h2>
        <span className="ww-door__count">
          {offers.length === 0 ? "All caught up" : `${offers.length} pinned up`}
        </span>
      </header>
      {offers.length === 0 ? (
        <div className="ww-door__empty">
          <Icon name="heart" size={26} />
          <p>New notes get pinned up overnight. Buzz brings more of them.</p>
        </div>
      ) : (
        <div className="ww-door__notes">
          {offers.map((view, index) => (
            <OfferNote
              key={view.offer.id}
              state={state}
              view={view}
              tilt={TILTS[index % TILTS.length] ?? 0}
              onAccept={(event) => onAccept(event, view.offer.id, view.client.id)}
              onDecline={(event) => onDecline(event, view.offer.id)}
            />
          ))}
        </div>
      )}
      {offers.length > 1 ? (
        <p className="ww-door__more" aria-hidden="true">
          <Icon name="bag" size={16} /> Scroll the door for {offers.length - 1} more
        </p>
      ) : null}
    </section>
  );
}
