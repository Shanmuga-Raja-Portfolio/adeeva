import { PATH_RULES } from "../../../content/career";
import { kinderTips, letterById, type DishRun, type GameState } from "../../../core";
import { formatClock } from "../service/serviceView";
import "./segmentCueStrip.css";

export function SegmentSummary({ state, run }: { readonly state: GameState; readonly run: DishRun }) {
  const path = state.path;
  if (run.purpose.kind !== "segment" || path === null || path.kind !== "tv" || path.lastSegment === null)
    return null;
  const report = path.lastSegment;
  const letter = report.letterId === null ? undefined : letterById(report.letterId);
  const kinder = kinderTips(run.purpose.cards);
  return (
    <div className="ck-segment-summary" data-testid="segment-summary">
      <ul className="ck-meters">
        <li>
          <span>Cooking</span>
          <strong>{report.quality}</strong>
        </li>
        <li>
          <span>Cue cards in order</span>
          <strong>{run.purpose.cueRight ? "Yes!" : "Not quite"}</strong>
        </li>
        <li>
          <span>Kind, clear tips</span>
          <strong>{run.purpose.kindTips} of 3</strong>
        </li>
        <li>
          <span>Studio clock</span>
          <strong>
            {formatClock(report.clockSeconds)} of {formatClock(PATH_RULES.segmentClockSeconds)}
          </strong>
        </li>
      </ul>
      {kinder.length === 0 ? null : (
        <ul className="ck-segment-summary__kinder" data-testid="segment-kinder-tips">
          {kinder.map((tip) => (
            <li key={tip.cue}>
              <strong>{tip.label}.</strong> A kinder, clearer tip: {tip.text}
            </li>
          ))}
        </ul>
      )}
      {letter === undefined ? null : (
        <blockquote className="ck-letter" data-testid="segment-letter">
          <p className="ck-letter__text">“{letter.text}”</p>
          <p className="ck-letter__from">{letter.from}</p>
        </blockquote>
      )}
    </div>
  );
}
