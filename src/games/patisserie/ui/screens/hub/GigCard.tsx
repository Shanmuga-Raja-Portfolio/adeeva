import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { clientById, runStartIssue, type GameState, type Gig } from "../../../core";

export interface GigCardProps {
  readonly state: GameState;
  readonly gig: Gig;
  readonly onStart: (event: ClickLike) => void;
  readonly onContinue: () => void;
}

export function GigCard({ state, gig, onStart, onContinue }: GigCardProps) {
  const client = clientById(gig.clientId);
  const run = state.activeRun;
  const onBench =
    run !== null && run.stage !== "done" && run.purpose.kind === "order" && run.purpose.gigId === gig.id;
  const issue = runStartIssue(state);
  const left = gig.brief.deadlineDay - state.calendar.day;
  return (
    <article className="pa-order pa-order--active" data-testid="order-card">
      <div className="pa-order__head">
        {client !== undefined ? (
          <Avatar look={client.look} size={48} title={client.name} frameColour="#e7f1dc" />
        ) : null}
        <div>
          <h4 className="pa-order__client">{client?.name ?? "A neighbour"}</h4>
          <span className="pa-muted">{gig.brief.occasion}</span>
        </div>
      </div>
      <div className="pa-order__actions pa-order__actions--due">
        <TagPill tone={left < 0 ? "danger" : left <= 1 ? "hot" : "sage"}>
          {left < 0 ? "Late" : left === 0 ? "Due today" : `Due in ${left} d`}
        </TagPill>
        {onBench ? (
          <Button size="sm" onClick={onContinue}>
            Back to the bench
          </Button>
        ) : (
          <Button size="sm" onClick={onStart} disabledReason={issue ?? undefined} showReason>
            Start baking
          </Button>
        )}
      </div>
    </article>
  );
}
