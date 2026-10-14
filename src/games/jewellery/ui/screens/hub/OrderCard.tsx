import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { clientById, productById, runStartIssue, type GameState, type Gig } from "../../../core";

interface OrderCardProps {
  readonly state: GameState;
  readonly gig: Gig;
  readonly onStart: (event: ClickLike) => void;
  readonly onContinue: () => void;
}

export function OrderCard({ state, gig, onStart, onContinue }: OrderCardProps) {
  const client = clientById(gig.clientId);
  const run = state.activeRun;
  const onBench =
    run !== null && run.stage !== "done" && run.purpose.kind === "order" && run.purpose.gigId === gig.id;
  const issue = runStartIssue(state);
  const left = gig.brief.deadlineDay - state.calendar.day;
  return (
    <article className="jb-order" data-testid="order-card">
      <div className="jb-order__head">
        {client !== undefined ? (
          <Avatar look={client.look} size={48} title={client.name} frameColour="#d9e9ea" />
        ) : null}
        <div>
          <h4 className="jb-order__client">{client?.name ?? "A neighbour"}</h4>
          <span className="jb-muted">
            {productById(gig.brief.productId).name} · {gig.brief.occasion}
          </span>
        </div>
        <TagPill tone={left < 0 ? "danger" : left <= 1 ? "hot" : "sage"}>
          {left < 0 ? "Late" : left === 0 ? "Due today" : `Due in ${left} d`}
        </TagPill>
      </div>
      <div className="jb-order__actions">
        {onBench ? (
          <Button size="sm" onClick={onContinue}>
            Back to the bench
          </Button>
        ) : (
          <Button size="sm" onClick={onStart} disabledReason={issue ?? undefined} showReason>
            Start making
          </Button>
        )}
      </div>
    </article>
  );
}
