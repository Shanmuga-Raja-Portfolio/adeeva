import { useEffect, useRef } from "react";
import { MusicChip } from "../../../../../ui/show/MusicChip";
import {
  progressPips,
  sceneLabel,
  type ShowMoment,
  type ShowSegment,
} from "../../../../../ui/show/showTimeline";

function stepName(segment: ShowSegment, walks: number): string {
  if (segment.kind === "walk") return `Look ${segment.walk + 1} of ${walks}`;
  if (segment.kind === "finale") return "Finale";
  if (segment.kind === "bow") return "Curtain call";
  return "Opening";
}

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
      <div className="ad-show__progress">
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
        <span className="ad-show__pip-label" aria-hidden="true">
          {stepName(moment.segment, pips.filter((segment) => segment.kind === "walk").length)}
        </span>
      </div>
      <button ref={skipRef} type="button" className="ad-show__skip" onClick={onSkip} data-testid={skipTestId}>
        {skipLabel}
      </button>
    </div>
  );
}
