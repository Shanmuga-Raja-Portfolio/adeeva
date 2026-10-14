import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { offerAcceptIssue, type GameState, type OfferView } from "../../../core";
import { BriefFacts } from "./BriefFacts";

export interface OfferTagProps {
  readonly state: GameState;
  readonly view: OfferView;
  readonly index: number;
  readonly onAccept: (event: ClickLike) => void;
  readonly onDecline: (event: ClickLike) => void;
}

export function OfferTag({ state, view, index, onAccept, onDecline }: OfferTagProps) {
  const { offer, client } = view;
  const issue = offerAcceptIssue(state, offer.id);
  const left = offer.expiresDay - state.calendar.day;
  return (
    <article
      className="jb-tag"
      style={{ transform: `rotate(${index % 2 === 0 ? -1.2 : 1.4}deg)` }}
      data-testid="offer-card"
    >
      <span className="jb-tag__hole" aria-hidden="true" />
      <div className="jb-tag__head">
        <Avatar look={client.look} size={56} title={client.name} frameColour="#fbe9c8" />
        <div>
          <h4 className="jb-tag__client">{client.name}</h4>
          <span className="jb-muted jb-tag__relation">{client.relation}</span>
        </div>
        <TagPill tone={left <= 0 ? "danger" : "plain"}>
          {left <= 0 ? "Reply today" : `Reply in ${left} d`}
        </TagPill>
      </div>
      <p className="jb-tag__quote">“{client.lines.request}”</p>
      <BriefFacts brief={offer.brief} hotTags={state.trends.current} />
      <div className="jb-tag__actions">
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
