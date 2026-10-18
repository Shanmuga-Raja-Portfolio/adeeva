import { useState } from "react";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import type { GameState, OfferView } from "../../../core";
import { OfferDetails } from "./OfferDetails";
import { OfferTag } from "./OfferTag";
import "./board.css";

export interface OrderBoardProps {
  readonly state: GameState;
  readonly offers: readonly OfferView[];
  readonly onAccept: (event: ClickLike, offerId: string) => void;
  readonly onDecline: (event: ClickLike, offerId: string) => void;
}

const TILTS = [-1.6, 1.2, -0.8, 1.5];
const PAPERS = ["#fff4c2", "#ffe1e4", "#e3f4ea", "#e6ecfb"];
const DETAILS_ID = "tf-board-note";

export function OrderBoard({ state, offers, onAccept, onDecline }: OrderBoardProps) {
  const [chosen, setChosen] = useState<string | null>(null);
  const open = offers.find((view) => view.offer.id === chosen) ?? null;
  const unpin = () => {
    const back = chosen;
    setChosen(null);
    if (back !== null) document.querySelector<HTMLElement>(`[data-note="${back}"] .tf-offer__head`)?.focus();
  };
  return (
    <section className="tf-board" aria-labelledby="tf-board-title">
      <span className="tf-board__nail" aria-hidden="true" />
      <h2 id="tf-board-title" className="tf-board__title">
        <Icon name="heart" size={18} />
        Requests
        {offers.length === 0 ? null : <span className="tf-board__count">{offers.length}</span>}
      </h2>
      {offers.length === 0 ? (
        <div className="tf-note tf-board__empty">
          <span className="tf-note__pin" aria-hidden="true" />
          <Icon name="heart" size={24} />
          <p>No requests right now. Regulars pin new ones overnight.</p>
        </div>
      ) : (
        <div className="tf-board__tags">
          {offers.map((view, index) => (
            <div key={view.offer.id} className="tf-board__slot" data-note={view.offer.id}>
              <OfferTag
                state={state}
                view={view}
                tilt={TILTS[index % TILTS.length] ?? 0}
                paper={PAPERS[index % PAPERS.length] ?? "#fffaf0"}
                open={view.offer.id === open?.offer.id}
                detailsId={DETAILS_ID}
                onToggle={() => setChosen(view.offer.id === chosen ? null : view.offer.id)}
                onAccept={(event) => onAccept(event, view.offer.id)}
              />
            </div>
          ))}
        </div>
      )}
      {open === null ? null : (
        <OfferDetails
          id={DETAILS_ID}
          state={state}
          view={open}
          onAccept={(event) => onAccept(event, open.offer.id)}
          onDecline={(event) => onDecline(event, open.offer.id)}
          onClose={unpin}
        />
      )}
    </section>
  );
}
