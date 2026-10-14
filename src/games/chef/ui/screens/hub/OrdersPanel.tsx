import { MAX_ACTIVE_GIGS } from "../../../../../engine/gigBoard";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { Icon } from "../../../../../ui/kit/IconSet";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import {
  clientById,
  dishById,
  ingredientById,
  offerAcceptIssue,
  offersFor,
  type GameState,
  type Gig,
  type OrderBrief,
} from "../../../core";

export interface OrdersPanelProps {
  readonly state: GameState;
  readonly onAccept: (event: ClickLike, offerId: string) => void;
  readonly onDecline: (event: ClickLike, offerId: string) => void;
  readonly onCook: (gig: Gig) => void;
}

function BriefFacts({ brief }: { readonly brief: OrderBrief }) {
  return (
    <ul className="ck-order__facts">
      <li>
        <Icon name="heart" size={14} />{" "}
        {brief.dishId === null
          ? `${brief.dishCount} ${brief.dishCount === 1 ? "dish" : "dishes"}`
          : dishById(brief.dishId).name}
        {brief.cuisines > 1 ? ` from ${brief.cuisines} kitchens` : ""}
      </li>
      <li>
        <Icon name="coin" size={14} /> Fee {brief.fee} · budget {brief.budget}
      </li>
      <li>
        <Icon name="calendar" size={14} /> Due day {brief.deadlineDay}
      </li>
      <li>
        <Icon name="star" size={14} /> Quality {brief.minQuality}
      </li>
      {brief.requiredTags.length > 0 ? (
        <li className="ck-order__tags">
          {brief.requiredTags.map((tag) => (
            <TagPill key={tag} tone="gold">
              {tag}
            </TagPill>
          ))}
        </li>
      ) : null}
      {brief.avoid.length > 0 ? (
        <li className="ck-muted">
          Not a fan of {brief.avoid.map((id) => ingredientById(id).name.toLowerCase()).join(" or ")}
        </li>
      ) : null}
    </ul>
  );
}

export function OrdersPanel({ state, onAccept, onDecline, onCook }: OrdersPanelProps) {
  const offers = offersFor(state);
  return (
    <section className="ck-panel ck-orders" aria-labelledby="ck-orders-title">
      <header className="ck-panel__header">
        <h2 id="ck-orders-title">Private orders</h2>
        <span className="ck-muted">
          {state.gigs.active.length} of {MAX_ACTIVE_GIGS} on the go
        </span>
      </header>
      {offers.length === 0 && state.gigs.active.length === 0 ? (
        <p className="ck-muted">New orders arrive overnight. Buzz brings more of them.</p>
      ) : null}
      {offers.map((view) => (
        <article key={view.offer.id} className="ck-order ck-order--offer" data-testid="order-offer">
          <div className="ck-order__who">
            <Avatar look={view.client.look} size={52} title={view.client.name} frameColour="#f2d9a8" />
            <div>
              <strong>{view.client.name}</strong>
              <span className="ck-muted">{view.client.who}</span>
            </div>
          </div>
          <p className="ck-order__request">“{view.client.lines.request}”</p>
          <BriefFacts brief={view.offer.brief} />
          <div className="ck-order__actions">
            <Button variant="ghost" size="sm" onClick={(event) => onDecline(event, view.offer.id)}>
              Kindly pass
            </Button>
            <Button
              size="sm"
              onClick={(event) => onAccept(event, view.offer.id)}
              disabledReason={offerAcceptIssue(state, view.offer.id) ?? undefined}
              aria-label={`Accept ${view.client.name}`}
            >
              Accept
            </Button>
          </div>
        </article>
      ))}
      {state.gigs.active.map((gig) => {
        const client = clientById(gig.clientId);
        const cooked = state.orderDishes.filter((entry) => entry.gigId === gig.id);
        return (
          <article key={gig.id} className="ck-order" data-testid="order-card">
            <div className="ck-order__who">
              {client === undefined ? null : (
                <Avatar look={client.look} size={52} title={client.name} frameColour="#f2d9a8" />
              )}
              <div>
                <strong>{client?.name ?? "A neighbour"}</strong>
                <span className="ck-muted">{gig.brief.occasion}</span>
              </div>
            </div>
            <BriefFacts brief={gig.brief} />
            <p className="ck-order__progress">
              {cooked.length} of {gig.brief.dishCount} cooked
              {cooked.length > 0 ? `: ${cooked.map((entry) => dishById(entry.dishId).name).join(", ")}` : ""}
            </p>
            <div className="ck-order__actions">
              <Button size="sm" icon="sparkle" onClick={() => onCook(gig)}>
                Cook a dish for this
              </Button>
            </div>
          </article>
        );
      })}
    </section>
  );
}
