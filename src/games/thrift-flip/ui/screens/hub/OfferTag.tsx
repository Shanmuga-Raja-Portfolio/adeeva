import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { offerAcceptIssue, type GameState, type OfferView } from "../../../core";
import { PriceTag } from "../../art/PriceTag";
import { BriefFacts, finishList, recipeList, requestLine, ticketBadge } from "./briefFacts";

export interface OfferTagProps {
  readonly state: GameState;
  readonly view: OfferView;
  readonly tilt: number;
  readonly onAccept: (event: ClickLike) => void;
  readonly onDecline: (event: ClickLike) => void;
}

export function OfferTag({ state, view, tilt, onAccept, onDecline }: OfferTagProps) {
  const { offer, client } = view;
  const issue = offerAcceptIssue(state, offer.id);
  const badge = ticketBadge(offer.brief);
  return (
    <article
      className={badge === null ? "tf-offer" : "tf-offer tf-offer--ticket"}
      data-testid="offer-tag"
      data-client={client.id}
      data-kind={offer.brief.kind}
    >
      <PriceTag tilt={tilt} tone={client.traitGate === undefined ? "kraft" : "mint"}>
        {badge === null ? null : <span className="tf-offer__badge">{badge} · no coins needed</span>}
        <header className="tf-offer__head">
          <Avatar look={client.look} size={52} frameColour="#e2f4ea" title={client.name} />
          <div>
            <h3 className="tf-offer__name">{client.name}</h3>
            <span className="tf-offer__relation">{client.relation}</span>
          </div>
        </header>
        <p className="tf-offer__request">“{requestLine(offer.brief, client)}”</p>
        <p className="tf-offer__make">
          <strong>{recipeList(offer.brief)}</strong> · {finishList(offer.brief)}
        </p>
        <BriefFacts brief={offer.brief} />
        <div className="tf-offer__actions">
          <Button variant="ghost" size="sm" onClick={onDecline}>
            Pass
          </Button>
          <Button size="sm" onClick={onAccept} disabledReason={issue ?? undefined}>
            Accept
          </Button>
        </div>
        <span className="tf-offer__expires">Offer open until day {offer.expiresDay}</span>
      </PriceTag>
    </article>
  );
}
