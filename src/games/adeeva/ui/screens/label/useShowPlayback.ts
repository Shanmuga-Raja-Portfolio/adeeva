import { useEffect, useMemo } from "react";
import { useShowClock } from "../../../../../ui/kit/useShowClock";
import {
  crossfadeFrames,
  momentAt,
  showDuration,
  showSegments,
  type ShowFrameSlot,
  type ShowMoment,
  type ShowSegment,
} from "./showTimeline";

export interface ShowPlayback {
  readonly segments: readonly ShowSegment[];
  readonly elapsed: number;
  readonly moment: ShowMoment;
  readonly frames: readonly ShowFrameSlot[];
}

export function useShowPlayback(walks: number, still: boolean, onDone: () => void): ShowPlayback {
  const segments = useMemo(() => showSegments(walks, still), [walks, still]);
  const elapsed = useShowClock(showDuration(segments), onDone);
  const moment = momentAt(segments, elapsed);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDone();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone]);

  return { segments, elapsed, moment, frames: crossfadeFrames(segments, moment, still) };
}
