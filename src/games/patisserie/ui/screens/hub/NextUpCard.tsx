import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { clientById, offersFor, productById, runStartIssue, type GameState } from "../../../core";

export interface NextUpCardProps {
  readonly state: GameState;
  readonly onStart: (event: ClickLike, gigId: string) => void;
  readonly onBench: () => void;
  readonly onSeeBoard: () => void;
}

function dueLabel(left: number): string {
  if (left < 0) return "Late";
  if (left === 0) return "Due today";
  return `Due in ${left} d`;
}

export function NextUpCard({ state, onStart, onBench, onSeeBoard }: NextUpCardProps) {
  const run = state.activeRun;
  const offers = offersFor(state);
  if (run !== null && run.stage !== "done") {
    const name =
      run.design.productId === null ? "A bake in progress" : productById(run.design.productId).name;
    return (
      <section className="pa-next-up" aria-label="On the bench">
        <span className="pa-next-up__eyebrow">On the bench</span>
        <strong className="pa-next-up__title">{name}</strong>
        <Button icon="sparkle" onClick={onBench}>
          Back to the bench
        </Button>
      </section>
    );
  }
  const gig = state.gigs.active[0];
  if (gig !== undefined) {
    const client = clientById(gig.clientId);
    const issue = runStartIssue(state);
    const left = gig.brief.deadlineDay - state.calendar.day;
    return (
      <section className="pa-next-up" aria-label="Next order">
        <span className="pa-next-up__eyebrow">Next order</span>
        <div className="pa-next-up__who">
          {client !== undefined ? (
            <Avatar look={client.look} size={52} title={client.name} frameColour="#e7f1dc" />
          ) : null}
          <span>
            <strong className="pa-next-up__title">{client?.name ?? "A neighbour"}</strong>
            <span className="pa-next-up__line">{gig.brief.occasion}</span>
          </span>
          <TagPill tone={left < 0 ? "danger" : left <= 1 ? "hot" : "sage"}>{dueLabel(left)}</TagPill>
        </div>
        <Button
          size="lg"
          icon="sparkle"
          onClick={(event) => onStart(event, gig.id)}
          disabledReason={issue ?? undefined}
        >
          Start baking
        </Button>
        {offers.length > 0 ? (
          <Button
            variant="secondary"
            size="sm"
            icon="heart"
            className="pa-next-up__more"
            onClick={onSeeBoard}
          >
            {offers.length} new {offers.length === 1 ? "order" : "orders"} on the board
          </Button>
        ) : null}
      </section>
    );
  }
  return (
    <section className="pa-next-up" aria-label="Order board">
      <span className="pa-next-up__eyebrow">Order board</span>
      <strong className="pa-next-up__title">
        {offers.length === 0
          ? "No new orders today"
          : `${offers.length} ${offers.length === 1 ? "order is" : "orders are"} pinned up`}
      </strong>
      <span className="pa-next-up__line">
        {offers.length === 0 ? "Fresh orders are pinned up overnight." : "Pick one you'd love to bake."}
      </span>
      <Button variant={offers.length === 0 ? "secondary" : "primary"} icon="heart" onClick={onSeeBoard}>
        Read the orders
      </Button>
    </section>
  );
}
