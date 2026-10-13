import type { ClickLike } from "../../kit/useDispatchOnce";
import { offerAcceptIssue, type GameState, type OfferView } from "../../../core";
import { Avatar } from "../../art/Avatar";
import { Button } from "../../kit/Button";
import { TagPill } from "../../kit/TagPill";
import { BriefSummary } from "./BriefSummary";

export interface OfferCardProps {
  state: GameState;
  view: OfferView;
  onAccept: (event: ClickLike) => void;
  onDecline: (event: ClickLike) => void;
}

function replyNote(expiresDay: number, day: number): string {
  const days = expiresDay - day;
  if (days <= 0) return "Reply today";
  return days === 1 ? "Reply by tomorrow" : `Reply within ${days} days`;
}

export function OfferCard({ state, view, onAccept, onDecline }: OfferCardProps) {
  const { offer, client } = view;
  const day = state.calendar.day;
  const issue = offerAcceptIssue(state, offer.id);
  const dueIn = offer.brief.deadlineDay - day;
  return (
    <article className="ad-offer" data-testid="offer-card">
      <div className="ad-offer__head">
        <Avatar look={client.look} size={56} title={client.name} frameColour="#e2eee5" />
        <div className="ad-offer__who">
          <h4 className="ad-offer__client">{client.name}</h4>
          <span className="ad-offer__relation">{client.relation}</span>
        </div>
        <TagPill tone={offer.expiresDay <= day ? "danger" : "plain"}>
          {replyNote(offer.expiresDay, day)}
        </TagPill>
      </div>
      <p className="ad-offer__occasion">{offer.brief.occasion}</p>
      <p className="ad-offer__quote">“{client.lines.request}”</p>
      <BriefSummary brief={offer.brief} hotTags={state.trends.current} />
      <div className="ad-offer__footer">
        <span className="ad-offer__due">
          Due day {offer.brief.deadlineDay} · {dueIn} {dueIn === 1 ? "day" : "days"} to sew
        </span>
        <div className="ad-offer__actions">
          <Button variant="ghost" size="sm" onClick={onDecline} aria-label={`Decline ${client.name}`}>
            Decline
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
      </div>
      {issue !== null ? <p className="ad-reason">{issue}</p> : null}
    </article>
  );
}
