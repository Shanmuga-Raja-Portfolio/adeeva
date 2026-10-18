import type { CSSProperties } from "react";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { offerAcceptIssue, type GameState, type OfferView } from "../../../core";
import { recipeList, ticketBadge } from "./briefFacts";

export interface OfferTagProps {
  readonly state: GameState;
  readonly view: OfferView;
  readonly tilt: number;
  readonly paper: string;
  readonly open: boolean;
  readonly detailsId: string;
  readonly onToggle: () => void;
  readonly onAccept: (event: ClickLike) => void;
}

export function noteTone(view: OfferView): string {
  if (ticketBadge(view.offer.brief) !== null) return "tf-note--ticket";
  return view.client.traitGate === undefined ? "" : "tf-note--mint";
}

export function OfferTag({ state, view, tilt, paper, open, detailsId, onToggle, onAccept }: OfferTagProps) {
  const { offer, client } = view;
  const { brief } = offer;
  const issue = offerAcceptIssue(state, offer.id);
  const style = { "--tf-tilt": `${tilt}deg`, "--tf-paper": paper } as CSSProperties;
  return (
    <article
      className={["tf-offer", "tf-note", open ? "tf-note--open" : "", noteTone(view)]
        .filter((name) => name.length > 0)
        .join(" ")}
      style={style}
      data-testid="offer-tag"
      data-client={client.id}
      data-kind={brief.kind}
    >
      <span className="tf-note__pin" aria-hidden="true" />
      <button
        type="button"
        className="tf-offer__head"
        aria-expanded={open}
        aria-controls={open ? detailsId : undefined}
        aria-label={`${client.name} wants ${recipeList(brief)}. Read the note`}
        onClick={onToggle}
      >
        <Avatar look={client.look} size={44} frameColour="#e2f4ea" title={client.name} />
        <span className="tf-offer__who">
          <span className="tf-offer__name">{client.name}</span>
          <span className="tf-offer__make">{recipeList(brief)}</span>
          <span className="tf-note__facts">
            <span title="What they pay you">
              <Icon name="coin" size={15} />
              <strong>{brief.fee}</strong>
            </span>
            <span title="Due day">
              <Icon name="calendar" size={15} />
              <strong>Day {brief.deadlineDay}</strong>
            </span>
          </span>
        </span>
      </button>
      {open ? null : (
        <Button size="sm" className="tf-offer__accept" onClick={onAccept} disabledReason={issue ?? undefined}>
          Accept
        </Button>
      )}
    </article>
  );
}
