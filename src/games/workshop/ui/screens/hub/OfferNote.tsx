import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { offerAcceptIssue, type GameState, type OfferView } from "../../../core";
import { BriefFacts } from "./BriefFacts";

interface OfferNoteProps {
  readonly state: GameState;
  readonly view: OfferView;
  readonly tilt: number;
  readonly onAccept: (event: ClickLike) => void;
  readonly onDecline: (event: ClickLike) => void;
}

export function OfferNote({ state, view, tilt, onAccept, onDecline }: OfferNoteProps) {
  const { offer, client } = view;
  const issue = offerAcceptIssue(state, offer.id);
  const left = offer.expiresDay - state.calendar.day;
  return (
    <article
      className="ww-note"
      style={{ transform: `rotate(${tilt}deg)` }}
      data-testid="offer-note"
      data-client={client.id}
    >
      <span className="ww-pin" aria-hidden="true" />
      <div className="ww-note__head">
        <Avatar look={client.look} size={56} title={client.name} frameColour="#dfe7ee" />
        <div>
          <h4 className="ww-note__client">{client.name}</h4>
          <span className="ww-muted ww-note__relation">{client.relation}</span>
        </div>
        <TagPill tone={left <= 0 ? "danger" : "plain"}>
          {left <= 0 ? "Reply today" : `Reply in ${left} d`}
        </TagPill>
      </div>
      <p className="ww-note__quote">“{client.lines.request}”</p>
      <BriefFacts brief={offer.brief} hotTags={state.trends.current} />
      <div className="ww-note__actions">
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
