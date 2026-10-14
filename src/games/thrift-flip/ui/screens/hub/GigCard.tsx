import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { clientById, runStartIssue, stallDayIssue, type GameState, type Gig } from "../../../core";
import { recipeList } from "./briefFacts";

export interface GigCardProps {
  readonly state: GameState;
  readonly gig: Gig;
  readonly onStart: (event: ClickLike) => void;
  readonly onContinue: () => void;
  readonly onSetAside: () => void;
}

export function GigCard({ state, gig, onStart, onContinue, onSetAside }: GigCardProps) {
  const client = clientById(gig.clientId);
  const run = state.activeRun;
  const onBench =
    run !== null && run.stage !== "done" && run.purpose.kind === "gig" && run.purpose.gigId === gig.id;
  const late = state.calendar.day > gig.brief.deadlineDay;
  const daysLeft = gig.brief.deadlineDay - state.calendar.day;
  const issue = runStartIssue(state);
  return (
    <article className={onBench ? "tf-gig tf-gig--bench" : "tf-gig"} data-testid="gig-card">
      {client !== undefined ? (
        <Avatar look={client.look} size={48} frameColour="#e2f4ea" title={client.name} />
      ) : null}
      <div className="tf-gig__body">
        <strong>{client?.name ?? "A regular"}</strong>
        <span className="tf-gig__what">{recipeList(gig.brief)}</span>
        <span className={late ? "tf-gig__due tf-gig__due--late" : "tf-gig__due"}>
          {late
            ? `Late since day ${gig.brief.deadlineDay}`
            : daysLeft === 0
              ? "Due today"
              : `Due in ${daysLeft} days`}
        </span>
      </div>
      <div className="tf-gig__actions">
        {onBench ? (
          <>
            <Button
              size="sm"
              onClick={onContinue}
              disabledReason={stallDayIssue(state.calendar.day) ?? undefined}
            >
              Continue
            </Button>
            <Button variant="ghost" size="sm" onClick={onSetAside}>
              Set aside
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={onStart} disabledReason={issue ?? undefined}>
            Start flip
          </Button>
        )}
      </div>
    </article>
  );
}
