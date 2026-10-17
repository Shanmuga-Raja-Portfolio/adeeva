import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { offerAcceptIssue, type GameState, type OfferView } from "../../../core";
import { BriefFacts } from "./BriefFacts";

export interface OfferCardProps {
  readonly state: GameState;
  readonly view: OfferView;
  readonly onAccept: (event: ClickLike) => void;
  readonly onDecline: (event: ClickLike) => void;
}

export function OfferCard({ state, view, onAccept, onDecline }: OfferCardProps) {
  const { offer, client } = view;
  const issue = offerAcceptIssue(state, offer.id);
  const left = offer.expiresDay - state.calendar.day;
  return (
    <article className="pa-order pa-order--offer" data-testid="offer-card">
      <span className="pa-order__pin" aria-hidden="true" />
      <div className="pa-order__head">
        <Avatar look={client.look} size={50} title={client.name} frameColour="#fde6cf" />
        <div>
          <h4 className="pa-order__client">{client.name}</h4>
          <span className="pa-muted pa-order__relation">{client.relation}</span>
        </div>
        <TagPill tone={left <= 0 ? "danger" : "plain"}>
          {left <= 0 ? "Reply today" : `Reply in ${left} d`}
        </TagPill>
      </div>
      <p className="pa-order__quote">“{client.lines.request}”</p>
      <BriefFacts brief={offer.brief} hotTags={state.trends.current} />
      <div className="pa-order__actions">
        <Button variant="ghost" size="sm" onClick={onDecline} aria-label={`Decline ${client.name}`}>
          Not this time
        </Button>
        <Button
          size="sm"
          onClick={onAccept}
          disabledReason={issue ?? undefined}
          aria-label={`Accept ${client.name}`}
        >
          Accept
        </Button>
      </div>
    </article>
  );
}
