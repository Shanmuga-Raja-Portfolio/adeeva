import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { TagPill } from "../../../../../ui/kit/TagPill";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { clientById, runStartIssue, type GameState, type Gig } from "../../../core";

interface JobCardProps {
  readonly state: GameState;
  readonly gig: Gig;
  readonly onStart: (event: ClickLike) => void;
  readonly onContinue: () => void;
}

export function JobCard({ state, gig, onStart, onContinue }: JobCardProps) {
  const client = clientById(gig.clientId);
  const run = state.activeRun;
  const onBench = run !== null && run.stage !== "done" && run.gigId === gig.id;
  const issue = runStartIssue(state);
  const left = gig.brief.deadlineDay - state.calendar.day;
  return (
    <article className="ww-job" data-testid="job-card">
      <div className="ww-job__head">
        {client !== undefined ? (
          <Avatar look={client.look} size={48} title={client.name} frameColour="#dcebdf" />
        ) : null}
        <div>
          <h4 className="ww-job__client">{client?.name ?? "A neighbour"}</h4>
          <span className="ww-muted">{gig.brief.occasion}</span>
        </div>
        <TagPill tone={left < 0 ? "danger" : left <= 1 ? "hot" : "sage"}>
          {left < 0 ? "Late" : left === 0 ? "Due today" : `Due in ${left} d`}
        </TagPill>
      </div>
      <div className="ww-job__actions">
        {onBench ? (
          <Button size="sm" onClick={onContinue}>
            Back to the workbench
          </Button>
        ) : (
          <Button size="sm" onClick={onStart} disabledReason={issue ?? undefined} showReason>
            Start building
          </Button>
        )}
      </div>
    </article>
  );
}
