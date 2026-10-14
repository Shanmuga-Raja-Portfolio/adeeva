import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { offerAcceptIssue, type GameState, type OfferView } from "../../../core";
import { BriefFacts } from "./BriefFacts";

interface LetterCardProps {
  readonly state: GameState;
  readonly view: OfferView;
  readonly index: number;
  readonly onAccept: (event: ClickLike) => void;
  readonly onDecline: (event: ClickLike) => void;
}

export function LetterCard({ state, view, index, onAccept, onDecline }: LetterCardProps) {
  const { offer, client } = view;
  const issue = offerAcceptIssue(state, offer.id);
  const left = offer.expiresDay - state.calendar.day;
  return (
    <article
      className={offer.brief.showHome ? "is-letter is-letter--show-home" : "is-letter"}
      style={{ transform: `rotate(${index % 2 === 0 ? -0.8 : 1}deg)` }}
      data-testid="offer-card"
    >
      <span className="is-letter__stamp" aria-hidden="true" />
      <div className="is-letter__head">
        <Avatar look={client.look} size={56} title={client.name} frameColour="#fcefc2" />
        <div>
          <h4 className="is-letter__client">{client.name}</h4>
          <span className="is-muted is-letter__relation">{client.relation}</span>
        </div>
        <TagPill tone={left <= 0 ? "danger" : offer.brief.showHome ? "gold" : "plain"}>
          {offer.brief.showHome ? "Show home" : left <= 0 ? "Reply today" : `Reply in ${left} d`}
        </TagPill>
      </div>
      <p className="is-letter__quote">“{client.lines.request}”</p>
      <BriefFacts brief={offer.brief} hotTags={state.trends.current} />
      <div className="is-letter__actions">
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
