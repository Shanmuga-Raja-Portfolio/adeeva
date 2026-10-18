import { useEffect, useRef, type KeyboardEvent } from "react";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { offerAcceptIssue, type GameState, type OfferView } from "../../../core";
import { finishList, recipeList, requestLine, ticketBadge } from "./briefFacts";
import { noteTone } from "./OfferTag";

export interface OfferDetailsProps {
  readonly id: string;
  readonly state: GameState;
  readonly view: OfferView;
  readonly onAccept: (event: ClickLike) => void;
  readonly onDecline: (event: ClickLike) => void;
  readonly onClose: () => void;
}

function replyText(left: number): string {
  if (left <= 0) return "Reply today";
  return left === 1 ? "Reply by tomorrow" : `Reply in ${left} days`;
}

export function OfferDetails({ id, state, view, onAccept, onDecline, onClose }: OfferDetailsProps) {
  const { offer, client } = view;
  const { brief } = offer;
  const issue = offerAcceptIssue(state, offer.id);
  const badge = ticketBadge(brief);
  const left = offer.expiresDay - state.calendar.day;
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    close.current?.focus();
  }, [offer.id]);
  const keys = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    onClose();
  };
  return (
    <section
      id={id}
      className={["tf-note-open", "tf-note", noteTone(view)].filter((name) => name.length > 0).join(" ")}
      role="dialog"
      aria-label={`${client.name}'s note`}
      data-testid="offer-details"
      onKeyDown={keys}
    >
      <span className="tf-note__pin" aria-hidden="true" />
      <header className="tf-note-open__head">
        <Avatar look={client.look} size={64} frameColour="#e2f4ea" title={client.name} />
        <div>
          <h3>{client.name}</h3>
          <span>{client.relation}</span>
        </div>
        <button
          ref={close}
          type="button"
          className="tf-note-open__close"
          onClick={onClose}
          aria-label="Pin the note back"
        >
          <Icon name="close" size={20} />
        </button>
      </header>
      {badge === null ? null : <span className="tf-offer__badge">{badge} · no coins needed</span>}
      <p className="tf-note-open__quote">“{requestLine(brief, client)}”</p>
      <p className="tf-note-open__make">
        <Icon name="scissors" size={18} />
        <span>
          <strong>{recipeList(brief)}</strong>
          {brief.requiredFinishes.length === 0 ? null : <> with {finishList(brief)}</>}
        </span>
      </p>
      <ul className="tf-note-open__facts" aria-label="Order details">
        <li>
          <Icon name="coin" size={20} />
          <strong>{brief.fee}</strong>
          <span>they pay you</span>
        </li>
        <li>
          <Icon name="calendar" size={20} />
          <strong>Day {brief.deadlineDay}</strong>
          <span>due</span>
        </li>
        <li>
          <Icon name="bag" size={20} />
          <strong>{brief.budget}</strong>
          <span>{brief.kind === "flip" ? "for finds" : "to spend"}</span>
        </li>
        <li>
          <Icon name="star" size={20} />
          <strong>{brief.minQuality}+</strong>
          <span>quality</span>
        </li>
      </ul>
      <footer className="tf-note-open__actions">
        <span className={left <= 0 ? "tf-offer__expires tf-offer__expires--soon" : "tf-offer__expires"}>
          {replyText(left)}
        </span>
        <Button variant="ghost" onClick={onDecline}>
          Pass
        </Button>
        <Button onClick={onAccept} disabledReason={issue ?? undefined}>
          Accept
        </Button>
      </footer>
    </section>
  );
}
