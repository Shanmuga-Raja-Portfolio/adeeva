import { useState } from "react";
import { Button } from "../../../../../ui/kit/Button";
import { Dialog } from "../../../../../ui/kit/Dialog";
import { Icon } from "../../../../../ui/kit/IconSet";
import { StarRating } from "../../../../../ui/kit/StarRating";
import { PATH_RULES } from "../../../content/career";
import { dishById, segmentDeskIssue, segmentsUsed, type GameState, type TvState } from "../../../core";

export interface SegmentDeskProps {
  readonly state: GameState;
  readonly tv: TvState;
  readonly onPrepare: () => void;
  readonly onCueCards: () => void;
  readonly onDrop: () => void;
}

export function SegmentDesk({ state, tv, onPrepare, onCueCards, onDrop }: SegmentDeskProps) {
  const used = segmentsUsed(tv, state.calendar.day);
  const prep = tv.prep;
  const last = tv.lastSegment;
  const [dropping, setDropping] = useState(false);
  return (
    <section
      className="ck-board ck-segment-desk"
      aria-labelledby="ck-segment-title"
      data-testid="segment-desk"
    >
      <header className="ck-board__header">
        <h2 id="ck-segment-title" className="ck-chalk">
          Segment desk
        </h2>
        <span className="ck-board__note">
          {used} of {PATH_RULES.segmentsPerWeek} segments this week
        </span>
      </header>
      {prep === null ? (
        <article className="ck-ticket-card">
          <div className="ck-ticket-card__pin" aria-hidden="true" />
          <span className="ad-eyebrow">Producer Mo</span>
          <h3 className="ck-ticket-card__title">Make a segment</h3>
          <p className="ck-muted">
            Pick a dish, put three cue cards in cooking order and choose kind tips. Then cook it live.
          </p>
          <ul className="ck-ticket-card__facts">
            <li>
              <Icon name="clock" size={16} /> {PATH_RULES.segmentPrepHours} h to prepare,{" "}
              {PATH_RULES.segmentHours} h live
            </li>
            <li>
              <Icon name="coin" size={16} /> {PATH_RULES.segmentBaseFee} + {PATH_RULES.segmentStarFee} a star
            </li>
          </ul>
          <div className="ck-ticket-card__actions">
            <Button
              icon="sparkle"
              onClick={onPrepare}
              disabledReason={segmentDeskIssue(state) ?? undefined}
              showReason
              data-testid="prepare-segment"
            >
              Prepare a segment
            </Button>
          </div>
        </article>
      ) : (
        <article className="ck-ticket-card ck-ticket-card--live">
          <div className="ck-ticket-card__pin" aria-hidden="true" />
          <span className="ad-eyebrow">On the cue board</span>
          <h3 className="ck-ticket-card__title">{dishById(prep.dishId).name}</h3>
          <p className="ck-muted">
            {prep.order.length} of {prep.cues.length} cards placed ·{" "}
            {prep.tips.filter((tip) => tip !== null).length} tips chosen
          </p>
          <div className="ck-ticket-card__actions">
            <Button variant="ghost" size="sm" onClick={() => setDropping(true)} data-testid="drop-segment">
              Drop it
            </Button>
            <Button icon="sparkle" onClick={onCueCards} data-testid="open-cue-cards">
              Cue cards
            </Button>
          </div>
        </article>
      )}
      {last === null ? null : (
        <p className="ck-segment-desk__last">
          Last time: {dishById(last.dishId).name} <StarRating stars={last.stars} size={16} /> score{" "}
          {last.score}
        </p>
      )}
      <Dialog
        open={dropping && prep !== null}
        title="Drop this segment?"
        onClose={() => setDropping(false)}
        footer={
          <>
            <Button variant="ghost" autoFocus onClick={() => setDropping(false)}>
              Keep it
            </Button>
            <Button
              onClick={() => {
                setDropping(false);
                onDrop();
              }}
              data-testid="confirm-drop-segment"
            >
              Drop it
            </Button>
          </>
        }
      >
        <p>The cue cards go back in the drawer.</p>
        <p className="ck-muted">
          The {PATH_RULES.segmentPrepHours} hours of prep are not given back. It does not count as one of this
          week's segments.
        </p>
      </Dialog>
    </section>
  );
}
