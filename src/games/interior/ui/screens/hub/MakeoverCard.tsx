import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { clientById, roomById, runStartIssue, type GameState, type Gig } from "../../../core";

interface MakeoverCardProps {
  readonly state: GameState;
  readonly gig: Gig;
  readonly onStart: (event: ClickLike) => void;
  readonly onContinue: () => void;
}

export function MakeoverCard({ state, gig, onStart, onContinue }: MakeoverCardProps) {
  const client = clientById(gig.clientId);
  const run = state.activeRun;
  const inProgress = run !== null && run.stage !== "done" && run.gigId === gig.id;
  const issue = runStartIssue(state);
  const left = gig.brief.deadlineDay - state.calendar.day;
  return (
    <article className="is-order" data-testid="order-card">
      <div className="is-order__head">
        {client !== undefined ? (
          <Avatar look={client.look} size={48} title={client.name} frameColour="#dbe7f5" />
        ) : null}
        <div>
          <h4 className="is-order__client">{client?.name ?? "A neighbour"}</h4>
          <span className="is-muted">{roomById(gig.brief.roomId).name}</span>
        </div>
        <TagPill tone={left < 0 ? "danger" : left <= 1 ? "hot" : "sage"}>
          {left < 0 ? "Late" : left === 0 ? "Due today" : `Due in ${left} d`}
        </TagPill>
      </div>
      <div className="is-order__actions">
        {inProgress ? (
          <Button size="sm" onClick={onContinue}>
            Back to the room
          </Button>
        ) : (
          <Button size="sm" onClick={onStart} disabledReason={issue ?? undefined} showReason>
            Start the makeover
          </Button>
        )}
      </div>
    </article>
  );
}
