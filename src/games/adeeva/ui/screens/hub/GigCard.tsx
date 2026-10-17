import type { ClickLike } from "../../../../../ui/kit/useDispatchOnce";
import { clientById, gigLapseDay, isGigLate, runStartIssue, type GameState, type Gig } from "../../../core";
import { Avatar } from "../../../../../ui/art/avatar/Avatar";
import { Button } from "../../../../../ui/kit/Button";
import { TagPill } from "../../../../../ui/kit/TagPill";
import { BriefSummary } from "./BriefSummary";

export interface GigCardProps {
  state: GameState;
  gig: Gig;
  onStart: (event: ClickLike) => void;
  onContinue: () => void;
  onSetAside: () => void;
}

function deadlineNote(gig: Gig, state: GameState): { text: string; tone: "plain" | "gold" | "danger" } {
  const day = state.calendar.day;
  if (isGigLate(gig, day)) {
    if (state.profile.difficulty === "relaxed") return { text: "Running late", tone: "danger" };
    const lastDay = gigLapseDay(gig) - 1;
    return {
      text: lastDay <= day ? "Late · last chance today" : `Late · waits until day ${lastDay}`,
      tone: "danger",
    };
  }
  const left = gig.brief.deadlineDay - day;
  if (left === 0) return { text: "Due today", tone: "gold" };
  if (left === 1) return { text: "Due tomorrow", tone: "gold" };
  return { text: `Due in ${left} days`, tone: "plain" };
}

export function GigCard({ state, gig, onStart, onContinue, onSetAside }: GigCardProps) {
  const client = clientById(gig.clientId);
  const name = client?.name ?? "Client";
  const run = state.activeRun;
  const onTable =
    run !== null && run.stage !== "done" && run.purpose.kind === "gig" && run.purpose.gigId === gig.id;
  const startIssue = runStartIssue(state);
  const note = deadlineNote(gig, state);
  return (
    <article className={onTable ? "ad-gig ad-gig--active" : "ad-gig"} data-testid="gig-card">
      <div className="ad-gig__head">
        {client !== undefined ? (
          <Avatar look={client.look} size={48} title={name} frameColour="#f6ecc8" />
        ) : null}
        <div className="ad-gig__who">
          <h4 className="ad-gig__client">{name}</h4>
          <span className="ad-gig__occasion">{gig.brief.occasion}</span>
        </div>
        <TagPill tone={note.tone}>{note.text}</TagPill>
      </div>
      <BriefSummary brief={gig.brief} hotTags={state.trends.current} />
      <div className="ad-gig__footer">
        {onTable ? (
          <>
            <span className="ad-gig__stage">On the table · {run.stage}</span>
            <Button size="sm" variant="ghost" onClick={onSetAside}>
              Set aside
            </Button>
            <Button size="sm" icon="needle" onClick={onContinue}>
              Continue {name}
            </Button>
          </>
        ) : (
          <>
            {startIssue !== null ? (
              <Button size="sm" variant="ghost" onClick={onSetAside}>
                Set aside the current dress
              </Button>
            ) : null}
            <Button icon="scissors" onClick={onStart} disabledReason={startIssue ?? undefined} showReason>
              Start sewing
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
