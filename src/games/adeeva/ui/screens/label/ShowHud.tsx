import { useEffect, useRef } from "react";
import { MusicChip } from "./MusicChip";
import { progressPips, sceneLabel, type ShowMoment, type ShowSegment } from "./showTimeline";

export interface ShowHudProps {
  readonly segments: readonly ShowSegment[];
  readonly moment: ShowMoment;
  readonly elapsed: number;
  readonly moodName: string;
  readonly playing: boolean;
  readonly skipLabel: string;
  readonly skipTestId?: string;
  readonly focusSkip?: boolean;
  readonly onSkip: () => void;
}

export function ShowHud({
  segments,
  moment,
  elapsed,
  moodName,
  playing,
  skipLabel,
  skipTestId,
  focusSkip = false,
  onSkip,
}: ShowHudProps) {
  const skipRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (focusSkip) skipRef.current?.focus({ preventScroll: true });
  }, [focusSkip]);
  const pips = progressPips(segments);
  const activePip = pips.indexOf(moment.segment);
  return (
    <div className="ad-show__hud">
      <MusicChip name={moodName} elapsed={elapsed} playing={playing} />
      <ol className="ad-show__pips" aria-label="Show progress">
        {pips.map((segment, index) => (
          <li
            key={sceneLabel(segment)}
            className={index === activePip ? "is-active" : index < activePip ? "is-done" : ""}
          >
            <span className="ad-visually-hidden">{sceneLabel(segment)}</span>
          </li>
        ))}
      </ol>
      <button ref={skipRef} type="button" className="ad-show__skip" onClick={onSkip} data-testid={skipTestId}>
        {skipLabel}
      </button>
    </div>
  );
}
